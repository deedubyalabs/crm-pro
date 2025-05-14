import { supabase, handleSupabaseError } from "./supabase"
import type { Document, DocumentFilters, DocumentWithRelations, NewDocument, UpdateDocument } from "@/types/documents"

export const documentService = {
  async getDocuments(filters?: DocumentFilters): Promise<DocumentWithRelations[]> {
    try {
      let query = supabase
        .from("documents")
        .select(`
          *,
          project:project_id (
            id,
            project_name
          ),
          job:job_id (
            id,
            name
          ),
          person:person_id (
            id,
            first_name,
            last_name,
            business_name
          ),
          opportunity:opportunity_id (
            id,
            opportunity_name
          ),
          created_by
        `)
        .order("updated_at", { ascending: false })

      // Apply filters
      if (filters?.documentType) {
        query = query.eq("document_type", filters.documentType)
      }

      if (filters?.status) {
        query = query.eq("status", filters.status)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%, description.ilike.%${filters.search}%`)
      }

      if (filters?.projectId) {
        query = query.eq("project_id", filters.projectId)
      }

      if (filters?.jobId) {
        query = query.eq("job_id", filters.jobId)
      }

      if (filters?.personId) {
        query = query.eq("person_id", filters.personId)
      }

      if (filters?.opportunityId) {
        query = query.eq("opportunity_id", filters.opportunityId)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data to match DocumentWithRelations type
      return data.map((doc) => ({
        ...doc,
        project: doc.project
          ? {
              id: doc.project.id,
              name: doc.project.project_name,
            }
          : null,
        job: doc.job
          ? {
              id: doc.job.id,
              name: doc.job.name, // Changed from job_name to name
            }
          : null,
        person: doc.person
          ? {
              id: doc.person.id,
              name: doc.person.business_name || `${doc.person.first_name || ""} ${doc.person.last_name || ""}`.trim(),
            }
          : null,
        opportunity: doc.opportunity
          ? {
              id: doc.opportunity.id,
              name: doc.opportunity.title,
            }
          : null,
        created_by: doc.created_by
          ? {
              id: doc.created_by.id,
              name: `${doc.created_by.first_name || ""} ${doc.created_by.last_name || ""}`.trim(),
            }
          : null,
      }))
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getDocumentById(id: string): Promise<DocumentWithRelations | null> {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          project:project_id (
            id,
            project_name
          ),
          job:job_id (
            id,
            job_name
          ),
          person:person_id (
            id,
            first_name,
            last_name,
            business_name
          ),
          opportunity:opportunity_id (
            id,
            opportunity_name
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error

      if (!data) return null

      // Transform the data to match DocumentWithRelations type
      return {
        ...data,
        project: data.project
          ? {
              id: data.project.id,
              name: data.project.project_name,
            }
          : null,
        job: data.job
          ? {
              id: data.job.id,
              name: data.job.job_name,
            }
          : null,
        person: data.person
          ? {
              id: data.person.id,
              name:
                data.person.business_name || `${data.person.first_name || ""} ${data.person.last_name || ""}`.trim(),
            }
          : null,
        opportunity: data.opportunity
          ? {
              id: data.opportunity.id,
              title: data.opportunity.opportunity_name,
            }
          : null,
      }
    } catch (error) {
      console.error("Error in getDocumentById:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async createDocument(document: NewDocument): Promise<Document> {
    try {
      const { data, error } = await supabase.from("documents").insert(document).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error in createDocument:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateDocument(id: string, updates: UpdateDocument): Promise<Document> {
    try {
      const { data, error } = await supabase.from("documents").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error in updateDocument:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error in deleteDocument:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async shareDocument(documentId: string, personId: string, accessLevel = "view", expiresAt?: string): Promise<void> {
    try {
      const { error } = await supabase.from("document_shares").insert({
        document_id: documentId,
        person_id: personId,
        access_level: accessLevel,
        expires_at: expiresAt,
      })

      if (error) throw error
    } catch (error) {
      console.error("Error in shareDocument:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async removeDocumentShare(documentId: string, personId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("document_shares")
        .delete()
        .eq("document_id", documentId)
        .eq("person_id", personId)

      if (error) throw error
    } catch (error) {
      console.error("Error in removeDocumentShare:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async getDocumentShares(documentId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("document_shares")
        .select(`
          *,
          person:person_id (
            id,
            first_name,
            last_name,
            business_name,
            email
          )
        `)
        .eq("document_id", documentId)

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error in getDocumentShares:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  // Helper function to get file extension from file type
  getFileExtension(fileType: string): string {
    const extensions: Record<string, string> = {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
      "application/vnd.ms-excel": "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
      "application/vnd.ms-powerpoint": "ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
      "text/plain": "txt",
      "application/zip": "zip",
      "application/x-rar-compressed": "rar",
    }

    return extensions[fileType] || "unknown"
  },

  // Helper function to get file icon based on file type
  getFileIcon(fileType: string): string {
    const fileExtension = this.getFileExtension(fileType)

    const iconMap: Record<string, string> = {
      pdf: "file-text",
      jpg: "image",
      jpeg: "image",
      png: "image",
      gif: "image",
      doc: "file-text",
      docx: "file-text",
      xls: "file",
      xlsx: "file",
      ppt: "file",
      pptx: "file",
      txt: "file-text",
      zip: "archive",
      rar: "archive",
    }

    return iconMap[fileExtension] || "file"
  },

  // Helper function to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  },
}
