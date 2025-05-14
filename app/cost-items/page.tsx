import type { Metadata } from "next"
import { costItemService } from "@/lib/cost-items"
import { CostItemsList } from "./cost-items-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cost Items | HomePro OS",
  description: "Manage your cost items catalog",
}

export default async function CostItemsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const type = typeof searchParams.type === "string" ? searchParams.type : undefined
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const isActive = searchParams.isActive === "true" ? true : searchParams.isActive === "false" ? false : undefined

  const costItems = await costItemService.getCostItems({
    type: type as any,
    search,
    isActive,
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cost Items</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/cost-items/bulk-create">
              <Plus className="mr-2 h-4 w-4" />
              Bulk Create
            </Link>
          </Button>
          <Button asChild>
            <Link href="/cost-items/new">
              <Plus className="mr-2 h-4 w-4" />
              New Cost Item
            </Link>
          </Button>
        </div>
      </div>
      <CostItemsList costItems={costItems} />
    </div>
  )
}
