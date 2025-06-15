"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid" // Import uuid
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
import { CalendarIcon, Plus, Percent, DollarSign, MoreHorizontal, MoreVertical, ListTodo, ListPlus, Database, CirclePercent, SquarePlus, Tag, Calculator } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn, formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { EstimateLineItemRow } from "./estimate-line-item"
import { PaymentScheduleItem } from "./payment-schedule-item"
import { BulkMarkupDialog } from "./bulk-markup-dialog" // Import new dialog
import { CostItemSelectorDrawer as CostItemSelectorDialog } from "./cost-item-selector-drawer" // Import CostItemSelectorDialog
import { EstimateSummary } from "./estimate-summary" // Import EstimateSummary
import { EstimateReviewDialog } from "./estimate-review-dialog" // Import EstimateReviewDialog
import { EstimateBiddingSection } from "./components/EstimateBiddingSection" // Import EstimateBiddingSection
import { EstimateDocumentsSection } from "./components/EstimateDocumentsSection" // Import EstimateDocumentsSection
import { EstimateSectionHeader } from "./components/EstimateSectionHeader" // Import EstimateSectionHeader
import type { EstimateLineItem, EstimateWithDetails, EstimatePaymentSchedule, EstimateSection, DiscountType } from "@/types/estimates"
import type { CostItem } from "@/types/cost-items"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label" // Import Label
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { CustomLineItemDialog } from "./custom-line-item-dialog"
import { DiscountDialog } from "./discount-dialog"
import { TaxRateDialog } from "./tax-rate-dialog"

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
  discount_type: z.enum(["percentage", "fixed", ""]).nullable().optional(),
  discount_value: z.coerce.number().min(0).nullable().optional(),
  tax_rate_percentage: z.coerce.number().min(0).max(100).nullable().optional(),
  deposit_required: z.boolean().optional(),
  deposit_percentage: z.coerce.number().min(0).max(100).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EstimateFormProps {
  estimate?: EstimateWithDetails;
  costItems: CostItem[];
  opportunities: { id: string; name: string; person_id: string }[];
  people: { id: string; name: string }[];
  onSubmit: (
    values: FormValues,
    sections: EstimateSection[], // Changed from lineItems to sections
    paymentSchedules: Partial<EstimatePaymentSchedule>[],
  ) => Promise<void>;
  // Props for managing state from parent
  sections: EstimateSection[];
  onSectionsChange: (sections: EstimateSection[]) => void;
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
  sections, // Receive sections from parent
  onSectionsChange, // Receive sections change handler from parent
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

  useEffect(() => {
    console.log("EstimateForm: sections prop changed:", JSON.stringify(sections, null, 2));
  }, [sections]);

  const [selectedOpportunityId, setSelectedOpportunityId] = useState(estimate?.opportunity_id || "");
  const [newSectionName, setNewSectionName] = useState("");
  const [isNewSectionOptional, setIsNewSectionOptional] = useState(false); // State for new section optional toggle
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false); // State for add section dialog
  const [isBulkMarkupDialogOpen, setIsBulkMarkupDialogOpen] = useState(false);
  const [currentSectionIdForBulkMarkup, setCurrentSectionIdForBulkMarkup] = useState<string | null>(null); // New state for section-specific bulk markup
  const [isCostItemSelectorOpen, setIsCostItemSelectorOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isCustomLineItemDialogOpen, setIsCustomLineItemDialogOpen] = useState(false);
  const [currentSectionIdForAddItem, setCurrentSectionIdForAddItem] = useState<string | null>(null);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isTaxRateDialogOpen, setIsTaxRateDialogOpen] = useState(false);

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
  // Add a defensive check for sections before calling reduce
  const subtotalAmount = (Array.isArray(sections) ? sections : []).reduce((sum, section) => {
    // Ensure section and section.line_items are valid before accessing properties
    if (!section || section.is_optional || !Array.isArray(section.line_items)) {
      return sum;
    }
    return sum + section.line_items.reduce((sectionSum, item) => {
      if (item.is_optional) {
        return sectionSum;
      }
      return sectionSum + (item.total || 0);
    }, 0);
  }, 0);

  console.log("EstimateForm: subtotalAmount calculated with sections:", JSON.stringify(sections, null, 2)); // Debugging line

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
    const targetSections = currentSectionIdForBulkMarkup
      ? sections.filter(s => s.id === currentSectionIdForBulkMarkup)
      : sections;

    const updatedSections = sections.map((section) => {
      if (currentSectionIdForBulkMarkup && section.id !== currentSectionIdForBulkMarkup) {
        return section; // Skip sections not targeted for bulk markup
      }

      return {
        ...section,
        line_items: section.line_items.map((item) => {
          let applyMarkup = false;
          const itemType = item.costItem?.type;

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
        }),
      };
    });
    onSectionsChange(updatedSections);
    toast({ title: "Bulk Markup Applied", description: "Markup has been applied to selected items." });
    setIsBulkMarkupDialogOpen(false); // Close the dialog after applying
    setCurrentSectionIdForBulkMarkup(null); // Clear the section ID
  };

  // Handle applying discount from the dialog
  const handleApplyDiscount = (type: DiscountType, value: number) => {
    form.setValue("discount_type", type);
    form.setValue("discount_value", value);
    toast({ title: "Discount Applied", description: "The estimate discount has been updated." });
  };

  const handleApplyTaxRate = (taxRate: number) => {
    form.setValue("tax_rate_percentage", taxRate);
    toast({ title: "Tax Rate Applied", description: "The estimate tax rate has been updated." });
  };

  // Function to open bulk markup dialog for a specific section
  const handleOpenSectionBulkMarkup = (sectionId: string) => {
    setCurrentSectionIdForBulkMarkup(sectionId);
    setIsBulkMarkupDialogOpen(true);
  };

  // Handle updating a section (name, optional, taxable)
  const handleUpdateSection = (id: string, updatedSection: Partial<EstimateSection>) => {
    const updatedSections = sections.map((section) =>
      section.id === id ? { ...section, ...updatedSection } : section
    );
    onSectionsChange(updatedSections);
  };

  // Handle deleting a section
  const handleDeleteSection = (id: string) => {
    const updatedSections = sections.filter((section) => section.id !== id);
    onSectionsChange(updatedSections);
  };

  // Handle adding a new line item (uses onLineItemsChange prop) - now handled by dropdown
  const handleAddExistingLineItem = (sectionId?: string) => {
    setIsCostItemSelectorOpen(true); // Open the cost item selector drawer
    setCurrentSectionIdForAddItem(sectionId || null); // Store sectionId
  };

  const handleAddCustomLineItem = (customItem: Partial<EstimateLineItem>) => { // Removed sectionId parameter
    const newCustomItem: EstimateLineItem = {
      id: uuidv4(),
      estimate_id: estimate?.id || '',
      description: customItem.description ?? '',
      quantity: customItem.quantity || 1,
      unit: customItem.unit || "EA",
      unit_cost: customItem.unit_cost || 0,
      markup: customItem.markup || 0,
      total: (customItem.quantity || 1) * (customItem.unit_cost || 0) * (1 + (customItem.markup || 0) / 100),
      is_optional: customItem.is_optional || false,
      is_taxable: customItem.is_taxable || true,
      assigned_to_user_id: customItem.assigned_to_user_id || null,
      section_name: customItem.section_name ?? null,
      cost_item_id: null,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const targetSectionId = currentSectionIdForAddItem || (sections.length > 0 ? sections[0].id : null); // Use stored sectionId
    let updatedSections = [...sections];

    if (!targetSectionId) {
      const newDefaultSection: EstimateSection = {
        id: uuidv4(),
        estimate_id: estimate?.id || '',
        name: "No Section",
        description: null,
        is_optional: false,
        is_taxable: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        line_items: [],
      };
      updatedSections.push(newDefaultSection);
      newDefaultSection.line_items.push(newCustomItem);
    } else {
      const sectionIndex = updatedSections.findIndex(s => s.id === targetSectionId);
      if (sectionIndex !== -1) {
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          line_items: [...updatedSections[sectionIndex].line_items, newCustomItem],
        };
      } else {
        if (updatedSections.length > 0) {
          updatedSections[0].line_items.push(newCustomItem);
        } else {
          console.error("No valid section found to add item.");
        }
      }
    }
    onSectionsChange(updatedSections);
    setIsCustomLineItemDialogOpen(false); // Close the custom line item dialog
    setCurrentSectionIdForAddItem(null); // Clear stored sectionId
  };

  // Handle selecting cost items from the drawer
  const handleSelectCostItemsFromDrawer = (selectedCostItems: CostItem[]) => { // Removed sectionId parameter
    const newEstimateLineItems: EstimateLineItem[] = selectedCostItems.map((selectedCostItem) => ({
      id: uuidv4(),
      estimate_id: estimate?.id || '',
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
      section_name: null,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      costItem: selectedCostItem,
    }));

    const targetSectionId = currentSectionIdForAddItem || (sections.length > 0 ? sections[0].id : null); // Use stored sectionId
    let updatedSections = [...sections];

    if (!targetSectionId) {
      const newDefaultSection: EstimateSection = {
        id: uuidv4(),
        estimate_id: estimate?.id || '',
        name: "No Section",
        description: null,
        is_optional: false,
        is_taxable: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        line_items: [],
      };
      updatedSections.push(newDefaultSection);
      newDefaultSection.line_items.push(...newEstimateLineItems);
    } else {
      const sectionIndex = updatedSections.findIndex(s => s.id === targetSectionId);
      if (sectionIndex !== -1) {
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          line_items: [...updatedSections[sectionIndex].line_items, ...newEstimateLineItems],
        };
      } else {
        if (updatedSections.length > 0) {
          updatedSections[0].line_items.push(...newEstimateLineItems);
        } else {
          console.error("No valid section found to add item.");
        }
      }
    }
    onSectionsChange(updatedSections);
    setIsCostItemSelectorOpen(false); // Close the drawer
    setCurrentSectionIdForAddItem(null); // Clear stored sectionId
  };

  // Handle updating a line item (uses onSectionsChange prop)
  const handleUpdateLineItem = (id: string, updatedLineItem: Partial<EstimateLineItem>) => {
    const updatedSections = sections.map((section) => ({
      ...section,
      line_items: section.line_items.map((item) => {
        if (item.id === id) {
          // Create a new object to ensure type compatibility and handle undefined from Partial
          const newItem: EstimateLineItem = {
            ...item,
            ...updatedLineItem,
            // Explicitly handle section_name to ensure it's string | null
            section_name: updatedLineItem.section_name === "none" ? null : (updatedLineItem.section_name ?? item.section_name),
            // Ensure other boolean/nullable fields are explicitly handled if they can be undefined in Partial
            is_optional: updatedLineItem.is_optional ?? item.is_optional,
            is_taxable: updatedLineItem.is_taxable ?? item.is_taxable,
            assigned_to_user_id: updatedLineItem.assigned_to_user_id === "none" ? null : (updatedLineItem.assigned_to_user_id ?? item.assigned_to_user_id),
          };
          return newItem;
        }
        return item;
      }),
    }));
    onSectionsChange(updatedSections);
  };

  // Handle deleting a line item (uses onSectionsChange prop)
  const handleDeleteLineItem = (id: string) => {
    const updatedSections = sections.map((section) => ({
      ...section,
      line_items: section.line_items.filter((item) => item.id !== id),
    }));
    onSectionsChange(updatedSections);
  };

  // Handle toggling section optionality and updating its line items
  const handleToggleSectionOptionality = (sectionId: string, isOptional: boolean) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          is_optional: isOptional,
          line_items: section.line_items.map((item) => ({
            ...item,
            is_optional: isOptional, // Set all line items in the section to the new optional status
          })),
        };
      }
      return section;
    });
    onSectionsChange(updatedSections);
  };

  // Handle adding a new section (updates sections prop)
  const handleAddSection = () => {
    setIsAddSectionDialogOpen(true); // Open the dialog instead of directly adding
  };

  const handleConfirmAddSection = () => {
    if (newSectionName.trim()) {
      const newSection: EstimateSection = {
        id: uuidv4(),
        estimate_id: estimate?.id || '',
        name: newSectionName.trim(),
        description: null,
        is_optional: isNewSectionOptional, // Use state from dialog
        is_taxable: true,
        sort_order: sections.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        line_items: [],
      };
      onSectionsChange([...sections, newSection]);
      setNewSectionName("");
      setIsNewSectionOptional(false);
      setIsAddSectionDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Section name cannot be empty.",
        variant: "destructive",
      });
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
    // Validation for line items moved to parent component (UnifiedEstimateClientPage)

    setIsSubmitting(true);
    try {
      await onSubmit(values, sections, paymentSchedules); // Pass sections instead of lineItems
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
    // Explicitly call handleSubmit with error handling
    await form.handleSubmit(handleSubmit, (errors) => {
      console.error("Form validation errors (Review and Submit):", errors);
      toast({
        title: "Validation Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
    })(); // Trigger the actual form submission
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

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="line-items">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Left Column for Line Items */}
                <div className="md:col-span-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Line Items</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="ml-auto">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">                        
                          <DropdownMenuItem onClick={() => handleAddExistingLineItem()}>
                            <Database className="mr-2 h-4 w-4 text-blue-600" /> Add From Library
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsCustomLineItemDialogOpen(true)}>
                            <ListPlus className="mr-2 h-4 w-4 text-orange-500" /> Add Custom Item
                            </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleAddSection}>
                            <SquarePlus className="mr-2 h-4 w-4 text--500" /> Add Section
                          </DropdownMenuItem> 
                      <DropdownMenuItem onClick={() => setIsBulkMarkupDialogOpen(true)}>
                        <Calculator className="mr-2 h-4 w-4 text-green-700" /> Add Markup
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsDiscountDialogOpen(true)}>
                        <Tag className="mr-2 h-4 w-4 text-purple-600" /> Apply Discount
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsTaxRateDialogOpen(true)}>
                        <CirclePercent className="mr-2 h-4 w-4 text-blue-600" /> Set Tax Rate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  {sections.every(section => section.line_items.length === 0) ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No items added yet. Click "Add Item" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Render sections and their line items */}
                      {sections.map((section) => (
                        <div key={section.id} className="mb-6">
                          <EstimateSectionHeader
                            section={section}
                            onUpdateSection={handleUpdateSection}
                            onDeleteSection={handleDeleteSection}
                            onAddExistingLineItem={(sectionId) => handleAddExistingLineItem(sectionId)}
                            onAddCustomLineItem={(sectionId) => {
                              setCurrentSectionIdForAddItem(sectionId);
                              setIsCustomLineItemDialogOpen(true);
                            }}
                            onToggleSectionOptionality={handleToggleSectionOptionality}
                            onApplySectionBulkMarkup={handleOpenSectionBulkMarkup} // Pass new prop
                          />
                          <table className="w-full">
                            <thead>
                              <tr className="text-sm font-medium text-muted-foreground">
                                <th className="w-1/12 px-2 py-2 text-left">Type</th>
                                <th className="w-2/12 px-2 py-2 text-left">Item Name</th>
                                <th className="w-1/12 px-2 py-2 text-center">Qty</th>
                                <th className="w-1/12 px-2 py-2 text-center">Unit</th>
                                <th className="w-1/12 px-2 py-2 text-right">Cost</th>
                                <th className="w-1/12 px-2 py-2 text-right">MU %</th>
                                <th className="w-1/12 px-2 py-2 text-center">Tax</th>
                                <th className="w-1/12 px-2 py-2 text-right">Total</th>
                                <th className="w-1/12 px-2 py-2 text-center">Assigned</th>
                                <th className="w-1/12 px-2 py-2 text-center">Optional</th>
                                <th className="w-1/12 px-2 py-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.line_items.map((item, index) => (
                                <EstimateLineItemRow
                                  key={item.id || `new-${index}`}
                                  lineItem={item}
                                  onUpdate={(updatedItem) => handleUpdateLineItem(item.id!, updatedItem)}
                                  onDelete={() => handleDeleteLineItem(item.id!)}
                                  isNew={!item.id}
                                  index={index}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}

                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Right Column for Estimate Summary */}
            <div className="md:col-span-1 sticky top-0 h-fit">
              <EstimateSummary
                estimate={estimate}
                sections={sections}
                subtotalAmount={subtotalAmount}
                discountedSubtotal={discountedSubtotal}
                taxAmount={taxAmount}
                totalAmount={totalAmount}
              />
            </div>
          </div>
        </TabsContent>

            <TabsContent value="payment-schedule">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8"> {/* Changed to md:grid-cols-12 */}
                {/* Left Column: Payment Schedule Items */}
                <Card className="md:col-span-8"> {/* Changed to md:col-span-8 */}
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
                          <div className="col-span-4">Due</div>
                          <div className="col-span-1 text-right">Percentage</div> {/* New header */}
                          <div className="col-span-1"></div> {/* For delete button */}
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
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Right Column: Payment Summary */}
                <Card className="md:col-span-4"> {/* Changed to md:col-span-4 */}
                  <CardHeader>
                    <CardTitle>Payment Schedule Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Payments Scheduled:</span>
                      <span>
                        {formatCurrency(paymentSchedules.reduce((sum, schedule) => sum + (schedule.amount || 0), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Estimate Total:</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Remaining Balance:</span>
                      <span className={cn(
                        Math.abs(totalAmount - paymentSchedules.reduce((sum, schedule) => sum + (schedule.amount || 0), 0)) < 0.01
                          ? "text-green-600"
                          : "text-amber-600"
                      )}>
                        {formatCurrency(totalAmount - paymentSchedules.reduce((sum, schedule) => sum + (schedule.amount || 0), 0))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/estimates")}>
              Cancel
            </Button>
            <Button
              type="submit" // Keep type="submit" for native form submission
              disabled={isSubmitting}
              onClick={() => {
                // Fallback to ensure handleSubmit is called
                form.handleSubmit(handleSubmit, (errors) => {
                  console.error("Form validation errors (fallback onClick):", errors);
                  toast({
                    title: "Validation Error",
                    description: "Please check the form for errors.",
                    variant: "destructive",
                  });
                })();
                console.log("Save button clicked (fallback)!");
              }}
            >
              Save
            </Button>
            <Button type="button" onClick={handleReviewAndSubmit} disabled={isSubmitting}>
              Review and Submit
            </Button>
          </div>
        </div>
      </form>
      <BulkMarkupDialog
        isOpen={isBulkMarkupDialogOpen}
        onClose={() => setIsBulkMarkupDialogOpen(false)}
        onApplyMarkup={handleApplyBulkMarkup}
      />
      <CostItemSelectorDialog
        isOpen={isCostItemSelectorOpen}
        onClose={() => setIsCostItemSelectorOpen(false)}
        onSelectCostItems={handleSelectCostItemsFromDrawer}
      />
      <EstimateReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        onConfirmSubmit={handleConfirmSubmit}
        estimate={estimate}
        sections={sections}
        paymentSchedules={paymentSchedules}
        totalAmount={totalAmount}
      />
      <CustomLineItemDialog
        isOpen={isCustomLineItemDialogOpen}
        onClose={() => setIsCustomLineItemDialogOpen(false)}
        onAddCustomItem={handleAddCustomLineItem}
        sections={sections.map(s => s.name)}
      />

      <DiscountDialog
        isOpen={isDiscountDialogOpen}
        onClose={() => setIsDiscountDialogOpen(false)}
        onApplyDiscount={handleApplyDiscount}
        initialDiscountType={form.watch("discount_type") || ""}
        initialDiscountValue={form.watch("discount_value") || 0}
      />

      <TaxRateDialog
        isOpen={isTaxRateDialogOpen}
        onClose={() => setIsTaxRateDialogOpen(false)}
        onApplyTaxRate={handleApplyTaxRate}
        initialTaxRate={form.watch("tax_rate_percentage") || 0}
      />

      {/* Add Section Dialog */}
      <Dialog open={isAddSectionDialogOpen} onOpenChange={setIsAddSectionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Enter the name for your new section and specify if it's optional.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sectionName" className="text-right">
                Name
              </Label>
              <Input
                id="sectionName"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isOptional" className="text-right">
                Optional
              </Label>
              <Checkbox
                id="isOptional"
                checked={isNewSectionOptional}
                onCheckedChange={(checked) => setIsNewSectionOptional(!!checked)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAddSection}>Add Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
