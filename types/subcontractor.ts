export interface Subcontractor {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  notes: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
  tags: string[] | null;
  trade_categories: string[] | null;
  website: string | null;
  logo: string | null;
}

export interface NewSubcontractor {
  first_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  trade_categories?: string[] | null;
  website?: string | null;
  logo?: string | null;
}

export interface UpdateSubcontractor {
  first_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  trade_categories?: string[] | null;
  website?: string | null;
  logo?: string | null;
}
