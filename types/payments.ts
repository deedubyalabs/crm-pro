export type Payment = {
  id: string
  invoice_id: string
  project_id: string
  person_id: string
  amount: number
  payment_date: string
  payment_method: string
  reference_number: string | null
  square_payment_id: string | null
  square_receipt_url: string | null
  notes: string | null
  created_by_user_id: string | null
  created_at: string
  updated_at: string
}

export type PaymentWithDetails = Payment & {
  invoice: {
    invoice_number: string | null
  }
  project: {
    project_name: string
  }
  person: {
    first_name: string | null
    last_name: string | null
    business_name: string | null
  }
}

export type PaymentMethod = {
  id: string
  name: string
  description: string | null
  is_online: boolean
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export type CreatePaymentParams = Omit<Payment, "id" | "created_at" | "updated_at">

export type UpdatePaymentParams = Partial<Omit<Payment, "id" | "created_at" | "updated_at">>
