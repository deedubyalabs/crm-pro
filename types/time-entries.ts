export type TimeEntry = {
  id: string
  project_id: string
  job_id: string
  person_id: string
  date: string
  hours: number
  description: string | null
  billable: boolean
  billed: boolean
  invoice_id: string | null
  created_by_user_id: string | null
  created_at: string
  updated_at: string
}

export type TimeEntryWithDetails = TimeEntry & {
  project: {
    project_name: string
  }
  job: {
    name: string
    hourly_rate: number
  }
  person: {
    first_name: string | null
    last_name: string | null
  }
}

export type CreateTimeEntryParams = Omit<TimeEntry, "id" | "created_at" | "updated_at" | "billed" | "invoice_id">

export type UpdateTimeEntryParams = Partial<Omit<TimeEntry, "id" | "created_at" | "updated_at">>
