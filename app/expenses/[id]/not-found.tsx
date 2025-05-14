import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ExpenseNotFound() {
  return (
    <div className="container mx-auto py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Expense Not Found</h1>
      <p className="text-muted-foreground mb-6">The expense you are looking for does not exist or has been deleted.</p>
      <Button asChild>
        <Link href="/expenses">Back to Expenses</Link>
      </Button>
    </div>
  )
}
