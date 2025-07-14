"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { biddingService } from "@/lib/bidding-service";
import type { BidRequest, Bid, BidLineItem } from "@/types/bidding";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Define schema for a single bid line item
const bidLineItemSchema = z.object({
  id: z.string(), // bid_request_line_item_id
  unit_price: z.coerce.number().min(0, "Price cannot be negative"),
  notes: z.string().optional(),
});

// Main form schema for the submission page
const formSchema = z.object({
  // This will dynamically hold line item prices
  line_item_prices: z.record(z.string(), z.coerce.number().min(0, "Price cannot be negative")),
  notes: z.string().optional(),
  bid_document_url: z.string().url("Invalid URL").optional().or(z.literal('')),
});

interface BidSubmissionPageProps {
  params: {
    token: string; // This token will represent the bid ID for direct submission
  };
}

export default function BidSubmissionPage({ params }: BidSubmissionPageProps) {
  const { token } = params; // token is actually the bidId
  const router = useRouter();
  const [bidDetails, setBidDetails] = useState<Bid | null>(null);
  const [bidRequest, setBidRequest] = useState<BidRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      line_item_prices: {},
      notes: "",
      bid_document_url: "",
    },
  });

  // Calculate total bid amount dynamically
  const totalBidAmount = React.useMemo(() => {
    let total = 0;
    if (bidRequest && form.watch("line_item_prices")) {
      bidRequest.line_items.forEach(item => {
        const price = form.watch(`line_item_prices.${item.id}`);
        if (typeof price === 'number' && !isNaN(price)) {
          total += price * item.quantity;
        }
      });
    }
    return total;
  }, [bidRequest, form.watch("line_item_prices")]);


  useEffect(() => {
    const fetchBidAndBidRequest = async () => {
      setIsLoading(true);
      try {
        const fetchedBid = await biddingService.getBid(token);
        if (!fetchedBid) {
          toast({ title: "Error", description: "Invalid bid link or bid not found.", variant: "destructive" });
          return;
        }
        setBidDetails(fetchedBid);

        const fetchedBidRequest = await biddingService.getBidRequestById(fetchedBid.bid_request_id);
        if (fetchedBidRequest) {
          setBidRequest(fetchedBidRequest);

          // Initialize form with existing bid line items if available
          const initialPrices: Record<string, number> = {};
          fetchedBid.bid_line_items?.forEach(bli => {
            initialPrices[bli.bid_request_line_item_id] = bli.unit_price;
          });
          form.reset({
            line_item_prices: initialPrices,
            notes: fetchedBid.notes || "",
            bid_document_url: fetchedBid.bid_document_url || "",
          });
        } else {
          toast({ title: "Error", description: "Associated bid request not found.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Failed to fetch bid details:", error);
        toast({ title: "Error", description: "Failed to load bid details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchBidAndBidRequest();
    }
  }, [token, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!bidDetails || !bidRequest) return;

    // Construct bid_line_items array from form values
    const bidLineItems: BidLineItem[] = [];
    bidRequest.line_items.forEach(item => {
      const unitPrice = values.line_item_prices[item.id];
      if (typeof unitPrice === 'number' && !isNaN(unitPrice)) {
        bidLineItems.push({
          id: item.id, // This is the bid_request_line_item_id
          bid_id: bidDetails.id, // Will be set by service, but good to include
          bid_request_line_item_id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: unitPrice,
          total: unitPrice * item.quantity,
          notes: "", // No specific notes per line item in this form for now
        });
      }
    });

    if (bidLineItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a price for at least one line item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedBid = await biddingService.updateBid(bidDetails.id, {
        amount: totalBidAmount, // Use calculated total
        notes: values.notes,
        bid_document_url: values.bid_document_url,
        status: "Submitted",
        bid_line_items: bidLineItems, // Send line item bids
      });

      toast({
        title: "Bid Submitted",
        description: "Your bid has been successfully submitted.",
      });
      setBidDetails(updatedBid);
    } catch (error) {
      console.error("Failed to submit bid:", error);
      toast({
        title: "Error",
        description: "Failed to submit your bid.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading bid submission form...</p>
      </div>
    );
  }

  if (!bidDetails || !bidRequest) {
    return (
      <div className="container mx-auto py-6">
        <p>Bid details not found or invalid link.</p>
      </div>
    );
  }

  if (bidDetails.status === "Submitted" || bidDetails.status === "Accepted" || bidDetails.status === "Rejected") {
    return (
      <div className="container mx-auto py-6 text-center space-y-4">
        <h1 className="text-3xl font-bold">Bid Already Submitted/Processed</h1>
        <p className="text-muted-foreground">This bid has already been submitted or processed. Thank you!</p>
        {bidDetails.amount > 0 && (
          <p className="text-lg">Your submitted amount: <strong>{formatCurrency(bidDetails.amount)}</strong></p>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Submit Bid for: {bidRequest.title}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Bid</CardTitle>
              <p className="text-muted-foreground">Estimate: {bidRequest.estimate_id}</p>
              <p className="text-muted-foreground">Due Date: {bidRequest.due_date ? format(new Date(bidRequest.due_date), "PPP") : "N/A"}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Line Item Bidding */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Line Item Prices</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Your Price (per unit)</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bidRequest.line_items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">No line items to bid on.</TableCell>
                      </TableRow>
                    ) : (
                      bidRequest.line_items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right w-[150px]">
                            <FormField
                              control={form.control}
                              name={`line_item_prices.${item.id}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      {...field}
                                      value={field.value ?? ''} // Ensure controlled component
                                      onChange={(e) => {
                                        field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value));
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency((form.watch(`line_item_prices.${item.id}`) || 0) * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end mt-4">
                <div className="w-1/2">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Bid Amount:</span>
                    <span>{formatCurrency(totalBidAmount)}</span>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes or comments" className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bid_document_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bid Document URL (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="Link to your formal proposal document" {...field} />
                    </FormControl>
                    <FormDescription>You can upload your proposal and paste the link here.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Bid"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
