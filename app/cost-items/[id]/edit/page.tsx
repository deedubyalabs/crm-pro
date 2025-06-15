import type { Metadata } from "next"
import EditCostItemClientPage from "./EditCostItemClientPage"

export const metadata: Metadata = {
  title: "Edit Cost Item | PROActive OS",
  description: "Edit an existing cost item",
}

export default async function EditCostItemPage({ params }: { params: { id: string } }) {
  return <EditCostItemClientPage id={params.id} />
}
