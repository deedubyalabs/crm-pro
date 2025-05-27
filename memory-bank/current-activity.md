The current activity is the completion of the "Implement Unified 'Activities' Module with AI Assistant Integration Points" task.

**Completed Sub-tasks:**
*   **Supabase Table Creation/Refinement:**
    *   `activities` table created with `id`, `subject`, `description`, `status`, `due_date`, `start_time`, `end_time`, `is_all_day`, `activity_type`, `location`, `priority`, `linked_person_id`, `linked_opportunity_id`, `linked_project_id`, `assigned_to_user_id`, `created_at`, `updated_at`.
    *   `activity_checklist_items` table created with `id`, `activity_id`, `description`, `is_completed`, `sort_order`.
    *   `activity_attendees` table created with `id`, `activity_id`, `person_id`.
    *   `activity_types` lookup table created with `id`, `name`, `user_id`, `is_default`, and populated with default types.
    *   `job_status` enum in Supabase updated to include "not_started", "in_progress", "delayed", "cancelled".
    *   `scheduling_constraints` table column `task_id` renamed to `job_id`.
    *   `scheduling_conflicts` table column `affected_tasks` renamed to `affected_jobs`.
*   **Scheduler Service Refactoring:**
    *   `lib/scheduler-service.ts` refactored into smaller, dedicated service files:
        *   `lib/scheduler/task-template-service.ts`
        *   `lib/scheduler/job-dependency-service.ts`
        *   `lib/scheduler/scheduling-constraint-service.ts`
        *   `lib/scheduler/weather-impact-rule-service.ts`
        *   `lib/scheduler/scheduling-conflict-service.ts`
        *   `lib/scheduler/project-job-service.ts`
        *   `lib/scheduler/schedule-generation-service.ts`
        *   `lib/scheduler/schedule-optimization-service.ts`
        *   `lib/scheduler/schedule-analysis-service.ts`
    *   `lib/scheduler-service.ts` converted into an index file re-exporting from the new services.
*   **Type Definition Updates:**
    *   `types/scheduler.ts` updated to reflect `job_id` in `SchedulingConstraint` and `affected_jobs` in `SchedulingConflict`, and to include `ScheduleGenerationRequest` and `ScheduleGenerationResult`.
    *   `types/job.ts` updated to include `dependencies`, `dependents`, `resourceAssignments`, and `constraints` in `JobWithAssignedToUser`.
    *   `types/supabase.ts` updated to export `Person` and reflect database schema changes.
*   **UI Component Adjustments:**
    *   `app/projects/[id]/schedule/page.tsx` updated to use new scheduler service imports and correct prop names.
    *   `app/projects/[id]/schedule/schedule-generate-button.tsx` updated to use `hasExistingJobs` prop.
    *   `app/projects/[id]/schedule/project-schedule-gantt.tsx` updated to use `jobs` prop and `scheduled_start_date`/`scheduled_end_date`.
    *   `app/projects/[id]/schedule/schedule-conflicts-list.tsx` updated to use `jobs` prop and `affected_jobs`.
    *   `app/jobs/jobs-list.tsx` adjusted to handle `status` prop type issues with the `Select` component by reverting `status` prop to `string` and using `Constants.public.Enums.job_status` for filter options.
    *   `app/jobs/jobs-page-client.tsx` updated to pass `assignedTo` correctly.

All core implementation tasks for the Unified 'Activities' Module and related refactoring/fixes have been completed.
