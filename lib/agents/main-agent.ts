import { StateGraph, END, StateGraphArgs } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AgentState } from "./agent-state";
import { CreatePersonTool } from "./tools/create-person";
import { GetPersonDetailsTool } from "./tools/get-person-details";
import { UpdatePersonTool } from "./tools/update-person"; // Import the new UpdatePersonTool
import { GetMaterialPriceTool } from "./tools/get-material-price";
import { ZepSearchTool } from "./tools/zep-search"; // Import the new ZepSearchTool
import { calculateLeadScoreTool } from "./tools/calculate-lead-score"; // Import the new calculateLeadScoreTool
import { suggestOpportunityUpdateTool } from "./tools/suggest-opportunity-update"; // Import the new suggestOpportunityUpdateTool
import { suggestNextActionTool } from "./tools/suggest-next-action"; // Import the new suggestNextActionTool
import { AIMessage, BaseMessage, HumanMessage, ToolMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { addMessages } from "@langchain/langgraph"; // Import addMessages

// Initialize the LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-preview-05-20", // Updated to the recommended model
  temperature: 0.7,
});

// Define the tools available to the agent
const tools = [
  new CreatePersonTool(),
  new GetPersonDetailsTool(),
  new UpdatePersonTool(),
  new GetMaterialPriceTool(),
  new ZepSearchTool(),
  calculateLeadScoreTool, // Add the new calculateLeadScoreTool
  suggestOpportunityUpdateTool, // Add the new suggestOpportunityUpdateTool
  suggestNextActionTool, // Add the new suggestNextActionTool
];

// Create a prompt template with a system message
const baseSystemPrompt = `You are Pro, the Pro-pilot and intelligent construction AI assistant for PROActive ONE, an operations hub for solo residential contractors.
You can answer questions about people (including leads, customers, subcontractors, and employees), create new people, update existing people, and help with estimates.
You can also calculate a predictive lead score for opportunities, suggest updates for opportunities based on recent communications, and suggest optimal next actions for opportunities.

When creating a new person, always ask for their first name, last name, and person type (e.g., 'Lead', 'Customer', 'Subcontractor', 'Employee', 'Other').
Optionally, you can also ask for their email, phone number, business name, address details, lead source (if Lead), and any notes.
Confirm with the user before creating a person.

When updating a person, you can change their first name, last name, person type, email, phone number, business name, address details, lead source (if Lead), lead stage (if Lead), or notes.
If the person is a 'Lead', you can use this tool to qualify them by updating their 'lead_stage' to 'Qualified' once you have gathered sufficient information (e.g., project type, budget, timeline, or confirmed interest).

When helping with estimates, you can look up material prices.

You can also search for information in the Zep knowledge graph about past conversations or ingested business data.

Available tools:
${tools.map(tool => `- ${tool.name}: ${tool.description}`).join("\n")}
`;

// Define the state graph configuration
const graphState: StateGraphArgs<AgentState>["channels"] = {
  messages: {
    reducer: addMessages, // Use addMessages as the reducer
    default: () => [],
  },
  entityType: {
    reducer: (x: string | undefined, y: string | undefined) => y ?? x,
    default: () => undefined,
  },
  entityId: {
    reducer: (x: string | undefined, y: string | undefined) => y ?? x,
    default: () => undefined,
  },
  userId: {
    reducer: (x: string | undefined, y: string | undefined) => y ?? x,
    default: () => undefined,
  },
  sessionId: {
    reducer: (x: string | undefined, y: string | undefined) => y ?? x,
    default: () => undefined,
  },
  conversationHistory: {
    reducer: (x: string | undefined, y: string | undefined) => y ?? x,
    default: () => undefined,
  },
  structuredOutput: {
    reducer: (x: any | undefined, y: any | undefined) => y ?? x,
    default: () => undefined,
  },
  zepContext: { // Add zepContext to the state channels
    reducer: (x: string | undefined, y: string | undefined) => y ?? x,
    default: () => undefined,
  },
  debugLog: { // Add debugLog to the state channels
    reducer: (x: string[] | undefined, y: string[]) => (x || []).concat(y),
    default: () => [],
  },
};

// Define the graph
const graph = new StateGraph<AgentState>({ channels: graphState })
  .addNode("llm", async (state: AgentState) => {
    console.log("State in LLM node:", state);
    const debugLog: string[] = [];
    debugLog.push("AI Action: Invoking LLM to determine next step.");

    let currentSystemPrompt = baseSystemPrompt;
    if (state.zepContext) {
      currentSystemPrompt = `Relevant context from prior conversations:\n${state.zepContext}\n\n${baseSystemPrompt}`;
    }

    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(currentSystemPrompt),
      new MessagesPlaceholder("messages"),
    ]);

    // Bind tools to the LLM
    const llmWithTools = llm.bindTools(tools);

    // Chain the prompt and the LLM
    const agentRunnable = prompt.pipe(llmWithTools);

    // No need for `state.messages || []` because addMessages reducer ensures it's always an array
    const result = await agentRunnable.invoke({ messages: state.messages });

    if (result instanceof AIMessage && result.tool_calls && result.tool_calls.length > 0) {
      result.tool_calls.forEach(call => {
        debugLog.push(`Tool Call: ${call.name} with input ${JSON.stringify(call.args)}`);
      });
    }

    return { messages: [result], debugLog: debugLog };
  })
  .addNode("tools", async (state: AgentState) => {
    const toolNode = new ToolNode(tools);
    const result = await toolNode.invoke(state);
    const debugLog: string[] = [];

    // Log tool outputs
    if (result.messages) {
      result.messages.forEach((msg: BaseMessage) => {
        if (msg instanceof ToolMessage) {
          debugLog.push(`Tool Result: ${msg.name} returned ${msg.content}`);
        }
      });
    }
    return { messages: result.messages, debugLog: debugLog };
  })
  // Define the entry point
  .setEntryPoint("llm");

// Define the conditional logic for routing
const route = (state: AgentState): "tools" | typeof END => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];

  // If the LLM invoked a tool, route to the tools node
  if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  // Otherwise, if it's a human message or an AI message without tool calls,
  // it means the LLM has generated a final response.
  return END;
};

// Add conditional edges
graph.addConditionalEdges("llm", route);
graph.addConditionalEdges("tools", (state: AgentState): "llm" | typeof END => {
  // After tools execute, always go back to the LLM to process tool output
  return "llm";
});

// Compile the graph
export const agentGraph = graph.compile();

// Note: Checkpointer integration will happen in the API route where the graph is invoked.
