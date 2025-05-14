import { Suspense } from "react"
import type { Metadata } from "next"
import PaymentsList from "./payments-list"

export const metadata: Metadata = {
  title: "Payments | HomePro One",
  description: "View and manage payments",
}

export default async function PaymentsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payments</h1>
      </div>

      <Suspense fallback={<div>Loading payments...</div>}>
        <PaymentsList />
      </Suspense>
    </div>
  )
}
