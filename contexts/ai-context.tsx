"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface AIContextType {
  isAssistantOpen: boolean
  setAssistantOpen: (isOpen: boolean) => void
  entityType: string | null
  entityId: string | null
  setContext: (type: string | null, id: string | null) => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: ReactNode }) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [entityType, setEntityType] = useState<string | null>(null)
  const [entityId, setEntityId] = useState<string | null>(null)

  const setContext = (type: string | null, id: string | null) => {
    setEntityType(type)
    setEntityId(id)
  }

  return (
    <AIContext.Provider value={{ isAssistantOpen, setAssistantOpen: setIsAssistantOpen, entityType, entityId, setContext }}>
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
