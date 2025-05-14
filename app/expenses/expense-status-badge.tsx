import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ExpenseStatus } from "@/types/expenses"

interface ExpenseStatusBadgeProps {
  status: ExpenseStatus
}

export function ExpenseStatusBadge({ status }: ExpenseStatusBadgeProps) {
  const statusConfig: Record<
    ExpenseStatus,
    { label: string; variant: "default" | "outline" | "secondary" | "destructive" }
  > = {
    pending: {
      label: "Pending",
      variant: "outline",
    },
    approved: {
      label: "Approved",
      variant: "secondary",
    },
    reimbursed: {
      label: "Reimbursed",
      variant: "default",
    },
    rejected: {
      label: "Rejected",
      variant: "destructive",
    },
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn(
        status === "pending" && "border-orange-200 bg-orange-100 text-orange-800",
        status === "approved" && "border-green-200 bg-green-100 text-green-800",
        status === "reimbursed" && "border-blue-200 bg-blue-100 text-blue-800",
        status === "rejected" && "border-red-200 bg-red-100 text-red-800",
      )}
    >
      {config.label}
    </Badge>
  )
}
