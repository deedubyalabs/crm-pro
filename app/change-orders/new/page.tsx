import type { Metadata } from "next"
import NewChangeOrderClientPage from "./NewChangeOrderClientPage"

export const metadata: Metadata = {
  title: "Create Change Order | PROActive OS",
  description: "Create a new change order",
}

export default async function NewChangeOrderPage() {
  return <NewChangeOrderClientPage />
}
