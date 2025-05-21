import type { Metadata } from "next"
import { getConversations } from "@/lib/communication-service"
import { auth } from "@/lib/auth-service"
import { InboxView } from "./inbox-view"

export const metadata: Metadata = {
  title: "Inbox | PROActive OS",
  description: "Manage all your communications in one place",
}

export default async function InboxPage() {
  const session = await auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">Please sign in to view your inbox</p>
      </div>
    )
  }

  try {
    const conversations = await getConversations(userId)

    return <InboxView initialConversations={conversations} userId={userId} />
  } catch (error) {
    console.error("Error loading inbox:", error)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-destructive">Failed to load inbox. Please try again later.</p>
      </div>
    )
  }
}
