import { type NextRequest, NextResponse } from "next/server"
import { purchaseOrderService } from "@/lib/purchase-order-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const materialListId = params.id
    const { group_by_supplier, supplier_id, delivery_date, notes } = await request.json()

    // Generate purchase orders from material list
    const purchaseOrders = await purchaseOrderService.generateFromMaterialList(materialListId, {
      groupBySupplier: group_by_supplier,
      deliveryDate: delivery_date,
    })

    return NextResponse.json(purchaseOrders)
  } catch (error) {
    console.error("Error generating purchase orders:", error)
    return NextResponse.json({ message: error instanceof Error ? error.message : "An error occurred" }, { status: 500 })
  }
}
