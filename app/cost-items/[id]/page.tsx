import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, Database, ShoppingCart } from "lucide-react"

export const metadata = {
  title: "Cost Item Details | HomePro One",
  description: "View cost item details",
}

async function getCostItem(id: string) {
  const { data, error } = await supabase.from("cost_items").select("*").eq("id", id).single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function CostItemDetailPage({ params }: { params: { id: string } }) {
  const costItem = await getCostItem(params.id)

  if (!costItem) {
    notFound()
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{costItem.name}</h1>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/cost-items/${costItem.id}/edit`}>Edit</Link>
          </Button>

          <Button asChild>
            <Link href={`/cost-items/${costItem.id}/bigbox`}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              BigBox Integration
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5" />
              Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1">{costItem.description || "No description"}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1">{costItem.category || "Uncategorized"}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Unit</dt>
                <dd className="mt-1">{costItem.unit}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Unit Cost</dt>
                <dd className="mt-1">${costItem.unit_cost.toFixed(2)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Markup Percentage</dt>
                <dd className="mt-1">{costItem.markup_percentage}%</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      costItem.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {costItem.is_active ? "Active" : "Inactive"}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              BigBox Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Sync with BigBox</dt>
                <dd className="mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      costItem.sync_with_bigbox ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {costItem.sync_with_bigbox ? "Enabled" : "Disabled"}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Last Price Sync</dt>
                <dd className="mt-1">
                  {costItem.last_price_sync ? new Date(costItem.last_price_sync).toLocaleString() : "Never synced"}
                </dd>
              </div>

              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link href={`/cost-items/${costItem.id}/bigbox`}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Manage BigBox Integration
                  </Link>
                </Button>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
