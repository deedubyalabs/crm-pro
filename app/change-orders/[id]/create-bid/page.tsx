import { notFound } from "next/navigation"
import { getChangeOrderById } from "@/lib/change-orders"
import { CreateBidFromChangeOrderForm } from "./create-bid-form"

interface CreateBidFromChangeOrderPageProps {
  params: {
    id: string
  }
}

export default async function CreateBidFromChangeOrderPage({ params }: CreateBidFromChangeOrderPageProps) {
  const changeOrder = await getChangeOrderById(params.id)

  if (!changeOrder) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create Bid Request from Change Order</h1>
      <CreateBidFromChangeOrderForm changeOrder={changeOrder} />
    </div>
  )
}
