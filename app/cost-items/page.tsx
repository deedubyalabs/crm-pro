import type { Metadata } from "next"
import { Suspense } from "react"
import { costItemService } from "@/lib/cost-items"
import { CostItemsList } from "./cost-items-list"
import { CostItemGroupsList } from "./cost-item-groups-list" // New component for groups
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CostItemType } from "@/types/cost-items" // Import CostItemType
import { CostItemSearchInput } from "./cost-item-search-input" // Import the new client component

export const metadata: Metadata = {
  title: "Cost Items | PROActive OS",
  description: "Manage your cost items catalog",
}

export default async function CostItemsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const currentTab = typeof searchParams.tab === "string" ? searchParams.tab : "all"
  const searchTerm = typeof searchParams.search === "string" ? searchParams.search : undefined
  const itemType = typeof searchParams.type === "string" ? (searchParams.type as CostItemType) : undefined
  const isActive = searchParams.isActive === "true" ? true : searchParams.isActive === "false" ? false : undefined
  const groupId = typeof searchParams.groupId === "string" ? searchParams.groupId : undefined

  // Fetch all cost items and groups for the respective tabs
  const [costItems, costItemGroups] = await Promise.all([
    costItemService.getCostItems({
      type: itemType,
      search: searchTerm,
      isActive: isActive,
      groupId: groupId,
    }),
    costItemService.getCostItemGroups(),
  ])

  const costItemTypes: CostItemType[] = ["Material", "Labor", "Equipment", "Subcontractor", "Other"]

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cost Items Catalog</h1>
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

      <Tabs defaultValue={currentTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" asChild>
              <Link href="/cost-items?tab=all">All</Link>
            </TabsTrigger>
            {costItemTypes.map((type) => (
              <TabsTrigger key={type} value={type.toLowerCase()} asChild>
                <Link href={`/cost-items?tab=${type.toLowerCase()}&type=${type}`}>
                  {type}
                </Link>
              </TabsTrigger>
            ))}
            <TabsTrigger value="groups" asChild>
              <Link href="/cost-items?tab=groups">Groups</Link>
            </TabsTrigger>
          </TabsList>
          <CostItemSearchInput initialSearchTerm={searchTerm} /> {/* Use the new client component */}
        </div>

        <TabsContent value="all">
          <Suspense fallback={<div>Loading all cost items...</div>}>
            <CostItemsList costItems={costItems} costItemGroups={costItemGroups} />
          </Suspense>
        </TabsContent>

        {costItemTypes.map((type) => (
          <TabsContent key={type} value={type.toLowerCase()}>
            <Suspense fallback={<div>Loading {type.toLowerCase()} cost items...</div>}>
              <CostItemsList
                costItems={costItems.filter(item => item.type === type)}
                costItemGroups={costItemGroups}
              />
            </Suspense>
          </TabsContent>
        ))}

        <TabsContent value="groups">
          <Suspense fallback={<div>Loading cost item groups...</div>}>
            <CostItemGroupsList costItemGroups={costItemGroups} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
