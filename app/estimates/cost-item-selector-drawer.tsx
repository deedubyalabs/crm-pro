"use client"

import { useState, useEffect } from "react"
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
import { Plus, Search } from "lucide-react"
import { costItemService } from "@/lib/cost-items"
import { bigboxService } from "@/lib/bigbox-service" // Import bigboxService
import type { CostItem, CostItemType, NewCostItem } from "@/types/cost-items"
import type { BigBoxProduct } from "@/types/bigbox" // Import BigBoxProduct type
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCostItemAction } from "@/app/cost-items/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Import Tabs components

interface CostItemSelectorDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSelectCostItem: (item: CostItem) => void
}

export function CostItemSelectorDrawer({ isOpen, onClose, onSelectCostItem }: CostItemSelectorDrawerProps) {
  const [costItems, setCostItems] = useState<CostItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<CostItemType | "all">("all")
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newCostItem, setNewCostItem] = useState<Partial<NewCostItem>>({
    item_code: "",
    name: "",
    type: "Material",
    unit: "EA",
    unit_cost: 0,
    default_markup: 0,
    is_active: true,
  })
  const [isSubmittingNew, setIsSubmittingNew] = useState(false)
  const [bigboxSearchTerm, setBigboxSearchTerm] = useState("") // New state for BigBox search
  const [bigboxSearchResults, setBigboxSearchResults] = useState<BigBoxProduct[]>([]) // New state for BigBox results
  const [isSearchingBigbox, setIsSearchingBigbox] = useState(false) // New state for BigBox search loading

  useEffect(() => {
    const fetchCostItems = async () => {
      const filters = {
        search: searchTerm || undefined,
        type: filterType === "all" ? undefined : filterType,
        isActive: true, // Only show active items in selector
      }
      const items = await costItemService.getCostItems(filters)
      setCostItems(items)
    }
    fetchCostItems()
  }, [searchTerm, filterType])

  const handleCreateNewCostItem = async () => {
    setIsSubmittingNew(true)
    try {
      // Basic validation
      if (!newCostItem.item_code || !newCostItem.name || !newCostItem.type || !newCostItem.unit) {
        throw new Error("Please fill all required fields for the new cost item.")
      }
      if (newCostItem.unit_cost === undefined || newCostItem.unit_cost < 0) {
        throw new Error("Unit cost must be a non-negative number.")
      }
      if (newCostItem.default_markup === undefined || newCostItem.default_markup < 0) {
        throw new Error("Default markup must be a non-negative number.")
      }

      const createdItem = await createCostItemAction(newCostItem as NewCostItem)
      toast({ title: "Cost Item Created", description: `${createdItem.name} has been added to your catalog.` })
      onSelectCostItem(createdItem) // Select the newly created item
      setIsCreatingNew(false)
      onClose()
    } catch (error) {
      toast({
        title: "Error Creating Cost Item",
        description: error instanceof Error ? error.message : "Failed to create new cost item.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingNew(false)
    }
  }

  const handleBigboxSearch = async () => {
    setIsSearchingBigbox(true)
    setBigboxSearchResults([]) // Clear previous results
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
      setIsSearchingBigbox(false)
    }
  }

  const handleImportBigboxProduct = async (product: BigBoxProduct) => {
    setIsSubmittingNew(true) // Use this to indicate import is in progress
    try {
      const importedCostItem = await bigboxService.createCostItemFromProduct(product)
      toast({ title: "Product Imported", description: `${importedCostItem.name} imported from BigBox and added to catalog.` })
      onSelectCostItem(importedCostItem) // Select the newly imported item
      onClose()
    } catch (error) {
      toast({
        title: "Error Importing Product",
        description: error instanceof Error ? error.message : "Failed to import product from BigBox.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingNew(false)
    }
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
              <Button onClick={() => setIsCreatingNew(true)}>
                <Plus className="mr-2 h-4 w-4" /> New
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
              <Button onClick={handleBigboxSearch} disabled={isSearchingBigbox}>
                {isSearchingBigbox ? "Searching..." : <Search className="mr-2 h-4 w-4" />}
                {isSearchingBigbox ? "Searching..." : "Search BigBox"}
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
                  {isSearchingBigbox ? (
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
                          <Button variant="ghost" size="sm" onClick={() => handleImportBigboxProduct(product)} disabled={isSubmittingNew}>
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

        <Dialog open={isCreatingNew} onOpenChange={setIsCreatingNew}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Cost Item</DialogTitle>
              <DialogDescription>
                Enter details for a new cost item. It will be added to your catalog.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-code" className="text-right">
                  Item Code
                </Label>
                <Input
                  id="new-item-code"
                  value={newCostItem.item_code || ""}
                  onChange={(e) => setNewCostItem({ ...newCostItem, item_code: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="new-item-name"
                  value={newCostItem.name || ""}
                  onChange={(e) => setNewCostItem({ ...newCostItem, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-type" className="text-right">
                  Type
                </Label>
                <Select
                  value={newCostItem.type || ""}
                  onValueChange={(value) => setNewCostItem({ ...newCostItem, type: value as CostItemType })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {costItemTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-unit" className="text-right">
                  Unit
                </Label>
                <Input
                  id="new-item-unit"
                  value={newCostItem.unit || ""}
                  onChange={(e) => setNewCostItem({ ...newCostItem, unit: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-unit-cost" className="text-right">
                  Unit Cost
                </Label>
                <Input
                  id="new-item-unit-cost"
                  type="number"
                  step="0.01"
                  value={newCostItem.unit_cost || 0}
                  onChange={(e) => setNewCostItem({ ...newCostItem, unit_cost: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-markup" className="text-right">
                  Default Markup (%)
                </Label>
                <Input
                  id="new-item-markup"
                  type="number"
                  step="0.01"
                  value={newCostItem.default_markup || 0}
                  onChange={(e) => setNewCostItem({ ...newCostItem, default_markup: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="new-item-description"
                  value={newCostItem.description || ""}
                  onChange={(e) => setNewCostItem({ ...newCostItem, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateNewCostItem} disabled={isSubmittingNew}>
                {isSubmittingNew ? "Creating..." : "Create Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  )
}
