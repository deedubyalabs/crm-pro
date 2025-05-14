import Link from "next/link"
import type { ClientPortalSettings } from "@/types/client-portal"

interface ClientPortalFooterProps {
  settings?: ClientPortalSettings | null
}

export function ClientPortalFooter({ settings }: ClientPortalFooterProps) {
  const portalName = settings?.portal_name || "Client Portal"
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} {portalName}. All rights reserved.
            </p>
          </div>

          <div className="flex space-x-6">
            <Link href="/client-portal/help" className="text-sm text-gray-500 hover:text-gray-900">
              Help Center
            </Link>
            {settings?.terms_and_conditions && (
              <Link href="/client-portal/terms" className="text-sm text-gray-500 hover:text-gray-900">
                Terms & Conditions
              </Link>
            )}
            {settings?.privacy_policy && (
              <Link href="/client-portal/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy Policy
              </Link>
            )}
            <Link href="/client-portal/contact" className="text-sm text-gray-500 hover:text-gray-900">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
