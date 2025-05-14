-- Create user_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM (
            'Admin',
            'Manager',
            'Estimator',
            'Technician',
            'Office',
            'Client'
        );
    END IF;
END$$;

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  email character varying(255) NOT NULL,
  hashed_password character varying(255) NOT NULL,
  first_name character varying(100) NULL,
  last_name character varying(100) NULL,
  role public.user_role NOT NULL DEFAULT 'Technician'::user_role,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users USING btree (role);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_timestamp ON public.users;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create user_sessions table for authentication
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token character varying(255) NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT user_sessions_token_key UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions USING btree (token);
