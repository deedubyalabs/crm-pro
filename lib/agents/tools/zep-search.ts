import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import zepClient from "@/lib/zep";

// Define the input schema for the Zep search function
const ZepSearchInput = z.object({
  query: z.string().describe("The query string to search the Zep knowledge graph with."),
});

// Define the function that performs the Zep search
async function zepSearchFunc(input: z.infer<typeof ZepSearchInput>): Promise<string> {
  const { query } = input;
  try {
    const searchResults = await zepClient.graph.search({
      query: query,
      scope: "edges", // Search for facts (edges)
      limit: 5, // Limit to 5 results
    });

    if (searchResults.edges && searchResults.edges.length > 0) {
      const facts = searchResults.edges.map(edge => edge.fact).join("\n- ");
      return `Found facts in Zep: - ${facts}`;
    } else {
      return "No relevant information found in Zep for the given query.";
    }
  } catch (error) {
    console.error("Error searching Zep:", error);
    return `Error searching Zep: ${error instanceof Error ? error.message : 'An unknown error occurred'}`;
  }
}

// Create the ZepSearchTool class
export class ZepSearchTool extends StructuredTool {
  name = "zep_search";
  description = "Searches the Zep knowledge graph for relevant information based on a query. Use this tool to retrieve facts and entities from past conversations or ingested business data. Input should be a concise query string.";
  schema = ZepSearchInput;

  async _call(input: z.infer<typeof ZepSearchInput>): Promise<string> {
    return zepSearchFunc(input);
  }
}
