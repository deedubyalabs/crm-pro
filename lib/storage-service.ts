import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

export const storageService = {
  async uploadFile(file: File, bucket = "documents"): Promise<string> {
    try {
      // Create a unique file name to avoid collisions
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) throw error

      // Get the public URL for the file
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error) {
      console.error("Error uploading file:", JSON.stringify(error))
      throw new Error("Failed to upload file. Please try again.")
    }
  },

  async deleteFile(fileUrl: string, bucket = "documents"): Promise<void> {
    try {
      // Extract the file path from the URL
      const url = new URL(fileUrl)
      const pathSegments = url.pathname.split("/")
      const filePath = pathSegments[pathSegments.length - 1]

      // Delete the file from Supabase Storage
      const { error } = await supabase.storage.from(bucket).remove([filePath])

      if (error) throw error
    } catch (error) {
      console.error("Error deleting file:", error)
      throw new Error("Failed to delete file. Please try again.")
    }
  },
}
