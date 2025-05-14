"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className={cn("flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out",
        isCollapsed ? "ml-16" : "ml-64"
      )}>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
