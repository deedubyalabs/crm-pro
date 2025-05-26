import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import { supabase, handleSupabaseError } from "@/lib/supabase";
import { Database } from "@/types/supabase"; // Import Database type for enums

// Define the input schema for the tool
const UpdatePersonInputSchema = z.object({
  person_id: z.string().describe("The ID of the person to update."),
  first_name: z.string().optional().describe("The updated first name of the person."),
  last_name: z.string().optional().describe("The updated last name of the person."),
  person_type: z.enum(
    ["Lead", "Customer", "Business", "Subcontractor", "Employee", "Other"] as const
  ).optional().describe("The updated type of person (e.g., 'Lead', 'Customer', 'Subcontractor', 'Employee', 'Other')."),
  email: z.string().optional().describe("The updated email address of the person."),
  phone: z.string().optional().describe("The updated phone number of the person."),
  business_name: z.string().optional().describe("The updated business name if the person is associated with a business."),
  address_line1: z.string().optional().describe("The updated first line of the person's address."),
  address_line2: z.string().optional().describe("The updated second line of the person's address."),
  city: z.string().optional().describe("The updated city of the person's address."),
  state_province: z.string().optional().describe("The updated state or province of the person's address."),
  postal_code: z.string().optional().describe("The updated postal code of the person's address."),
  country: z.string().optional().describe("The updated country of the person's address."),
  lead_source: z.string().optional().describe("The updated source from which the lead was acquired. Only applicable if person_type is 'Lead'."),
  lead_stage: z.string().optional().describe("The updated stage of the lead (e.g., 'New Lead', 'Contacted', 'Qualified', 'Unqualified', 'Lost'). Only applicable if person_type is 'Lead'."),
  notes: z.string().optional().describe("Any additional notes or updated details about the person."),
}).refine(data => Object.keys(data).length > 1, { // Ensure at least one field other than person_id is provided
  message: "At least one field (first_name, last_name, person_type, email, phone, business_name, address_line1, address_line2, city, state_province, postal_code, country, lead_source, lead_stage, or notes) must be provided for update.",
});

// Define the tool to update an existing person
export class UpdatePersonTool extends StructuredTool<typeof UpdatePersonInputSchema> {
  name = "update_person";
  description = "Updates an existing person in the system with the provided details. At least one field other than person_id must be provided for update.";
  schema = UpdatePersonInputSchema;

  constructor() {
    super();
  }

  protected async _call(input: z.infer<typeof UpdatePersonInputSchema>): Promise<string> {
    try {
      const {
        person_id,
        first_name,
        last_name,
        person_type,
        email,
        phone,
        business_name,
        address_line1,
        address_line2,
        city,
        state_province,
        postal_code,
        country,
        lead_source,
        lead_stage,
        notes,
      } = input;

      const updates: { [key: string]: any } = {};
      if (first_name !== undefined) updates.first_name = first_name;
      if (last_name !== undefined) updates.last_name = last_name;
      if (person_type !== undefined) updates.person_type = person_type;
      if (email !== undefined) updates.email = email;
      if (phone !== undefined) updates.phone = phone;
      if (business_name !== undefined) updates.business_name = business_name;
      if (address_line1 !== undefined) updates.address_line1 = address_line1;
      if (address_line2 !== undefined) updates.address_line2 = address_line2;
      if (city !== undefined) updates.city = city;
      if (state_province !== undefined) updates.state_province = state_province;
      if (postal_code !== undefined) updates.postal_code = postal_code;
      if (country !== undefined) updates.country = country;
      if (lead_source !== undefined) updates.lead_source = lead_source;
      if (lead_stage !== undefined) updates.lead_stage = lead_stage;
      if (notes !== undefined) updates.notes = notes;

      if (Object.keys(updates).length === 0) {
        return "No valid fields provided for update.";
      }

      const { data, error } = await supabase
        .from("people")
        .update(updates)
        .eq("id", person_id)
        .select("id")
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      if (data) {
        return `Person with ID ${data.id} updated successfully.`;
      } else {
        return `No person found with ID: ${person_id} or no changes were applied.`;
      }
    } catch (error) {
      return `Failed to update person: ${handleSupabaseError(error)}`;
    }
  }
}
