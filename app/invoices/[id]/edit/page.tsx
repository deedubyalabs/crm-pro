import type { Metadata } from "next"
import EditInvoiceClientPage from "./EditInvoiceClientPage"

export const metadata: Metadata = {
  title: "Edit Invoice | PROActive ONE",
  description: "Edit an existing invoice",
}

export default async function EditInvoicePage({
  params,
}: {
  params: { id: string }
}) {
  return <EditInvoiceClientPage params={params} />
}
