import { Suspense } from "react";
import { CreateBidRequestForm } from "./create-bid-request-form"; // Assuming a form component will be created

interface NewBidRequestPageProps {
  searchParams?: {
    estimateId?: string;
    changeOrderId?: string;
  };
}

export default async function NewBidRequestPage({ searchParams }: NewBidRequestPageProps) {
  const estimateId = searchParams?.estimateId;
  const changeOrderId = searchParams?.changeOrderId;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Bid Request</h1>
      <Suspense fallback={<div>Loading form...</div>}>
        <CreateBidRequestForm estimateId={estimateId} changeOrderId={changeOrderId} />
      </Suspense>
    </div>
  );
}
