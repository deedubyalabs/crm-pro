import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ChangeOrderNotFound() {
  return (
    <div className="container mx-auto py-12 flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-4">Change Order Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The change order you are looking for does not exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/change-orders">Back to Change Orders</Link>
      </Button>
    </div>
  )
}
