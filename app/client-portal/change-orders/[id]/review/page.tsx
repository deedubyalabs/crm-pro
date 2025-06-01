import { notFound } from "next/navigation"
import { changeOrderService } from "@/lib/change-orders"
import { Heading } from "@/components/ui/heading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClientReviewPage } from "./ClientReviewPage" // Client component for interaction

interface ChangeOrderReviewPageProps {
  params: {
    id: string;
  };
}

export default async function ChangeOrderReviewPage({ params }: ChangeOrderReviewPageProps) {
  const changeOrder = await changeOrderService.getChangeOrderById(params.id);

  if (!changeOrder) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <Heading
        title={`Review Change Order #${changeOrder.change_order_number || "N/A"}`}
        description={`Project: ${changeOrder.project?.project_name || "N/A"}`}
      />
      <Separator className="my-6" />

      <ClientReviewPage changeOrder={changeOrder} />
    </div>
  );
}
