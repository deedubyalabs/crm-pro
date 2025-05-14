import { createClient } from "@/lib/supabase"
import type {
  Conversation,
  NewConversation,
  Message,
  NewMessage,
  NewMessageAttachment,
  NewParticipant,
  Call,
  NewCall,
  UpdateCall,
  VideoSession,
  NewVideoSession,
  ConversationWithDetails,
  MessageWithDetails,
  CallWithDetails,
  MessageType,
} from "@/types/communications"

export async function getConversations(userId: string, limit = 20, offset = 0): Promise<ConversationWithDetails[]> {
  const supabase = createClient()

  // Get conversations where the user is a participant
  const { data: participations, error: participationsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId)
    .is("left_at", null)

  if (participationsError) throw participationsError

  if (!participations.length) return []

  const conversationIds = participations.map((p) => p.conversation_id)

  // Get conversations with last message
  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select(`
      *,
      participants:conversation_participants(
        id,
        user_id,
        customer_id,
        type,
        joined_at,
        left_at,
        last_read_at
      ),
      messages:messages(
        id,
        content,
        type,
        status,
        sent_at,
        sender_id
      )
    `)
    .in("id", conversationIds)
    .order("last_message_at", { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1)

  if (conversationsError) throw conversationsError

  // Process conversations to add last message and unread count
  return conversations.map((conversation) => {
    const messages = conversation.messages || []
    const lastMessage =
      messages.length > 0
        ? messages.sort((a, b) => new Date(b.sent_at || 0).getTime() - new Date(a.sent_at || 0).getTime())[0]
        : undefined

    const userLastRead = conversation.participants?.find((p) => p.user_id === userId)?.last_read_at

    const unreadCount = userLastRead
      ? messages.filter((m) => m.sender_id !== userId && new Date(m.sent_at || 0) > new Date(userLastRead)).length
      : messages.filter((m) => m.sender_id !== userId).length

    return {
      ...conversation,
      lastMessage,
      unreadCount,
    }
  })
}

export async function getConversation(conversationId: string): Promise<ConversationWithDetails | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      participants:conversation_participants(
        id,
        user_id,
        customer_id,
        type,
        joined_at,
        left_at,
        last_read_at
      )
    `)
    .eq("id", conversationId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // Record not found
    throw error
  }

  return data
}

export async function getMessages(conversationId: string, limit = 50, before?: string): Promise<MessageWithDetails[]> {
  const supabase = createClient()

  let query = supabase
    .from("messages")
    .select(`
      *,
      attachments:message_attachments(*)
    `)
    .eq("conversation_id", conversationId)
    .order("sent_at", { ascending: false })
    .limit(limit)

  if (before) {
    const { data: beforeMessage } = await supabase.from("messages").select("sent_at").eq("id", before).single()

    if (beforeMessage) {
      query = query.lt("sent_at", beforeMessage.sent_at)
    }
  }

  const { data, error } = await query

  if (error) throw error

  return data || []
}

export async function createConversation(
  newConversation: NewConversation,
  participants: NewParticipant[],
): Promise<Conversation> {
  const supabase = createClient()

  // Start a transaction
  const { data, error } = await supabase.from("conversations").insert(newConversation).select().single()

  if (error) throw error

  // Add participants
  const participantsWithConversationId = participants.map((p) => ({
    ...p,
    conversation_id: data.id,
  }))

  const { error: participantsError } = await supabase
    .from("conversation_participants")
    .insert(participantsWithConversationId)

  if (participantsError) throw participantsError

  return data
}

export async function sendMessage(newMessage: NewMessage, attachments?: NewMessageAttachment[]): Promise<Message> {
  const supabase = createClient()

  // Send the message
  const { data, error } = await supabase.from("messages").insert(newMessage).select().single()

  if (error) throw error

  // Add attachments if any
  if (attachments && attachments.length > 0) {
    const attachmentsWithMessageId = attachments.map((a) => ({
      ...a,
      message_id: data.id,
    }))

    const { error: attachmentsError } = await supabase.from("message_attachments").insert(attachmentsWithMessageId)

    if (attachmentsError) throw attachmentsError
  }

  // Update user's last read timestamp
  const { error: updateError } = await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", newMessage.conversation_id)
    .eq("user_id", newMessage.sender_id)

  if (updateError) throw updateError

  return data
}

export async function markConversationAsRead(conversationId: string, userId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)

  if (error) throw error
}

export async function createCall(newCall: NewCall): Promise<Call> {
  const supabase = createClient()

  const { data, error } = await supabase.from("calls").insert(newCall).select().single()

  if (error) throw error

  return data
}

export async function updateCall(callId: string, updates: UpdateCall): Promise<Call> {
  const supabase = createClient()

  const { data, error } = await supabase.from("calls").update(updates).eq("id", callId).select().single()

  if (error) throw error

  return data
}

export async function createVideoSession(newSession: NewVideoSession): Promise<VideoSession> {
  const supabase = createClient()

  const { data, error } = await supabase.from("video_sessions").insert(newSession).select().single()

  if (error) throw error

  return data
}

export async function getCallHistory(userId: string, limit = 20, offset = 0): Promise<CallWithDetails[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("calls")
    .select(`
      *,
      recording:call_recordings(*)
    `)
    .or(`caller_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("started_at", { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1)

  if (error) throw error

  return data || []
}

export async function searchConversations(
  userId: string,
  query: string,
  limit = 20,
): Promise<ConversationWithDetails[]> {
  const supabase = createClient()

  // Get conversations where the user is a participant
  const { data: participations, error: participationsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId)
    .is("left_at", null)

  if (participationsError) throw participationsError

  if (!participations.length) return []

  const conversationIds = participations.map((p) => p.conversation_id)

  // Search conversations by title or message content
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      participants:conversation_participants(
        id,
        user_id,
        customer_id,
        type,
        joined_at,
        left_at,
        last_read_at
      ),
      messages:messages(
        id,
        content,
        type,
        status,
        sent_at,
        sender_id
      )
    `)
    .in("id", conversationIds)
    .or(`title.ilike.%${query}%,id.in.(
      select conversation_id from messages 
      where conversation_id in (${conversationIds.map((id) => `'${id}'`).join(",")})
      and content ilike '%${query}%'
    )`)
    .limit(limit)

  if (error) throw error

  return data || []
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient()

  // Get conversations where the user is a participant
  const { data: participations, error: participationsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId)
    .is("left_at", null)

  if (participationsError) throw participationsError

  if (!participations.length) return 0

  let totalUnread = 0

  // For each conversation, count unread messages
  for (const participation of participations) {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", participation.conversation_id)
      .neq("sender_id", userId)
      .gt("sent_at", participation.last_read_at || "1970-01-01")

    if (!error && count !== null) {
      totalUnread += count
    }
  }

  return totalUnread
}

export async function getEmailIntegrations(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("email_integrations")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)

  if (error) throw error

  return data || []
}

export async function getSmsIntegrations(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("sms_integrations")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)

  if (error) throw error

  return data || []
}

export async function getCommunicationTemplates(userId: string, type?: MessageType) {
  const supabase = createClient()

  let query = supabase.from("communication_templates").select("*").or(`user_id.eq.${userId},is_global.eq.true`)

  if (type) {
    query = query.eq("type", type)
  }

  const { data, error } = await query

  if (error) throw error

  return data || []
}
