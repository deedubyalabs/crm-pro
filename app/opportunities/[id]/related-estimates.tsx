"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

type Estimate = {
  id: string
  estimate_number: string | null
  status: string
  issue_date: string | null
  expiration_date: string | null
  total_amount: number
}

interface RelatedEstimatesProps {
  estimates: Estimate[]
  opportunityId: string
}

export function RelatedEstimates({ estimates, opportunityId }: RelatedEstimatesProps) {
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
            Draft
          </Badge>
        )
      case "Sent":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Sent
          </Badge>
        )
      case "Accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Accepted
          </Badge>
        )
      case "Rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
            Rejected
          </Badge>
        )
      case "Expired":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (estimates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No estimates found</h3>
        <p className="text-muted-foreground mt-2 mb-6">This opportunity doesn't have any estimates yet.</p>
        <Button asChild>
          <Link href={`/estimates/new?opportunityId=${opportunityId}`}>Create an estimate</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Estimates</h3>
        <Button asChild>
          <Link href={`/estimates/new?opportunityId=${opportunityId}`}>
            <Plus className="mr-2 h-4 w-4" /> Create Estimate
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {estimates.map((estimate) => (
          <div
            key={estimate.id}
            className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg"
          >
            <div className="space-y-1 mb-2 md:mb-0">
              <div className="flex items-center space-x-2">
                <Link href={`/estimates/${estimate.id}`} className="font-medium hover:underline">
                  Estimate {estimate.estimate_number || "(Draft)"}
                </Link>
                {getStatusBadge(estimate.status)}
              </div>
              <div className="text-sm text-muted-foreground">
                {estimate.issue_date ? `Issued: ${formatDate(estimate.issue_date)}` : "Not issued yet"}
                {estimate.expiration_date && ` • Expires: ${formatDate(estimate.expiration_date)}`}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium">{formatCurrency(estimate.total_amount)}</div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/estimates/${estimate.id}`}>View</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
