"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateCostItemDialog } from "./CreateCostItemDialog"

export function CostItemActions() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="flex gap-2">
      <Button asChild>
        <Link href="/cost-items/new">
          <Globe className="h-4 w-4" />
          Search Web
        </Link>
      </Button>
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Cost Item
      </Button>

      <CreateCostItemDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  )
}
