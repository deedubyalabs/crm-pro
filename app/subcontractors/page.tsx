import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import SubcontractorsClient from "./subcontractors-client"
import SubcontractorsListSkeleton from "./subcontractors-list-skeleton"
import { biddingService } from "@/lib/bidding-service"

export const metadata: Metadata = {
  title: "Subcontractors | PROActive OS",
  description: "Manage your subcontractors",
}

export default async function SubcontractorsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;

  // Initial fetch for server-side rendering
  const initialSubcontractors = await biddingService.getSubcontractors({ search });

  return (
    <div className="flex flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subcontractors</h1>
          <p className="text-muted-foreground">Manage your contacts, leads, customers, and subcontractors</p>
        </div>
        <Button asChild>
          <Link href="/subcontractors/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Subcontractor
          </Link>
        </Button>
      </div>

      <Suspense fallback={<SubcontractorsListSkeleton />}>
        <SubcontractorsClient initialSubcontractors={initialSubcontractors} searchParams={params} />
      </Suspense>
    </div>
  )
}
