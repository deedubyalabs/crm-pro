"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Send, Smile } from "lucide-react"

interface ComposeBarProps {
  onSend: (content: string, attachments: File[]) => void
}

export function ComposeBar({ onSend }: ComposeBarProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (message.trim() || attachments.length > 0) {
      onSend(message, attachments)
      setMessage("")
      setAttachments([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  return (
    <div className="border-t p-4">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="bg-muted rounded-md px-3 py-1 text-xs flex items-center">
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                className="ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            className="w-full border rounded-md resize-none p-3 min-h-[80px] pr-10"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="absolute bottom-3 right-3 text-muted-foreground hover:text-foreground"
            onClick={() => {
              /* Emoji picker would go here */
            }}
          >
            <Smile size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

          <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip size={20} />
          </Button>

          <Button type="submit" size="icon">
            <Send size={20} />
          </Button>
        </div>
      </form>
    </div>
  )
}
