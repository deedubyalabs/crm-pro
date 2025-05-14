import type { Metadata } from "next"
import { estimateService } from "@/lib/estimates"
import { EstimatesList } from "./estimates-list"

export const metadata: Metadata = {
  title: "Estimates | HomePro OS",
  description: "Manage your estimates",
}

export default async function EstimatesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const opportunityId = typeof searchParams.opportunityId === "string" ? searchParams.opportunityId : undefined
  const personId = typeof searchParams.personId === "string" ? searchParams.personId : undefined
  const startDate = typeof searchParams.startDate === "string" ? searchParams.startDate : undefined
  const endDate = typeof searchParams.endDate === "string" ? searchParams.endDate : undefined

  const estimates = await estimateService.getEstimates({
    status: status as any,
    search,
    opportunityId,
    personId,
    startDate,
    endDate,
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <EstimatesList estimates={estimates} />
    </div>
  )
}
