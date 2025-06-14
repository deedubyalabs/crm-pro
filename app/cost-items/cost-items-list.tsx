"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Trash2, MoreHorizontal } from "lucide-react"
import type { CostItem, CostItemGroup } from "@/types/cost-items"
import { formatCurrency } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { costItemService } from "@/lib/cost-items" // Import costItemService

interface CostItemsListProps {
  costItems: CostItem[]
  costItemGroups: CostItemGroup[]
  totalCount: number // New: total count for pagination
}

export function CostItemsList({ costItems, costItemGroups, totalCount }: CostItemsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [selectedItems, setSelectedItems] = useState<string[]>([]) // New: for bulk delete

  // Pagination state
  const itemsPerPage = parseInt(searchParams.get("limit") || "10") // Dynamic items per page
  const currentPage = parseInt(searchParams.get("page") || "1")
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Get current filter values from URL
  const currentType = searchParams.get("type") || ""
  const currentActive = searchParams.get("isActive") || ""
  const currentGroupId = searchParams.get("groupId") || ""

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    params.set("page", "1") // Reset to first page on new search

    router.push(`/cost-items?${params.toString()}`)
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set("page", "1") // Reset to first page on new filter

    router.push(`/cost-items?${params.toString()}`)
  }

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/cost-items?${params.toString()}`)
  }

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("limit", value)
    params.set("page", "1") // Reset to first page on limit change
    router.push(`/cost-items?${params.toString()}`)
  }

  // Handle individual item selection for bulk delete
  const handleSelectItem = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems((prev) => [...prev, id])
    } else {
      setSelectedItems((prev) => prev.filter((item) => item !== id))
    }
  }

  // Handle select all items for bulk delete
  const handleSelectAllItems = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(costItems.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await costItemService.bulkDeleteCostItems(selectedItems)
      toast({
        title: "Cost Items Deleted",
        description: `${selectedItems.length} cost item(s) have been deleted.`,
      })
      setSelectedItems([]) // Clear selection after deletion
      router.refresh() // Refresh the list after deletion
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete cost items. Please try again.",
        variant: "destructive",
      })
      console.error("Error deleting cost items:", error)
    }
  }

  // Get type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Material":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Material
          </Badge>
        )
      case "Labor":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Labor
          </Badge>
        )
      case "Equipment":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            Equipment
          </Badge>
        )
      case "Subcontractor":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
            Subcontractor
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
            Other
          </Badge>
        )
    }
  }

  return (
    <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] text-center">
                    <Checkbox
                      checked={selectedItems.length === costItems.length && costItems.length > 0}
                      onCheckedChange={handleSelectAllItems}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Markup</TableHead>
                  <TableHead>Cost Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No cost items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  costItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="w-[40px] text-center">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked === true)}
                          aria-label={`Select item ${item.name}`}
                        />
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{getTypeBadge(item.type)}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                      <TableCell className="text-right">{item.default_markup}%</TableCell>
                      <TableCell className="font-medium">{item.item_code}</TableCell>
                      <TableCell>
                        {item.is_active ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/cost-items/${item.id}`}>View</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/cost-items/${item.id}/edit`}>Edit</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            {selectedItems.length > 0 ? (
              <div className="flex-1 text-sm text-muted-foreground">
                {selectedItems.length} of {costItems.length} row(s) selected.
              </div>
            ) : (
              <div className="flex-1 text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} items.
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
              {selectedItems.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Selected ({selectedItems.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the selected cost items.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
    </>
  )
}
