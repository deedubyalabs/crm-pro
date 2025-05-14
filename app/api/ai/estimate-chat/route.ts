import { NextResponse } from 'next/server';
import type { Message } from '@/components/ai/conversational-estimator/types';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for temporary IDs
// Import services for cost item lookup
import { costItemService } from '@/lib/cost-items';
// Import bigbox service (assuming it exists and has a searchProducts function)
// import { bigboxService } from '@/lib/bigbox-service';


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set. Please set it in your environment variables.");
  // Potentially throw an error or handle this case more gracefully depending on deployment strategy
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || ""); // Fallback to empty string if not set, though SDK might error

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite", // Using a cost-effective and fast model
  // systemInstruction is now preferred for setting the role of the model
  systemInstruction: `You are Pro, an expert residential construction estimator. Your primary role is to assist solo contractors in creating accurate and detailed project estimates.

  Key Responsibilities:
  1.  Understand Project Scope: Carefully analyze the user's description of the project. Identify the type of work (e.g., bathroom remodel, kitchen renovation, deck construction, painting, plumbing repair).
  2.  Identify Materials & Quantities: Extract specific materials mentioned (e.g., "ceramic tile," "quartz countertops," "pressure-treated lumber"). If quantities or dimensions are provided (e.g., "10x12 room," "300 sq ft of flooring," "two windows"), note them.
  3.  Clarify Ambiguities: If the user's input is vague or missing critical details (like dimensions, material choices, specific tasks), ask clear, concise clarifying questions. For example: "What are the approximate dimensions of the bathroom?", "What type of flooring are you considering?", "Could you specify the model of the toilet?".
  4.  Break Down Tasks: Mentally (or by suggesting to the user) break down the project into logical tasks or line items.
  5.  Professional Interaction: Maintain a helpful, professional, and conversational tone.
  6.  Structured Output (Goal): In addition to your conversational reply, you MUST include a JSON block in your response, enclosed in triple backticks (\`\`\`) and labeled \`json\`. This JSON block should contain structured data about the estimate. The JSON object should have the following keys:
      -   \`projectType\`: A string identifying the type of project (e.g., "Bathroom Remodel", "Deck Construction").
      -   \`dimensions\`: A string or object describing the project dimensions.
      -   \`lineItemsSuggestedByAI\`: An array of objects, where each object represents a potential line item. Each line item object should have the following keys:
          -   \`aiSuggestionId\`: A string, a temporary unique ID for this suggestion.
          -   \`description\`: A string describing the item (e.g., "Supply and install new toilet", "Supply and install ceramic floor tile").
          -   \`suggestedQuantity\`: A number representing the suggested quantity.
          -   \`suggestedUnit\`: A string representing the suggested unit (e.g., "each", "sq ft", "linear ft").
          -   \`notesFromAI\`: A string containing any specific notes about this item (optional).
          -   \`matchedCostItemId\`: A string, the ID from the \`cost_items\` table if a match is found (nullable).
          -   \`suggestedUnitCost\`: A number, the suggested unit cost (nullable).
          -   \`suggestedMarkup\`: A number, the suggested markup percentage (nullable).
          -   \`section_name\`: A string, the suggested section name (nullable).

  Important Considerations:
  -   Do NOT invent prices or labor costs at this stage. Your current focus is on understanding the scope and suggesting line items. Costing will be handled separately by the application logic based on your suggestions.
  -   If the user uploads files/images, acknowledge them (e.g., "Thanks for the image. I see..."). You won't be able to directly analyze image content in this text-based interaction, but acknowledge the attachment.
  -   Keep your conversational replies concise but thorough enough to confirm understanding or ask for necessary details.
  -   If the user asks for something outside of estimation, gently guide them back or state you are specialized in estimation.
  -   ALWAYS include the JSON block, even if it's empty (e.g., \`\`\`json\n{}\n\`\`\` or \`\`\`json\n{\n  "lineItemsSuggestedByAI": []\n}\`\`\` if no items are identified).

  Example Clarifying Question: "Okay, a kitchen refresh sounds good. To help me understand the scope better, could you tell me the approximate length of the countertops you're planning to replace?"
  Example Acknowledgment: "Got it. A new deck, approximately 12x16 feet. What kind of decking material are you considering (e.g., wood, composite)?"
  Example JSON Output:
  \`\`\`json
  {
    "projectType": "Bathroom Remodel",
    "dimensions": "8x5 ft",
    "lineItemsSuggestedByAI": [
      {
        "aiSuggestionId": "temp-12345",
        "description": "Supply and install new toilet",
        "suggestedQuantity": 1,
        "suggestedUnit": "each",
        "notesFromAI": "Standard elongated bowl",
        "matchedCostItemId": null,
        "suggestedUnitCost": null,
        "suggestedMarkup": null,
        "section_name": "Plumbing"
      },
      {
        "aiSuggestionId": "temp-67890",
        "description": "Supply and install ceramic floor tile",
        "suggestedQuantity": 40,
        "suggestedUnit": "sq ft",
        "notesFromAI": "Assuming 8x5 bathroom size",
        "matchedCostItemId": null,
        "suggestedUnitCost": null,
        "suggestedMarkup": null,
        "section_name": "Flooring"
      }
    ]
  }
  \`\`\`
  `,
});

const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192, // Adjust as needed, but be mindful of costs/limits
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Helper to transform messages for Gemini
// Gemini expects { role: "user" | "model", parts: [{ text: "..." }] }
// System instruction is now part of model initialization
function transformMessagesForGemini(messages: Message[]): Array<{ role: "user" | "model"; parts: { text: string }[] }> {
  return messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant') // System message is handled by systemInstruction
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content + (msg.attachments ? ` (Attached: ${msg.attachments.map(a => a.name).join(', ')})` : '') }],
    }));
}


export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const incomingMessages: Message[] = body.messages;

    if (!incomingMessages || !Array.isArray(incomingMessages) || incomingMessages.length === 0) {
      return NextResponse.json({ error: 'Messages are required in the request body.' }, { status: 400 });
    }

    const history = transformMessagesForGemini(incomingMessages);

    // Find the index of the first user message in the history
    const firstUserIndex = history.findIndex(msg => msg.role === 'user');

    let chatHistory: Array<{ role: "user" | "model"; parts: { text: string }[] }> = [];
    if (firstUserIndex !== -1) {
      // If a user message is found, use the history from that point onwards,
      // excluding the last message (current user query)
      chatHistory = history.slice(firstUserIndex, -1);
    } else {
      // If no user message is found in the history (shouldn't happen in a valid chat),
      // pass an empty history.
      chatHistory = [];
    }

    const chat = model.startChat({
      history: chatHistory, // Use the potentially adjusted history
      generationConfig,
      safetySettings,
    });

    const currentUserMessageContent = history[history.length - 1]?.parts[0]?.text || "";
    const result = await chat.sendMessage(currentUserMessageContent); // Send only the current user message text
    
    const geminiResponse = result.response;
    const responseText = geminiResponse.text();

    let conversationalReply = responseText;
    let structuredEstimateData: any = {}; // Initialize structured data object

    // Attempt to extract JSON block from the response text
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatch && jsonMatch[1]) {
      try {
        structuredEstimateData = JSON.parse(jsonMatch[1]);
        // Remove the JSON block from the conversational reply
        conversationalReply = responseText.replace(jsonMatch[0], '').trim();

        // Process suggested line items (assuming structuredEstimateData.lineItemsSuggestedByAI exists)
        if (structuredEstimateData.lineItemsSuggestedByAI && Array.isArray(structuredEstimateData.lineItemsSuggestedByAI)) {
          // Fetch cost items for lookup
          const costItems = await costItemService.getCostItems({ isActive: true }); // Fetch active cost items

          structuredEstimateData.lineItems = await Promise.all(structuredEstimateData.lineItemsSuggestedByAI.map(async (item: any) => {
            let matchedCostItemId = null;
            let unitCost = 0;
            let markup = 0;
            let notes = item.notesFromAI || ""; // Start with AI's notes

            // Attempt to match with existing cost items (basic keyword match for now)
            const matchedCostItem = costItems.find(costItem =>
              costItem.name.toLowerCase().includes(item.description.toLowerCase()) ||
              (costItem.description && costItem.description.toLowerCase().includes(item.description.toLowerCase()))
            );

            if (matchedCostItem) {
              matchedCostItemId = matchedCostItem.id;
              unitCost = matchedCostItem.unit_cost;
              markup = matchedCostItem.default_markup;
            } else {
              // Implement BigBox lookup if cost item not found and item is a material
              // Assuming item.description can be used as a search query for BigBox
              try {
                // Uncomment the import for bigboxService at the top of the file
                // import { bigboxService } from '@/lib/bigbox-service';
                const { bigboxService } = await import('@/lib/bigbox-service');
                const bigBoxResults = await bigboxService.searchProducts(item.description);

                // Check if search_results array exists and has elements
                if (bigBoxResults && bigBoxResults.search_results && bigBoxResults.search_results.length > 0) {
                  // Use the price of the first relevant result
                  unitCost = bigBoxResults.search_results[0].offers?.primary?.price || 0; // Access price safely
                  markup = 0; // Default markup for BigBox items
                  notes += (notes ? " | " : "") + "Price from BigBox API, please review and add to Cost Library if needed.";
                }
              } catch (bigboxError) {
                console.error("Error calling BigBox API:", bigboxError);
                // Continue without BigBox price if API call fails
              }
            }

            // Calculate total with markup
            const quantity = item.suggestedQuantity || 1;
            const costWithMarkup = unitCost * (1 + markup / 100);
            const total = quantity * costWithMarkup;


            return {
              id: uuidv4(), // Temporary ID for frontend state management
              aiSuggestionId: item.aiSuggestionId || uuidv4(), // Use AI's ID or generate new
              description: item.description || "Untitled Item",
              quantity: quantity,
              unit: item.suggestedUnit || "EA",
              unit_cost: unitCost, // Use found cost or 0
              markup: markup, // Use found markup or 0
              total: total,
              section_name: item.section_name || "AI Suggestions", // Use AI's section or default
              notes: notes, // Include BigBox note if applicable
              matched_cost_item_id: matchedCostItemId, // Include matched cost item ID
              // suggestedUnitCost: item.suggestedUnitCost || null, // Keep AI's suggestion if available
              // suggestedMarkup: item.suggestedMarkup || null, // Keep AI's suggestion if available
            };
          }));
          // Remove the original AI suggested items after processing
          delete structuredEstimateData.lineItemsSuggestedByAI;
        } else {
           // If lineItemsSuggestedByAI is missing or not an array, initialize an empty array
           structuredEstimateData.lineItems = [];
        }

      } catch (parseError) {
        console.error("Error parsing JSON from Gemini response:", parseError);
        // Continue with just the conversational reply if JSON parsing fails
        structuredEstimateData = {}; // Ensure structured data is empty on parse error
      }
    } else {
       // If no JSON block is found, structured data remains empty
       structuredEstimateData = {};
       structuredEstimateData.lineItems = []; // Ensure lineItems is an empty array
    }


    const responsePayload = {
      conversationalReply: conversationalReply,
      structuredEstimateData: structuredEstimateData,
    };

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error) {
    console.error('Error in /api/ai/estimate-chat:', error);
    let errorMessage = 'An unknown error occurred while communicating with the AI model.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
     // Check for specific GoogleGenerativeAI errors if possible
    if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
    }
    return NextResponse.json({ error: 'Failed to process request with AI model.', details: errorMessage }, { status: 500 });
  }
}
