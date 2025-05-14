import { notFound } from "next/navigation"
import Link from "next/link"
import { materialListService } from "@/lib/material-list-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft, Building, Edit, FileText, ShoppingCart, Truck } from "lucide-react"

interface MaterialListPageProps {
  params: {
    id: string
  }
}

export default async function MaterialListPage({ params }: MaterialListPageProps) {
  const materialList = await materialListService.getMaterialListById(params.id)

  if (!materialList) {
    notFound()
  }

  // Helper function to get status badge
  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "finalized":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Finalized</Badge>
      case "ordered":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Ordered</Badge>
      case "partial":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Partial</Badge>
      case "complete":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper function to get item status badge
  function getItemStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "ordered":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Ordered</Badge>
      case "received":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Received</Badge>
      case "backordered":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Backordered</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Group items by supplier
  const itemsBySupplier: Record<string, typeof materialList.items> = {}
  const unassignedItems: typeof materialList.items = []

  materialList.items.forEach((item) => {
    if (item.supplier) {
      const supplierId = item.supplier.id
      if (!itemsBySupplier[supplierId]) {
        itemsBySupplier[supplierId] = []
      }
      itemsBySupplier[supplierId].push(item)
    } else {
      unassignedItems.push(item)
    }
  })

  // Calculate totals
  const totalCost = materialList.items.reduce((sum, item) => sum + (item.total_cost || 0), 0)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/material-lists">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{materialList.name}</h1>
            <div className="flex items-center mt-1 space-x-2">
              {getStatusBadge(materialList.status)}
              <span className="text-sm text-muted-foreground">Created {formatDate(materialList.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {materialList.status === "draft" && (
            <Button variant="outline" asChild>
              <Link href={`/material-lists/${materialList.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {(materialList.status === "draft" || materialList.status === "finalized") && (
            <Button asChild>
              <Link href={`/material-lists/${materialList.id}/purchase-orders/new`}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">
                <Link href={`/projects/${materialList.project.id}`} className="hover:underline flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  {materialList.project.project_name}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {materialList.estimate && (
          <Card>
            <CardHeader>
              <CardTitle>Source Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">
                  <Link href={`/estimates/${materialList.estimate.id}`} className="hover:underline flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {materialList.estimate.estimate_number}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Material List Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span>{getStatusBadge(materialList.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Items:</span>
                <span>{materialList.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-bold">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialList.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No materials found.
                  </TableCell>
                </TableRow>
              ) : (
                materialList.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.description}
                      {item.costItem && (
                        <div className="text-xs text-muted-foreground mt-1">Item Code: {item.costItem.item_code}</div>
                      )}
                      {item.waste_factor > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Base Qty: {item.base_quantity} + {item.waste_factor}% waste
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_cost || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total_cost || 0)}</TableCell>
                    <TableCell>
                      {item.supplier ? (
                        <span>{item.supplier.name}</span>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>{getItemStatusBadge(item.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-6">
            <div className="w-1/3 space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>

          {materialList.description && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-muted-foreground whitespace-pre-line">{materialList.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(itemsBySupplier).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Materials by Supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(itemsBySupplier).map(([supplierId, items]) => {
              const supplier = items[0].supplier
              const supplierTotal = items.reduce((sum, item) => sum + (item.total_cost || 0), 0)

              return (
                <div key={supplierId} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center">
                      <Truck className="mr-2 h-4 w-4" />
                      {supplier?.name}
                    </h3>
                    <span className="font-medium">{formatCurrency(supplierTotal)}</span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.description}
                            {item.costItem && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Item Code: {item.costItem.item_code}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_cost || 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.total_cost || 0)}</TableCell>
                          <TableCell>{getItemStatusBadge(item.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            })}

            {unassignedItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Unassigned Items</h3>
                  <span className="font-medium">
                    {formatCurrency(unassignedItems.reduce((sum, item) => sum + (item.total_cost || 0), 0))}
                  </span>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassignedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.description}
                          {item.costItem && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Item Code: {item.costItem.item_code}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_cost || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total_cost || 0)}</TableCell>
                        <TableCell>{getItemStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
