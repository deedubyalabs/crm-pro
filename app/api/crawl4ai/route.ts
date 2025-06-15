import { NextResponse } from "next/server";
import type { CostItem } from "@/types/cost-items";

// Define the Pydantic schema for the CostItem
const costItemSchema = {
  title: "CostItem",
  type: "object",
  properties: {
    name: {
      title: "Name",
      description: "The name of the product.",
      type: "string",
    },
    description: {
      title: "Description",
      description: "A detailed description of the product.",
      type: "string",
    },
    unit_cost: {
      title: "Unit Cost",
      description: "The price or unit cost of the product.",
      type: "number",
    },
    unit: {
      title: "Unit",
      description: "The unit of measurement for the product (e.g., EA, LF, SF).",
      type: "string",
    },
    item_code: {
      title: "Item Code",
      description: "The manufacturer's item code or SKU for the product.",
      type: "string",
    },
  },
  required: ["name", "unit_cost", "unit"],
};

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  const crawlPayload = {
    urls: [url],
    crawler_config: {
      type: "CrawlerRunConfig",
      params: {
        extraction_strategy: {
          type: "LLMExtractionStrategy",
          params: {
            llm_config: {
              provider: "openai/gpt-4o",
              api_token: process.env.OPENAI_API_KEY,
            },
            schema: {
              type: "dict",
              value: costItemSchema,
            },
            extraction_type: "schema",
            instruction: "Extract all product details from the page. For each product, extract the name, description, price, and item code/SKU. If a unit of measurement is available, extract it; otherwise, default to 'EA'.",
          },
        },
        cache_mode: "bypass",
      },
    },
  };

  try {
    const response = await fetch("http://localhost:11235/crawl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(crawlPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Crawl4AI API error:", errorText);
      return NextResponse.json({ error: `Crawl4AI API error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    // The extracted content is a stringified JSON, so we need to parse it.
    const extractedContent = JSON.parse(data[0].extracted_content);
    return NextResponse.json(extractedContent);
  } catch (error) {
    console.error("Crawl4AI request failed:", error);
    return NextResponse.json({ error: "Failed to perform Crawl4AI request" }, { status: 500 });
  }
}
