"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { authService } from "@/lib/auth-service"
import { useAuth } from "@/contexts/auth-context"
import type { UserProfile } from "@/types/auth"

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ProfileFormProps {
  initialProfile: UserProfile | null
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter()
  const { session } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialProfile?.first_name || "",
      last_name: initialProfile?.last_name || "",
      email: session.user?.email || "",
      phone: initialProfile?.phone || "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    if (!session.user) return

    setIsLoading(true)
    try {
      await authService.updateUserProfile(session.user.id, values)
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Profile update failed",
        description: error instanceof Error ? error.message : "An error occurred during profile update",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = () => {
    const firstName = form.watch("first_name") || ""
    const lastName = form.watch("last_name") || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal information and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={initialProfile?.avatar_url || ""} alt={getInitials()} />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">
                  Your profile picture will be shown across the application
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" {...field} disabled />
                  </FormControl>
                  <FormDescription>Your email address is used for login and cannot be changed here</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" type="tel" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
