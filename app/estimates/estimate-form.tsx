"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { CalendarIcon, Plus, Percent, DollarSign } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { EstimateLineItemRow } from "./estimate-line-item"
import { PaymentScheduleItem } from "./payment-schedule-item"
import { BulkMarkupDialog } from "./bulk-markup-dialog" // Import new dialog
import { CostItemSelectorDrawer } from "./cost-item-selector-drawer" // Import CostItemSelectorDrawer
import { EstimateSummary } from "./estimate-summary" // Import EstimateSummary
import { EstimateReviewDialog } from "./estimate-review-dialog" // Import EstimateReviewDialog
import { EstimateBiddingSection } from "./components/EstimateBiddingSection" // Import EstimateBiddingSection
import { EstimateDocumentsSection } from "./components/EstimateDocumentsSection" // Import EstimateDocumentsSection
import type { EstimateLineItem, EstimateWithDetails, EstimatePaymentSchedule } from "@/types/estimates"
import type { CostItem } from "@/types/cost-items"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog" // Import Dialog components

// Define the form schema
const formSchema = z.object({
  opportunity_id: z.string().min(1, "Opportunity is required"),
  person_id: z.string().min(1, "Customer is required"),
  estimate_number: z.string().optional(),
  status: z.enum(["Draft", "Sent", "Accepted", "Rejected", "Expired"]),
  issue_date: z.date().optional().nullable(),
  expiration_date: z.date().optional().nullable(),
  notes: z.string().optional(),
  terms_and_conditions: z.string().optional(), // New field
  scope_of_work: z.string().optional(), // New field
  cover_sheet_details: z.string().optional(), // New field
  discount_type: z.enum(["percentage", "fixed", ""]).optional(),
  discount_value: z.coerce.number().min(0).optional(),
  tax_rate_percentage: z.coerce.number().min(0).max(100).optional(),
  deposit_required: z.boolean().optional(),
  deposit_percentage: z.coerce.number().min(0).max(100).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EstimateFormProps {
  estimate?: EstimateWithDetails
  costItems: CostItem[]
  opportunities: { id: string; name: string; person_id: string }[]
  people: { id: string; name: string }[]
  onSubmit: (
    values: FormValues,
    lineItems: Partial<EstimateLineItem>[],
    paymentSchedules: Partial<EstimatePaymentSchedule>[],
  ) => Promise<void>
}

interface EstimateFormProps {
  estimate?: EstimateWithDetails;
  costItems: CostItem[];
  opportunities: { id: string; name: string; person_id: string }[];
  people: { id: string; name: string }[];
  onSubmit: (
    values: FormValues,
    lineItems: Partial<EstimateLineItem>[],
    paymentSchedules: Partial<EstimatePaymentSchedule>[],
  ) => Promise<void>;
  // Props for managing state from parent
  lineItems: Partial<EstimateLineItem>[];
  onLineItemsChange: (lineItems: Partial<EstimateLineItem>[]) => void;
  paymentSchedules: Partial<EstimatePaymentSchedule>[];
  onPaymentSchedulesChange: (paymentSchedules: Partial<EstimatePaymentSchedule>[]) => void;
  initialActiveTab?: string; // Allow parent to control initial active tab
  onTabChange?: (tab: string) => void; // Callback for tab changes
}

export function EstimateForm({
  estimate,
  costItems,
  opportunities,
  people,
  onSubmit,
  lineItems, // Receive lineItems from parent
  onLineItemsChange, // Receive lineItems change handler from parent
  paymentSchedules, // Receive paymentSchedules from parent
  onPaymentSchedulesChange, // Receive paymentSchedules change handler from parent
  initialActiveTab = "details", // Default to 'details'
  onTabChange, // Receive tab change handler from parent
}: EstimateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for active tab is now managed internally unless onTabChange is provided
  const [internalActiveTab, setInternalActiveTab] = useState(initialActiveTab);
  const activeTab = onTabChange ? initialActiveTab : internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;


  const [selectedOpportunityId, setSelectedOpportunityId] = useState(estimate?.opportunity_id || "");
  const [sections, setSections] = useState<string[]>([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [isBulkMarkupDialogOpen, setIsBulkMarkupDialogOpen] = useState(false); // State for bulk markup dialog
  const [isCostItemSelectorOpen, setIsCostItemSelectorOpen] = useState(false); // State for cost item selector drawer
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false); // State for review dialog

  // Initialize the form with default values or existing estimate data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: estimate
      ? {
          opportunity_id: estimate.opportunity_id || "",
          person_id: estimate.person_id || "",
          estimate_number: estimate.estimate_number ?? undefined,
          status: estimate.status || "Draft",
          issue_date: estimate.issue_date ? new Date(estimate.issue_date) : null,
          expiration_date: estimate.expiration_date ? new Date(estimate.expiration_date) : null,
          notes: estimate.notes || "",
          terms_and_conditions: estimate.terms_and_conditions || "", // Initialize new field
          scope_of_work: estimate.scope_of_work || "", // Initialize new field
          cover_sheet_details: estimate.cover_sheet_details || "", // Initialize new field
          discount_type: estimate.discount_type || "",
          discount_value: estimate.discount_value || 0,
        }
      : {
          opportunity_id: "",
          person_id: "",
          estimate_number: undefined,
          status: "Draft",
          issue_date: null,
          expiration_date: null,
          notes: "",
          terms_and_conditions: "", // Default for new field
          scope_of_work: "", // Default for new field
          cover_sheet_details: "", // Default for new field
          discount_type: "",
          discount_value: 0,
        },
  });

  // Effect to update form values when the estimate prop changes (for pre-filling)
  useEffect(() => {
    if (estimate) {
      form.reset({
        opportunity_id: estimate.opportunity_id || "",
        person_id: estimate.person_id || "",
        estimate_number: estimate.estimate_number ?? undefined,
        status: estimate.status || "Draft",
        issue_date: estimate.issue_date ? new Date(estimate.issue_date) : null,
        expiration_date: estimate.expiration_date ? new Date(estimate.expiration_date) : null,
        notes: estimate.notes || "",
        terms_and_conditions: estimate.terms_and_conditions || "", // Include new field
        scope_of_work: estimate.scope_of_work || "", // Include new field
        cover_sheet_details: estimate.cover_sheet_details || "", // Include new field
        discount_type: estimate.discount_type || "",
        discount_value: estimate.discount_value || 0,
        tax_rate_percentage: estimate.tax_rate_percentage || 0, // Include tax rate
        deposit_required: estimate.deposit_required || false, // Include deposit required
        deposit_percentage: estimate.deposit_percentage || 0, // Include deposit percentage
      });
       setSelectedOpportunityId(estimate.opportunity_id || ""); // Also update selected opportunity state
    }
  }, [estimate, form]); // Depend on estimate and form instance

  // Extract unique sections from line items (depends on lineItems prop)
  useEffect(() => {
    const uniqueSections = Array.from(
      new Set(
        lineItems
          .map((item) => item.section_name)
          .filter((section): section is string => section !== null && section !== undefined && section !== "")
      )
    );
    setSections(uniqueSections);
  }, [lineItems]); // Depend on lineItems prop

  // Update person_id when opportunity changes
  useEffect(() => {
    const opportunityId = form.watch("opportunity_id");
    if (opportunityId) {
      const selectedOpportunity = opportunities.find((opp) => opp.id === opportunityId);
      if (selectedOpportunity) {
        form.setValue("person_id", selectedOpportunity.person_id);
      }
    }
  }, [form.watch("opportunity_id"), opportunities, form]); // Added dependencies

  // Calculate subtotal, tax, and total amount when line items, discount, or tax change
  const subtotalAmount = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);

  const discountType = form.watch("discount_type");
  const discountValue = form.watch("discount_value") || 0;
  const taxRatePercentage = form.watch("tax_rate_percentage") || 0;

  let discountedSubtotal = subtotalAmount;
  if (discountType === "percentage") {
    discountedSubtotal = subtotalAmount * (1 - discountValue / 100);
  } else if (discountType === "fixed") {
    discountedSubtotal = subtotalAmount - discountValue;
  }
  discountedSubtotal = Math.max(0, discountedSubtotal); // Ensure discounted subtotal is not negative

  const taxAmount = discountedSubtotal * (taxRatePercentage / 100);
  const totalAmount = discountedSubtotal + taxAmount; // Update total calculation to include tax


  // Handle applying bulk markup
  const handleApplyBulkMarkup = (markupPercentage: number, scope: string) => {
    const updatedLineItems = lineItems.map((item) => {
      let applyMarkup = false;
      // Ensure item.costItem exists before accessing its properties
      const itemType = item.costItem?.type; // Corrected to camelCase

      if (scope === "all") {
        applyMarkup = true;
      } else if (scope === "material" && itemType === "Material") {
        applyMarkup = true;
      } else if (scope === "labor" && itemType === "Labor") {
        applyMarkup = true;
      } else if (scope === "equipment" && itemType === "Equipment") {
        applyMarkup = true;
      } else if (scope === "subcontractor" && itemType === "Subcontractor") {
        applyMarkup = true;
      } else if (scope === "other" && itemType === "Other") {
        applyMarkup = true;
      }

      if (applyMarkup) {
        const newMarkup = markupPercentage;
        const newUnitCost = item.unit_cost || 0;
        const newQuantity = item.quantity || 0;
        const subtotal = newQuantity * newUnitCost;
        const newTotal = subtotal * (1 + newMarkup / 100);

        return {
          ...item,
          markup: newMarkup,
          total: newTotal,
        };
      }
      return item;
    });
    onLineItemsChange(updatedLineItems);
    toast({ title: "Bulk Markup Applied", description: "Markup has been applied to selected items." });
  };

  // Handle adding a new line item (uses onLineItemsChange prop)
  const handleAddLineItem = () => {
    setIsCostItemSelectorOpen(true); // Open the cost item selector drawer
  };

  // Handle selecting a cost item from the drawer
  const handleSelectCostItemFromDrawer = (selectedCostItem: CostItem) => {
    const newLineItem: Partial<EstimateLineItem> = {
      cost_item_id: selectedCostItem.id,
      description: selectedCostItem.name,
      quantity: 1,
      unit: selectedCostItem.unit,
      unit_cost: selectedCostItem.unit_cost,
      markup: selectedCostItem.default_markup,
      total: selectedCostItem.unit_cost * (1 + selectedCostItem.default_markup / 100),
      is_optional: false,
      is_taxable: true,
      assigned_to_user_id: null,
      costItem: selectedCostItem, // Attach the full cost item for display/reference
    };
    onLineItemsChange([...lineItems, newLineItem]);
    setIsCostItemSelectorOpen(false); // Close the drawer
  };

  // Handle updating a line item (uses onLineItemsChange prop)
  const handleUpdateLineItem = (index: number, updatedLineItem: Partial<EstimateLineItem>) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = updatedLineItem;
    onLineItemsChange(newLineItems);
  };

  // Handle deleting a line item (uses onLineItemsChange prop)
  const handleDeleteLineItem = (index: number) => {
    const newLineItems = [...lineItems];
    newLineItems.splice(index, 1);
    onLineItemsChange(newLineItems);
  };

  // Handle adding a new section (updates internal sections state)
  const handleAddSection = () => {
    if (newSectionName && !sections.includes(newSectionName)) {
      setSections([...sections, newSectionName]);
      setNewSectionName("");
    }
  };

  // Handle adding a new payment schedule (uses onPaymentSchedulesChange prop)
  const handleAddPaymentSchedule = () => {
    onPaymentSchedulesChange([
      ...paymentSchedules,
      {
        description: "",
        amount: 0,
        due_type: "on_acceptance",
      },
    ]);
  };

  // Handle updating a payment schedule (uses onPaymentSchedulesChange prop)
  const handleUpdatePaymentSchedule = (index: number, updatedSchedule: Partial<EstimatePaymentSchedule>) => {
    const newSchedules = [...paymentSchedules];
    newSchedules[index] = updatedSchedule;
    onPaymentSchedulesChange(newSchedules);
  };

  // Handle deleting a payment schedule (uses onPaymentSchedulesChange prop)
  const handleDeletePaymentSchedule = (index: number) => {
    const newSchedules = [...paymentSchedules];
    newSchedules.splice(index, 1);
    onPaymentSchedulesChange(newSchedules);
  };

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one line item to the estimate",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values, lineItems, paymentSchedules);
      toast({
        title: estimate ? "Estimate updated" : "Estimate created",
        description: estimate
          ? "The estimate has been updated successfully."
          : "The estimate has been created successfully.",
      });
      // router.push("/estimates"); // Parent component handles navigation
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle opening the review dialog
  const handleReviewAndSubmit = () => {
    setIsReviewDialogOpen(true);
  };

  // Function to confirm submission from the review dialog
  const handleConfirmSubmit = async () => {
    setIsReviewDialogOpen(false); // Close the review dialog
    await form.handleSubmit(handleSubmit)(); // Trigger the actual form submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="line-items">Line Items</TabsTrigger>
              <TabsTrigger value="payment-schedule">Payment Schedule</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger> {/* Documents Tab */}
              <TabsTrigger value="bidding">Bidding</TabsTrigger> {/* New Bidding Tab */}
            </TabsList>

            {/* Details Tab Content */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>{estimate ? "Edit Estimate Details" : "New Estimate Details"}</CardTitle> {/* Updated Title */}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="opportunity_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opportunity</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedOpportunityId(value);
                            }}
                            value={field.value} // Use value from form state
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select opportunity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {opportunities.map((opportunity) => (
                                <SelectItem key={opportunity.id} value={opportunity.id}>
                                  {opportunity.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>The opportunity this estimate is for</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="person_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value} // Use value from form state
                            disabled={selectedOpportunityId !== ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {people.map((person) => (
                                <SelectItem key={person.id} value={person.id}>
                                  {person.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {selectedOpportunityId
                              ? "Customer is automatically selected from the opportunity"
                              : "The customer this estimate is for"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="estimate_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimate Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Auto-generated when sent"
                              {...field}
                              value={field.value || ""}
                              disabled={estimate?.status !== "Draft"}
                            />
                          </FormControl>
                          <FormDescription>Will be auto-generated if left blank</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}> {/* Use value from form state */}
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="Sent">Sent</SelectItem>
                              <SelectItem value="Accepted">Accepted</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                              <SelectItem value="Expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>The current status of this estimate</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="issue_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Issue Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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

                      <FormField
                        control={form.control}
                        name="expiration_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Expiration Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional notes or terms"
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>These notes will appear on the estimate</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Added Tax Rate Field */}
                  <FormField
                    control={form.control}
                    name="tax_rate_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>The percentage of tax applied to the estimate subtotal.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Added Deposit Required Checkbox */}
                   <FormField
                    control={form.control}
                    name="deposit_required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Require Deposit
                          </FormLabel>
                          <FormDescription>
                            Check this box if a deposit is required for this estimate.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Added Deposit Percentage Field */}
                  {form.watch("deposit_required") && ( // Only show if deposit is required
                    <FormField
                      control={form.control}
                      name="deposit_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deposit Percentage (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>The percentage of the total amount required as a deposit.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="line-items">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Line Items</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button type="button" onClick={() => setIsBulkMarkupDialogOpen(true)} variant="outline">
                      <Percent className="mr-2 h-4 w-4" /> Bulk Markup
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="New section name"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        className="w-40"
                      />
                      <Button type="button" onClick={handleAddSection} variant="outline" size="sm">
                        Add Section
                      </Button>
                    </div>
                    <Button type="button" onClick={handleAddLineItem} variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {lineItems.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No items added yet. Click "Add Item" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                        <div className="col-span-4">Description</div>
                        <div className="col-span-1">Qty</div>
                        <div className="col-span-1">Unit</div>
                        <div className="col-span-2 text-right">Unit Cost</div>
                        <div className="col-span-1">Markup %</div>
                        <div className="col-span-2 text-right">Total</div>
                        <div className="col-span-1"></div>
                      </div>

                      {lineItems.map((item, index) => (
                        <EstimateLineItemRow
                          key={item.id || `new-${index}`}
                          lineItem={item}
                          costItems={costItems}
                          sections={sections}
                          onUpdate={(updatedItem) => handleUpdateLineItem(index, updatedItem)}
                          onDelete={() => handleDeleteLineItem(index)}
                          isNew={!item.id}
                        />
                      ))}

                      <div className="flex justify-end pt-4 border-t">
                        <div className="w-1/3 space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Subtotal:</span>
                            <span>{formatCurrency(subtotalAmount)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-medium">Discount:</span>
                            <div className="flex items-center space-x-2">
                              <FormField
                                control={form.control}
                                name="discount_type"
                                render={({ field }) => (
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ""} // Use value from form state
                                  >
                                    <SelectTrigger className="w-[100px]">
                                      <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="percentage">
                                        <div className="flex items-center">
                                          <Percent className="mr-2 h-4 w-4" />
                                          Percentage
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="fixed">
                                        <div className="flex items-center">
                                          <DollarSign className="mr-2 h-4 w-4" />
                                          Fixed
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="discount_value"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        disabled={!form.watch("discount_type")}
                                        className="w-[80px] text-right"
                                        value={field.value ?? ""} // Use value from form state, handle undefined
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />

                              {form.watch("discount_type") === "percentage" && (
                                <span>%</span>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment-schedule">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Payment Schedule</CardTitle>
                  <Button type="button" onClick={handleAddPaymentSchedule} variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Payment
                  </Button>
                </CardHeader>
                <CardContent>
                  {paymentSchedules.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No payment schedule defined. Click "Add Payment" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground mb-2">
                        <div className="col-span-4">Description</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-5">Due</div>
                        <div className="col-span-1"></div>
                      </div>

                      {paymentSchedules.map((schedule, index) => (
                        <PaymentScheduleItem
                          key={schedule.id || `new-${index}`}
                          schedule={schedule}
                          totalAmount={totalAmount}
                          onUpdate={(updatedSchedule) => handleUpdatePaymentSchedule(index, updatedSchedule)}
                          onDelete={() => handleDeletePaymentSchedule(index)}
                        />
                      ))}

                      <div className="flex justify-end pt-4 border-t">
                        <div className="w-1/3 space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Total Scheduled:</span>
                            <span>
                              {formatCurrency(paymentSchedules.reduce((sum, schedule) => sum + (schedule.amount || 0), 0))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Estimate Total:</span>
                            <span>{formatCurrency(totalAmount)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold">
                            <span>Difference:</span>
                            <span className={cn(
                              Math.abs(totalAmount - paymentSchedules.reduce((sum, schedule) => sum + (schedule.amount || 0), 0)) < 0.01
                                ? "text-green-600"
                                : "text-amber-600"
                            )}>
                              {formatCurrency(totalAmount - paymentSchedules.reduce((sum, schedule) => sum + (schedule.amount || 0), 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* New Summary Tab Content */}
            <TabsContent value="summary">
              <EstimateSummary
                estimate={estimate}
                lineItems={lineItems}
                subtotalAmount={subtotalAmount}
                discountedSubtotal={discountedSubtotal}
                taxAmount={taxAmount}
                totalAmount={totalAmount}
              />
            </TabsContent>

            {/* Documents Tab Content */}
            <TabsContent value="documents">
              {estimate?.id ? (
                <EstimateDocumentsSection estimateId={estimate.id} />
              ) : (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground">
                    Save the estimate first to manage documents.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* New Bidding Tab Content */}
            <TabsContent value="bidding">
              {estimate?.id ? (
                <EstimateBiddingSection estimateId={estimate.id} />
              ) : (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground">
                    Save the estimate first to manage bids.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/estimates")}>
              Cancel
            </Button>
            <Button type="button" onClick={handleReviewAndSubmit} disabled={isSubmitting}>
              Review and Submit
            </Button>
          </div>
        </div> {/* Closes "space-y-6" div */}
      </form>
      <BulkMarkupDialog
        isOpen={isBulkMarkupDialogOpen}
        onClose={() => setIsBulkMarkupDialogOpen(false)}
        onApplyMarkup={handleApplyBulkMarkup}
      />
      <CostItemSelectorDrawer
        isOpen={isCostItemSelectorOpen}
        onClose={() => setIsCostItemSelectorOpen(false)}
        onSelectCostItem={handleSelectCostItemFromDrawer}
      />
      <EstimateReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        onConfirmSubmit={handleConfirmSubmit}
        estimate={estimate}
        lineItems={lineItems}
        paymentSchedules={paymentSchedules}
        totalAmount={totalAmount}
      />
    </Form>
  );
}
