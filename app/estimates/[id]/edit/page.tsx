import { notFound, redirect } from "next/navigation"
import { estimateService } from "@/lib/estimates"
import UnifiedEstimateClientPage from "../../UnifiedEstimateClientPage" // Import UnifiedEstimateClientPage
import type { EstimateWithDetails } from "@/types/estimates" // Import EstimateWithDetails type

export const metadata = {
  title: "Edit Estimate | HomePro OS",
  description: "Edit an estimate",
}

export default async function EditEstimatePage({ params: { id } }: { params: { id: string } }) {
  // Handle the "new" route parameter by redirecting to the new estimate page
  if (id === "new") {
    redirect("/estimates/new")
  }

  const estimate: EstimateWithDetails | null = await estimateService.getEstimateById(id)

  if (!estimate) {
    notFound()
  }

  return <UnifiedEstimateClientPage estimate={estimate} /> // Use UnifiedEstimateClientPage and pass estimate
}
