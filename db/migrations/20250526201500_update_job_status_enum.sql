DO $$
BEGIN
  -- Add new values to existing enum type
  ALTER TYPE public.job_status ADD VALUE 'not_started';
  ALTER TYPE public.job_status ADD VALUE 'in_progress';
  ALTER TYPE public.job_status ADD VALUE 'delayed';
  ALTER TYPE public.job_status ADD VALUE 'cancelled';
END
$$;
