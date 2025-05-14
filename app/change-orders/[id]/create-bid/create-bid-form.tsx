"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { biddingService } from "@/lib/bidding-service"
import type { ChangeOrderWithProject } from "@/lib/change-orders"
import type { TradeCategory, TradeGroupedItems } from "@/types/bidding"
import type { Person } from "@/types/people"

interface CreateBidFromChangeOrderFormProps {
  changeOrder: ChangeOrderWithProject
}

export function CreateBidFromChangeOrderForm({ changeOrder }: CreateBidFromChangeOrderFormProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<string>("byTrade")
  const [tradeGroups, setTradeGroups] = useState<TradeGroupedItems>({})
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [selectedTrades, setSelectedTrades] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [subcontractors, setSubcontractors] = useState<Person[]>([])
  const [selectedSubcontractors, setSelectedSubcontractors] = useState<Record<string, string[]>>({})
  const [bidDetails, setBidDetails] = useState<Record<string, { title: string; description: string; dueDate: string }>>({})

  // Load trade-grouped items on component mount
  useEffect(() => {
    const loadTradeGroups = async () => {
      try {
        const groups = await biddingService.getTradeGroupedItems(undefined, changeOrder.id, { excludeWithBids: true })
        setTradeGroups(groups)

        // Initialize bid details for each trade
        const initialBidDetails: Record<string, { title: string; description: string; dueDate: string }> = {}
        Object.keys(groups).forEach((trade) => {
          initialBidDetails[trade] = {
            title: `${changeOrder.co_number || 'Change Order'} - ${trade.charAt(0).toUpperCase() + trade.slice(1)} Work`,
            description: `Bid request for ${trade} work from change order ${changeOrder.co_number || changeOrder.id}`,
            dueDate: '',
          }
        })
        setBidDetails(initialBidDetails)
      } catch (error) {
        console.error("Error loading trade groups:", error)
      }
    }

    loadTradeGroups()
  }, [changeOrder.id, changeOrder.co_number])

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
  const handleBidDetailsChange = (
    trade: string,
    field: 'title' | 'description' | 'dueDate',
    value: string
  ) => {
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
            project_id: changeOrder.project_id,
            change_order_id: changeOrder.id,
            title: bidDetails[trade]?.title || `Bid Request for ${trade}`,
            description: bidDetails[trade]?.description || '',
            trade_category: trade as TradeCategory,
            due_date: bidDetails[trade]?.dueDate || undefined,
          },
          selectedTradeItems.map((item) => ({
            bid_request_id: '', // Will be filled by the service
            change_order_line_item_id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            estimated_cost: item.unit_cost,
            estimated_total: item.total,
          }))
        )

        // Add selected subcontractors to the bid request
        const subs = selectedSubcontractors[trade] || []
        if (subs.length > 0 && bidRequest) {
          await biddingService.sendBidRequest(bidRequest.id, subs)
        }
      }

      // Redirect to the bids list
      router.push('/bids')
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
          <Link href={`/change-orders/${changeOrder.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Change Order
          </Link>
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="byTrade">Group by Trade</TabsTrigger>
          <TabsTrigger\
