import { supabase, handleSupabaseError } from "./supabase"
import type { Payment, PaymentWithDetails, CreatePaymentParams, UpdatePaymentParams, PaymentMethod } from "@/types/payments"
import { invoiceService, type InvoiceStatus } from "./invoices"
import { projectService } from "./projects"
import { projectFinancialLogService } from "./project-financial-log"

export async function getPayments(): Promise<PaymentWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        invoice:invoices(invoice_number),
        project:projects(project_name),
        person:people(first_name, last_name, business_name)
      `)
      .order("payment_date", { ascending: false })

    if (error) throw error
    return (data || []).map(p => ({
      ...p,
      invoice: {
        invoice_number: p.invoice?.invoice_number || 'N/A',
      },
    })) as PaymentWithDetails[];
  } catch (error) {
    console.error("Error fetching payments:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function getPaymentsByProject(projectId: string): Promise<PaymentWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        invoice:invoices(invoice_number),
        project:projects(project_name),
        person:people(first_name, last_name, business_name)
      `)
      .eq("project_id", projectId)
      .order("payment_date", { ascending: false })

    if (error) throw error
    return (data || []).map(p => ({
      ...p,
      invoice: {
        invoice_number: p.invoice?.invoice_number || 'N/A',
      },
    })) as PaymentWithDetails[];
  } catch (error) {
    console.error("Error fetching payments by project:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function getPaymentsByInvoice(invoiceId: string): Promise<PaymentWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        invoice:invoices(invoice_number),
        project:projects(project_name),
        person:people(first_name, last_name, business_name)
      `)
      .eq("invoice_id", invoiceId)
      .order("payment_date", { ascending: false })

    if (error) throw error
    return (data || []).map(p => ({
      ...p,
      invoice: {
        invoice_number: p.invoice?.invoice_number || 'N/A',
      },
    })) as PaymentWithDetails[];
  } catch (error) {
    console.error("Error fetching payments by invoice:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function getPaymentById(id: string): Promise<PaymentWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        invoice:invoices(invoice_number),
        project:projects(project_name),
        person:people(first_name, last_name, business_name)
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return {
      ...data,
      invoice: {
        invoice_number: data.invoice?.invoice_number || 'N/A',
      },
    } as PaymentWithDetails;
  } catch (error) {
    console.error("Error fetching payment by ID:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function createPayment(payment: CreatePaymentParams): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .insert({
        ...payment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, amount, invoice_id, project_id, created_by_user_id")
      .single()

    if (error) throw error

    // Update associated invoice
    if (data.invoice_id) {
      const invoice = await invoiceService.getInvoiceById(data.invoice_id);
      if (invoice) {
        const newAmountPaid = (invoice.amount_paid || 0) + data.amount;
        let newStatus: InvoiceStatus = invoice.status as InvoiceStatus;
        if (newAmountPaid >= invoice.total_amount) {
          newStatus = "Paid" as InvoiceStatus;
        } else if (newAmountPaid > 0) {
          newStatus = "Partially Paid" as InvoiceStatus;
        }
        await invoiceService.updateInvoice(invoice.id, {
          amount_paid: newAmountPaid, status: newStatus,
          project_id: "",
          person_id: "",
          invoice_number: "",
          total_amount: 0,
          line_items: []
        });
      }
    }

    // Update project financials
    if (data.project_id) {
      await projectService.updateProjectTotalPaymentsReceived(data.project_id, data.amount);
      await projectService.updateProjectOutstandingBalance(data.project_id, -data.amount); // Reduce outstanding balance

      const updatedProject = await projectService.getProjectById(data.project_id);
      await projectFinancialLogService.addProjectFinancialLog({
        project_id: data.project_id,
        transaction_type: "Payment Received",
        transaction_id: data.id,
        amount_impact: data.amount,
        description: `Payment received for $${data.amount}`,
        created_by_user_id: data.created_by_user_id ?? null,
        new_actual_cost: updatedProject?.actual_cost ?? null,
        new_budget_amount: updatedProject?.budget_amount ?? null,
      });
    }

    return data.id
  } catch (error) {
    console.error("Error creating payment:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function updatePayment(id: string, updates: UpdatePaymentParams): Promise<void> {
  try {
    const oldPayment = await paymentService.getPaymentById(id);
    if (!oldPayment) {
      throw new Error(`Payment with ID ${id} not found.`);
    }

    const { data, error } = await supabase
      .from("payments")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, amount, invoice_id, project_id, created_by_user_id")
      .single()

    if (error) throw error

    // Calculate amount difference
    const amountDifference = (data.amount || 0) - oldPayment.amount;

    // Update associated invoice
    if (data.invoice_id) {
      const invoice = await invoiceService.getInvoiceById(data.invoice_id);
      if (invoice) {
        const newAmountPaid = (invoice.amount_paid || 0) + amountDifference;
        let newStatus: InvoiceStatus = invoice.status as InvoiceStatus;
        if (newAmountPaid >= invoice.total_amount) {
          newStatus = "Paid" as InvoiceStatus;
        } else if (newAmountPaid > 0) {
          newStatus = "Partially Paid" as InvoiceStatus;
        } else {
          newStatus = "Sent" as InvoiceStatus; // If payment is reversed completely
        }
        await invoiceService.updateInvoice(invoice.id, {
          amount_paid: newAmountPaid, status: newStatus,
          project_id: "",
          person_id: "",
          invoice_number: "",
          total_amount: 0,
          line_items: []
        });
      }
    }

    // Update project financials
    if (data.project_id) {
      await projectService.updateProjectTotalPaymentsReceived(data.project_id, amountDifference);
      await projectService.updateProjectOutstandingBalance(data.project_id, -amountDifference);

      const updatedProject = await projectService.getProjectById(data.project_id);
      await projectFinancialLogService.addProjectFinancialLog({
        project_id: data.project_id,
        transaction_type: "Payment Updated",
        transaction_id: data.id,
        amount_impact: amountDifference,
        description: `Payment updated by $${amountDifference}`,
        created_by_user_id: data.created_by_user_id ?? null,
        new_actual_cost: updatedProject?.actual_cost ?? null,
        new_budget_amount: updatedProject?.budget_amount ?? null,
      });
    }
  } catch (error) {
    console.error("Error updating payment:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function deletePayment(id: string): Promise<void> {
  try {
    const paymentToDelete = await paymentService.getPaymentById(id);
    if (!paymentToDelete) {
      throw new Error(`Payment with ID ${id} not found.`);
    }

    const { error } = await supabase.from("payments").delete().eq("id", id)

    if (error) throw error

    // Reverse financial impact
    if (paymentToDelete.invoice_id) {
      const invoice = await invoiceService.getInvoiceById(paymentToDelete.invoice_id);
      if (invoice) {
        const newAmountPaid = (invoice.amount_paid || 0) - paymentToDelete.amount;
        let newStatus = invoice.status;
        if (newAmountPaid < invoice.total_amount && newAmountPaid > 0) {
          newStatus = "Partially Paid";
        } else if (newAmountPaid <= 0) {
          newStatus = "Sent"; // Or "Overdue" if due date passed
        }
        await invoiceService.updateInvoice(invoice.id, {
          amount_paid: newAmountPaid, status: newStatus as InvoiceStatus,
          project_id: "",
          person_id: "",
          invoice_number: "",
          total_amount: 0,
          line_items: []
        });
      }
    }

    if (paymentToDelete.project_id) {
      await projectService.updateProjectTotalPaymentsReceived(paymentToDelete.project_id, -paymentToDelete.amount);
      await projectService.updateProjectOutstandingBalance(paymentToDelete.project_id, paymentToDelete.amount); // Increase outstanding balance

      const updatedProject = await projectService.getProjectById(paymentToDelete.project_id);
      await projectFinancialLogService.addProjectFinancialLog({
        project_id: paymentToDelete.project_id,
        transaction_type: "Payment Deleted",
        transaction_id: id,
        amount_impact: -paymentToDelete.amount,
        description: `Payment of $${paymentToDelete.amount} deleted`,
        created_by_user_id: paymentToDelete.created_by_user_id ?? null,
        new_actual_cost: updatedProject?.actual_cost ?? null,
        new_budget_amount: updatedProject?.budget_amount ?? null,
      });
    }
  } catch (error) {
    console.error("Error deleting payment:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase.from("payment_methods").select("*").eq("is_active", true).order("name")

    if (error) throw error
    return (data || []).map(pm => ({
      ...pm,
      created_at: pm.created_at || new Date().toISOString(), // Provide default if null
      updated_at: pm.updated_at || new Date().toISOString(), // Provide default if null
    })) as PaymentMethod[];
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export const paymentService = {
  getPayments,
  getPaymentsByProject,
  getPaymentsByInvoice,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentMethods,
}
