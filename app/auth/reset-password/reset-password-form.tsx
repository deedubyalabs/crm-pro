"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { authService } from "@/lib/auth-service"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type FormValues = z.infer<typeof formSchema>

export function ResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      await authService.resetPassword(values.email)
      setIsSubmitted(true)
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      })
    } catch (error) {
      console.error("Password reset error:", error)
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "An error occurred during password reset",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium">Check your email</h3>
        <p className="mt-2 text-sm text-gray-600">
          We&apos;ve sent a password reset link to your email address. Please check your inbox.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/auth/login")}>
          Return to login
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" type="email" {...field} />
              </FormControl>
              <FormDescription>We&apos;ll send a password reset link to this email address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending reset link..." : "Send password reset link"}
        </Button>
      </form>
    </Form>
  )
}
