import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";

// Define the input schema for the tool
const GetMaterialPriceInputSchema = z.object({
  materialName: z.string().describe("The name or description of the material (e.g., '2x4 lumber', 'drywall sheet', 'gallon of paint')."),
  quantity: z.number().optional().describe("The quantity of the material needed. Defaults to 1 if not specified."),
  unit: z.string().optional().describe("The unit of measurement for the quantity (e.g., 'feet', 'sheets', 'gallons')."),
});

// Define the tool to get material prices
export class GetMaterialPriceTool extends StructuredTool<typeof GetMaterialPriceInputSchema> {
  name = "get_material_price";
  description = "Retrieves the estimated price for a given material, optionally considering quantity and unit. This tool interacts with the BigBox API for current pricing.";
  schema = GetMaterialPriceInputSchema;

  constructor() {
    super();
  }

  protected async _call(input: z.infer<typeof GetMaterialPriceInputSchema>): Promise<string> {
    // In a real application, this would interact with the BigBox API (lib/bigbox-service.ts)
    // For now, we'll return mock data
    console.log("Fetching material price for:", input);

    const { materialName, quantity = 1, unit } = input;
    let pricePerUnit = 0;
    let mockUnit = unit || "unit";

    // Simple mock pricing logic
    if (materialName.toLowerCase().includes("lumber") || materialName.toLowerCase().includes("2x4")) {
      pricePerUnit = 5.00;
      mockUnit = "linear foot";
    } else if (materialName.toLowerCase().includes("drywall")) {
      pricePerUnit = 15.00;
      mockUnit = "sheet";
    } else if (materialName.toLowerCase().includes("paint")) {
      pricePerUnit = 30.00;
      mockUnit = "gallon";
    } else {
      pricePerUnit = 10.00; // Default price
    }

    const totalPrice = pricePerUnit * quantity;

    return JSON.stringify({
      materialName,
      quantity,
      unit: mockUnit,
      pricePerUnit,
      totalPrice,
      source: "BigBox API (Mock)",
    });
  }
}
