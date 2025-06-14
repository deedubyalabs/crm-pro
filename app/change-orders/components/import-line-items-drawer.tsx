"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SideDrawer } from "@/components/side-drawer"
import { Heading } from "@/components/ui/heading"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { estimateService } from "@/lib/estimates"
import { blueprintOfValuesService } from "@/lib/blueprint-of-values"
import { EstimateWithDetails, EstimateLineItem } from "@/types/estimates"
import { BlueprintOfValuesWithItems, BlueprintOfValuesItem } from "@/types/blueprint-of-values"
import { ChangeOrderLineItem } from "@/types/change-orders"
import { Loader2 } from "lucide-react"

interface ImportLineItemsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onImport: (lineItems: Partial<ChangeOrderLineItem>[]) => void;
}

type SourceType = "estimate" | "bov" | "";

export function ImportLineItemsDrawer({ isOpen, onClose, projectId, onImport }: ImportLineItemsDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sourceType, setSourceType] = useState<SourceType>("")
  const [selectedSourceId, setSelectedSourceId] = useState<string>("")
  const [estimates, setEstimates] = useState<EstimateWithDetails[]>([])
  const [bovs, setBovs] = useState<BlueprintOfValuesWithItems[]>([])
  const [availableLineItems, setAvailableLineItems] = useState<Partial<ChangeOrderLineItem>[]>([])
  const [selectedLineItemIds, setSelectedLineItemIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen && projectId) {
      const fetchSources = async () => {
        setIsLoading(true)
        try {
          const fetchedEstimates = await estimateService.getEstimatesByProjectId(projectId)
          setEstimates(fetchedEstimates)
          const fetchedBovs = await blueprintOfValuesService.getBlueprintOfValuesByProjectId(projectId) // This will still error, will fix after reading lib/project-of-values.ts
          setBovs(fetchedBovs)
        } catch (error) {
          console.error("Error fetching sources:", error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchSources()
    } else {
      // Reset state when drawer closes
      setSourceType("")
      setSelectedSourceId("")
      setAvailableLineItems([])
      setSelectedLineItemIds(new Set())
    }
  }, [isOpen, projectId])

  useEffect(() => {
    const fetchLineItems = async () => {
      if (selectedSourceId && sourceType) {
        setIsLoading(true)
        try {
          let items: Partial<ChangeOrderLineItem>[] = []
          if (sourceType === "estimate") {
            const estimate = estimates.find(e => e.id === selectedSourceId)
            if (estimate?.lineItems) {
              items = estimate.lineItems.map((item: EstimateLineItem) => ({ // Explicitly type item
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unit_price: item.unit_cost, // Changed from unit_price to unit_cost
                total: item.total,
              }))
            }
          } else if (sourceType === "bov") {
            const bov = bovs.find(s => s.id === selectedSourceId)
            if (bov?.items) { // Changed from lineItems to items
              items = bov.items.map((item: BlueprintOfValuesItem) => ({ // Explicitly type item
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unit_price: item.unit_price,
                total: item.total,
              }))
            }
          }
          setAvailableLineItems(items)
          setSelectedLineItemIds(new Set(items.map((_, idx) => `${selectedSourceId}-${idx}`))) // Select all by default
        } catch (error) {
          console.error("Error fetching line items:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setAvailableLineItems([])
        setSelectedLineItemIds(new Set())
      }
    }
    fetchLineItems()
  }, [selectedSourceId, sourceType, estimates, bovs])

  const handleCheckboxChange = (id: string, isChecked: boolean) => {
    setSelectedLineItemIds(prev => {
      const newSet = new Set(prev)
      if (isChecked) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  const handleImport = () => {
    const importedItems = availableLineItems.filter((_item, idx) =>
      selectedLineItemIds.has(`${selectedSourceId}-${idx}`)
    )
    onImport(importedItems)
    onClose()
  }

  return (
    <SideDrawer isOpen={isOpen} onClose={onClose} title="Import Line Items">
      <div className="p-4 flex flex-col h-full">
        <Heading title="Import Line Items" description="Select items from an existing Estimate or Blueprint of Values." />

        <div className="mt-4 space-y-4">
          <Select onValueChange={(value: SourceType) => { setSourceType(value); setSelectedSourceId("") }} value={sourceType}>
            <SelectTrigger>
              <SelectValue placeholder="Select source type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="estimate">Estimate</SelectItem>
              <SelectItem value="bov">Blueprint of Values</SelectItem>
            </SelectContent>
          </Select>

          {sourceType === "estimate" && (
            <Select onValueChange={setSelectedSourceId} value={selectedSourceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an Estimate" />
              </SelectTrigger>
              <SelectContent>
                {estimates.map(estimate => (
                  <SelectItem key={estimate.id} value={estimate.id}>
                    {estimate.estimate_number} - {estimate.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {sourceType === "bov" && (
            <Select onValueChange={setSelectedSourceId} value={selectedSourceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a Blueprint of Values" />
              </SelectTrigger>
              <SelectContent>
                {bovs.map(bov => (
                  <SelectItem key={bov.id} value={bov.id}>
                    {bov.bov_number} - {bov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="mt-6 flex-grow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : availableLineItems.length > 0 ? (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {availableLineItems.map((item, idx) => {
                  const itemId = `${selectedSourceId}-${idx}`
                  return (
                    <div key={itemId} className="flex items-center space-x-2 p-2 border rounded-md">
                      <Checkbox
                        id={itemId}
                        checked={selectedLineItemIds.has(itemId)}
                        onCheckedChange={(checked) => handleCheckboxChange(itemId, !!checked)}
                      />
                      <Label htmlFor={itemId} className="grid gap-1.5 leading-none">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} @ ${item.unit_price?.toFixed(2)} = ${item.total?.toFixed(2)}
                        </div>
                      </Label>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {selectedSourceId ? "No line items found for the selected source." : "Select a source to view line items."}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isLoading || selectedLineItemIds.size === 0}>
            {isLoading ? "Importing..." : `Import Selected (${selectedLineItemIds.size})`}
          </Button>
        </div>
      </div>
    </SideDrawer>
  )
}
