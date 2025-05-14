"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Document as DocumentType } from "@/types/documents"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Copy, Mail } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DocumentShareFormProps {
  document: DocumentType
}

export default function DocumentShareForm({ document }: DocumentShareFormProps) {
  const router = useRouter()
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const [accessLevel, setAccessLevel] = useState("view")
  const [requirePassword, setRequirePassword] = useState(false)
  const [password, setPassword] = useState("")
  const [emailRecipients, setEmailRecipients] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const generateShareLink = async () => {
    setIsGeneratingLink(true)
    try {
      // In a real implementation, this would call an API to generate a secure sharing link
      // For now, we'll simulate it with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate a fake share link for demonstration
      const baseUrl = window.location.origin
      const shareId = Math.random().toString(36).substring(2, 15)
      const newShareLink = `${baseUrl}/shared/documents/${shareId}`

      setShareLink(newShareLink)
      toast({
        title: "Share link generated",
        description: "The link has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const copyLinkToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      toast({
        title: "Link copied",
        description: "The share link has been copied to your clipboard.",
      })
    }
  }

  const sendEmailInvitations = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    try {
      // In a real implementation, this would call an API to send emails
      // For now, we'll simulate it with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Invitations sent",
        description: "Email invitations have been sent successfully.",
      })

      // Reset form
      setEmailRecipients("")
      setEmailMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email invitations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Share Link</CardTitle>
          <CardDescription>Generate a link to share this document with others</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-level">Access Level</Label>
            <Select value={accessLevel} onValueChange={setAccessLevel}>
              <SelectTrigger id="access-level">
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View only</SelectItem>
                <SelectItem value="comment">Can comment</SelectItem>
                <SelectItem value="edit">Can edit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="expiry-date">Expiry Date</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpiryDate(undefined)}
                className={cn("h-8 text-xs", !expiryDate && "opacity-0")}
              >
                Clear
              </Button>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, "PPP") : "No expiration"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="require-password" checked={requirePassword} onCheckedChange={setRequirePassword} />
            <Label htmlFor="require-password">Require password</Label>
          </div>

          {requirePassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
              />
            </div>
          )}

          {shareLink ? (
            <div className="space-y-2">
              <Label htmlFor="share-link">Share Link</Label>
              <div className="flex">
                <Input id="share-link" value={shareLink} readOnly className="rounded-r-none" />
                <Button variant="secondary" className="rounded-l-none" onClick={copyLinkToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
        <CardFooter>
          {!shareLink ? (
            <Button onClick={generateShareLink} disabled={isGeneratingLink}>
              {isGeneratingLink ? "Generating..." : "Generate Share Link"}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setShareLink("")}>
              Reset
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Invitations</CardTitle>
          <CardDescription>Send email invitations to share this document</CardDescription>
        </CardHeader>
        <form onSubmit={sendEmailInvitations}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-recipients">Recipients</Label>
              <Textarea
                id="email-recipients"
                placeholder="Enter email addresses (one per line or separated by commas)"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter multiple email addresses separated by commas or new lines
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-message">Message (Optional)</Label>
              <Textarea
                id="email-message"
                placeholder="Add a personal message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSending}>
              <Mail className="mr-2 h-4 w-4" />
              {isSending ? "Sending..." : "Send Invitations"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
