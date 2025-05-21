"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Send, Brain, Loader2 } from "lucide-react"
import { useAIContext } from "@/contexts/ai-context" // Will create this context

interface Message {
  role: "user" | "ai"
  content: string
}

export default function AssistantChatDrawer() {
  const { isAssistantOpen, setAssistantOpen, entityType, entityId } = useAIContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Reset messages when context changes or drawer opens/closes
  useEffect(() => {
    setMessages([]) // Clear chat history when context changes or drawer state changes
  }, [entityType, entityId, isAssistantOpen])

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return

    const newMessage: Message = { role: "user", content: inputMessage }
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setInputMessage("")
    setIsLoading(true)

    try {
      const payload = {
        message: inputMessage,
        entityType: entityType,
        entityId: entityId,
        conversationHistory: updatedMessages, // Send current conversation history
      }

      const response = await fetch("/api/ai/assistant-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setMessages(data.newConversationHistory) // Use newConversationHistory from backend
    } catch (error) {
      console.error("Error sending message to AI:", error)
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error: Could not connect to AI. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Sheet open={isAssistantOpen} onOpenChange={setAssistantOpen}>
      <SheetContent className="w-full sm:max-w-[500px] flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" /> PROActive AI Assistant
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col overflow-hidden py-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm">
                  {entityType && entityId
                    ? `PROActive AI is ready to assist with ${entityType} ID: ${entityId}.`
                    : "PROActive AI is ready to assist."}
                  <br />
                  Type your message below.
                </div>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-center space-x-2 pt-4 border-t">
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        {/* Optional: Placeholder for "starter prompt" suggestion chips */}
        <div className="mt-2 text-center text-xs text-muted-foreground">
          {/* Example: Click a chip to send a predefined message */}
          {/* <Button variant="outline" size="sm" className="mr-2">Suggest next steps</Button> */}
        </div>
        <div className="text-center text-xs text-muted-foreground mt-1">
          AI Connection Status: <span className="text-green-500">Connected</span> {/* Placeholder status */}
        </div>
      </SheetContent>
    </Sheet>
  )
}
