import { BaseMessage } from "@langchain/core/messages";
import { AgentFinish } from "@langchain/core/agents";

// Define the structure of the agent's state
export interface AgentState {
  messages: BaseMessage[];
  entityType?: string;
  entityId?: string;
  userId?: string;
  sessionId?: string;
  conversationHistory?: string;
  structuredOutput?: any; // To hold structured data output by tools or agents
  zepContext?: string; // To hold Zep's retrieved context
  debugLog?: string[]; // To hold debug information about agent actions and tool calls
}

// Define the structure for tool calls and agent finishes
export type AgentStep = {
  toolCalls: { tool: string; toolInput: any }[];
  agentFinish?: AgentFinish;
};
