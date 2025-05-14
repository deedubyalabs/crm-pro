export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      people: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          person_type: string
          first_name: string | null
          last_name: string | null
          business_name: string | null
          email: string | null
          phone: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state_province: string | null
          postal_code: string | null
          country: string | null
          lead_source: string | null
          notes: string | null
          last_contacted_at: string | null
          square_customer_id: string | null
          google_contact_id: string | null
          created_by_user_id: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          person_type: string
          first_name?: string | null
          last_name?: string | null
          business_name?: string | null
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state_province?: string | null
          postal_code?: string | null
          country?: string | null
          lead_source?: string | null
          notes?: string | null
          last_contacted_at?: string | null
          square_customer_id?: string | null
          google_contact_id?: string | null
          created_by_user_id?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          person_type?: string
          first_name?: string | null
          last_name?: string | null
          business_name?: string | null
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state_province?: string | null
          postal_code?: string | null
          country?: string | null
          lead_source?: string | null
          notes?: string | null
          last_contacted_at?: string | null
          square_customer_id?: string | null
          google_contact_id?: string | null
          created_by_user_id?: string | null
          tags?: string[] | null
        }
      }
      opportunities: {
        Row: {
          id: string
          person_id: string
          opportunity_name: string
          description: string | null
          status: string
          estimated_value: number | null
          requested_completion_date: string | null
          assigned_user_id: string | null
          created_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id: string
          opportunity_name: string
          description?: string | null
          status: string
          estimated_value?: number | null
          requested_completion_date?: string | null
          assigned_user_id?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          opportunity_name?: string
          description?: string | null
          status?: string
          estimated_value?: number | null
          requested_completion_date?: string | null
          assigned_user_id?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          person_id: string | null
          opportunity_id: string | null
          project_id: string | null
          appointment_type: string | null
          status: string
          start_time: string
          end_time: string
          address: string | null
          notes: string | null
          created_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id?: string | null
          opportunity_id?: string | null
          project_id?: string | null
          appointment_type?: string | null
          status: string
          start_time: string
          end_time: string
          address?: string | null
          notes?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: string | null
          opportunity_id?: string | null
          project_id?: string | null
          appointment_type?: string | null
          status?: string
          start_time?: string
          end_time?: string
          address?: string | null
          notes?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          person_id: string
          opportunity_id: string | null
          estimate_id: string | null
          project_number: string | null
          project_name: string
          status: string
          project_address_line1: string | null
          project_address_line2: string | null
          project_city: string | null
          project_state_province: string | null
          project_postal_code: string | null
          project_country: string | null
          budget_amount: number | null
          actual_cost: number | null
          planned_start_date: string | null
          planned_end_date: string | null
          actual_start_date: string | null
          actual_end_date: string | null
          description: string | null
          notes: string | null
          created_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id: string
          opportunity_id?: string | null
          estimate_id?: string | null
          project_number?: string | null
          project_name: string
          status: string
          project_address_line1?: string | null
          project_address_line2?: string | null
          project_city?: string | null
          project_state_province?: string | null
          project_postal_code?: string | null
          project_country?: string | null
          budget_amount?: number | null
          actual_cost?: number | null
          planned_start_date?: string | null
          planned_end_date?: string | null
          actual_start_date?: string | null
          actual_end_date?: string | null
          description?: string | null
          notes?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          opportunity_id?: string | null
          estimate_id?: string | null
          project_number?: string | null
          project_name?: string
          status?: string
          project_address_line1?: string | null
          project_address_line2?: string | null
          project_city?: string | null
          project_state_province?: string | null
          project_postal_code?: string | null
          project_country?: string | null
          budget_amount?: number | null
          actual_cost?: number | null
          planned_start_date?: string | null
          planned_end_date?: string | null
          actual_start_date?: string | null
          actual_end_date?: string | null
          description?: string | null
          notes?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          status: string
          sort_order: number | null
          scheduled_start_date: string | null
          scheduled_end_date: string | null
          actual_start_date: string | null
          actual_end_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          created_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          status: string
          sort_order?: number | null
          scheduled_start_date?: string | null
          scheduled_end_date?: string | null
          actual_start_date?: string | null
          actual_end_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          status?: string
          sort_order?: number | null
          scheduled_start_date?: string | null
          scheduled_end_date?: string | null
          actual_start_date?: string | null
          actual_end_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cost_items: {
        Row: {
          id: string
          item_code: string
          name: string
          description: string | null
          type: string
          unit: string
          unit_cost: number
          default_markup: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_code: string
          name: string
          description?: string | null
          type: string
          unit: string
          unit_cost: number
          default_markup: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_code?: string
          name?: string
          description?: string | null
          type?: string
          unit?: string
          unit_cost?: number
          default_markup?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      estimates: {
        Row: {
          id: string
          opportunity_id: string
          person_id: string
          estimate_number: string | null
          status: string
          issue_date: string | null
          expiration_date: string | null
          total_amount: number
          notes: string | null
          created_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          person_id: string
          estimate_number?: string | null
          status?: string
          issue_date?: string | null
          expiration_date?: string | null
          total_amount?: number
          notes?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          person_id?: string
          estimate_number?: string | null
          status?: string
          issue_date?: string | null
          expiration_date?: string | null
          total_amount?: number
          notes?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      estimate_line_items: {
        Row: {
          id: string
          estimate_id: string
          cost_item_id: string | null
          description: string
          quantity: number
          unit: string
          unit_cost: number
          markup: number
          total: number
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          estimate_id: string
          cost_item_id?: string | null
          description: string
          quantity: number
          unit: string
          unit_cost: number
          markup: number
          total: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          estimate_id?: string
          cost_item_id?: string | null
          description?: string
          quantity?: number
          unit?: string
          unit_cost?: number
          markup?: number
          total?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_status: "Scheduled" | "Completed" | "Canceled" | "Rescheduled" | "No Show"
      person_type: "Lead" | "Customer" | "Business" | "Subcontractor" | "Employee" | "Other"
      opportunity_status:
        | "New Lead"
        | "Contact Attempted"
        | "Contacted"
        | "Needs Scheduling"
        | "Appointment Scheduled"
        | "Needs Estimate"
        | "Estimate Sent"
        | "Estimate Accepted"
        | "Estimate Rejected"
        | "On Hold"
        | "Lost"
      project_status:
        | "Pending Start"
        | "Planning"
        | "In Progress"
        | "On Hold"
        | "Awaiting Change Order Approval"
        | "Nearing Completion"
        | "Completed"
        | "Canceled"
      job_status: "Pending" | "Scheduled" | "In Progress" | "Blocked" | "Completed" | "Canceled"
      cost_item_type: "Material" | "Labor" | "Equipment" | "Subcontractor" | "Other"
      estimate_status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired"
    }
  }
}
