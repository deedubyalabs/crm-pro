import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function InvoiceNotFound() {
  return (
    <div className="container mx-auto py-12 flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-4">Invoice Not Found</h2>
      <p className="text-muted-foreground mb-6">The invoice you are looking for does not exist or has been removed.</p>
      <Button asChild>
        <Link href="/invoices">Back to Invoices</Link>
      </Button>
    </div>
  )
}
