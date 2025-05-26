import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import { supabase, handleSupabaseError } from "@/lib/supabase";
import { Database } from "@/types/supabase"; // Import Database type for enums

// Define the input schema for the tool
const CreatePersonInputSchema = z.object({
  first_name: z.string().describe("The first name of the person."),
  last_name: z.string().optional().describe("The last name of the person."),
  person_type: z.enum(
    ["Lead", "Customer", "Business", "Subcontractor", "Employee", "Other"] as const
  ).describe("The type of person (e.g., 'Lead', 'Customer', 'Subcontractor', 'Employee', 'Other')."),
  email: z.string().optional().describe("The email address of the person."),
  phone: z.string().optional().describe("The phone number of the person."),
  business_name: z.string().optional().describe("The business name if the person is associated with a business."),
  address_line1: z.string().optional().describe("The first line of the person's address."),
  address_line2: z.string().optional().describe("The second line of the person's address."),
  city: z.string().optional().describe("The city of the person's address."),
  state_province: z.string().optional().describe("The state or province of the person's address."),
  postal_code: z.string().optional().describe("The postal code of the person's address."),
  country: z.string().optional().describe("The country of the person's address."),
  lead_source: z.string().optional().describe("The source from which the lead was acquired (e.g., 'Website', 'Referral', 'Advertisement'). Only applicable if person_type is 'Lead'."),
  notes: z.string().optional().describe("Any additional notes or details about the person."),
});

// Define the tool to create a new person
export class CreatePersonTool extends StructuredTool<typeof CreatePersonInputSchema> {
  name = "create_person";
  description = "Creates a new person in the system with the provided details. Requires first name and person type, and optionally last name, email, phone number, business name, address details, lead source (if Lead), and notes. Returns the ID of the newly created person.";
  schema = CreatePersonInputSchema;

  constructor() {
    super();
  }

  protected async _call(input: z.infer<typeof CreatePersonInputSchema>): Promise<string> {
    try {
      const {
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
        notes,
      } = input;

      const { data, error } = await supabase
        .from("people")
        .insert({
          first_name: first_name,
          last_name: last_name || null,
          person_type: person_type,
          email: email || null,
          phone: phone || null,
          business_name: business_name || null,
          address_line1: address_line1 || null,
          address_line2: address_line2 || null,
          city: city || null,
          state_province: state_province || null,
          postal_code: postal_code || null,
          country: country || null,
          lead_source: lead_source || null,
          notes: notes || null,
          // lead_stage is specific to leads and should not be set here
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      if (data) {
        return `Person created successfully with ID: ${data.id}`;
      } else {
        return "Failed to create person: No data returned after insertion.";
      }
    } catch (error) {
      return `Failed to create person: ${handleSupabaseError(error)}`;
    }
  }
}
