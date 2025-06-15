import type { Metadata } from "next"
import { estimateService } from "@/lib/estimates"
import { EstimatesList } from "./estimates-list"
import { EstimateStatus } from "@/types/estimates"

export const metadata: Metadata = {
  title: "Estimates | PROActive OS",
  description: "Manage your estimates",
}

export default async function EstimatesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const awaitedSearchParams = await searchParams;

  const status = typeof awaitedSearchParams.status === "string" ? awaitedSearchParams.status as EstimateStatus : undefined
  const search = typeof awaitedSearchParams.search === "string" ? awaitedSearchParams.search : undefined
  const opportunityId = typeof awaitedSearchParams.opportunityId === "string" ? awaitedSearchParams.opportunityId : undefined
  const personId = typeof awaitedSearchParams.personId === "string" ? awaitedSearchParams.personId : undefined
  const startDate = typeof awaitedSearchParams.startDate === "string" ? awaitedSearchParams.startDate : undefined
  const endDate = typeof awaitedSearchParams.endDate === "string" ? awaitedSearchParams.endDate : undefined

  const estimates = await estimateService.getEstimates({
    status,
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
