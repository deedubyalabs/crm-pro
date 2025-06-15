import type { Metadata } from "next"
import NewCostItemClientPage from "./NewCostItemClientPage"

export const metadata: Metadata = {
  title: "New Cost Item | PROActive OS",
  description: "Create a new cost item",
}

export default function NewCostItemPage() {
  return <NewCostItemClientPage />
}
