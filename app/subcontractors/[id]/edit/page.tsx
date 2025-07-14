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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { biddingService } from "@/lib/bidding-service"; // Re-using biddingService for subcontractor management
import type { Subcontractor, UpdateSubcontractor } from "@/types/subcontractor";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  business_name: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
  trade_categories: z.string().optional(), // Will be parsed as string[]
  website: z.string().url("Invalid URL").optional().or(z.literal('')),
});

interface EditSubcontractorPageProps {
  params: {
    id: string; // Subcontractor ID
  };
}

export default function EditSubcontractorPage({ params }: EditSubcontractorPageProps) {
  const { id: subcontractorId } = params;
  const router = useRouter();
  const [subcontractor, setSubcontractor] = useState<Subcontractor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      business_name: "",
      email: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      notes: "",
      trade_categories: "",
      website: "",
    },
  });

  useEffect(() => {
    const fetchSubcontractor = async () => {
      setIsLoading(true);
      try {
        const fetchedSubcontractor = await biddingService.getSubcontractorById(subcontractorId);
        if (fetchedSubcontractor) {
          setSubcontractor(fetchedSubcontractor);
          form.reset({
            first_name: fetchedSubcontractor.first_name || "",
            last_name: fetchedSubcontractor.last_name || "",
            business_name: fetchedSubcontractor.business_name || "",
            email: fetchedSubcontractor.email || "",
            phone: fetchedSubcontractor.phone || "",
            address_line1: fetchedSubcontractor.address_line1 || "",
            address_line2: fetchedSubcontractor.address_line2 || "",
            city: fetchedSubcontractor.city || "",
            state: fetchedSubcontractor.state || "",
            postal_code: fetchedSubcontractor.postal_code || "",
            notes: fetchedSubcontractor.notes || "",
            trade_categories: fetchedSubcontractor.trade_categories?.join(', ') || "",
            website: fetchedSubcontractor.website || "",
          });
        } else {
          toast({
            title: "Error",
            description: "Subcontractor not found.",
            variant: "destructive",
          });
          router.push("/subcontractors");
        }
      } catch (error) {
        console.error("Failed to fetch subcontractor:", error);
        toast({
          title: "Error",
          description: "Failed to load subcontractor details.",
          variant: "destructive",
        });
        router.push("/subcontractors");
      } finally {
        setIsLoading(false);
      }
    };

    if (subcontractorId) {
      fetchSubcontractor();
    }
  }, [subcontractorId, router, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const updatedSubcontractor: UpdateSubcontractor = {
        ...values,
        trade_categories: values.trade_categories ? values.trade_categories.split(',').map(tag => tag.trim()) : null,
      };

      await biddingService.updateSubcontractor(subcontractorId, updatedSubcontractor);

      toast({
        title: "Success",
        description: "Subcontractor updated successfully.",
      });
      router.push("/subcontractors"); // Redirect back to subcontractors list
    } catch (error) {
      console.error("Failed to update subcontractor:", error);
      toast({
        title: "Error",
        description: "Failed to update subcontractor.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading subcontractor details...</p>
      </div>
    );
  }

  if (!subcontractor) {
    return (
      <div className="container mx-auto py-6">
        <p>Subcontractor not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/subcontractors">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Subcontractors</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Subcontractor: {subcontractor.business_name || `${subcontractor.first_name} ${subcontractor.last_name}`}</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subcontractor Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trade_categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade Categories (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Electrical, Plumbing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address_line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address_line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
