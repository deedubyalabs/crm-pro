import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DocumentStatus } from "@/types/documents"

interface DocumentStatusBadgeProps {
  status: DocumentStatus
  className?: string
}

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      case "pending_approval":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "expired":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "active":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case "draft":
        return "Draft"
      case "pending_approval":
        return "Pending Approval"
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      case "expired":
        return "Expired"
      case "active":
        return "Active"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <Badge variant="outline" className={cn("font-normal", getStatusColor(status), className)}>
      {getStatusLabel(status)}
    </Badge>
  )
}
