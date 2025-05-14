"use client"

import { useRef, useEffect } from "react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { MessageWithDetails } from "@/types/communications"

interface MessageThreadProps {
  messages: MessageWithDetails[]
  loading: boolean
  currentUserId: string
}

export function MessageThread({ messages, loading, currentUserId }: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
            <div className="flex items-start max-w-[70%] space-x-2">
              {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className={`h-16 ${i % 2 === 0 ? "w-40" : "w-60"} rounded-lg`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
      </div>
    )
  }

  // Group messages by date
  const groupedMessages: { [date: string]: MessageWithDetails[] } = {}

  messages.forEach((message) => {
    const date = message.sent_at ? format(new Date(message.sent_at), "MMMM d, yyyy") : "Unknown date"
    if (!groupedMessages[date]) {
      groupedMessages[date] = []
    }
    groupedMessages[date].push(message)
  })

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-muted px-3 py-1 rounded-full">
              <span className="text-xs text-muted-foreground">{date}</span>
            </div>
          </div>

          {dateMessages.map((message) => {
            const isSelf = message.sender_id === currentUserId
            const time = message.sent_at ? format(new Date(message.sent_at), "h:mm a") : ""

            return (
              <div key={message.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                <div className="flex items-start max-w-[70%] space-x-2">
                  {!isSelf && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Sender" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}

                  <div>
                    <div className="flex items-center space-x-2">
                      {!isSelf && <span className="text-xs font-medium">User</span>}
                      <span className="text-xs text-muted-foreground">{time}</span>
                    </div>

                    <div
                      className={`mt-1 p-3 rounded-lg ${isSelf ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center space-x-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                              </svg>
                              <a
                                href={attachment.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline"
                              >
                                {attachment.file_name}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
