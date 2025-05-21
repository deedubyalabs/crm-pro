import type { Metadata } from "next"
import { UsersList } from "./users-list"
// import { authService } from "@/lib/auth-service"

export const metadata: Metadata = {
  title: "User Management | PROActive OS",
  description: "Manage users in your PROActive OS system",
}

export default async function UsersPage() {
  // DEV MODE: Use mock users data instead of fetching from auth service
  const mockUsers = [
    {
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
    },
    {
      id: "test-user-id",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      role: "user",
      phone: "555-987-6543",
      jobTitle: "Tester",
      department: "QA",
      bio: "This is another mock profile for development testing.",
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  // Comment out actual auth service calls
  // const users = await authService.getAllUserProfiles()

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage users and their roles in the system</p>
      </div>

      <UsersList initialUsers={mockUsers} />
    </div>
  )
}
