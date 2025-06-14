"use server"

import { estimateService } from "@/lib/estimates"
import type { EstimateLineItem, EstimatePaymentSchedule, Estimate } from "@/types/estimates" // Import Estimate type

// Define a type for the input data for creating or updating an estimate
interface EstimateInput {
  opportunity_id?: string;
  person_id: string;
  estimate_number?: string | null;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  issue_date?: string | Date | null; // Allow Date object as it might come from form
  expiration_date?: string | Date | null; // Allow Date object
  notes?: string | null;
  discount_type?: "percentage" | "fixed" | "" | null;
  discount_value?: number | null;
  lineItems: Partial<EstimateLineItem>[];
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
      opportunity_id: input.opportunity_id ?? null,
      person_id: input.person_id,
      estimate_number: estimateNumber,
      status: input.status,
      issue_date: issueDate,
      expiration_date: expirationDate,
      notes: input.notes,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      // Calculate total amount based on line items
      subtotal_amount: input.lineItems.reduce((sum, item) => sum + (item.total || 0), 0),
      total_amount: input.lineItems.reduce((sum, item) => sum + (item.total || 0), 0), // Recalculate total including discount in service if needed
      ai_conversation_history: input.ai_conversation_history, // Include conversation history
    }

    // Assuming estimateService.createEstimate expects full line items if they are not partial.
    // If the service handles partials, this assertion might need adjustment.
    const estimate = await estimateService.createEstimate(
      estimateData,
      input.lineItems as EstimateLineItem[], // Pass line items
      input.paymentSchedules as EstimatePaymentSchedule[] // Pass payment schedules
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
      // Calculate total amount based on line items
      subtotal_amount: input.lineItems.reduce((sum, item) => sum + (item.total || 0), 0),
      total_amount: input.lineItems.reduce((sum, item) => sum + (item.total || 0), 0), // Recalculate total including discount in service if needed
      ai_conversation_history: input.ai_conversation_history, // Include conversation history
    }

    // Assuming estimateService.updateEstimate expects full line items and payment schedules
    // and handles syncing/replacing them based on IDs.
    const estimate = await estimateService.updateEstimate(
      estimateId,
      estimateData,
      input.lineItems as EstimateLineItem[], // Pass line items
      input.paymentSchedules as EstimatePaymentSchedule[] // Pass payment schedules
    )

    return { success: true, estimateId: estimate.id }
  } catch (error) {
    console.error("Error updating estimate in Server Action:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while updating the estimate."
    return { success: false, error: errorMessage }
  }
}
