import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import OpportunityList from "./opportunity-list"
import OpportunityListSkeleton from "./opportunity-list-skeleton"
import OpportunityStatusFilter from "./opportunity-status-filter"

export const metadata: Metadata = {
  title: "Opportunities | PROActive OS",
  description: "Manage your sales opportunities and leads",
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Await search parameters
  const awaitedSearchParams = await searchParams;

  // Extract search parameters
  const search = typeof awaitedSearchParams.search === "string" ? awaitedSearchParams.search : undefined
  const status = typeof awaitedSearchParams.status === "string" ? awaitedSearchParams.status : undefined
  const personId = typeof awaitedSearchParams.personId === "string" ? awaitedSearchParams.personId : undefined

  return (
    <div className="flex flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground">Manage your sales opportunities and leads</p>
        </div>
        <Button asChild>
          <Link href="/opportunities/new">
            <Plus className="mr-2 h-4 w-4" />
            New Opportunity
          </Link>
        </Button>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <OpportunityStatusFilter activeStatus={status} />
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <form action="/opportunities" method="GET">
            {/* Preserve existing query parameters */}
            {status && <input type="hidden" name="status" value={status} />}
            {personId && <input type="hidden" name="personId" value={personId} />}

            <Input
              type="search"
              name="search"
              placeholder="Search opportunities..."
              className="pl-8"
              defaultValue={search}
            />
          </form>
        </div>
      </div>

      <Suspense fallback={<OpportunityListSkeleton />}>
        <OpportunityList status={status} search={search} personId={personId} />
      </Suspense>
    </div>
  )
}
