"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"
import { CostItemGroup } from "@/types/cost-items"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createCostItemGroupAction, updateCostItemGroupAction, deleteCostItemGroupAction } from "./actions"

interface CostItemGroupsListProps {
  costItemGroups: CostItemGroup[]
}

export function CostItemGroupsList({ costItemGroups }: CostItemGroupsListProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<CostItemGroup | null>(null)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenDialog = (group?: CostItemGroup) => {
    setEditingGroup(group || null)
    setGroupName(group?.name || "")
    setGroupDescription(group?.description || "")
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingGroup(null)
    setGroupName("")
    setGroupDescription("")
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (editingGroup) {
        await updateCostItemGroupAction(editingGroup.id, { name: groupName, description: groupDescription })
        toast({ title: "Group updated", description: "Cost item group has been updated." })
      } else {
        await createCostItemGroupAction({ name: groupName, description: groupDescription })
        toast({ title: "Group created", description: "New cost item group has been created." })
      }
      router.refresh() // Refresh data
      handleCloseDialog()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save group.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return
    try {
      await deleteCostItemGroupAction(id)
      toast({ title: "Group deleted", description: "Cost item group has been deleted." })
      router.refresh() // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete group.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> New Group
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costItemGroups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No cost item groups found.
              </TableCell>
            </TableRow>
          ) : (
            costItemGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>{group.description}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(group)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(group.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edit Cost Item Group" : "New Cost Item Group"}</DialogTitle>
            <DialogDescription>
              {editingGroup ? "Edit the details of your cost item group." : "Create a new cost item group."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
