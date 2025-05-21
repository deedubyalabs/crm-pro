import type { Metadata } from "next"
import { getInvoices } from "@/lib/invoices"
import InvoicesList from "./invoices-list"

export const metadata: Metadata = {
  title: "Invoices | PROActive OS",
  description: "Manage your invoices",
}

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices</h1>
      </div>

      <InvoicesList invoices={invoices} />
    </div>
  )
}
