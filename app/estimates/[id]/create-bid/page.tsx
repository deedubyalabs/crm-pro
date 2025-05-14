import { notFound } from "next/navigation"
import { estimateService } from "@/lib/estimates"
import { CreateBidFromEstimateForm } from "./create-bid-form"

interface CreateBidFromEstimatePageProps {
  params: {
    id: string
  }
}

export default async function CreateBidFromEstimatePage({ params }: CreateBidFromEstimatePageProps) {
  const estimate = await estimateService.getEstimateById(params.id)

  if (!estimate) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create Bid Request from Estimate</h1>
      <CreateBidFromEstimateForm estimate={estimate} />
    </div>
  )
}
