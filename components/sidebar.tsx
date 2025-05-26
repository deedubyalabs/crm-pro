"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  FileText,
  Menu,
  X,
  DollarSign,
  Building,
  Clock,
  FileSpreadsheet,
  Receipt,
  ClipboardList,
  FileCheck,
  Mic,
  MessageSquare,
  CreditCard,
  Home,
  Cog,
  Bot,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/contexts/sidebar-context"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isCollapsed, toggleCollapsed } = useSidebar()
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: Calendar,
    },
  ]

  const crmNavItems = [
    {
      title: "People",
      href: "/people",
      icon: Users,
    },
    {
      title: "Inbox",
      href: "/inbox",
      icon: MessageSquare,
    },
    {
      title: "Opportunities",
      href: "/opportunities",
      icon: Briefcase,
    },
    {
      title: "Appointments",
      href: "/appointments",
      icon: Clock,
    },
  ]

  const operationsNavItems = [
    {
      title: "Projects",
      href: "/projects",
      icon: Building,
    },
    {
      title: "Jobs",
      href: "/jobs",
      icon: ClipboardList,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "Voice Notes",
      href: "/voice-notes",
      icon: Mic,
    },
  ]

  const financialNavItems = [
    {
      title: "Hub",
      href: "/financial-dashboard",
      icon: DollarSign,
    },
    {
      title: "Cost Items",
      href: "/cost-items",
      icon: FileSpreadsheet,
    },
    {
      title: "Estimates",
      href: "/estimates",
      icon: FileText,
    },
    {
      title: "Change Orders",
      href: "/change-orders",
      icon: FileCheck,
    },
    {
      title: "Invoices",
      href: "/invoices",
      icon: Receipt,
    },
    {
      title: "Expenses",
      href: "/expenses",
      icon: DollarSign,
    },
    {
      title: "Payments",
      href: "/payments",
      icon: CreditCard,
    },
  ]

  const adminNavItems = [
    {
      title: "Agent Workspace",
      href: "/agent-workspace",
      icon: Bot,
    },
    {
      title: "Client Portal",
      href: "/client-portal-admin",
      icon: UserCircle,
    },
    {
      title: "Settings",
      href: "/settings/profile",
      icon: Cog,
    },
  ]

  // Render a nav item based on whether the sidebar is collapsed or not
  const renderNavItem = (item: { title: string; href: string; icon: any }) => {
    if (isCollapsed) {
      return (
        <TooltipProvider key={item.href}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  "flex justify-center items-center p-2 rounded-md",
                  isActive(item.href)
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={closeSidebar}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md",
          isActive(item.href) ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        )}
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.title}
      </Link>
    )
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50" onClick={toggleSidebar}>
        <Menu className="h-6 w-6" />
      </Button>

      <div
        className={cn("fixed inset-0 z-40 bg-black/50 md:hidden", isOpen ? "block" : "hidden")}
        onClick={closeSidebar}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-16" : "w-64",
          className,
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-5 w-5" />
              <span className="font-bold text-xl">PROActive OS</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/" className="flex items-center justify-center w-full">
              <Home className="h-5 w-5" />
            </Link>
          )}
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={closeSidebar}>
              <X className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleCollapsed}>
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          {!isCollapsed && (
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h3>
            </div>
          )}
          {isCollapsed && <div className="py-2 border-b"></div>}
          <nav className={cn("px-2 py-2 space-y-1", isCollapsed && "flex flex-col items-center")}>
            {mainNavItems.map((item) => renderNavItem(item))}
          </nav>

          {!isCollapsed && (
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CRM</h3>
            </div>
          )}
          {isCollapsed && <div className="py-2 border-b"></div>}
          <nav className={cn("px-2 py-2 space-y-1", isCollapsed && "flex flex-col items-center")}>
            {crmNavItems.map((item) => renderNavItem(item))}
          </nav>

          {!isCollapsed && (
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Operations</h3>
            </div>
          )}
          {isCollapsed && <div className="py-2 border-b"></div>}
          <nav className={cn("px-2 py-2 space-y-1", isCollapsed && "flex flex-col items-center")}>
            {operationsNavItems.map((item) => renderNavItem(item))}
          </nav>

          {!isCollapsed && (
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Finances</h3>
            </div>
          )}
          {isCollapsed && <div className="py-2 border-b"></div>}
          <nav className={cn("px-2 py-2 space-y-1", isCollapsed && "flex flex-col items-center")}>
            {financialNavItems.map((item) => renderNavItem(item))}
          </nav>

          {!isCollapsed && (
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</h3>
            </div>
          )}
          {isCollapsed && <div className="py-2 border-b"></div>}
          <nav className={cn("px-2 py-2 space-y-1", isCollapsed && "flex flex-col items-center")}>
            {adminNavItems.map((item) => renderNavItem(item))}
          </nav>
        </div>
      </aside>
    </>
  )
}
