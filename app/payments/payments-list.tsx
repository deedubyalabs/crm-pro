import { paymentService } from "@/lib/payments"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function PaymentsList() {
  const payments = await paymentService.getPayments()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length > 0 ? (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  <Link href={`/payments/${payment.id}`} className="hover:underline">
                    {payment.reference_number || "N/A"}
                  </Link>
                </TableCell>
                <TableCell>{formatDate(payment.payment_date)}</TableCell>
                <TableCell>
                  <Link href={`/invoices/${payment.invoice_id}`} className="hover:underline">
                    #{payment.invoice.invoice_number}
                  </Link>
                </TableCell>
                <TableCell>
                  {payment.person.business_name ||
                    `${payment.person.first_name || ""} ${payment.person.last_name || ""}`.trim()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {payment.payment_method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No payments found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
