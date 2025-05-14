import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import PeopleList from "./people-list"
import PeopleListSkeleton from "./people-list-skeleton"
import PeopleTypeFilter from "./people-type-filter"

export const metadata: Metadata = {
  title: "People | HomePro OS",
  description: "Manage your contacts, leads, customers, and subcontractors",
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Extract search parameters
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const type = typeof searchParams.type === "string" ? searchParams.type : undefined
  const leadSource = typeof searchParams.leadSource === "string" ? searchParams.leadSource : undefined
  const tag = typeof searchParams.tag === "string" ? searchParams.tag : undefined

  return (
    <div className="flex flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">People</h1>
          <p className="text-muted-foreground">Manage your contacts, leads, customers, and subcontractors</p>
        </div>
        <Button asChild>
          <Link href="/people/new">
            <Plus className="mr-2 h-4 w-4" />
            New Contact
          </Link>
        </Button>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <PeopleTypeFilter className="w-full sm:w-auto" />
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <form action="/people" method="GET">
            {/* Preserve existing query parameters */}
            {type && <input type="hidden" name="type" value={type} />}
            {leadSource && <input type="hidden" name="leadSource" value={leadSource} />}
            {tag && <input type="hidden" name="tag" value={tag} />}

            <Input type="search" name="search" placeholder="Search people..." className="pl-8" defaultValue={search} />
          </form>
        </div>
      </div>

      <Suspense fallback={<PeopleListSkeleton />}>
        <PeopleList type={type} search={search} leadSource={leadSource} tag={tag} />
      </Suspense>
    </div>
  )
}
