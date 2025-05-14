import type { Metadata } from "next"
import BulkCreateMaterialsClient from "./bulk-create-client"

export const metadata: Metadata = {
  title: "Bulk Create Materials | HomePro One",
  description: "Create multiple cost items from BigBox products",
}

export default function BulkCreateMaterialsPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Bulk Create Materials</h1>
      <BulkCreateMaterialsClient />
    </div>
  )
}
