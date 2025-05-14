import type { Metadata } from "next"
import { ProfileForm } from "./profile-form"
// import { authService } from "@/lib/auth-service"

export const metadata: Metadata = {
  title: "Profile Settings | HomePro OS",
  description: "Manage your HomePro OS profile settings",
}

export default async function ProfilePage() {
  // DEV MODE: Use mock profile data instead of fetching from auth service
  const mockProfile = {
    id: "dev-user-id",
    email: "dev@example.com",
    firstName: "Dev",
    lastName: "User",
    role: "admin",
    phone: "555-123-4567",
    jobTitle: "Developer",
    department: "Engineering",
    bio: "This is a mock profile for development testing.",
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Comment out actual auth service calls
  // const user = await authService.getCurrentUser()
  // const profile = user ? await authService.getUserProfile(user.id) : null

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account profile and preferences</p>
      </div>

      <div className="space-y-6">
        <ProfileForm initialProfile={mockProfile} />
      </div>
    </div>
  )
}
