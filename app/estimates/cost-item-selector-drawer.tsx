"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useInView } from "react-intersection-observer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog" // Changed from Sheet to Dialog
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Trash2 } from "lucide-react" // Import Trash2 icon
import { costItemService } from "@/lib/cost-items"
import type { CostItem, CostItemType } from "@/types/cost-items"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateCostItemDialog } from "@/app/cost-items/components/CreateCostItemDialog"
import { cn } from "@/lib/utils" // Import cn for conditional classNames

interface CostItemSelectorDialogProps { // Renamed interface
  isOpen: boolean
  onClose: () => void
  onSelectCostItems: (items: CostItem[]) => void
}

export function CostItemSelectorDrawer({ isOpen, onClose, onSelectCostItems }: CostItemSelectorDialogProps) {
  const [costItems, setCostItems] = useState<CostItem[]>([])
  const [selectedCostItems, setSelectedCostItems] = useState<CostItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<CostItemType | "all">("all")
  const [isCreateCostItemDialogOpen, setIsCreateCostItemDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const itemsPerPage = 30 // Increased items per page for better scrolling experience
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const fetchCostItems = useCallback(async (page: number) => {
    setIsLoading(true)
    const filters = {
      search: searchTerm || undefined,
      type: filterType === "all" ? undefined : filterType,
      isActive: true,
      page: page,
      limit: itemsPerPage,
    }
    const { costItems: fetchedItems, totalCount } = await costItemService.getCostItems(filters)
    
    if (page === 1) {
      setCostItems(fetchedItems)
    } else {
      setCostItems((prev) => [...prev, ...fetchedItems])
    }

    if (fetchedItems.length < itemsPerPage || costItems.length + fetchedItems.length >= totalCount) {
      setHasMore(false)
    } else {
      setHasMore(true)
    }
    setIsLoading(false)
  }, [searchTerm, filterType, itemsPerPage])

  // Effect for initial load and filter changes
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1)
      setHasMore(true)
      fetchCostItems(1)
      setSelectedCostItems([])
    }
  }, [isOpen, searchTerm, filterType]) // Removed fetchCostItems from here to avoid re-triggering

  // Effect for infinite scrolling
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchCostItems(nextPage)
    }
  }, [inView, hasMore, isLoading, currentPage])

  const handleCostItemCreated = (newCostItem: CostItem) => {
    setCostItems(prev => [newCostItem, ...prev]);
    setSelectedCostItems((prev) => [...prev, newCostItem]);
    setIsCreateCostItemDialogOpen(false);
  }

  const handleCheckboxChange = (item: CostItem, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCostItems((prev) => [...prev, item])
    } else {
      setSelectedCostItems((prev) => prev.filter((selectedItem) => selectedItem.id !== item.id))
    }
  }

  const handleAddSelectedItems = () => {
    onSelectCostItems(selectedCostItems)
    onClose()
  }

  const costItemTypes: CostItemType[] = ["Material", "Labor", "Equipment", "Subcontractor", "Other"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-6">
          <DialogTitle>Select Cost Item</DialogTitle>
          <DialogDescription>
            Choose from your library or create a new item.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 px-6 pb-6 min-h-0">
          {/* Left Column: Tabs for My Catalog and BigBox */}
          <div className="flex flex-col flex-1 pr-4 border-r">
                <div className="flex items-center space-x-2 mb-4 flex-shrink-0">
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filterType} onValueChange={(value) => setFilterType(value as CostItemType | "all")}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {costItemTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setIsCreateCostItemDialogOpen(true)}>
                    New Cost Item
                  </Button>
                </div>

                <div className="flex-1 rounded-md border overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Select</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {costItems.map((item, index) => (
                          <TableRow
                            key={item.id}
                            ref={index === costItems.length - 1 ? ref : null}
                            className={cn(
                              "cursor-pointer text-xs",
                              selectedCostItems.some((selected) => selected.id === item.id) ? "bg-blue-50/50" : ""
                            )}
                            onClick={() => handleCheckboxChange(item, !selectedCostItems.some((selected) => selected.id === item.id))}
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedCostItems.some((selected) => selected.id === item.id)}
                                onChange={(e) => handleCheckboxChange(item, e.target.checked)}
                                className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{item.item_code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                          </TableRow>
                        ))}
                        {isLoading && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              Loading...
                            </TableCell>
                          </TableRow>
                        )}
                        {!hasMore && costItems.length === 0 && (
                           <TableRow>
                             <TableCell colSpan={5} className="text-center">
                               No cost items found.
                             </TableCell>
                           </TableRow>
                        )}
                      </TableBody>
                    </Table>
                </div>
          </div>

          {/* Right Column: Selected Items Summary and Add Button */}
          <div className="flex flex-col w-1/4 pl-4">
            <h3 className="text-lg font-semibold mb-2">Selected Items ({selectedCostItems.length})</h3>
            <div className="flex-1 overflow-y-auto border rounded-md p-2">
              {selectedCostItems.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No items selected yet.</p>
              ) : (
                <ul className="space-y-1">
                  {selectedCostItems.map((item) => (
                    <li key={item.id} className="flex justify-between items-center text-xs">
                    <span>{item.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCheckboxChange(item, false)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              )}
            </div>
            <Button onClick={handleAddSelectedItems} className="w-full mt-4">
              Add Selected Items ({selectedCostItems.length})
            </Button>
          </div>
        </div>

        {/* Integrate the new CreateCostItemDialog */}
        <CreateCostItemDialog
          isOpen={isCreateCostItemDialogOpen}
          onClose={() => setIsCreateCostItemDialogOpen(false)}
          onCostItemCreated={handleCostItemCreated}
        />
      </DialogContent>
    </Dialog>
  )
}
