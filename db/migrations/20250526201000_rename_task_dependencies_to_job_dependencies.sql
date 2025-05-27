-- db/migrations/20250526201000_rename_task_dependencies_to_job_dependencies.sql

-- Drop the project_tasks table if it exists, as per user's instruction "NO PROJECT TASKS"
DROP TABLE IF EXISTS project_tasks;
