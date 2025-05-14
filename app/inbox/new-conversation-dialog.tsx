"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createConversation } from "@/lib/communication-service"
import type { ConversationWithDetails } from "@/types/communications"

interface NewConversationDialogProps {
  open: boolean
  onClose: () => void
  userId: string
  onConversationCreated: (conversation: ConversationWithDetails) => void
}

export function NewConversationDialog({ open, onClose, userId, onConversationCreated }: NewConversationDialogProps) {
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Please enter a conversation title")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Create a new conversation
      const newConversation = {
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      }

      // Add the current user as a participant
      const participants = [
        {
          user_id: userId,
          type: "team_member" as const,
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString(),
        },
      ]

      const conversation = await createConversation(newConversation, participants)

      // Convert to the expected format with details
      const conversationWithDetails: ConversationWithDetails = {
        ...conversation,
        participants,
        unreadCount: 0,
      }

      onConversationCreated(conversationWithDetails)
    } catch (err) {
      console.error("Error creating conversation:", err)
      setError("Failed to create conversation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Conversation Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this conversation"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Conversation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
