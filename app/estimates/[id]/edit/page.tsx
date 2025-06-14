import { notFound, redirect } from "next/navigation"
import { estimateService } from "@/lib/estimates"
import UnifiedEstimateClientPage from "../../UnifiedEstimateClientPage" // Import UnifiedEstimateClientPage
import type { EstimateWithDetails } from "@/types/estimates" // Import EstimateWithDetails type

export const metadata = {
  title: "Edit Estimate | PROActive ONE",
  description: "Edit an estimate",
}

export default async function EditEstimatePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Handle the "new" route parameter by redirecting to the new estimate page
  if (id === "new") {
    redirect("/estimates/new");
  }

  const estimate: EstimateWithDetails | null = await estimateService.getEstimateById(id)

  if (!estimate) {
    notFound()
  }

  return <UnifiedEstimateClientPage estimate={estimate} /> // Use UnifiedEstimateClientPage and pass estimate
}
