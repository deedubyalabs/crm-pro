"use server";

import { redirect } from "next/navigation";
import { costItemService } from "@/lib/cost-items";
import type { NewCostItem } from "@/types/cost-items";

export async function createCostItemAction(values: NewCostItem) {
  try {
    await costItemService.createCostItem(values);
    redirect("/cost-items");
  } catch (error) {
    console.error("Error creating cost item:", error);
    // Re-throw the error so it can be handled by the caller if needed
    throw error;
  }
}
