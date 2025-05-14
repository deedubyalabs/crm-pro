"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"

interface CreateBidButtonProps {
  estimateId: string
}

export function CreateBidButton({ estimateId }: CreateBidButtonProps) {
  return (
    <Button variant="outline" asChild>
      <Link href={`/estimates/${estimateId}/create-bid`}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Create Bid Request
      </Link>
    </Button>
  )
}
