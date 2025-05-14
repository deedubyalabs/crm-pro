import { supabase, handleSupabaseError } from "./supabase"
import type { PaymentWithDetails, CreatePaymentParams, UpdatePaymentParams, PaymentMethod } from "@/types/payments"

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
    return data || []
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
    return data || []
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
    return data || []
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
    return data
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
      .select("id")
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error("Error creating payment:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function updatePayment(id: string, payment: UpdatePaymentParams): Promise<void> {
  try {
    const { error } = await supabase
      .from("payments")
      .update({
        ...payment,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error updating payment:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function deletePayment(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("payments").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting payment:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase.from("payment_methods").select("*").eq("is_active", true).order("name")

    if (error) throw error
    return data || []
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
