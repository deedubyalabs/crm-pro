"use client"

import { useState, useEffect, useCallback } from "react"
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
import { bigboxService } from "@/lib/bigbox-service"
import type { CostItem, CostItemType } from "@/types/cost-items"
import type { BigBoxProduct } from "@/types/bigbox"
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
  const [isBigboxSearchLoading, setIsBigboxSearchLoading] = useState(false)
  const [bigboxSearchTerm, setBigboxSearchTerm] = useState("")
  const [bigboxSearchResults, setBigboxSearchResults] = useState<BigBoxProduct[]>([])
  const [isCreateCostItemDialogOpen, setIsCreateCostItemDialogOpen] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCostItems, setTotalCostItems] = useState(0)
  const itemsPerPage = 20 // Set a default limit

  const fetchCostItems = useCallback(async () => {
    const filters = {
      search: searchTerm || undefined,
      type: filterType === "all" ? undefined : filterType,
      isActive: true,
      page: currentPage, // Pass current page
      limit: itemsPerPage, // Pass items per page
    }
    const { costItems: fetchedItems, totalCount } = await costItemService.getCostItems(filters)
    setCostItems(fetchedItems)
    setTotalCostItems(totalCount)
  }, [searchTerm, filterType, currentPage, itemsPerPage]) // Add currentPage and itemsPerPage to dependencies

  useEffect(() => {
    if (isOpen) {
      fetchCostItems()
      setSelectedCostItems([])
      setCurrentPage(1) // Reset to first page when dialog opens
    }
  }, [isOpen, fetchCostItems])

  useEffect(() => {
    if (isOpen) {
      fetchCostItems()
      setSelectedCostItems([]) // Clear selected items when dialog opens
    }
  }, [isOpen, fetchCostItems])

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
    try {
      const importedCostItem = await bigboxService.createCostItemFromProduct(product)
      toast({ title: "Product Imported", description: `${importedCostItem.name} imported from BigBox and added to catalog.` })
      setSelectedCostItems((prev) => [...prev, importedCostItem])
    } catch (error) {
      toast({
        title: "Error Importing Product",
        description: error instanceof Error ? error.message : "Failed to import product from BigBox.",
        variant: "destructive",
      })
    }
  }

  const handleCostItemCreated = (costItemId: string) => {
    fetchCostItems()
    const newlyCreatedItem = costItems.find(item => item.id === costItemId);
    if (newlyCreatedItem) {
      setSelectedCostItems((prev) => [...prev, newlyCreatedItem]);
    }
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
      <DialogContent className="max-w-[90vw] h-[95vh] flex flex-col p-0"> {/* Adjusted size to 90vw, increased height, removed padding */}
        <DialogHeader className="p-6"> {/* Re-added padding to header */}
          <DialogTitle>Select Cost Item</DialogTitle>
          <DialogDescription>
            Browse your cost item catalog, search BigBox, or create a new item to add to the estimate.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 px-6 pb-6"> {/* Main content area with two columns, re-added padding */}
          {/* Left Column: Tabs for My Catalog and BigBox */}
          <div className="flex flex-col flex-1 pr-4 border-r">
            <Tabs defaultValue="my-catalog" className="flex flex-col flex-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-catalog">My Catalog</TabsTrigger>
                <TabsTrigger value="bigbox-catalog">BigBox Catalog</TabsTrigger>
              </TabsList>

              <TabsContent value="my-catalog" className="flex flex-col flex-1 min-h-0">
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

                <div className="flex-1 basis-0 rounded-md border min-h-0 overflow-y-auto"> {/* Make this div scrollable */}
                  <div className="h-full"> {/* Removed overflow-y-auto from here */}
                    <Table className="w-full h-full"> {/* Added h-full to table */}
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
                        {costItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              No cost items found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          costItems.map((item) => (
                            <TableRow
                              key={item.id}
                              className={cn(
                                "cursor-pointer",
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
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                {/* Pagination Controls */}
                <div className="flex items-center justify-between flex-shrink-0 p-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {Math.ceil(totalCostItems / itemsPerPage) || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage * itemsPerPage >= totalCostItems}
                  >
                    Next
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="bigbox-catalog" className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center space-x-2 mb-4 flex-shrink-0">
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

                <div className="flex-1 basis-0 rounded-md border min-h-0 overflow-y-auto">
                  <div className="h-full">
                    <Table className="h-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="w-[50px] text-right">Import</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="min-h-[calc(100vh-350px)]"> {/* Added min-height to ensure it takes up more space */}
                        {isBigboxSearchLoading ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center"> {/* Removed h-24 */}
                              Searching BigBox...
                            </TableCell>
                          </TableRow>
                        ) : bigboxSearchResults.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center"> {/* Removed h-24 */}
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
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Selected Items Summary and Add Button */}
          <div className="flex flex-col w-1/3 pl-4"> {/* Adjusted width */}
            <h3 className="text-lg font-semibold mb-2">Selected Items ({selectedCostItems.length})</h3>
            <div className="flex-1 overflow-y-auto border rounded-md p-2">
              {selectedCostItems.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No items selected yet.</p>
              ) : (
                <ul className="space-y-1">
                  {selectedCostItems.map((item) => (
                    <li key={item.id} className="flex justify-between items-center text-sm">
                    <span>{item.name}</span>
                    <Button
                      variant="ghost"
                      size="icon" // Changed size to icon
                      onClick={() => handleCheckboxChange(item, false)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" /> {/* Replaced text with icon */}
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
