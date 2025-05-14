-- Create membership programs table
CREATE TABLE IF NOT EXISTS public.membership_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create membership tiers table
CREATE TABLE IF NOT EXISTS public.membership_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES public.membership_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10, 2) NOT NULL,
    annual_price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    benefits JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create included services table
CREATE TABLE IF NOT EXISTS public.membership_included_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_id UUID NOT NULL REFERENCES public.membership_tiers(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    frequency TEXT, -- e.g., "monthly", "quarterly", "annually", "twice-yearly"
    visits_per_year INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer memberships table
CREATE TABLE IF NOT EXISTS public.customer_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES public.membership_tiers(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL, -- "active", "pending", "expired", "cancelled"
    payment_frequency TEXT NOT NULL, -- "monthly", "quarterly", "annually"
    auto_renew BOOLEAN DEFAULT TRUE,
    last_payment_date DATE,
    next_payment_date DATE,
    cancellation_date DATE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create membership service history table
CREATE TABLE IF NOT EXISTS public.membership_service_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    membership_id UUID NOT NULL REFERENCES public.customer_memberships(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.membership_included_services(id) ON DELETE RESTRICT,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    technician_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL, -- "scheduled", "completed", "cancelled", "rescheduled"
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards programs table
CREATE TABLE IF NOT EXISTS public.rewards_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    points_expiration_months INTEGER, -- NULL means points don't expire
    created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards earning rules table
CREATE TABLE IF NOT EXISTS public.rewards_earning_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES public.rewards_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL, -- "spend", "service", "referral", "signup", "custom"
    points_value INTEGER NOT NULL, -- Points earned per unit
    unit_type TEXT NOT NULL, -- "dollar", "service", "referral", "one-time", etc.
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE, -- NULL means no end date
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards catalog table
CREATE TABLE IF NOT EXISTS public.rewards_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES public.rewards_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    reward_type TEXT NOT NULL, -- "discount", "free_service", "merchandise", "custom"
    points_required INTEGER NOT NULL,
    discount_percentage INTEGER, -- For discount rewards
    discount_amount DECIMAL(10, 2), -- For discount rewards
    service_id UUID REFERENCES public.membership_included_services(id) ON DELETE SET NULL, -- For service rewards
    merchandise_details JSONB, -- For merchandise rewards
    is_active BOOLEAN DEFAULT TRUE,
    quantity_available INTEGER, -- NULL means unlimited
    start_date DATE,
    end_date DATE, -- NULL means no end date
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer rewards accounts table
CREATE TABLE IF NOT EXISTS public.customer_rewards_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.rewards_programs(id) ON DELETE RESTRICT,
    current_points INTEGER NOT NULL DEFAULT 0,
    lifetime_points INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    enrollment_date DATE NOT NULL,
    status TEXT NOT NULL, -- "active", "inactive", "suspended"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, program_id)
);

-- Create rewards transactions table
CREATE TABLE IF NOT EXISTS public.rewards_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.customer_rewards_accounts(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL, -- "earn", "redeem", "expire", "adjust"
    points INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    source_type TEXT, -- "invoice", "service", "referral", "reward", "manual", etc.
    source_id UUID, -- Reference to the source object (invoice, service, etc.)
    created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards redemptions table
CREATE TABLE IF NOT EXISTS public.rewards_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.rewards_transactions(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards_catalog(id) ON DELETE RESTRICT,
    status TEXT NOT NULL, -- "pending", "fulfilled", "cancelled"
    fulfillment_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_membership_tiers_program_id ON public.membership_tiers(program_id);
CREATE INDEX IF NOT EXISTS idx_membership_included_services_tier_id ON public.membership_included_services(tier_id);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_customer_id ON public.customer_memberships(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_tier_id ON public.customer_memberships(tier_id);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_status ON public.customer_memberships(status);
CREATE INDEX IF NOT EXISTS idx_membership_service_history_membership_id ON public.membership_service_history(membership_id);
CREATE INDEX IF NOT EXISTS idx_rewards_earning_rules_program_id ON public.rewards_earning_rules(program_id);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_program_id ON public.rewards_catalog(program_id);
CREATE INDEX IF NOT EXISTS idx_customer_rewards_accounts_customer_id ON public.customer_rewards_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_rewards_accounts_program_id ON public.customer_rewards_accounts(program_id);
CREATE INDEX IF NOT EXISTS idx_rewards_transactions_account_id ON public.rewards_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_rewards_redemptions_transaction_id ON public.rewards_redemptions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_rewards_redemptions_reward_id ON public.rewards_redemptions(reward_id);
