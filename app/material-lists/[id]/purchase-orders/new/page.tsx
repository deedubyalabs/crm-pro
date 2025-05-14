import { notFound } from "next/navigation"
import { materialListService } from "@/lib/material-list-service"
import { supplierService } from "@/lib/supplier-service"
import CreatePurchaseOrderForm from "./create-purchase-order-form"

interface CreatePurchaseOrderPageProps {
  params: {
    id: string
  }
}

export default async function CreatePurchaseOrderPage({ params }: CreatePurchaseOrderPageProps) {
  const materialList = await materialListService.getMaterialListById(params.id)

  if (!materialList) {
    notFound()
  }

  // Get all suppliers
  const suppliers = await supplierService.getSuppliers({ isActive: true })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Purchase Order</h1>
        <p className="text-muted-foreground">Generate a purchase order from material list: {materialList.name}</p>
      </div>

      <CreatePurchaseOrderForm materialList={materialList} suppliers={suppliers} />
    </div>
  )
}
