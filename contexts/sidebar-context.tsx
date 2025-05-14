"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface SidebarContextType {
  isCollapsed: boolean
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setIsCollapsed(savedState === "true")
    }
  }, [])

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString())
  }, [isCollapsed])

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  return <SidebarContext.Provider value={{ isCollapsed, toggleCollapsed }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
