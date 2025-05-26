"use server";

import { redirect } from "next/navigation";
import { costItemService } from "@/lib/cost-items";
import type { NewCostItem, NewCostItemGroup, UpdateCostItemGroup } from "@/types/cost-items";

export async function createCostItemAction(values: NewCostItem) {
  try {
    const newCostItem = await costItemService.createCostItem(values);
    // No redirect here, as this action is now used by the drawer which handles its own closing/refresh
    return newCostItem; // Return the created item
  } catch (error) {
    console.error("Error creating cost item:", error);
    throw error;
  }
}

export async function createCostItemGroupAction(values: NewCostItemGroup) {
  try {
    await costItemService.createCostItemGroup(values);
  } catch (error) {
    console.error("Error creating cost item group:", error);
    throw error;
  }
}

export async function updateCostItemGroupAction(id: string, values: UpdateCostItemGroup) {
  try {
    await costItemService.updateCostItemGroup(id, values);
  } catch (error) {
    console.error("Error updating cost item group:", error);
    throw error;
  }
}

export async function deleteCostItemGroupAction(id: string) {
  try {
    await costItemService.deleteCostItemGroup(id);
  } catch (error) {
    console.error("Error deleting cost item group:", error);
    throw error;
  }
}
