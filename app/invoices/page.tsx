import type { Metadata } from "next"
import { invoiceService } from "@/lib/invoices"
import InvoicesList from "./invoices-list"
import { InvoiceWithProjectAndPerson, Invoice } from "@/lib/invoices"

export const metadata: Metadata = {
  title: "Invoices | PROActive ONE",
  description: "Manage your invoices",
}

export default async function InvoicesPage() {
  const invoices = await invoiceService.getInvoices()
  const validInvoices = invoices.filter((invoice): invoice is InvoiceWithProjectAndPerson => 
    invoice.issue_date !== undefined && invoice.invoice_number !== null
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices</h1>
      </div>

      <InvoicesList invoices={validInvoices} />
    </div>
  )
}
