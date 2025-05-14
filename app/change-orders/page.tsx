import type { Metadata } from "next"
import { getChangeOrders } from "@/lib/change-orders"
import ChangeOrdersList from "./change-orders-list"

export const metadata: Metadata = {
  title: "Change Orders | HomePro OS",
  description: "Manage your change orders",
}

export default async function ChangeOrdersPage() {
  const changeOrders = await getChangeOrders()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Change Orders</h1>
      </div>

      <ChangeOrdersList changeOrders={changeOrders} />
    </div>
  )
}
