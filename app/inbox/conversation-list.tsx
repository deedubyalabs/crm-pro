"use client"

import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { ConversationWithDetails } from "@/types/communications"

interface ConversationListProps {
  conversations: ConversationWithDetails[]
  activeId: string
  onSelect: (id: string) => void
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">No conversations yet</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeId
        const hasUnread = (conversation.unreadCount || 0) > 0

        // Get the other participant's name for the conversation title
        const title = conversation.title || "New Conversation"

        return (
          <div
            key={conversation.id}
            className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
              isActive ? "bg-gray-100" : ""
            }`}
            onClick={() => onSelect(conversation.id)}
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt={title} />
                <AvatarFallback>{title.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className={`text-sm font-medium truncate ${hasUnread ? "font-semibold" : ""}`}>{title}</h3>
                  {conversation.lastMessage?.sent_at && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conversation.lastMessage.sent_at), { addSuffix: false })}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs truncate ${hasUnread ? "font-medium" : "text-muted-foreground"}`}>
                    {conversation.lastMessage?.content || "No messages yet"}
                  </p>

                  {hasUnread && (
                    <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
