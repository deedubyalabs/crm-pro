import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Initialize the Supabase client
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Helper function to handle Supabase errors
export function handleSupabaseError(error: unknown): string {
  console.error("Supabase error details:", error)

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("Too Many Requests")) {
      return "Too many requests. Please try again later."
    }

    // Handle schema-related errors
    if (error.message.includes("column") && error.message.includes("does not exist")) {
      return "Database schema error: Column does not exist. Please check your database schema."
    }

    if (error.message.includes("invalid input value for enum")) {
      return "Invalid enum value. Please check the allowed values for this field."
    }

    if (error.message.includes("relationship")) {
      return "Relationship error. The referenced record may not exist."
    }

    return error.message
  }

  if (typeof error === "object" && error !== null) {
    // Try to extract message from Supabase error object
    if ("message" in error && typeof error.message === "string") {
      return error.message
    }

    // Try to extract details from error object
    if ("details" in error && typeof error.details === "string") {
      return error.details
    }
  }

  return "An unknown error occurred"
}
