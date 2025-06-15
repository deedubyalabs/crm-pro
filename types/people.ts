export type PersonType = "Customer" | "Lead" | "Business" | "Subcontractor" | "Employee";

export interface Person {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  person_type: PersonType;
  trade_categories?: string[] | null; // Assuming this is an array of strings for trade categories
  created_at: string;
  updated_at: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
  lead_source: string | null;
  lead_stage: string | null;
  tags: string[] | null;
  notes: string | null;
  last_contacted_at: string | null;
  created_by_user_id: string | null;
  google_contact_id: string | null;
  square_customer_id: string | null;
}

export interface NewPerson {
  first_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  person_type: PersonType;
  trade_categories?: string[] | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state_province?: string | null;
  postal_code?: string | null;
  country?: string | null;
  lead_source?: string | null;
  lead_stage?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  last_contacted_at?: string | null;
  created_by_user_id?: string | null;
  google_contact_id?: string | null;
  square_customer_id?: string | null;
}

export interface UpdatePerson {
  first_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  person_type?: PersonType;
  trade_categories?: string[] | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state_province?: string | null;
  postal_code?: string | null;
  country?: string | null;
  lead_source?: string | null;
  lead_stage?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  last_contacted_at?: string | null;
}
