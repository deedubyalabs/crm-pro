"use client"

import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onCreateConversation: () => void
}

export function EmptyState({ onCreateConversation }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="bg-muted rounded-full p-6 mb-4">
        <MessageSquare size={32} className="text-muted-foreground" />
      </div>

      <h3 className="text-xl font-semibold mb-2">No conversation selected</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Select a conversation from the sidebar or start a new one to begin messaging.
      </p>

      <Button onClick={onCreateConversation}>Start New Conversation</Button>
    </div>
  )
}
