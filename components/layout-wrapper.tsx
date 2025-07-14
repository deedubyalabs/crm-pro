"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import DynamicSidebar from "@/components/dynamic-sidebar"
import { useSidebar } from "@/contexts/sidebar-context"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex">
      <DynamicSidebar />
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out px-6 py-6", /* Added px-6 py-6 for internal padding */
        isCollapsed ? "ml-16" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
}
