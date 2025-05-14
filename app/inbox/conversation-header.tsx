import { Phone, Video, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ConversationWithDetails } from "@/types/communications"

interface ConversationHeaderProps {
  conversation: ConversationWithDetails
}

export function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const title = conversation.title || "New Conversation"

  return (
    <div className="border-b p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt={title} />
          <AvatarFallback>{title.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{conversation.participants?.length || 0} participants</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Phone size={20} />
        </Button>

        <Button variant="ghost" size="icon">
          <Video size={20} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Info</DropdownMenuItem>
            <DropdownMenuItem>Add Participant</DropdownMenuItem>
            <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Leave Conversation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
