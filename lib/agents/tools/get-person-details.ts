import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import { supabase, handleSupabaseError } from "@/lib/supabase";
import { Database } from "@/types/supabase"; // Import Database type for enums

// Define the input schema for the tool
const GetPersonDetailsInputSchema = z.object({
  first_name: z.string().optional().describe("The first name of the person to retrieve details for."),
  last_name: z.string().optional().describe("The last name of the person to retrieve details for."),
  person_type: z.enum(
    ["Lead", "Customer", "Business", "Subcontractor", "Employee", "Other"] as const
  ).optional().describe("The type of person to retrieve details for (e.g., 'Lead', 'Customer', 'Subcontractor', 'Employee', 'Other')."),
  email: z.string().optional().describe("The email address of the person to retrieve details for."),
  phone: z.string().optional().describe("The phone number of the person to retrieve details for."),
}).refine(data => data.first_name || data.last_name || data.person_type || data.email || data.phone, {
  message: "At least one of 'first_name', 'last_name', 'person_type', 'email', or 'phone' must be provided.",
});

// Define the tool to get person details
export class GetPersonDetailsTool extends StructuredTool<typeof GetPersonDetailsInputSchema> {
  name = "get_person_details";
  description = "Retrieves detailed information about a specific person from the database using their first name, last name, person type, email, or phone number. At least one identifier must be provided.";
  schema = GetPersonDetailsInputSchema;

  constructor() {
    super();
  }

  protected async _call(input: z.infer<typeof GetPersonDetailsInputSchema>): Promise<string> {
    try {
      let query = supabase.from("people").select("*");

      if (input.first_name) {
        query = query.ilike("first_name", `%${input.first_name}%`);
      }
      if (input.last_name) {
        query = query.ilike("last_name", `%${input.last_name}%`);
      }
      if (input.person_type) {
        query = query.eq("person_type", input.person_type);
      }
      if (input.email) {
        query = query.eq("email", input.email);
      }
      if (input.phone) {
        query = query.eq("phone", input.phone);
      }

      const { data, error } = await query.limit(1); // Limit to 1 result for simplicity, consider handling multiple matches

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      if (data && data.length > 0) {
        return JSON.stringify(data[0]);
      } else {
        return "No person found matching the provided criteria.";
      }
    } catch (error) {
      return `Failed to retrieve person details: ${handleSupabaseError(error)}`;
    }
  }
}
