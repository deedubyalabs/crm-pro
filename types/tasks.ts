export type Task = {
  id: string;
  task_name: string;
  type: TaskType | null;
  opportunity_id: string | null;
  project_id: string | null;
  person_id: string | null;
  start_time: string | null;
  end_time: string | null;
  status: TaskStatus | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type TaskWithRelations = Task & {
  opportunity?: {
    opportunity_name: string;
  } | null;
  project?: {
    project_name: string;
  } | null;
  person?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export type CreateTaskParams = Omit<Task, "id" | "created_at" | "updated_at">;

export type UpdateTaskParams = Partial<Omit<Task, "id" | "created_at" | "updated_at">>;

export enum TaskType {
  Appointment = "Appointment",
  PhoneCall = "Phone Call",
  VideoChat = "Video Chat",
  ToDo = "To Do",
  Reminder = "Reminder",
  Email = "Email", // Added Email type
}

export enum TaskStatus {
  Open = "Open",
  InProgress = "In Progress",
  Completed = "Completed",
  Cancelled = "Cancelled",
}
