import { Suspense } from "react"
import { notFound } from "next/navigation"

import { SideDrawer } from "@/components/side-drawer"
import { Skeleton } from "@/components/ui/skeleton"
import EditChangeOrderClientPage from "./EditChangeOrderClientPage"
import { changeOrderService } from "@/lib/change-orders"

export const revalidate = 0

interface EditChangeOrderPageProps {
  params: {
    id: string
  }
}

export default async function EditChangeOrderPage({ params }: EditChangeOrderPageProps) {
  const changeOrder = await changeOrderService.getChangeOrderById(params.id)

  if (!changeOrder) {
    notFound()
  }

  return (
    <Suspense fallback={<EditChangeOrderPageSkeleton />}>
      <EditChangeOrderClientPage initialData={changeOrder} />
    </Suspense>
  )
}

function EditChangeOrderPageSkeleton() {
  return (
    <SideDrawer
      title="Loading Change Order..."
      description="Fetching change order details."
      isOpen={true}
      onClose={() => {}} // No-op for skeleton
    >
      <div className="space-y-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </SideDrawer>
  )
}
