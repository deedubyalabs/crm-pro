import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { EstimatePaymentSchedule } from "@/types/estimates"

interface PaymentScheduleListProps {
  paymentSchedules: EstimatePaymentSchedule[]
  totalAmount: number
}

export function PaymentScheduleList({ paymentSchedules, totalAmount }: PaymentScheduleListProps) {
  if (!paymentSchedules || paymentSchedules.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Payment Schedule</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentSchedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">{schedule.description}</TableCell>
              <TableCell className="text-right">{formatCurrency(schedule.amount)}</TableCell>
              <TableCell className="text-right">
                {schedule.percentage ? `${schedule.percentage.toFixed(2)}%` : "-"}
              </TableCell>
              <TableCell>{schedule.due_date ? formatDate(schedule.due_date) : "Upon agreement"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
