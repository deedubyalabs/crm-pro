"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getConversations, getMessages, markConversationAsRead, sendMessage } from "@/lib/communication-service"
import { ConversationList } from "./conversation-list"
import { MessageThread } from "./message-thread"
import { ComposeBar } from "./compose-bar"
import { ConversationHeader } from "./conversation-header"
import { EmptyState } from "./empty-state"
import { NewConversationDialog } from "./new-conversation-dialog"
import type { ConversationWithDetails, MessageWithDetails } from "@/types/communications"

interface InboxViewProps {
  initialConversations: ConversationWithDetails[]
  userId: string
}

export function InboxView({ initialConversations, userId }: InboxViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("conversation")

  const [conversations, setConversations] = useState<ConversationWithDetails[]>(initialConversations)
  const [activeConversation, setActiveConversation] = useState<ConversationWithDetails | null>(null)
  const [messages, setMessages] = useState<MessageWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [newConversationOpen, setNewConversationOpen] = useState(false)

  // Load active conversation and messages when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null)
      setMessages([])
      return
    }

    const conversation = conversations.find((c) => c.id === conversationId)
    if (conversation) {
      setActiveConversation(conversation)
      loadMessages(conversationId)
      markAsRead(conversationId)
    }
  }, [conversationId, conversations])

  // Refresh conversations periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshConversations()
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const refreshConversations = async () => {
    try {
      const updated = await getConversations(userId)
      setConversations(updated)
    } catch (error) {
      console.error("Error refreshing conversations:", error)
    }
  }

  const loadMessages = async (convoId: string) => {
    setLoading(true)
    try {
      const msgs = await getMessages(convoId)
      setMessages(msgs.sort((a, b) => new Date(a.sent_at || 0).getTime() - new Date(b.sent_at || 0).getTime()))
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (convoId: string) => {
    try {
      await markConversationAsRead(convoId, userId)
      // Update local state to reflect read status
      setConversations((prev) => prev.map((c) => (c.id === convoId ? { ...c, unreadCount: 0 } : c)))
    } catch (error) {
      console.error("Error marking conversation as read:", error)
    }
  }

  const handleSendMessage = async (content: string, attachments: File[] = []) => {
    if (!activeConversation || !content.trim()) return

    try {
      const newMsg = {
        conversation_id: activeConversation.id,
        sender_id: userId,
        content,
        type: "chat" as const,
        status: "sent" as const,
        sent_at: new Date().toISOString(),
      }

      const sentMessage = await sendMessage(newMsg)

      // Update local state
      setMessages((prev) => [...prev, sentMessage])

      // Also update the conversation list to show the latest message
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  lastMessage: sentMessage,
                  last_message_at: sentMessage.sent_at,
                }
              : c,
          )
          .sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()),
      )
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleSelectConversation = (convoId: string) => {
    router.push(`/inbox?conversation=${convoId}`)
  }

  const handleCreateConversation = () => {
    setNewConversationOpen(true)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Conversation List Sidebar */}
      <div className="w-80 border-r flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Inbox</h2>
          <button onClick={handleCreateConversation} className="p-2 rounded-full hover:bg-gray-100">
            <span className="sr-only">New Conversation</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <ConversationList
          conversations={conversations}
          activeId={conversationId || ""}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col h-full">
        {activeConversation ? (
          <>
            <ConversationHeader conversation={activeConversation} />

            <MessageThread messages={messages} loading={loading} currentUserId={userId} />

            <ComposeBar onSend={handleSendMessage} />
          </>
        ) : (
          <EmptyState onCreateConversation={handleCreateConversation} />
        )}
      </div>

      <NewConversationDialog
        open={newConversationOpen}
        onClose={() => setNewConversationOpen(false)}
        userId={userId}
        onConversationCreated={(convo) => {
          setConversations((prev) => [convo, ...prev])
          router.push(`/inbox?conversation=${convo.id}`)
          setNewConversationOpen(false)
        }}
      />
    </div>
  )
}
