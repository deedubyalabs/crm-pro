import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { validateClientPortalSession } from "@/lib/client-portal-service"
import { ClientPortalHeader } from "./components/client-portal-header"
import { ClientPortalFooter } from "./components/client-portal-footer"
import { getPortalSettings } from "@/lib/client-portal-service"
import { cn } from "@/lib/utils"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Client Portal | PROActive ONE",
  description: "Access your project information, invoices, and more",
}

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("client_portal_token")?.value

  // Get portal settings
  const settings = await getPortalSettings()

  // If this is the login page, we don't need to validate the session
  const isLoginPage =
    typeof window !== "undefined" &&
    (window.location.pathname === "/client-portal/login" || window.location.pathname === "/client-portal/register")

  if (!isLoginPage && (!sessionToken || !(await validateClientPortalSession(sessionToken)))) {
    redirect("/client-portal/login")
  }

  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background antialiased", inter.className)}>
        <div className="flex flex-col min-h-screen">
          <ClientPortalHeader settings={settings} />
          <main className="flex-1 container mx-auto py-8 px-4">{children}</main>
          <ClientPortalFooter settings={settings} />
        </div>
      </body>
    </html>
  )
}
