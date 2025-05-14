import type { Database } from "./supabase"
import type { User } from "./auth"

export type MessageType = "email" | "sms" | "chat" | "call" | "video"
export type MessageStatus = "sent" | "delivered" | "read" | "failed" | "draft"
export type MessagePriority = "low" | "normal" | "high" | "urgent"
export type CallStatus = "missed" | "answered" | "voicemail" | "scheduled" | "in_progress"
export type CallDirection = "inbound" | "outbound"
export type ParticipantType = "customer" | "team_member" | "system"

export type Conversation = Database["public"]["Tables"]["conversations"]["Row"]
export type NewConversation = Database["public"]["Tables"]["conversations"]["Insert"]
export type UpdateConversation = Database["public"]["Tables"]["conversations"]["Update"]

export type Message = Database["public"]["Tables"]["messages"]["Row"]
export type NewMessage = Database["public"]["Tables"]["messages"]["Insert"]
export type UpdateMessage = Database["public"]["Tables"]["messages"]["Update"]

export type MessageAttachment = Database["public"]["Tables"]["message_attachments"]["Row"]
export type NewMessageAttachment = Database["public"]["Tables"]["message_attachments"]["Insert"]
export type UpdateMessageAttachment = Database["public"]["Tables"]["message_attachments"]["Update"]

export type Participant = Database["public"]["Tables"]["conversation_participants"]["Row"]
export type NewParticipant = Database["public"]["Tables"]["conversation_participants"]["Insert"]
export type UpdateParticipant = Database["public"]["Tables"]["conversation_participants"]["Update"]

export type Call = Database["public"]["Tables"]["calls"]["Row"]
export type NewCall = Database["public"]["Tables"]["calls"]["Insert"]
export type UpdateCall = Database["public"]["Tables"]["calls"]["Update"]

export type CallRecording = Database["public"]["Tables"]["call_recordings"]["Row"]
export type NewCallRecording = Database["public"]["Tables"]["call_recordings"]["Insert"]
export type UpdateCallRecording = Database["public"]["Tables"]["call_recordings"]["Update"]

export type VideoSession = Database["public"]["Tables"]["video_sessions"]["Row"]
export type NewVideoSession = Database["public"]["Tables"]["video_sessions"]["Insert"]
export type UpdateVideoSession = Database["public"]["Tables"]["video_sessions"]["Update"]

export type EmailIntegration = Database["public"]["Tables"]["email_integrations"]["Row"]
export type NewEmailIntegration = Database["public"]["Tables"]["email_integrations"]["Insert"]
export type UpdateEmailIntegration = Database["public"]["Tables"]["email_integrations"]["Update"]

export type SmsIntegration = Database["public"]["Tables"]["sms_integrations"]["Row"]
export type NewSmsIntegration = Database["public"]["Tables"]["sms_integrations"]["Insert"]
export type UpdateSmsIntegration = Database["public"]["Tables"]["sms_integrations"]["Update"]

export type CommunicationTemplate = Database["public"]["Tables"]["communication_templates"]["Row"]
export type NewCommunicationTemplate = Database["public"]["Tables"]["communication_templates"]["Insert"]
export type UpdateCommunicationTemplate = Database["public"]["Tables"]["communication_templates"]["Update"]

export interface MessageWithDetails extends Message {
  sender?: User
  attachments?: MessageAttachment[]
  conversation?: Conversation
}

export interface ConversationWithDetails extends Conversation {
  participants?: Participant[]
  messages?: Message[]
  lastMessage?: Message
  unreadCount?: number
}

export interface CallWithDetails extends Call {
  recording?: CallRecording
  participants?: Participant[]
}

export interface VideoSessionWithDetails extends VideoSession {
  participants?: Participant[]
  messages?: Message[]
}
