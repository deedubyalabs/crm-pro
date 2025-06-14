import { supabase, handleSupabaseError } from "./supabase"
import { storageService } from "./storage-service" // Import storageService
import type { Document, DocumentFilters, DocumentWithRelations, NewDocument, UpdateDocument, DocumentType } from "@/types/documents"

interface UploadDocumentParams {
  file: File;
  fileName: string;
  fileType: string;
  fileSize: number;
  linkedEntityId: string;
  linkedEntityType: "project" | "job" | "person" | "opportunity" | "estimate" | "change_order" | "invoice";
  documentType?: DocumentType;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export const documentService = {
  async getDocuments(filters?: DocumentFilters): Promise<DocumentWithRelations[]> {
    try {
      let query = supabase
        .from("documents")
        .select(`
          *,
          project_id (
            id,
            project_name
          ),
          job_id (
            id,
            name
          ),
          person_id (
            id,
            first_name,
            last_name,
            business_name
          ),
          opportunity_id (
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

      if (filters?.estimateId) { // Added estimateId filter
        query = query.eq("estimate_id", filters.estimateId)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data to match DocumentWithRelations type
      return data.map((doc: any) => ({
        ...doc,
        project: doc.project_id
          ? {
              id: doc.project_id.id,
              name: doc.project_id.project_name,
            }
          : null,
        job: doc.job_id
          ? {
              id: doc.job_id.id,
              name: doc.job_id.name,
            }
          : null,
        person: doc.person_id
          ? {
              id: doc.person_id.id,
              name: doc.person_id.business_name || `${doc.person_id.first_name || ""} ${doc.person_id.last_name || ""}`.trim(),
            }
          : null,
        opportunity: doc.opportunity_id
          ? {
              id: doc.opportunity_id.id,
              title: doc.opportunity_id.opportunity_name, // Map opportunity_name to title
            }
          : null,
        created_by: doc.created_by, // Keep as string
      })) as DocumentWithRelations[]
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
          project_id (
            id,
            project_name
          ),
          job_id (
            id,
            name
          ),
          person_id (
            id,
            first_name,
            last_name,
            business_name
          ),
          opportunity_id (
            id,
            opportunity_name
          ),
          created_by
        `)
        .eq("id", id)
        .single()

      if (error) throw error

      if (!data) return null

      // Transform the data to match DocumentWithRelations type
      return {
        ...data,
        project: data.project_id
          ? {
              id: data.project_id.id,
              name: data.project_id.project_name,
            }
          : null,
        job: data.job_id
          ? {
              id: data.job_id.id,
              name: data.job_id.name,
            }
          : null,
        person: data.person_id
          ? {
              id: data.person_id.id,
              name:
                data.person_id.business_name || `${data.person_id.first_name || ""} ${data.person_id.last_name || ""}`.trim(),
            }
          : null,
        opportunity: data.opportunity_id
          ? {
              id: data.opportunity_id.id,
              title: data.opportunity_id.opportunity_name, // Map opportunity_name to title
            }
          : null,
        created_by: data.created_by as string,
      } as DocumentWithRelations
    } catch (error) {
      console.error("Error in getDocumentById:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async uploadDocument(params: UploadDocumentParams): Promise<Document> {
    try {
      // 1. Upload file to Supabase Storage
      const fileUrl = await storageService.uploadFile(params.file, "documents") // Use 'documents' bucket

      // 2. Create document record in the database
      const newDocument: NewDocument = {
        name: params.fileName,
        description: params.description || null,
        file_url: fileUrl,
        file_type: params.fileType,
        file_size: params.fileSize,
        document_type: params.documentType || "other",
        status: "active",
        version: 1,
        project_id: params.linkedEntityType === "project" ? params.linkedEntityId : null,
        job_id: params.linkedEntityType === "job" ? params.linkedEntityId : null,
        person_id: params.linkedEntityType === "person" ? params.linkedEntityId : null,
        opportunity_id: params.linkedEntityType === "opportunity" ? params.linkedEntityId : null,
        estimate_id: params.linkedEntityType === "estimate" ? params.linkedEntityId : null,
        change_order_id: params.linkedEntityType === "change_order" ? params.linkedEntityId : null,
        invoice_id: params.linkedEntityType === "invoice" ? params.linkedEntityId : null,
        created_by: "unknown", // TODO: Replace with actual user ID
        tags: params.tags || null,
        metadata: params.metadata || null,
      }

      const { data, error } = await supabase.from("documents").insert(newDocument as NewDocument).select().single()

      if (error) throw error
      return data as Document
    } catch (error) {
      console.error("Error in uploadDocument:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async createDocument(document: NewDocument): Promise<Document> {
    try {
      const { data, error } = await supabase.from("documents").insert(document).select().single()

      if (error) throw error
      return data as Document
    } catch (error) {
      console.error("Error in createDocument:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateDocument(id: string, updates: UpdateDocument): Promise<Document> {
    try {
      const { data, error } = await supabase.from("documents").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data as Document
    } catch (error) {
      console.error("Error in updateDocument:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      // Get the document to retrieve its file_url
      const { data: document, error: getError } = await supabase
        .from("documents")
        .select("file_url")
        .eq("id", id)
        .single()

      if (getError) throw getError
      if (!document) throw new Error("Document not found.")

      // Delete the document record from the database
      const { error } = await supabase.from("documents").delete().eq("id", id)

      if (error) throw error

      // Delete the file from Supabase Storage
      if (document.file_url) {
        await storageService.deleteFile(document.file_url, "documents")
      }
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
