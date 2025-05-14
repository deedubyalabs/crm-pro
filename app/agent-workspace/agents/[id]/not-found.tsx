import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"

export default function AgentNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-6">
        <Bot className="h-10 w-10 text-slate-500" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Agent Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        The agent you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <Button asChild>
        <Link href="/agent-workspace/agents">Return to Agents</Link>
      </Button>
    </div>
  )
}
