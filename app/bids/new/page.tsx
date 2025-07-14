"use client"

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { EstimateLineItem } from "@/types/estimates";
import { EstimateSection } from "@/types/estimates";
import { biddingService } from "@/lib/bidding-service";
import { estimateService } from "@/lib/estimates";
import { NewBidRequest, BidPackageLineItem } from "@/types/bidding";
import { ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, "Bid package name is required"),
  description: z.string().optional(),
  due_date: z.date().optional().nullable(),
});

export default function NewBidRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estimateId = searchParams.get("estimateId");

  const [estimateSections, setEstimateSections] = useState<EstimateSection[]>([]);
  const [selectedLineItems, setSelectedLineItems] = useState<Record<string, boolean>>({});
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: null,
    },
  });

  useEffect(() => {
    if (estimateId) {
      const fetchEstimateDetails = async () => {
        try {
          const estimate = await estimateService.getEstimateById(estimateId);
          if (estimate) {
            setEstimateSections(estimate.sections || []);
          } else {
            toast({
              title: "Error",
              description: "Estimate not found.",
              variant: "destructive",
            });
            router.push("/estimates"); // Redirect if estimate not found
          }
        } catch (error) {
          console.error("Failed to fetch estimate details:", error);
          toast({
            title: "Error",
            description: "Failed to load estimate details.",
            variant: "destructive",
          });
          router.push("/estimates");
        } finally {
          setIsLoadingEstimate(false);
        }
      };
      fetchEstimateDetails();
    } else {
      toast({
        title: "Error",
        description: "Estimate ID is missing.",
        variant: "destructive",
      });
      router.push("/estimates");
    }
  }, [estimateId, router]);

  const handleLineItemToggle = (lineItemId: string) => {
    setSelectedLineItems((prev) => ({
      ...prev,
      [lineItemId]: !prev[lineItemId],
    }));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!estimateId) {
      toast({
        title: "Error",
        description: "Estimate ID is missing, cannot create bid request.",
        variant: "destructive",
      });
      return;
    }

    const selectedItemsArray: BidPackageLineItem[] = [];
    estimateSections.forEach(section => {
      section.line_items.forEach(item => {
        if (selectedLineItems[item.id]) {
          selectedItemsArray.push({
            ...item,
            // Ensure necessary fields are copied, and remove fields that might cause issues if not matching DB schema for bid_request_line_items
            // For example, remove `costItem` if it's not expected in bid_request_line_items
            costItem: undefined, // Remove nested object that's not part of the bid_request_line_items table
          } as BidPackageLineItem);
        }
      });
    });

    if (selectedItemsArray.length === 0) {
      toast({
        title: "Warning",
        description: "Please select at least one line item for the bid package.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newBidRequest: NewBidRequest = {
        estimate_id: estimateId,
        title: values.title,
        description: values.description || null,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        status: "Draft", // Initial status
        line_items: selectedItemsArray,
      };

      await biddingService.createBidRequest(newBidRequest);

      toast({
        title: "Success",
        description: "Bid request created successfully.",
      });
      router.push(`/estimates/${estimateId}/edit`); // Redirect back to estimate edit page
    } catch (error) {
      console.error("Failed to create bid request:", error);
      toast({
        title: "Error",
        description: "Failed to create bid request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingEstimate) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading estimate details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/estimates/${estimateId}/edit`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create New Bid Request</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bid Package Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bid Package Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Electrical Rough-in Bid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Scope</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide details for subcontractors..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              {estimateSections.length === 0 ? (
                <p className="text-muted-foreground">No line items found in the estimate.</p>
              ) : (
                <div className="space-y-4">
                  {estimateSections.map(section => (
                    <div key={section.id}>
                      <h3 className="font-semibold mb-2">{section.name}</h3>
                      {section.line_items.length === 0 ? (
                        <p className="text-muted-foreground ml-4">No line items in this section.</p>
                      ) : (
                        <div className="grid gap-2">
                          {section.line_items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`item-${item.id}`}
                                checked={selectedLineItems[item.id] || false}
                                onCheckedChange={() => handleLineItemToggle(item.id)}
                              />
                              <Label htmlFor={`item-${item.id}`}>
                                {item.description} ({item.quantity} {item.unit} @ {item.unit_cost})
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Bid Request
          </Button>
        </form>
      </Form>
    </div>
  );
}
