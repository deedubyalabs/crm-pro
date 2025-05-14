"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { AuthState, LoginCredentials, SignupData } from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // DEV MODE: Provide a default authenticated user state
  const [state, setState] = useState<AuthState>({
    // Mock user for development
    user: {
      id: "dev-user-id",
      email: "dev@example.com",
      firstName: "Dev",
      lastName: "User",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    isLoading: false,
    error: null,
  })

  const router = useRouter()
  const pathname = usePathname()

  // Comment out user loading for development
  /*
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getCookie("auth_token") as string

        if (!token) {
          setState({ user: null, isLoading: false, error: null })
          return
        }

        const user = await authService.getUserByToken(token)

        if (!user) {
          deleteCookie("auth_token")
          setState({ user: null, isLoading: false, error: null })
          return
        }

        setState({ user, isLoading: false, error: null })
      } catch (error) {
        setState({ user: null, isLoading: false, error: "Failed to load user" })
      }
    }

    loadUser()
  }, [])
  */

  // Comment out auth redirects for development
  /*
  useEffect(() => {
    if (state.isLoading) return

    const publicPaths = ["/auth/login", "/auth/signup", "/auth/reset-password", "/auth/update-password"]
    const isPublicPath = publicPaths.some((path) => pathname?.startsWith(path))

    if (!state.user && !isPublicPath) {
      router.push("/auth/login")
    } else if (state.user && isPublicPath) {
      router.push("/dashboard")
    }
  }, [state.isLoading, state.user, pathname, router])
  */

  // Mock implementations for auth functions
  const login = async (credentials: LoginCredentials) => {
    console.log("DEV MODE: Login called with", credentials)
    // No actual login in dev mode
    return Promise.resolve()
  }

  const signup = async (data: SignupData) => {
    console.log("DEV MODE: Signup called with", data)
    // No actual signup in dev mode
    return Promise.resolve()
  }

  const logout = async () => {
    console.log("DEV MODE: Logout called")
    // No actual logout in dev mode
    return Promise.resolve()
  }

  const refreshUser = async () => {
    console.log("DEV MODE: RefreshUser called")
    // No actual refresh in dev mode
    return Promise.resolve()
  }

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, refreshUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
