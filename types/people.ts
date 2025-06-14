export type PersonType = "Customer" | "Lead" | "Vendor" | "Subcontractor" | "Employee" | "Business" | "Other";

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
  // Add other fields as they become apparent from usage
}

export interface NewPerson {
  first_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  person_type: PersonType;
  trade_categories?: string[] | null;
}

export interface UpdatePerson {
  first_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  person_type?: PersonType;
  trade_categories?: string[] | null;
}
