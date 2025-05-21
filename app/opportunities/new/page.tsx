import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import OpportunityForm from "../opportunity-form"

export const metadata = {
  title: "New Opportunity | HomePro One",
  description: "Create a new sales opportunity",
}

export default async function NewOpportunityPage({
  searchParams,
}: {
  searchParams: { personId?: string }
}) {
  const awaitedSearchParams = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/opportunities">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Opportunity</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunity Details</CardTitle>
          <CardDescription>Enter the details for your new opportunity</CardDescription>
        </CardHeader>
        <CardContent>
          <OpportunityForm personId={awaitedSearchParams.personId} />
        </CardContent>
      </Card>
    </div>
  )
}
