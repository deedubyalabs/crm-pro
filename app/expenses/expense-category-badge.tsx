import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ExpenseCategory } from "@/types/expenses"

interface ExpenseCategoryBadgeProps {
  category: ExpenseCategory
}

export function ExpenseCategoryBadge({ category }: ExpenseCategoryBadgeProps) {
  const categoryConfig: Record<ExpenseCategory, { label: string; className: string }> = {
    materials: {
      label: "Materials",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    labor: {
      label: "Labor",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    equipment: {
      label: "Equipment",
      className: "bg-purple-100 text-purple-800 border-purple-200",
    },
    subcontractor: {
      label: "Subcontractor",
      className: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
    travel: {
      label: "Travel",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    permits: {
      label: "Permits",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    office: {
      label: "Office",
      className: "bg-sky-100 text-sky-800 border-sky-200",
    },
    marketing: {
      label: "Marketing",
      className: "bg-pink-100 text-pink-800 border-pink-200",
    },
    insurance: {
      label: "Insurance",
      className: "bg-teal-100 text-teal-800 border-teal-200",
    },
    utilities: {
      label: "Utilities",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    rent: {
      label: "Rent",
      className: "bg-violet-100 text-violet-800 border-violet-200",
    },
    other: {
      label: "Other",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
  }

  const config = categoryConfig[category]

  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  )
}
