export type ScheduleOfValue = {
  id: string;
  project_id: string | null;
  estimate_id: string | null;
  name: string;
  total_amount: number;
  status: string; // e.g., 'Draft', 'Approved', 'Closed'
  created_at: string;
  updated_at: string;
};

export type ScheduleOfValueItem = {
  id: string;
  sov_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  is_billed: boolean;
  invoice_line_item_id: string | null;
  linked_estimate_line_item_id: string | null;
  linked_change_order_line_item_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ScheduleOfValueWithItems = ScheduleOfValue & {
  sov_number: string | null; // Explicitly add sov_number
  items: ScheduleOfValueItem[];
  project: {
    project_name: string;
  };
  estimate: {
    estimate_number: string | null;
  } | null;
};

export type NewScheduleOfValue = Omit<ScheduleOfValue, "id" | "created_at" | "updated_at" | "total_amount">;
export type UpdateScheduleOfValue = Partial<Omit<ScheduleOfValue, "id" | "created_at" | "updated_at">>;

export type NewScheduleOfValueItem = Omit<ScheduleOfValueItem, "id" | "created_at" | "updated_at" | "total">;
export type UpdateScheduleOfValueItem = Partial<Omit<ScheduleOfValueItem, "id" | "created_at" | "updated_at">>;
