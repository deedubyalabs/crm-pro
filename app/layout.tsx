import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { AuthProvider } from "@/contexts/auth-context"
import { SidebarProvider } from "@/contexts/sidebar-context"
import LayoutContent from "@/components/layout-content" // Import the new client component

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "PROActive OS",
  description: "Agent-optimized business operations platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background antialiased", inter.className)}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <SidebarProvider>
                <LayoutContent>{children}</LayoutContent>
                <Toaster />
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
