"use client"

import { useEffect, useState } from "react"
import { blueprintOfValuesService } from "@/lib/blueprint-of-values"
import { BlueprintOfValueWithItems, BlueprintOfValueLineItem } from "@/types/blueprint-of-values"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface BlueprintOfValuesListProps {
  projectId: string
}

export default function BlueprintOfValuesList({ projectId }: BlueprintOfValuesListProps) {
  const [bovs, setBovs] = useState<BlueprintOfValueWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBovs = async () => {
      try {
        setLoading(true)
        const data = await blueprintOfValuesService.getBlueprintOfValuesByProjectId(projectId)
        setBovs(data)
      } catch (err) {
        console.error("Failed to fetch Blueprint of Values:", err)
        setError("Failed to load Blueprint of Values. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchBovs()
  }, [projectId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blueprint of Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading Blueprint of Values...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blueprint of Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (bovs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blueprint of Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">No Blueprint of Values found for this project.</div>
        </CardContent>
      </Card>
    )
  }

  // For simplicity, we'll display the items of the first BOV found.
  // In a more complex scenario, you might have a way to select a specific BOV.
  const currentBov = bovs[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blueprint of Values: {currentBov.name || currentBov.bov_number}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name / Description</TableHead>
              <TableHead className="text-right">Scheduled Value</TableHead>
              <TableHead className="text-right">Amount Previously Billed</TableHead>
              <TableHead className="text-right">Remaining to Bill</TableHead>
              <TableHead className="text-right">% Previously Billed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBov.items.map((item: BlueprintOfValueLineItem) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.item_name}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.scheduled_value)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.amount_previously_billed)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.remaining_to_bill)}</TableCell>
                <TableCell className="text-right">{item.percent_previously_billed.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
