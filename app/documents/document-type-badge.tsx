import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DocumentType } from "@/types/documents"

interface DocumentTypeBadgeProps {
  type: DocumentType
  className?: string
}

export function DocumentTypeBadge({ type, className }: DocumentTypeBadgeProps) {
  const getTypeColor = (type: DocumentType) => {
    switch (type) {
      case "contract":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "estimate":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "invoice":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "permit":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "plan":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
      case "photo":
        return "bg-pink-100 text-pink-800 hover:bg-pink-100"
      case "warranty":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100"
      case "certificate":
        return "bg-teal-100 text-teal-800 hover:bg-teal-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getTypeLabel = (type: DocumentType) => {
    switch (type) {
      case "contract":
        return "Contract"
      case "estimate":
        return "Estimate"
      case "invoice":
        return "Invoice"
      case "permit":
        return "Permit"
      case "plan":
        return "Plan"
      case "photo":
        return "Photo"
      case "warranty":
        return "Warranty"
      case "certificate":
        return "Certificate"
      default:
        return "Other"
    }
  }

  return (
    <Badge variant="outline" className={cn("font-normal", getTypeColor(type), className)}>
      {getTypeLabel(type)}
    </Badge>
  )
}
