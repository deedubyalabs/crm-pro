import type { Metadata } from "next"
import { ClientPortalLoginForm } from "./client-portal-login-form"
import { getPortalSettings } from "@/lib/client-portal-service"

export const metadata: Metadata = {
  title: "Login | Client Portal",
  description: "Log in to your client portal account",
}

export default async function ClientPortalLoginPage() {
  const settings = await getPortalSettings()
  const portalName = settings?.portal_name || "Client Portal"
  const logoUrl = settings?.logo_url || "/abstract-logo.png"

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-20 w-auto" src={logoUrl || "/placeholder.svg"} alt={portalName} />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Access your projects, invoices, and more</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <ClientPortalLoginForm />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a href="/client-portal/register" className="font-medium text-primary hover:text-primary/90">
                Contact your contractor for access
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
