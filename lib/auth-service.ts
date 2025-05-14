import { supabase, handleSupabaseError } from "./supabase"
import type {
  User,
  LoginCredentials,
  SignupData,
  ResetPasswordData,
  UpdatePasswordData,
  UpdateProfileData,
} from "@/types/auth"
import { createHash, randomBytes } from "crypto"

export const authService = {
  async login({ email, password, remember = false }: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      // Hash the password
      const hashedPassword = createHash("sha256").update(password).digest("hex")

      // Check credentials
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("hashed_password", hashedPassword)
        .eq("is_active", true)
        .single()

      if (error || !user) {
        throw new Error("Invalid email or password")
      }

      // Create a session
      const token = randomBytes(32).toString("hex")
      const expiresAt = new Date()

      // Set expiration based on remember me option
      if (remember) {
        expiresAt.setDate(expiresAt.getDate() + 30) // 30 days
      } else {
        expiresAt.setDate(expiresAt.getDate() + 1) // 1 day
      }

      const { error: sessionError } = await supabase.from("user_sessions").insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })

      if (sessionError) {
        throw sessionError
      }

      return { user, token }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async signup(data: SignupData): Promise<User> {
    try {
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", data.email.toLowerCase())
        .maybeSingle()

      if (existingUser) {
        throw new Error("Email already in use")
      }

      // Hash the password
      const hashedPassword = createHash("sha256").update(data.password).digest("hex")

      // Create the user
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          email: data.email.toLowerCase(),
          hashed_password: hashedPassword,
          first_name: data.first_name || null,
          last_name: data.last_name || null,
          role: "Client", // Default role for new signups
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return newUser
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async logout(token: string): Promise<void> {
    try {
      await supabase.from("user_sessions").delete().eq("token", token)
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getUserByToken(token: string): Promise<User | null> {
    try {
      // Get session
      const { data: session, error: sessionError } = await supabase
        .from("user_sessions")
        .select("user_id, expires_at")
        .eq("token", token)
        .single()

      if (sessionError || !session) {
        return null
      }

      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        // Delete expired session
        await supabase.from("user_sessions").delete().eq("token", token)
        return null
      }

      // Get user
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user_id)
        .eq("is_active", true)
        .single()

      if (userError || !user) {
        return null
      }

      return user
    } catch (error) {
      console.error("Error getting user by token:", error)
      return null
    }
  },

  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      // Check if user exists
      const { data: user, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", data.email.toLowerCase())
        .eq("is_active", true)
        .single()

      if (error || !user) {
        // Don't reveal if email exists or not for security
        return
      }

      // Generate reset token
      const token = randomBytes(32).toString("hex")
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiration

      // Store token in database (you might want to create a password_reset_tokens table)
      // For now, we'll use the user_sessions table with a special prefix
      await supabase.from("user_sessions").insert({
        user_id: user.id,
        token: `reset_${token}`,
        expires_at: expiresAt.toISOString(),
      })

      // Send email with reset link (implement email sending)
      // This would typically call your email service
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updatePassword(data: UpdatePasswordData): Promise<void> {
    try {
      // Get session with reset token
      const { data: session, error: sessionError } = await supabase
        .from("user_sessions")
        .select("user_id, expires_at")
        .eq("token", `reset_${data.token}`)
        .single()

      if (sessionError || !session) {
        throw new Error("Invalid or expired token")
      }

      // Check if token is expired
      if (new Date(session.expires_at) < new Date()) {
        throw new Error("Token has expired")
      }

      // Hash the new password
      const hashedPassword = createHash("sha256").update(data.password).digest("hex")

      // Update user password
      const { error } = await supabase
        .from("users")
        .update({
          hashed_password: hashedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user_id)

      if (error) {
        throw error
      }

      // Delete the reset token
      await supabase.from("user_sessions").delete().eq("token", `reset_${data.token}`)
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    try {
      const updates: any = {}

      if (data.first_name !== undefined) updates.first_name = data.first_name
      if (data.last_name !== undefined) updates.last_name = data.last_name
      if (data.email !== undefined) {
        // Check if email is already in use by another user
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("email", data.email.toLowerCase())
          .neq("id", userId)
          .maybeSingle()

        if (existingUser) {
          throw new Error("Email already in use")
        }

        updates.email = data.email.toLowerCase()
      }

      // Only update if there are changes
      if (Object.keys(updates).length === 0) {
        // Get current user data
        const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error) throw error
        return user
      }

      // Update the user
      const { data: updatedUser, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return updatedUser
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", id)

      if (error) {
        throw error
      }

      // If no data or empty array, return null
      if (!data || data.length === 0) {
        return null;
      }

      // If multiple users are returned, log a warning and return the first one
      if (data.length > 1) {
        console.warn(`Multiple users found for ID: ${id}. Returning the first one.`);
      }

      return data[0];
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateUserRole(userId: string, role: string): Promise<User> {
    try {
      const { data, error } = await supabase.from("users").update({ role }).eq("id", userId).select().single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async toggleUserActive(userId: string, isActive: boolean): Promise<User> {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ is_active: isActive })
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
