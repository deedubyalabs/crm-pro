import type { Metadata } from "next"
import EditChangeOrderClientPage from "./EditChangeOrderClientPage"

export const metadata: Metadata = {
  title: "Edit Change Order | HomePro OS",
  description: "Edit an existing change order",
}

export default async function EditChangeOrderPage({
  params,
}: {
  params: { id: string }
}) {
  return <EditChangeOrderClientPage params={params} />
}
