import { Suspense } from "react"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Heading } from "@/components/ui/heading"
import { DataTable } from "@/components/ui/data-table" 
import { changeOrderService, ChangeOrderWithProject } from "@/lib/change-orders"
import { columns } from "./components/columns"

export const revalidate = 0

export default function ChangeOrdersPage() {
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title="Change Orders"
          description="Manage your project change orders."
        />
        <Link href="/change-orders/new">
          <Button className="text-sm md:text-base">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New
          </Button>
        </Link>
      </div>
      <Separator />
      <Suspense fallback={<ChangeOrdersTableSkeleton />}>
        <ChangeOrdersTable />
      </Suspense>
    </>
  )
}

async function ChangeOrdersTable() {
  const changeOrders = await changeOrderService.getChangeOrders()

  return (
    <DataTable
      searchKey="title"
      columns={columns}
      data={changeOrders as unknown as ChangeOrderWithProject[]}
    />
  )
}

function ChangeOrdersTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
