import { z } from "zod"
import { DynamicTool } from "@langchain/core/tools"

// Define the input schema for the suggest-next-action tool
const SuggestNextActionSchema = z.object({
  opportunity_id: z.string().describe("The ID of the opportunity for which to suggest next actions."),
  current_status: z.string().optional().describe("The current status of the opportunity."),
  lead_score: z.number().optional().describe("The current lead score of the opportunity."),
})

/**
 * Suggests optimal next actions for an opportunity based on its current state.
 * This is a mock implementation. In a real scenario, an LLM would analyze the opportunity's
 * status, lead score, and history to propose intelligent next steps.
 */
export const suggestNextActionTool = new DynamicTool({
  name: "suggest-next-action",
  description: "Suggests optimal next actions for a given opportunity based on its current status and lead score.",
  func: async (input: string) => {
    try {
      const parsedInput = SuggestNextActionSchema.parse(JSON.parse(input));
      const { opportunity_id, current_status, lead_score } = parsedInput;

      console.log(`Suggesting next actions for opportunity ${opportunity_id}:`);
      console.log(`  Current Status: ${current_status || 'N/A'}`);
      console.log(`  Lead Score: ${lead_score || 'N/A'}`);

      // Mock suggestion logic:
      // In a real scenario, an LLM would generate these based on complex reasoning.
      let suggestedActions = [];

      if (current_status === "New Lead" && (lead_score === undefined || lead_score > 70)) {
        suggestedActions.push({
          action: "Send initial contact email",
          rationale: "Opportunity is new and has a high lead score, prompt outreach is recommended.",
        });
      } else if (current_status === "Contacted" && (lead_score === undefined || lead_score > 60)) {
        suggestedActions.push({
          action: "Schedule a discovery call",
          rationale: "Initial contact made, move to qualify the lead further.",
        });
      } else if (current_status === "Needs Estimate") {
        suggestedActions.push({
          action: "Prepare and send detailed estimate",
          rationale: "Client is ready for a formal proposal.",
        });
      } else {
        suggestedActions.push({
          action: "Follow up with client",
          rationale: "General follow-up to keep the opportunity moving.",
        });
      }

      return JSON.stringify({ opportunity_id, suggested_actions: suggestedActions });
    } catch (error) {
      console.error("Error in suggest-next-action tool:", error);
      return JSON.stringify({ error: "Failed to suggest next actions." });
    }
  },
});
