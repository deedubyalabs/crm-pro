"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { deleteCookie } from "cookies-next"
import { logoutClientPortalUser } from "@/lib/client-portal-service"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClientPortalSettings } from "@/types/client-portal"

interface ClientPortalHeaderProps {
  settings?: ClientPortalSettings | null
}

export function ClientPortalHeader({ settings }: ClientPortalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const portalName = settings?.portal_name || "Client Portal"
  const logoUrl = settings?.logo_url || "/abstract-logo.png"

  const navigation = [
    { name: "Dashboard", href: "/client-portal" },
    { name: "Projects", href: "/client-portal/projects" },
    { name: "Invoices", href: "/client-portal/invoices" },
    { name: "Documents", href: "/client-portal/documents" },
    { name: "Messages", href: "/client-portal/messages" },
  ]

  const handleLogout = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("client_portal_token="))
        ?.split("=")[1]

      if (token) {
        await logoutClientPortalUser(token)
        deleteCookie("client_portal_token")
      }

      router.push("/client-portal/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/client-portal" className="flex items-center">
              <img className="h-8 w-auto" src={logoUrl || "/placeholder.svg"} alt={portalName} />
              <span className="ml-2 text-xl font-semibold">{portalName}</span>
            </Link>
          </div>

          <nav className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/client-portal/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/client-portal/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">Client Name</div>
                  <div className="text-sm font-medium text-gray-500">client@example.com</div>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <Link
                  href="/client-portal/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/client-portal/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
