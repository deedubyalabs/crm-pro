"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface AIContextType {
  isAssistantOpen: boolean
  setAssistantOpen: (isOpen: boolean) => void
  entityType: string | null
  entityId: string | null
  setContext: (type: string | null, id: string | null, initialMessage?: string) => void
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  initialMessage: string | null;
  setInitialMessage: (message: string | null) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: ReactNode }) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [entityType, setEntityType] = useState<string | null>(null)
  const [entityId, setEntityId] = useState<string | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [initialMessage, setInitialMessage] = useState<string | null>(null)

  const setContext = (type: string | null, id: string | null, message?: string) => {
    setEntityType(type)
    setEntityId(id)
    setInitialMessage(message || null)
  }

  return (
    <AIContext.Provider value={{ isAssistantOpen, setAssistantOpen: setIsAssistantOpen, entityType, entityId, setContext, currentConversationId, setCurrentConversationId, initialMessage, setInitialMessage }}>
      {children}
    </AIContext.Provider>
  )
}

export function useAIContext() {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error("useAIContext must be used within an AIProvider")
  }
  return context
}
