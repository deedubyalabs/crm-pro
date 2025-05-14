"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { markNotificationRead, markAllNotificationsRead } from "@/lib/client-portal-service"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, FileText, MessageSquare, CreditCard, Building } from "lucide-react"
import type { ClientPortalNotification } from "@/types/client-portal"

interface ClientNotificationsProps {
  notifications: ClientPortalNotification[]
}

export function ClientNotifications({ notifications: initialNotifications }: ClientNotificationsProps) {
  const [notifications, setNotifications] = useState(initialNotifications)

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No new notifications</p>
      </div>
    )
  }

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(notifications[0].user_id)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_message":
        return <MessageSquare className="h-4 w-4" />
      case "new_invoice":
      case "payment_received":
        return <CreditCard className="h-4 w-4" />
      case "new_estimate":
      case "new_change_order":
        return <FileText className="h-4 w-4" />
      case "new_document":
      case "document_signed":
        return <FileText className="h-4 w-4" />
      case "project_update":
        return <Building className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs">
          Mark all as read
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 p-3 rounded-md ${
                notification.is_read ? "bg-background" : "bg-muted"
              }`}
            >
              <div
                className={`flex-shrink-0 rounded-full p-1.5 ${notification.is_read ? "bg-muted" : "bg-primary/10"}`}
              >
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${notification.is_read ? "text-foreground" : "text-primary"}`}>
                    {notification.title}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">{notification.message}</p>

                <div className="flex items-center justify-between pt-1">
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      className="text-xs text-primary hover:underline"
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      View details
                    </Link>
                  ) : (
                    <span></span>
                  )}

                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
