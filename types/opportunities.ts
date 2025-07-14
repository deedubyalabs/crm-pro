import { Database } from "@/types/supabase";
import { TaskWithRelations } from "@/types/tasks"; // Import TaskWithRelations

export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
export type NewOpportunity = Database["public"]["Tables"]["opportunities"]["Insert"];
export type UpdateOpportunity = Database["public"]["Tables"]["opportunities"]["Update"] & {
  requested_completion_date?: Date | string | null;
  expected_close_date?: Date | string | null;
  lead_score?: number | null;
};

export type OpportunityStatus = "New" | "Contact Attempted" | "Contacted" | "Appointment Scheduled" | "Needs Estimate" | "Pending Approval" | "Accepted" | "Rejected" | "Expired/Lost";

export type EstimateSummary = {
  created_at: string | number | Date;
  estimate_number: string | null;
  id: string;
  status: string;
  issue_date: string | null;
  expiration_date: string | null;
  total_amount: number;
};

export type TaskSummary = {
  id: string;
  title: string;
  status: string;
  start_time: string;
  end_time: string;
  formatted_date: string;
  formatted_time: string;
};

export type ProjectSummary = {
  id: string;
  project_number: string | null;
  project_name: string;
  status: string;
  budget_amount: number | null;
};

export interface OpportunityWithPerson {
  id: string;
  person_id: string;
  opportunity_name: string;
  description: string | null;
  opportunity_status: OpportunityStatus | null;
  estimated_value: number | null;
  probability: number | null;
  requested_completion_date: string | null;
  expected_close_date: string | null;
  source: string | null;
  assigned_user_id: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
  lead_score: number | null;
  person: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    email: string | null;
    phone: string | null;
    person_type: string;
    name: string;
    type: string;
  };
}

export type OpportunityWithRelations = OpportunityWithPerson & {
  tasks?: TaskWithRelations[]; // Changed from TaskSummary[] to TaskWithRelations[]
  projects?: ProjectSummary[];
  estimates?: EstimateSummary[];
};
