import type { Metadata } from "next"
import { UpdatePasswordForm } from "./update-password-form"

export const metadata: Metadata = {
  title: "Update Password | HomePro OS",
  description: "Update your HomePro OS account password",
}

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Update your password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Enter your new password below</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  )
}
