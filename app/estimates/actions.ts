"use server"

import { estimateService } from "@/lib/estimates"
import type { EstimateLineItem, EstimatePaymentSchedule, Estimate, EstimateSection } from "@/types/estimates" // Import Estimate and EstimateSection types

// Define a type for the input data for creating or updating an estimate
interface EstimateInput {
  opportunity_id?: string;
  person_id: string;
  estimate_number?: string | null;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  issue_date?: string | Date | null; // Allow Date object as it might come from form
  expiration_date?: string | Date | null; // Allow Date object
  notes?: string | null;
  terms_and_conditions?: string | null; // Add new fields
  scope_of_work?: string | null; // Add new fields
  cover_sheet_details?: string | null; // Add new fields
  discount_type?: "percentage" | "fixed" | "" | null;
  discount_value?: number | null;
  tax_rate_percentage?: number | null; // Add tax rate
  deposit_required?: boolean; // Add deposit fields
  deposit_percentage?: number | null; // Add deposit fields
  sections: EstimateSection[]; // Change from lineItems to sections
  paymentSchedules: Partial<EstimatePaymentSchedule>[];
  ai_conversation_history?: string | null; // JSON string of messages
}


export type EstimateActionResult = {
  success: boolean;
  estimateId?: string;
  error?: string;
};

export async function createEstimateAction(
  input: EstimateInput // Accept a single input object
): Promise<EstimateActionResult> {
  try {
    let estimateNumber = input.estimate_number
    if ((!estimateNumber || String(estimateNumber).trim() === "") && input.status !== "Draft") {
      estimateNumber = await estimateService.generateEstimateNumber()
    }

    // Ensure dates are correctly formatted if they are Date objects
    const issueDate = input.issue_date instanceof Date ? input.issue_date.toISOString().split("T")[0] : input.issue_date;
    const expirationDate = input.expiration_date instanceof Date ? input.expiration_date.toISOString().split("T")[0] : input.expiration_date;

    const estimateData = {
      opportunity_id: input.opportunity_id || "", // Ensure it's a string, not null
      person_id: input.person_id,
      estimate_number: estimateNumber,
      status: input.status,
      issue_date: issueDate,
      expiration_date: expirationDate,
      notes: input.notes,
      terms_and_conditions: input.terms_and_conditions, // Pass new fields
      scope_of_work: input.scope_of_work, // Pass new fields
      cover_sheet_details: input.cover_sheet_details, // Pass new fields
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      tax_rate_percentage: input.tax_rate_percentage, // Pass tax rate
      deposit_required: input.deposit_required, // Pass deposit fields
      deposit_percentage: input.deposit_percentage, // Pass deposit fields
      // Calculate total amount based on sections and their line items
      subtotal_amount: (input.sections ?? []).reduce((sum: number, section) => {
        if (section.is_optional) return sum;
        return sum + (section.line_items ?? []).reduce((sectionSum: number, item) => sectionSum + (item.total || 0), 0);
      }, 0),
      total_amount: (input.sections ?? []).reduce((sum: number, section) => {
        if (section.is_optional) return sum;
        return sum + (section.line_items ?? []).reduce((sectionSum: number, item) => sectionSum + (item.total || 0), 0);
      }, 0), // This will be adjusted by discount/tax in service if needed
      ai_conversation_history: input.ai_conversation_history, // Include conversation history
    }

    // Extract all line items from sections for the service call
    const allLineItems: EstimateLineItem[] = (input.sections ?? []).flatMap(section => section.line_items ?? []);

    const estimate = await estimateService.createEstimate(
      estimateData as any, // Cast to any to bypass type error for now
      allLineItems, // Pass all line items
      input.paymentSchedules as any // Cast to any to bypass type error for now
    )

    return { success: true, estimateId: estimate.id }
  } catch (error) {
    console.error("Error creating estimate in Server Action:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while creating the estimate."
    return { success: false, error: errorMessage }
  }
}

export async function updateEstimateAction(
  estimateId: string,
  input: EstimateInput // Accept a single input object
): Promise<EstimateActionResult> {
  try {
    // Ensure dates are correctly formatted if they are Date objects
    const issueDate = input.issue_date instanceof Date ? input.issue_date.toISOString().split("T")[0] : input.issue_date;
    const expirationDate = input.expiration_date instanceof Date ? input.expiration_date.toISOString().split("T")[0] : input.expiration_date;

    const estimateData = {
      opportunity_id: input.opportunity_id,
      person_id: input.person_id,
      estimate_number: input.estimate_number,
      status: input.status,
      issue_date: issueDate,
      expiration_date: expirationDate,
      notes: input.notes,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      // Calculate total amount based on sections and their line items
      subtotal_amount: (input.sections ?? []).reduce((sum: number, section) => {
        if (section.is_optional) return sum;
        return sum + (section.line_items ?? []).reduce((sectionSum: number, item) => sectionSum + (item.total || 0), 0);
      }, 0),
      total_amount: (input.sections ?? []).reduce((sum: number, section) => {
        if (section.is_optional) return sum;
        return sum + (section.line_items ?? []).reduce((sectionSum: number, item) => sectionSum + (item.total || 0), 0);
      }, 0), // This will be adjusted by discount/tax in service if needed
      ai_conversation_history: input.ai_conversation_history, // Include conversation history
    }

    // Extract all line items from sections for the service call
    const allLineItems: EstimateLineItem[] = (input.sections ?? []).flatMap(section => section.line_items ?? []);

    const estimate = await estimateService.updateEstimate(
      estimateId,
      estimateData as any, // Cast to any to bypass type error for now
      allLineItems, // Pass all line items
      input.paymentSchedules as any // Cast to any to bypass type error for now
    )

    return { success: true, estimateId: estimate.id }
  } catch (error) {
    console.error("Error updating estimate in Server Action:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while updating the estimate."
    return { success: false, error: errorMessage }
  }
}
