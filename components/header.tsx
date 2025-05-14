"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, User, LogOut, Settings } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

export default function Header() {
  const pathname = usePathname()
  const { isCollapsed } = useSidebar()
  const [notifications] = useState([
    { id: 1, message: "New invoice paid", time: "5 minutes ago" },
    { id: 2, message: "New appointment scheduled", time: "1 hour ago" },
    { id: 3, message: "Project status updated", time: "3 hours ago" },
  ])

  // Function to get the current page title based on the pathname
  const getPageTitle = () => {
    const path = pathname || ""

    if (path === "/") return "Home"
    if (path === "/dashboard") return "Dashboard"
    if (path.startsWith("/people")) return "People"
    if (path.startsWith("/opportunities")) return "Opportunities"
    if (path.startsWith("/appointments")) return "Appointments"
    if (path.startsWith("/projects")) return "Projects"
    if (path.startsWith("/jobs")) return "Jobs"
    if (path.startsWith("/estimates")) return "Estimates"
    if (path.startsWith("/invoices")) return "Invoices"
    if (path.startsWith("/change-orders")) return "Change Orders"
    if (path.startsWith("/expenses")) return "Expenses"
    if (path.startsWith("/payments")) return "Payments"
    if (path.startsWith("/documents")) return "Documents"
    if (path.startsWith("/voice-notes")) return "Voice Notes"
    if (path.startsWith("/calendar")) return "Calendar"
    if (path.startsWith("/financial-dashboard")) return "Financial Dashboard"
    if (path.startsWith("/cost-items")) return "Cost Items"
    if (path.startsWith("/agent-workspace")) return "Agent Workspace"
    if (path.startsWith("/client-portal-admin")) return "Client Portal Admin"
    if (path.startsWith("/settings")) return "Settings"
    if (path.startsWith("/inbox")) return "Inbox"

    // Extract the last part of the path for dynamic routes
    const parts = path.split("/").filter(Boolean)
    return parts.length > 0 ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "Home"
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6",
        isCollapsed ? "ml-16" : "ml-0 md:ml-64",
      )}
    >
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-2">
                <span>{notification.message}</span>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center">
              <Link href="/notifications">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/profile" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/auth/logout" className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
