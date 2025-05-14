"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { biddingService } from "@/lib/bidding-service"
import type { EstimateWithDetails } from "@/types/estimates"
import type { TradeCategory, TradeGroupedItems } from "@/types/bidding"
import type { Person } from "@/types/people"

interface CreateBidFromEstimateFormProps {
  estimate: EstimateWithDetails
}

export function CreateBidFromEstimateForm({ estimate }: CreateBidFromEstimateFormProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<string>("byTrade")
  const [tradeGroups, setTradeGroups] = useState<TradeGroupedItems>({})
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [selectedTrades, setSelectedTrades] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [subcontractors, setSubcontractors] = useState<Person[]>([])
  const [selectedSubcontractors, setSelectedSubcontractors] = useState<Record<string, string[]>>({})
  const [bidDetails, setBidDetails] = useState<Record<string, { title: string; description: string; dueDate: string }>>(
    {},
  )

  // Load trade-grouped items on component mount
  useEffect(() => {
    const loadTradeGroups = async () => {
      try {
        const groups = await biddingService.getTradeGroupedItems(estimate.id, undefined, { excludeWithBids: true })
        setTradeGroups(groups)

        // Initialize bid details for each trade
        const initialBidDetails: Record<string, { title: string; description: string; dueDate: string }> = {}
        Object.keys(groups).forEach((trade) => {
          initialBidDetails[trade] = {
            title: `${estimate.estimate_number || "Estimate"} - ${trade.charAt(0).toUpperCase() + trade.slice(1)} Work`,
            description: `Bid request for ${trade} work from estimate ${estimate.estimate_number || estimate.id}`,
            dueDate: "",
          }
        })
        setBidDetails(initialBidDetails)
      } catch (error) {
        console.error("Error loading trade groups:", error)
      }
    }

    loadTradeGroups()
  }, [estimate.id, estimate.estimate_number])

  // Load subcontractors when a trade is selected
  useEffect(() => {
    const loadSubcontractors = async () => {
      if (selectedTrades.length === 0) return

      try {
        // For simplicity, just load subcontractors for the first selected trade
        const trade = selectedTrades[0] as TradeCategory
        const subs = await biddingService.getSubcontractorsByTrade(trade)
        setSubcontractors(subs)

        // Initialize selected subcontractors for this trade if not already set
        if (!selectedSubcontractors[trade]) {
          setSelectedSubcontractors((prev) => ({
            ...prev,
            [trade]: [],
          }))
        }
      } catch (error) {
        console.error("Error loading subcontractors:", error)
      }
    }

    loadSubcontractors()
  }, [selectedTrades])

  // Handle item selection
  const handleItemSelect = (itemId: string, checked: boolean) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: checked,
    }))
  }

  // Handle trade selection
  const handleTradeSelect = (trade: string) => {
    setSelectedTrades((prev) => {
      if (prev.includes(trade)) {
        return prev.filter((t) => t !== trade)
      } else {
        return [...prev, trade]
      }
    })
  }

  // Handle subcontractor selection
  const handleSubcontractorSelect = (trade: string, subcontractorId: string) => {
    setSelectedSubcontractors((prev) => {
      const current = prev[trade] || []
      if (current.includes(subcontractorId)) {
        return {
          ...prev,
          [trade]: current.filter((id) => id !== subcontractorId),
        }
      } else {
        return {
          ...prev,
          [trade]: [...current, subcontractorId],
        }
      }
    })
  }

  // Handle bid details change
  const handleBidDetailsChange = (trade: string, field: "title" | "description" | "dueDate", value: string) => {
    setBidDetails((prev) => ({
      ...prev,
      [trade]: {
        ...prev[trade],
        [field]: value,
      },
    }))
  }

  // Calculate selected items count and total
  const getSelectedItemsStats = (trade?: string) => {
    let count = 0
    let total = 0

    Object.entries(tradeGroups).forEach(([groupTrade, group]) => {
      if (trade && trade !== groupTrade) return

      group.items.forEach((item) => {
        if (selectedItems[item.id]) {
          count++
          total += item.total || 0
        }
      })
    })

    return { count, total }
  }

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Create a bid request for each selected trade
      for (const trade of selectedTrades) {
        const tradeItems = tradeGroups[trade]?.items || []
        const selectedTradeItems = tradeItems.filter((item) => selectedItems[item.id])

        if (selectedTradeItems.length === 0) continue

        // Create the bid request
        const bidRequest = await biddingService.createBidRequest(
          {
            project_id: estimate.project_id,
            estimate_id: estimate.id,
            title: bidDetails[trade]?.title || `Bid Request for ${trade}`,
            description: bidDetails[trade]?.description || "",
            trade_category: trade as TradeCategory,
            due_date: bidDetails[trade]?.dueDate || undefined,
          },
          selectedTradeItems.map((item) => ({
            bid_request_id: "", // Will be filled by the service
            estimate_line_item_id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            estimated_cost: item.unit_cost,
            estimated_total: item.total,
          })),
        )

        // Add selected subcontractors to the bid request
        const subs = selectedSubcontractors[trade] || []
        if (subs.length > 0 && bidRequest) {
          await biddingService.sendBidRequest(bidRequest.id, subs)
        }
      }

      // Redirect to the bids list
      router.push("/bids")
      router.refresh()
    } catch (error) {
      console.error("Error creating bid requests:", error)
    } finally {
      setLoading(false)
    }
  }

  // Select all items in a trade
  const selectAllInTrade = (trade: string, checked: boolean) => {
    const newSelectedItems = { ...selectedItems }

    tradeGroups[trade]?.items.forEach((item) => {
      newSelectedItems[item.id] = checked
    })

    setSelectedItems(newSelectedItems)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/estimates/${estimate.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Estimate
          </Link>
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="byTrade">Group by Trade</TabsTrigger>
          <TabsTrigger value="allItems">All Line Items</TabsTrigger>
        </TabsList>

        <TabsContent value="byTrade" className="space-y-6">
          {Object.entries(tradeGroups).length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No items available for bidding.</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(tradeGroups).map(([trade, group]) => (
              <Card key={trade} className={selectedTrades.includes(trade) ? "border-primary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`trade-${trade}`}
                        checked={selectedTrades.includes(trade)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleTradeSelect(trade)
                            // Select all items in this trade
                            selectAllInTrade(trade, true)
                          } else {
                            handleTradeSelect(trade)
                            // Deselect all items in this trade
                            selectAllInTrade(trade, false)
                          }
                        }}
                      />
                      <Label htmlFor={`trade-${trade}`} className="text-lg font-semibold cursor-pointer">
                        {trade.charAt(0).toUpperCase() + trade.slice(1)} ({group.items.length} items)
                      </Label>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Estimated Cost</p>
                      <p className="font-medium">{formatCurrency(group.totalEstimatedCost)}</p>
                    </div>
                  </div>
                </CardHeader>
                {selectedTrades.includes(trade) && (
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`title-${trade}`}>Bid Request Title</Label>
                          <Input
                            id={`title-${trade}`}
                            value={bidDetails[trade]?.title || ""}
                            onChange={(e) => handleBidDetailsChange(trade, "title", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`dueDate-${trade}`}>Due Date</Label>
                          <Input
                            id={`dueDate-${trade}`}
                            type="date"
                            value={bidDetails[trade]?.dueDate || ""}
                            onChange={(e) => handleBidDetailsChange(trade, "dueDate", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`description-${trade}`}>Description</Label>
                        <Textarea
                          id={`description-${trade}`}
                          value={bidDetails[trade]?.description || ""}
                          onChange={(e) => handleBidDetailsChange(trade, "description", e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Select Subcontractors</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {subcontractors.length > 0 ? (
                            subcontractors.map((sub) => (
                              <div key={sub.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`sub-${trade}-${sub.id}`}
                                  checked={(selectedSubcontractors[trade] || []).includes(sub.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      handleSubcontractorSelect(trade, sub.id)
                                    } else {
                                      handleSubcontractorSelect(trade, sub.id)
                                    }
                                  }}
                                />
                                <Label htmlFor={`sub-${trade}-${sub.id}`} className="cursor-pointer">
                                  {sub.business_name || `${sub.first_name} ${sub.last_name}`}
                                </Label>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No subcontractors found for this trade.</p>
                          )}
                        </div>
                      </div>

                      <div className="border rounded-md">
                        <div className="p-3 border-b bg-muted/40 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`select-all-${trade}`}
                              checked={group.items.every((item) => selectedItems[item.id])}
                              onCheckedChange={(checked) => {
                                selectAllInTrade(trade, !!checked)
                              }}
                            />
                            <Label htmlFor={`select-all-${trade}`} className="font-medium cursor-pointer">
                              Select All Items
                            </Label>
                          </div>
                          <div className="text-sm">
                            {getSelectedItemsStats(trade).count} items selected (
                            {formatCurrency(getSelectedItemsStats(trade).total)})
                          </div>
                        </div>
                        <div className="divide-y">
                          {group.items.map((item) => (
                            <div key={item.id} className="p-3 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`item-${item.id}`}
                                  checked={selectedItems[item.id] || false}
                                  onCheckedChange={(checked) => handleItemSelect(item.id, !!checked)}
                                />
                                <Label htmlFor={`item-${item.id}`} className="cursor-pointer">
                                  <div>{item.description}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.quantity} {item.unit} @ {formatCurrency(item.unit_cost)}
                                  </div>
                                </Label>
                              </div>
                              <div className="font-medium">{formatCurrency(item.total)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="allItems" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <div className="p-3 border-b bg-muted/40 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all-items"
                      checked={Object.values(selectedItems).every(Boolean) && Object.keys(selectedItems).length > 0}
                      onCheckedChange={(checked) => {
                        const newSelectedItems: Record<string, boolean> = {}
                        Object.entries(tradeGroups).forEach(([_, group]) => {
                          group.items.forEach((item) => {
                            newSelectedItems[item.id] = !!checked
                          })
                        })
                        setSelectedItems(newSelectedItems)
                      }}
                    />
                    <Label htmlFor="select-all-items" className="font-medium cursor-pointer">
                      Select All Items
                    </Label>
                  </div>
                  <div className="text-sm">
                    {getSelectedItemsStats().count} items selected ({formatCurrency(getSelectedItemsStats().total)})
                  </div>
                </div>
                <div className="divide-y">
                  {Object.entries(tradeGroups).flatMap(([trade, group]) =>
                    group.items.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`all-item-${item.id}`}
                            checked={selectedItems[item.id] || false}
                            onCheckedChange={(checked) => handleItemSelect(item.id, !!checked)}
                          />
                          <Label htmlFor={`all-item-${item.id}`} className="cursor-pointer">
                            <div>{item.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} {item.unit} @ {formatCurrency(item.unit_cost)} ({trade})
                            </div>
                          </Label>
                        </div>
                        <div className="font-medium">{formatCurrency(item.total)}</div>
                      </div>
                    )),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" asChild>
          <Link href={`/estimates/${estimate.id}`}>Cancel</Link>
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || selectedTrades.length === 0 || getSelectedItemsStats().count === 0}
        >
          {loading ? "Creating..." : "Create Bid Requests"}
        </Button>
      </div>
    </div>
  )
}
