"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search } from "lucide-react" // Re-added Plus icon
import { costItemService } from "@/lib/cost-items"
import { bigboxService } from "@/lib/bigbox-service"
import type { CostItem, CostItemType } from "@/types/cost-items"
import type { BigBoxProduct } from "@/types/bigbox"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Added Select imports
import { CreateCostItemDialog } from "@/app/cost-items/components/CreateCostItemDialog"

interface CostItemSelectorDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSelectCostItem: (item: CostItem) => void
}

export function CostItemSelectorDrawer({ isOpen, onClose, onSelectCostItem }: CostItemSelectorDrawerProps) {
  const [costItems, setCostItems] = useState<CostItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<CostItemType | "all">("all")
  const [isBigboxSearchLoading, setIsBigboxSearchLoading] = useState(false) // Renamed for clarity
  const [bigboxSearchTerm, setBigboxSearchTerm] = useState("")
  const [bigboxSearchResults, setBigboxSearchResults] = useState<BigBoxProduct[]>([])
  const [isCreateCostItemDialogOpen, setIsCreateCostItemDialogOpen] = useState(false) // State for new dialog

  // Memoized fetch function to avoid re-creating on every render
  const fetchCostItems = useCallback(async () => {
    const filters = {
      search: searchTerm || undefined,
      type: filterType === "all" ? undefined : filterType,
      isActive: true,
    }
    const items = await costItemService.getCostItems(filters)
    setCostItems(items)
  }, [searchTerm, filterType])

  useEffect(() => {
    if (isOpen) { // Only fetch when the drawer is open
      fetchCostItems()
    }
  }, [isOpen, fetchCostItems]) // Depend on isOpen and memoized fetchCostItems

  const handleBigboxSearch = async () => {
    setIsBigboxSearchLoading(true)
    setBigboxSearchResults([])
    try {
      const result = await bigboxService.searchProducts(bigboxSearchTerm)
      if (result.search_results) {
        setBigboxSearchResults(result.search_results.map(sr => sr.product))
      } else {
        toast({
          title: "No BigBox Results",
          description: "No products found for your search term on BigBox.",
          variant: "default",
        })
      }
    } catch (error) {
      toast({
        title: "BigBox Search Error",
        description: error instanceof Error ? error.message : "Failed to search BigBox products.",
        variant: "destructive",
      })
    } finally {
      setIsBigboxSearchLoading(false)
    }
  }

  const handleImportBigboxProduct = async (product: BigBoxProduct) => {
    // No longer using isSubmittingNew, as it's handled by the createCostItemAction
    try {
      const importedCostItem = await bigboxService.createCostItemFromProduct(product)
      toast({ title: "Product Imported", description: `${importedCostItem.name} imported from BigBox and added to catalog.` })
      onSelectCostItem(importedCostItem)
      onClose()
    } catch (error) {
      toast({
        title: "Error Importing Product",
        description: error instanceof Error ? error.message : "Failed to import product from BigBox.",
        variant: "destructive",
      })
    }
  }

  const handleCostItemCreated = (costItemId: string) => {
    // After a new cost item is created, re-fetch the list to include it
    fetchCostItems()
    // Optionally, select the newly created item if desired
    // const newlyCreatedItem = costItems.find(item => item.id === costItemId);
    // if (newlyCreatedItem) {
    //   onSelectCostItem(newlyCreatedItem);
    // }
  }

  const costItemTypes: CostItemType[] = ["Material", "Labor", "Equipment", "Subcontractor", "Other"]

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col">
        <SheetHeader>
          <SheetTitle>Select Cost Item</SheetTitle>
          <SheetDescription>
            Browse your cost item catalog, search BigBox, or create a new item to add to the estimate.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="my-catalog" className="flex flex-col flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-catalog">My Catalog</TabsTrigger>
            <TabsTrigger value="bigbox-catalog">BigBox Catalog</TabsTrigger>
          </TabsList>

          <TabsContent value="my-catalog" className="flex flex-col flex-1 pt-4">
            <div className="flex items-center space-x-2 mb-4">
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
              <Button onClick={() => setIsCreateCostItemDialogOpen(true)}> {/* Open new dialog */}
                New Cost Item
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="w-[50px] text-right">Select</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No cost items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    costItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item_code}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => onSelectCostItem(item)}>
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="bigbox-catalog" className="flex flex-col flex-1 pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Search BigBox products (e.g., 'lawn mower')..."
                value={bigboxSearchTerm}
                onChange={(e) => setBigboxSearchTerm(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleBigboxSearch()
                  }
                }}
              />
              <Button onClick={handleBigboxSearch} disabled={isBigboxSearchLoading}>
                {isBigboxSearchLoading ? "Searching..." : <Search className="mr-2 h-4 w-4" />}
                {isBigboxSearchLoading ? "Searching..." : "Search BigBox"}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[50px] text-right">Import</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isBigboxSearchLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Searching BigBox...
                      </TableCell>
                    </TableRow>
                  ) : bigboxSearchResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No BigBox products found. Search above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bigboxSearchResults.map((product) => (
                      <TableRow key={product.item_id}>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.offers?.primary?.price || 0)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleImportBigboxProduct(product)}>
                            Import
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Integrate the new CreateCostItemDialog */}
        <CreateCostItemDialog
          isOpen={isCreateCostItemDialogOpen}
          onClose={() => setIsCreateCostItemDialogOpen(false)}
          onCostItemCreated={handleCostItemCreated}
        />
      </SheetContent>
    </Sheet>
  )
}
