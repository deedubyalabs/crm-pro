import { dashboardService } from "@/lib/dashboard-service"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function OverdueInvoicesTable() {
  const overdueInvoices = await dashboardService.getOverdueInvoices()

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-right">Amount Due</TableHead>
            <TableHead className="text-right">Days Overdue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {overdueInvoices.length > 0 ? (
            overdueInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                    #{invoice.invoice_number}
                  </Link>
                  <div className="text-xs text-muted-foreground">Due: {formatDate(invoice.due_date)}</div>
                </TableCell>
                <TableCell>
                  {invoice.person.business_name ||
                    `${invoice.person.first_name || ""} ${invoice.person.last_name || ""}`.trim()}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(invoice.amountDue)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={invoice.daysOverdue > 30 ? "destructive" : "outline"}>
                    {invoice.daysOverdue} days
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No overdue invoices
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
