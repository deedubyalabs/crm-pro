export type BlueprintOfValues = {
  id: string;
  project_id: string | null;
  estimate_id: string | null;
  name: string;
  total_amount: number;
  status: string; // e.g., 'Draft', 'Approved', 'Closed'
  created_at: string;
  updated_at: string;
};

export type BlueprintOfValuesItem = {
  id: string;
  bov_id: string;
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

export type BlueprintOfValuesWithItems = BlueprintOfValues & {
  bov_number: string | null; // Explicitly add bov_number
  items: BlueprintOfValuesItem[];
  project: {
    project_name: string;
  };
  estimate: {
    estimate_number: string | null;
  } | null;
};

export type NewBlueprintOfValues = Omit<BlueprintOfValues, "id" | "created_at" | "updated_at" | "total_amount">;
export type UpdateBlueprintOfValues = Partial<Omit<BlueprintOfValues, "id" | "created_at" | "updated_at">>;

export type NewBlueprintOfValuesItem = Omit<BlueprintOfValuesItem, "id" | "created_at" | "updated_at" | "total">;
export type UpdateBlueprintOfValuesItem = Partial<Omit<BlueprintOfValuesItem, "id" | "created_at" | "updated_at">>;
