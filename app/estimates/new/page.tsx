import type { Metadata } from "next"
import UnifiedEstimateClientPage from "../UnifiedEstimateClientPage" // Import UnifiedEstimateClientPage

export const metadata: Metadata = {
  title: "New Estimate | PROActive OS",
  description: "Create a new estimate",
}

export default async function NewEstimatePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined } // searchParams is a Promise-like object here
}) {
  // Await searchParams to resolve its properties
  const awaitedSearchParams = await searchParams;

  // Extract the specific search parameter needed by the client component
  const opportunityId = typeof awaitedSearchParams.opportunityId === "string" ? awaitedSearchParams.opportunityId : undefined;

  // Pass only the extracted data as a prop to the Client Component
  return <UnifiedEstimateClientPage /> // Use UnifiedEstimateClientPage
}
