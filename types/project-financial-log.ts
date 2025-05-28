export type ProjectFinancialLog = {
  id: string;
  project_id: string | null;
  transaction_type: string; // e.g., 'Estimate Accepted', 'Change Order Approved', 'Expense Logged', 'Invoice Sent', 'Payment Received'
  transaction_id: string | null; // ID of the related record
  amount_impact: number;
  new_budget_amount: number | null;
  new_actual_cost: number | null;
  description: string | null;
  created_at: string;
  created_by_user_id: string | null;
};

export type NewProjectFinancialLog = Omit<ProjectFinancialLog, "id" | "created_at">;
export type UpdateProjectFinancialLog = Partial<Omit<ProjectFinancialLog, "id" | "created_at">>;
