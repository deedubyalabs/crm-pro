import { tavily } from "@tavily/core";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "search";
  const query = searchParams.get("query");
  const url = searchParams.get("url");

  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (!tavilyApiKey) {
    return NextResponse.json({ error: "TAVILY_API_KEY is not set" }, { status: 500 });
  }

  try {
    const tvly = tavily({ apiKey: tavilyApiKey });

    let response;
    switch (action) {
      case "search":
        if (!query) {
          return NextResponse.json({ error: "Query parameter is required for search" }, { status: 400 });
        }
        response = await tvly.search(query, {
          includeDomains: ["homedepot.com", "lowes.com", "menards.com"],
          maxResults: 10, // Limit initial search results
          includeRawContent: "text", // Include raw content as text for potential extraction
        });
        break;
      case "extract":
        if (!url) {
          return NextResponse.json({ error: "URL parameter is required for extract" }, { status: 400 });
        }
        response = await tvly.extract([url], {});
        break;
      case "crawl":
        if (!url) {
          return NextResponse.json({ error: "URL parameter is required for crawl" }, { status: 400 });
        }
        response = await tvly.crawl(url, {
          maxDepth: 1, // Limit crawl depth to avoid excessive crawling
          limit: 5, // Limit number of pages to crawl
          instructions: "Extract product name, price, and description.", // Specific instructions for crawling
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Tavily ${action} error:`, error);
    return NextResponse.json({ error: `Failed to perform Tavily ${action}` }, { status: 500 });
  }
}
