export type BlueprintOfValue = {
  id: string;
  project_id: string;
  bov_number: string | null;
  name: string | null;
  status: string | null;
  estimate_id: string | null;
  created_at: string;
  updated_at: string;
};

export type NewBlueprintOfValue = {
  project_id: string;
  bov_number?: string | null;
  name?: string | null;
  status?: string | null;
  estimate_id?: string | null;
};

export type BlueprintOfValueLineItem = {
  id: string;
  bov_id: string;
  estimate_line_item_id: string | null;
  item_name: string;
  description: string | null;
  scheduled_value: number;
  amount_previously_billed: number;
  remaining_to_bill: number;
  percent_previously_billed: number;
  created_at: string;
  updated_at: string;
};

export type NewBlueprintOfValueLineItem = {
  bov_id: string;
  estimate_line_item_id?: string | null;
  item_name: string;
  description?: string | null;
  scheduled_value: number;
  amount_previously_billed?: number;
  remaining_to_bill?: number;
  percent_previously_billed?: number;
};

export type BlueprintOfValueWithItems = BlueprintOfValue & {
  items: BlueprintOfValueLineItem[];
};
