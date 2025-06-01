"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChangeOrderWithProject } from "@/lib/change-orders"
import { formatCurrency } from "@/lib/utils"

export const columns: ColumnDef<ChangeOrderWithProject>[] = [
  {
    accessorKey: "change_order_number",
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          CO Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }: { row: any }) => {
      const changeOrder = row.original
      return (
        <Link href={`/change-orders/${changeOrder.id}`} className="text-blue-600 hover:underline">
          {changeOrder.change_order_number}
        </Link>
      )
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "project.project_name",
    header: "Project",
    cell: ({ row }: { row: any }) => {
      const changeOrder = row.original
      return changeOrder.project?.project_name || "N/A"
    },
  },
  {
    accessorKey: "status",
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "total_amount",
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }: { row: any }) => {
      const amount = parseFloat(row.getValue("total_amount"))
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => {
      const changeOrder = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(changeOrder.id)}
            >
              Copy Change Order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/change-orders/${changeOrder.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/change-orders/${changeOrder.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            {/* Add delete functionality later */}
            {/* <DropdownMenuItem>Delete</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
