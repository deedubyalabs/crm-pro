import { Suspense } from "react"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import BigBoxIntegration from "./bigbox-integration"

export const metadata = {
  title: "BigBox Integration | HomePro One",
  description: "Integrate cost items with BigBox products",
}

async function getCostItem(id: string) {
  const { data, error } = await supabase.from("cost_items").select("*").eq("id", id).single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function BigBoxIntegrationPage({ params }: { params: { id: string } }) {
  const costItem = await getCostItem(params.id)

  if (!costItem) {
    notFound()
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">BigBox Integration: {costItem.name}</h1>

      <Suspense fallback={<div>Loading BigBox integration...</div>}>
        <BigBoxIntegration costItem={costItem} />
      </Suspense>
    </div>
  )
}
