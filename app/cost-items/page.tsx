import type { Metadata } from "next"
import { Suspense } from "react"
import { costItemService } from "@/lib/cost-items"
import { CostItemsList } from "./cost-items-list"
import { CostItemGroupsList } from "./cost-item-groups-list" // New component for groups
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link" // Keep Link for TabsTrigger
import { CostItemType } from "@/types/cost-items" // Import CostItemType
import { CostItemSearchInput } from "./cost-item-search-input" // Import the new client component
import { CostItemActions } from "./components/CostItemActions" // Import the new client component

export const metadata: Metadata = {
  title: "Cost Items | PROActive OS",
  description: "Manage your cost items catalog",
}

export default async function CostItemsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Await searchParams before accessing its properties
  const awaitedSearchParams = await searchParams;
  const currentTab = typeof awaitedSearchParams.tab === "string" ? awaitedSearchParams.tab : "all"
  const searchTerm = typeof awaitedSearchParams.search === "string" ? awaitedSearchParams.search : undefined
  const itemType = typeof awaitedSearchParams.type === "string" ? (awaitedSearchParams.type as CostItemType) : undefined
  const isActive = awaitedSearchParams.isActive === "true" ? true : awaitedSearchParams.isActive === "false" ? false : undefined
  const groupId = typeof awaitedSearchParams.groupId === "string" ? awaitedSearchParams.groupId : undefined
  const page = parseInt(typeof awaitedSearchParams.page === "string" ? awaitedSearchParams.page : "1")
  const limit = parseInt(typeof awaitedSearchParams.page === "string" ? awaitedSearchParams.page : "10") // Get limit from searchParams

  // Fetch all cost items and groups for the respective tabs
  const [{ costItems, totalCount }, costItemGroups] = await Promise.all([
    costItemService.getCostItems({
      type: itemType,
      search: searchTerm,
      isActive: isActive,
      groupId: groupId,
      page: page,
      limit: limit,
    }),
    costItemService.getCostItemGroups(),
  ])

  // If the current page is out of bounds after filtering/searching, redirect to page 1
  if (costItems.length === 0 && totalCount > 0 && page > 1) {
    const params = new URLSearchParams(awaitedSearchParams as Record<string, string>);
    params.set("page", "1");
    // Use Next.js's redirect function for server components
    const { redirect } = await import("next/navigation");
    redirect(`/cost-items?${params.toString()}`);
  }

  const costItemTypes: CostItemType[] = ["Material", "Labor", "Equipment", "Subcontractor", "Other"]

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cost Items Library</h1>
        <CostItemActions /> {/* Use the new client component here */}
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
            <CostItemsList costItems={costItems} costItemGroups={costItemGroups} totalCount={totalCount} />
          </Suspense>
        </TabsContent>

        {costItemTypes.map((type) => (
          <TabsContent key={type} value={type.toLowerCase()}>
            <Suspense fallback={<div>Loading {type.toLowerCase()} cost items...</div>}>
              <CostItemsList
                costItems={costItems.filter(item => item.type === type)}
                costItemGroups={costItemGroups}
                totalCount={totalCount} // Pass totalCount to filtered lists as well
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
