import Link from "next/link"
import { materialListService } from "@/lib/material-list-service"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import MaterialListsTable from "./material-lists-table"

export const metadata = {
  title: "Material Lists | HomePro OS",
  description: "Manage material lists for your projects",
}

export default async function MaterialListsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse search parameters
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined
  const projectId = typeof searchParams.projectId === "string" ? searchParams.projectId : undefined

  // Fetch material lists with filters
  const materialLists = await materialListService.getMaterialLists({
    search,
    status: status as any,
    projectId,
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Material Lists</h1>
          <p className="text-muted-foreground">Manage material lists and generate purchase orders</p>
        </div>
        <Button asChild>
          <Link href="/material-lists/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Material List
          </Link>
        </Button>
      </div>

      <MaterialListsTable materialLists={materialLists} />
    </div>
  )
}
