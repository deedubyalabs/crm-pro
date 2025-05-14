export type DocumentType =
  | "contract"
  | "estimate"
  | "invoice"
  | "permit"
  | "plan"
  | "photo"
  | "warranty"
  | "certificate"
  | "other"

export type DocumentStatus = "draft" | "pending_approval" | "approved" | "rejected" | "expired" | "active"

export interface Document {
  id: string
  name: string
  description: string | null
  file_url: string
  file_type: string
  file_size: number
  document_type: DocumentType
  status: DocumentStatus
  version: number
  project_id: string | null
  job_id: string | null
  person_id: string | null
  opportunity_id: string | null
  created_by: string
  created_at: string
  updated_at: string
  tags: string[] | null
  metadata: Record<string, any> | null
}

export type NewDocument = Omit<Document, "id" | "created_at" | "updated_at">
export type UpdateDocument = Partial<Omit<Document, "id" | "created_at" | "updated_at">>

export interface DocumentWithRelations extends Document {
  project?: {
    id: string
    name: string
  } | null
  job?: {
    id: string
    name: string
  } | null
  person?: {
    id: string
    name: string
  } | null
  opportunity?: {
    id: string
    title: string
  } | null
}

export interface DocumentFilters {
  documentType?: DocumentType
  status?: DocumentStatus
  projectId?: string
  jobId?: string
  personId?: string
  opportunityId?: string
  search?: string
  tags?: string[]
  startDate?: string
  endDate?: string
}
