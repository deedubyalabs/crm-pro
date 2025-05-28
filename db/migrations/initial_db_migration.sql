-- =============================================
-- PROActive ONE Complete Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Custom Types / Enums
-- =============================================

-- Person Types
CREATE TYPE person_type AS ENUM (
    'Lead',
    'Customer',
    'Business',
    'Subcontractor',
    'Employee',
    'Other'
);

-- Opportunity Statuses
CREATE TYPE opportunity_status AS ENUM (
    'New Lead',
    'Contact Attempted',
    'Contacted',
    'Needs Scheduling',
    'Appointment Scheduled',
    'Needs Estimate',
    'Estimate Sent',
    'Estimate Accepted',
    'Estimate Rejected',
    'On Hold',
    'Lost'
);

-- Appointment Statuses
CREATE TYPE appointment_status AS ENUM (
    'Scheduled',
    'Completed',
    'Canceled',
    'Rescheduled',
    'No Show'
);

-- Project Statuses
CREATE TYPE project_status AS ENUM (
    'Pending Start',
    'Planning',
    'In Progress',
    'On Hold',
    'Awaiting Change Order Approval',
    'Nearing Completion',
    'Completed',
    'Canceled'
);

-- Job Statuses
CREATE TYPE job_status AS ENUM (
    'Pending',
    'Scheduled',
    'In Progress',
    'Blocked',
    'Completed',
    'Canceled'
);

-- Cost Item Types
CREATE TYPE cost_item_type AS ENUM (
    'Material',
    'Labor',
    'Equipment',
    'Subcontractor',
    'Other'
);

-- Estimate Statuses
CREATE TYPE estimate_status AS ENUM (
    'Draft',
    'Sent',
    'Accepted',
    'Rejected',
    'Expired'
);

-- Invoice Statuses
CREATE TYPE invoice_status AS ENUM (
    'Draft',
    'Sent',
    'Partially Paid',
    'Paid',
    'Overdue',
    'Void'
);

-- Change Order Statuses
CREATE TYPE change_order_status AS ENUM (
    'Draft',
    'Pending Approval',
    'Approved',
    'Rejected',
    'Implemented',
    'Canceled'
);

-- Expense Categories
CREATE TYPE expense_category AS ENUM (
    'materials',
    'labor',
    'equipment',
    'subcontractor',
    'travel',
    'permits',
    'office',
    'marketing',
    'insurance',
    'utilities',
    'rent',
    'other'
);

-- Expense Statuses
CREATE TYPE expense_status AS ENUM (
    'pending',
    'approved',
    'reimbursed',
    'rejected'
);

-- Payment Methods
CREATE TYPE payment_method AS ENUM (
    'credit_card',
    'debit_card',
    'cash',
    'check',
    'bank_transfer',
    'company_account',
    'personal_funds',
    'other'
);

-- Document Types
CREATE TYPE document_type AS ENUM (
    'contract',
    'invoice',
    'estimate',
    'permit',
    'drawing',
    'photo',
    'warranty',
    'certificate',
    'other'
);

-- Document Statuses
CREATE TYPE document_status AS ENUM (
    'active',
    'archived',
    'pending',
    'expired'
);

-- Bid Statuses
CREATE TYPE bid_status AS ENUM (
    'draft',
    'sent',
    'viewed',
    'responded',
    'awarded',
    'declined',
    'expired',
    'cancelled'
);

-- Bid Response Statuses
CREATE TYPE bid_response_status AS ENUM (
    'submitted',
    'under_review',
    'clarification_needed',
    'accepted',
    'rejected'
);

-- Trade Categories
CREATE TYPE trade_category AS ENUM (
    'general',
    'electrical',
    'plumbing',
    'hvac',
    'carpentry',
    'masonry',
    'roofing',
    'flooring',
    'painting',
    'landscaping',
    'concrete',
    'drywall',
    'insulation',
    'windows_doors',
    'siding',
    'cleaning',
    'demolition',
    'excavation',
    'other'
);

-- User Roles
CREATE TYPE user_role AS ENUM (
    'Admin',
    'Manager',
    'Estimator',
    'Technician',
    'Office',
    'Client'
);

-- =============================================
-- Utility Functions
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Core Tables
-- =============================================

-- People (Customers, Leads, Subcontractors, etc.)
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    person_type person_type NOT NULL,
    first_name TEXT,
    last_name TEXT,
    business_name TEXT,
    email TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country TEXT,
    lead_source TEXT,
    notes TEXT,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    square_customer_id TEXT,
    google_contact_id TEXT,
    created_by_user_id UUID,
    tags TEXT[],
    trade_categories TEXT[]
);

-- Create indexes for people table
CREATE INDEX idx_people_person_type ON people(person_type);
CREATE INDEX idx_people_email ON people(email);
CREATE INDEX idx_people_phone ON people(phone);
CREATE INDEX idx_people_created_at ON people(created_at);
CREATE INDEX idx_people_tags ON people USING GIN(tags);
CREATE INDEX idx_people_trade_categories ON people USING GIN(trade_categories);

-- Create updated_at trigger for people
CREATE TRIGGER set_timestamp_people
BEFORE UPDATE ON people
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Opportunities
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    opportunity_name TEXT NOT NULL,
    description TEXT,
    status opportunity_status NOT NULL,
    estimated_value DECIMAL(12, 2),
    requested_completion_date DATE,
    assigned_user_id UUID,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for opportunities
CREATE INDEX idx_opportunities_person_id ON opportunities(person_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX idx_opportunities_assigned_user_id ON opportunities(assigned_user_id);

-- Create updated_at trigger for opportunities
CREATE TRIGGER set_timestamp_opportunities
BEFORE UPDATE ON opportunities
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    appointment_type TEXT,
    status appointment_status NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    address TEXT,
    notes TEXT,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for appointments
CREATE INDEX idx_appointments_person_id ON appointments(person_id);
CREATE INDEX idx_appointments_opportunity_id ON appointments(opportunity_id);
CREATE INDEX idx_appointments_project_id ON appointments(project_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);

-- Create updated_at trigger for appointments
CREATE TRIGGER set_timestamp_appointments
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    estimate_id UUID REFERENCES estimates(id) ON DELETE SET NULL,
    project_number TEXT,
    project_name TEXT NOT NULL,
    status project_status NOT NULL,
    project_address_line1 TEXT,
    project_address_line2 TEXT,
    project_city TEXT,
    project_state_province TEXT,
    project_postal_code TEXT,
    project_country TEXT,
    budget_amount DECIMAL(12, 2),
    actual_cost DECIMAL(12, 2),
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    description TEXT,
    notes TEXT,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for projects
CREATE INDEX idx_projects_person_id ON projects(person_id);
CREATE INDEX idx_projects_opportunity_id ON projects(opportunity_id);
CREATE INDEX idx_projects_estimate_id ON projects(estimate_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_planned_start_date ON projects(planned_start_date);
CREATE INDEX idx_projects_planned_end_date ON projects(planned_end_date);

-- Create updated_at trigger for projects
CREATE TRIGGER set_timestamp_projects
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status job_status NOT NULL,
    sort_order INTEGER,
    scheduled_start_date DATE,
    scheduled_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    estimated_hours DECIMAL(8, 2),
    actual_hours DECIMAL(8, 2),
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for jobs
CREATE INDEX idx_jobs_project_id ON jobs(project_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_scheduled_start_date ON jobs(scheduled_start_date);
CREATE INDEX idx_jobs_scheduled_end_date ON jobs(scheduled_end_date);

-- Create updated_at trigger for jobs
CREATE TRIGGER set_timestamp_jobs
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================
-- Estimating and Costing
-- =============================================

-- Cost Items
CREATE TABLE cost_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type cost_item_type NOT NULL,
    unit TEXT NOT NULL,
    unit_cost DECIMAL(12, 2) NOT NULL,
    default_markup DECIMAL(8, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sync_with_bigbox BOOLEAN DEFAULT FALSE,
    last_price_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for cost_items
CREATE INDEX idx_cost_items_item_code ON cost_items(item_code);
CREATE INDEX idx_cost_items_type ON cost_items(type);
CREATE INDEX idx_cost_items_is_active ON cost_items(is_active);

-- Create updated_at trigger for cost_items
CREATE TRIGGER set_timestamp_cost_items
BEFORE UPDATE ON cost_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Estimates
CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE RESTRICT,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
    estimate_number TEXT,
    status estimate_status NOT NULL DEFAULT 'Draft',
    issue_date DATE,
    expiration_date DATE,
    subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed') OR discount_type IS NULL),
    discount_value DECIMAL(10, 2),
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    requires_deposit BOOLEAN NOT NULL DEFAULT FALSE,
    deposit_percentage DECIMAL(5, 2),
    deposit_amount DECIMAL(12, 2),
    notes TEXT,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for estimates
CREATE INDEX idx_estimates_opportunity_id ON estimates(opportunity_id);
CREATE INDEX idx_estimates_person_id ON estimates(person_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimates_issue_date ON estimates(issue_date);
CREATE INDEX idx_estimates_created_at ON estimates(created_at);

-- Create updated_at trigger for estimates
CREATE TRIGGER set_timestamp_estimates
BEFORE UPDATE ON estimates
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Estimate Line Items
CREATE TABLE estimate_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
    cost_item_id UUID REFERENCES cost_items(id) ON DELETE SET NULL,
    section_name TEXT,
    description TEXT NOT NULL,
    quantity DECIMAL(12, 3) NOT NULL,
    unit TEXT NOT NULL,
    unit_cost DECIMAL(12, 2) NOT NULL,
    markup DECIMAL(8, 2) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    trade_category TEXT,
    has_bids BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for estimate_line_items
CREATE INDEX idx_estimate_line_items_estimate_id ON estimate_line_items(estimate_id);
CREATE INDEX idx_estimate_line_items_cost_item_id ON estimate_line_items(cost_item_id);
CREATE INDEX idx_estimate_line_items_trade_category ON estimate_line_items(trade_category);

-- Create updated_at trigger for estimate_line_items
CREATE TRIGGER set_timestamp_estimate_line_items
BEFORE UPDATE ON estimate_line_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Estimate Payment Schedules
CREATE TABLE estimate_payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    percentage DECIMAL(5, 2),
    due_type TEXT NOT NULL, -- 'on_acceptance', 'on_completion', 'days_after_acceptance', 'specific_date'
    due_days INTEGER,
    due_date DATE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for estimate_payment_schedules
CREATE INDEX idx_estimate_payment_schedules_estimate_id ON estimate_payment_schedules(estimate_id);

-- Create updated_at trigger for estimate_payment_schedules
CREATE TRIGGER set_timestamp_estimate_payment_schedules
BEFORE UPDATE ON estimate_payment_schedules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================
-- Invoicing and Financials
-- =============================================

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
    invoice_number TEXT,
    invoice_type TEXT DEFAULT 'standard',
    status invoice_status NOT NULL DEFAULT 'Draft',
    issue_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed') OR discount_type IS NULL),
    discount_value DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for invoices
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_person_id ON invoices(person_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

-- Create updated_at trigger for invoices
CREATE TRIGGER set_timestamp_invoices
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Invoice Line Items
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(12, 3) NOT NULL,
    unit TEXT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    source_type TEXT,
    source_id UUID,
    section_title TEXT,
    is_section_header BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for invoice_line_items
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_source_id ON invoice_line_items(source_id);

-- Create updated_at trigger for invoice_line_items
CREATE TRIGGER set_timestamp_invoice_line_items
BEFORE UPDATE ON invoice_line_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Change Orders
CREATE TABLE change_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    change_order_number TEXT,
    co_number TEXT,
    status change_order_status NOT NULL DEFAULT 'Draft',
    title TEXT NOT NULL,
    description TEXT,
    reason TEXT,
    requested_by TEXT,
    issue_date TIMESTAMP WITH TIME ZONE,
    approval_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    time_impact_days INTEGER DEFAULT 0,
    cost_impact DECIMAL(10, 2) DEFAULT 0,
    billed BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for change_orders
CREATE INDEX idx_change_orders_project_id ON change_orders(project_id);
CREATE INDEX idx_change_orders_status ON change_orders(status);
CREATE INDEX idx_change_orders_invoice_id ON change_orders(invoice_id);
CREATE INDEX idx_change_orders_created_at ON change_orders(created_at);

-- Create updated_at trigger for change_orders
CREATE TRIGGER set_timestamp_change_orders
BEFORE UPDATE ON change_orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Change Order Line Items
CREATE TABLE change_order_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(12, 3) NOT NULL,
    unit TEXT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    trade_category TEXT,
    has_bids BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for change_order_line_items
CREATE INDEX idx_change_order_line_items_change_order_id ON change_order_line_items(change_order_id);
CREATE INDEX idx_change_order_line_items_trade_category ON change_order_line_items(trade_category);

-- Create updated_at trigger for change_order_line_items
CREATE TRIGGER set_timestamp_change_order_line_items
BEFORE UPDATE ON change_order_line_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_method TEXT NOT NULL,
    reference_number TEXT,
    square_payment_id TEXT,
    square_receipt_url TEXT,
    notes TEXT,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for payments
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_project_id ON payments(project_id);
CREATE INDEX idx_payments_person_id ON payments(person_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Create updated_at trigger for payments
CREATE TRIGGER set_timestamp_payments
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    expense_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL,
    receipt_url TEXT,
    billable BOOLEAN NOT NULL DEFAULT TRUE,
    billed BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    notes TEXT,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for expenses
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_job_id ON expenses(job_id);
CREATE INDEX idx_expenses_person_id ON expenses(person_id);
CREATE INDEX idx_expenses_invoice_id ON expenses(invoice_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_billable ON expenses(billable);
CREATE INDEX idx_expenses_billed ON expenses(billed);

-- Create updated_at trigger for expenses
CREATE TRIGGER set_timestamp_expenses
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Time Entries
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    description TEXT,
    billable BOOLEAN NOT NULL DEFAULT TRUE,
    billed BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for time_entries
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX idx_time_entries_person_id ON time_entries(person_id);
CREATE INDEX idx_time_entries_invoice_id ON time_entries(invoice_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_billable ON time_entries(billable);
CREATE INDEX idx_time_entries_billed ON time_entries(billed);

-- Create updated_at trigger for time_entries
CREATE TRIGGER set_timestamp_time_entries
BEFORE UPDATE ON time_entries
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Expense Categories
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger for expense_categories
CREATE TRIGGER set_timestamp_expense_categories
BEFORE UPDATE ON expense_categories
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Payment Methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger for payment_methods
CREATE TRIGGER set_timestamp_payment_methods
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================
-- Materials and Purchasing
-- =============================================

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country TEXT,
    website TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for suppliers
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);

-- Create updated_at trigger for suppliers
CREATE TRIGGER set_timestamp_suppliers
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Material Lists
CREATE TABLE material_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    estimate_id UUID REFERENCES estimates(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create indexes for material_lists
CREATE INDEX idx_material_lists_project_id ON material_lists(project_id);
CREATE INDEX idx_material_lists_estimate_id ON material_lists(estimate_id);
CREATE INDEX idx_material_lists_status ON material_lists(status);

-- Create updated_at trigger for material_lists
CREATE TRIGGER set_timestamp_material_lists
BEFORE UPDATE ON material_lists
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Material List Items
CREATE TABLE material_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_list_id UUID NOT NULL REFERENCES material_lists(id) ON DELETE CASCADE,
    cost_item_id UUID REFERENCES cost_items(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(12, 3) NOT NULL,
    unit TEXT NOT NULL,
    base_quantity DECIMAL(12, 3) NOT NULL,
    waste_factor DECIMAL(5, 2) DEFAULT 0,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    unit_cost DECIMAL(12, 2),
    total_cost DECIMAL(12, 2),
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for material_list_items
CREATE INDEX idx_material_list_items_material_list_id ON material_list_items(material_list_id);
CREATE INDEX idx_material_list_items_cost_item_id ON material_list_items(cost_item_id);
CREATE INDEX idx_material_list_items_supplier_id ON material_list_items(supplier_id);
CREATE INDEX idx_material_list_items_status ON material_list_items(status);

-- Create updated_at trigger for material_list_items
CREATE TRIGGER set_timestamp_material_list_items
BEFORE UPDATE ON material_list_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Purchase Orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    material_list_id UUID REFERENCES material_lists(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    issue_date TIMESTAMP WITH TIME ZONE,
    delivery_date TIMESTAMP WITH TIME ZONE,
    subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city TEXT,
    shipping_state_province TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create indexes for purchase_orders
CREATE INDEX idx_purchase_orders_project_id ON purchase_orders(project_id);
CREATE INDEX idx_purchase_orders_material_list_id ON purchase_orders(material_list_id);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_issue_date ON purchase_orders(issue_date);
CREATE INDEX idx_purchase_orders_delivery_date ON purchase_orders(delivery_date);

-- Create updated_at trigger for purchase_orders
CREATE TRIGGER set_timestamp_purchase_orders
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Purchase Order Items
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    material_list_item_id UUID REFERENCES material_list_items(id) ON DELETE SET NULL,
    cost_item_id UUID REFERENCES cost_items(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(12, 3) NOT NULL,
    unit TEXT NOT NULL,
    unit_cost DECIMAL(12, 2) NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for purchase_order_items
CREATE INDEX idx_purchase_order_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_material_list_item_id ON purchase_order_items(material_list_item_id);
CREATE INDEX idx_purchase_order_items_cost_item_id ON purchase_order_items(cost_item_id);

-- Create updated_at trigger for purchase_order_items
CREATE TRIGGER set_timestamp_purchase_order_items
BEFORE UPDATE ON purchase_order_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Delivery Schedules
CREATE TABLE delivery_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    delivery_window_start TIME,
    delivery_window_end TIME,
    contact_name TEXT,
    contact_phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for delivery_schedules
CREATE INDEX idx_delivery_schedules_purchase_order_id ON delivery_schedules(purchase_order_id);
CREATE INDEX idx_delivery_schedules_scheduled_date ON delivery_schedules(scheduled_date);
CREATE INDEX idx_delivery_schedules_status ON delivery_schedules(status);

-- Create updated_at trigger for delivery_schedules
CREATE TRIGGER set_timestamp_delivery_schedules
BEFORE UPDATE ON delivery_schedules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- BigBox Product Mappings
CREATE TABLE bigbox_product_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cost_item_id UUID NOT NULL REFERENCES cost_items(id) ON DELETE CASCADE,
    bigbox_product_id TEXT NOT NULL,
    store_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for bigbox_product_mappings
CREATE INDEX idx_bigbox_product_mappings_cost_item_id ON bigbox_product_mappings(cost_item_id);
CREATE INDEX idx_bigbox_product_mappings_bigbox_product_id ON bigbox_product_mappings(bigbox_product_id);
CREATE INDEX idx_bigbox_product_mappings_store_id ON bigbox_product_mappings(store_id);

-- Create updated_at trigger for bigbox_product_mappings
CREATE TRIGGER set_timestamp_bigbox_product_mappings
BEFORE UPDATE ON bigbox_product_mappings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================
-- Bidding System
-- =============================================

-- Bid Requests
CREATE TABLE bid_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    estimate_id UUID REFERENCES estimates(id) ON DELETE SET NULL,
    change_order_id UUID REFERENCES change_orders(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    trade_category TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    awarded_at TIMESTAMP WITH TIME ZONE,
    awarded_to UUID,
    notes TEXT,
    CONSTRAINT bid_requests_source_check CHECK (
        (estimate_id IS NOT NULL AND change_order_id IS NULL) OR
        (estimate_id IS NULL AND change_order_id IS NOT NULL) OR
        (estimate_id IS NULL AND change_order_id IS NULL)
    )
);

-- Create indexes for bid_requests
CREATE INDEX idx_bid_requests_project_id ON bid_requests(project_id);
CREATE INDEX idx_bid_requests_estimate_id ON bid_requests(estimate_id);
CREATE INDEX idx_bid_requests_change_order_id ON bid_requests(change_order_id);
CREATE INDEX idx_bid_requests_trade_category ON bid_requests(trade_category);
CREATE INDEX idx_bid_requests_status ON bid_requests(status);
CREATE INDEX idx_bid_requests_due_date ON bid_requests(due_date);
CREATE INDEX idx_bid_requests_awarded_to ON bid_requests(awarded_to);

-- Create updated_at trigger for bid_requests
CREATE TRIGGER set_timestamp_bid_requests
BEFORE UPDATE ON bid_requests
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Bid Items
CREATE TABLE bid_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_request_id UUID NOT NULL REFERENCES bid_requests(id) ON DELETE CASCADE,
    estimate_line_item_id UUID REFERENCES estimate_line_items(id) ON DELETE SET NULL,
    change_order_line_item_id UUID REFERENCES change_order_line_items(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(12, 3) NOT NULL,
    unit TEXT NOT NULL,
    estimated_cost DECIMAL(12, 2),
    estimated_total DECIMAL(12, 2),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT bid_items_source_check CHECK (
        (estimate_line_item_id IS NOT NULL AND change_order_line_item_id IS NULL) OR
        (estimate_line_item_id IS NULL AND change_order_line_item_id IS NOT NULL) OR
        (estimate_line_item_id IS NULL AND change_order_line_item_id IS NULL)
    )
);

-- Create indexes for bid_items
CREATE INDEX idx_bid_items_bid_request_id ON bid_items(bid_request_id);
CREATE INDEX idx_bid_items_estimate_line_item_id ON bid_items(estimate_line_item_id);
CREATE INDEX idx_bid_items_change_order_line_item_id ON bid_items(change_order_line_item_id);

-- Create updated_at trigger for bid_items
CREATE TRIGGER set_timestamp_bid_items
BEFORE UPDATE ON bid_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Bid Subcontractors
CREATE TABLE bid_subcontractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_request_id UUID NOT NULL REFERENCES bid_requests(id) ON DELETE CASCADE,
    subcontractor_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'invited',
    invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    viewed_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    declined_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(bid_request_id, subcontractor_id)
);

-- Create indexes for bid_subcontractors
CREATE INDEX idx_bid_subcontractors_bid_request_id ON bid_subcontractors(bid_request_id);
CREATE INDEX idx_bid_subcontractors_subcontractor_id ON bid_subcontractors(subcontractor_id);
CREATE INDEX idx_bid_subcontractors_status ON bid_subcontractors(status);

-- Create updated_at trigger for bid_subcontractors
CREATE TRIGGER set_timestamp_bid_subcontractors
BEFORE UPDATE ON bid_subcontractors
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Bid Responses
CREATE TABLE bid_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_request_id UUID NOT NULL REFERENCES bid_requests(id) ON DELETE CASCADE,
    subcontractor_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    total_amount DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted',
    notes TEXT,
    estimated_duration INTEGER,
    estimated_start_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(bid_request_id, subcontractor_id)
);

-- Create indexes for bid_responses
CREATE INDEX idx_bid_responses_bid_request_id ON bid_responses(bid_request_id);
CREATE INDEX idx_bid_responses_subcontractor_id ON bid_responses(subcontractor_id);
CREATE INDEX idx_bid_responses_status ON bid_responses(status);

-- Create updated_at trigger for bid_responses
CREATE TRIGGER set_timestamp_bid_responses
BEFORE UPDATE ON bid_responses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Bid Response Items
CREATE TABLE bid_response_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_response_id UUID NOT NULL REFERENCES bid_responses(id) ON DELETE CASCADE,
    bid_item_id UUID NOT NULL REFERENCES bid_items(id) ON DELETE CASCADE,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(bid_response_id, bid_item_id)
);

-- Create indexes for bid_response_items
CREATE INDEX idx_bid_response_items_bid_response_id ON bid_response_items(bid_response_id);
CREATE INDEX idx_bid_response_items_bid_item_id ON bid_response_items(bid_item_id);

-- Create updated_at trigger for bid_response_items
CREATE TRIGGER set_timestamp_bid_response_items
BEFORE UPDATE ON bid_response_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Bid Attachments
CREATE TABLE bid_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_request_id UUID REFERENCES bid_requests(id) ON DELETE CASCADE,
    bid_response_id UUID REFERENCES bid_responses(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT bid_attachments_source_check CHECK (
        (bid_request_id IS NOT NULL AND bid_response_id IS NULL) OR
        (bid_request_id IS NULL AND bid_response_id IS NOT NULL)
    )
);

-- Create indexes for bid_attachments
CREATE INDEX idx_bid_attachments_bid_request_id ON bid_attachments(bid_request_id);
CREATE INDEX idx_bid_attachments_bid_response_id ON bid_attachments(bid_response_id);

-- Create updated_at trigger for bid_attachments
CREATE TRIGGER set_timestamp_bid_attachments
BEFORE UPDATE ON bid_attachments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================
-- Documents and Files
-- =============================================

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    document_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    version INTEGER NOT NULL DEFAULT 1,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    tags TEXT[],
    metadata JSONB
);

-- Create indexes for documents
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_job_id ON documents(job_id);
CREATE INDEX idx_documents_person_id ON documents(person_id);
CREATE INDEX idx_documents_opportunity_id ON documents(opportunity_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);

-- Create updated_at trigger for documents
CREATE TRIGGER set_timestamp_documents
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Document Shares
CREATE TABLE document_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL DEFAULT 'view',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(document_id, person_id)
);

-- Create indexes for document_shares
CREATE INDEX idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX idx_document_shares_person_id ON document_shares(person_id);

-- =============================================
-- Takeoffs
-- =============================================

-- Takeoffs
CREATE TABLE takeoffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for takeoffs
CREATE INDEX idx_takeoffs_project_id ON takeoffs(project_id);

-- Create updated_at trigger for takeoffs
CREATE TRIGGER set_timestamp_takeoffs
BEFORE UPDATE ON takeoffs
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================
-- Voice Notes
-- =============================================

-- Voice Notes
CREATE TABLE voice_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    transcript TEXT,
    duration INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for voice_notes
CREATE INDEX idx_voice_notes_user_id ON voice_notes(user_id);
CREATE INDEX idx_voice_notes_project_id ON voice_notes(project_id);
CREATE INDEX idx_voice_notes_job_id ON voice_notes(job_id);
CREATE INDEX idx_voice_notes_status ON voice_notes(status);

-- Create updated_at trigger for voice_notes
CREATE TRIGGER set_timestamp_voice_notes
BEFORE UPDATE ON voice_notes
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================
-- Intelligent Scheduler
-- =============================================

-- Resource Types
CREATE TABLE resource_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger for resource_types
CREATE TRIGGER set_timestamp_resource_types
BEFORE UPDATE ON resource_types
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Resources
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type_id UUID REFERENCES resource_types(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    hourly_rate DECIMAL(10, 2),
    availability_start_time TIME DEFAULT '08:00:00',
    availability_end_time TIME DEFAULT '17:00:00',
    availability_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
    capacity DECIMAL(10, 2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for resources
CREATE INDEX idx_resources_resource_type_id ON resources(resource_type_id);
CREATE INDEX idx_resources_is_active ON resources(is_active);

-- Create updated_at trigger for resources
CREATE TRIGGER set_timestamp_resources
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Task Templates
CREATE TABLE task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    estimated_duration INTEGER NOT NULL,
    default_resources JSONB,
    predecessor_templates JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger for task_templates
CREATE TRIGGER set_timestamp_task_templates
BEFORE UPDATE ON task_templates
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Project Tasks
CREATE TABLE project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    task_template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'not_started',
    priority INTEGER DEFAULT 0,
    estimated_duration INTEGER NOT NULL,
    actual_duration INTEGER,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    completion_percentage INTEGER DEFAULT 0,
    is_milestone BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for project_tasks
CREATE INDEX idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_job_id ON project_tasks(job_id);
CREATE INDEX idx_project_tasks_task_template_id ON project_tasks(task_template_id);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);
CREATE INDEX idx_project_tasks_scheduled_start ON project_tasks(scheduled_start);
CREATE INDEX idx_project_tasks_scheduled_end ON project_tasks(scheduled_end);

-- Create updated_at trigger for project_tasks
CREATE TRIGGER set_timestamp_project_tasks
BEFORE UPDATE ON project_tasks
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Task Dependencies
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    predecessor_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    successor_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    dependency_type TEXT DEFAULT 'finish_to_start',
    lag_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_dependency UNIQUE (predecessor_task_id, successor_task_id)
);

-- Create indexes for task_dependencies
CREATE INDEX idx_task_dependencies_predecessor_task_id ON task_dependencies(predecessor_task_id);
CREATE INDEX idx_task_dependencies_successor_task_id ON task_dependencies(successor_task_id);

-- Create updated_at trigger for task_dependencies
CREATE TRIGGER set_timestamp_task_dependencies
BEFORE UPDATE ON task_dependencies
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Resource Assignments
CREATE TABLE resource_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    assignment_start TIMESTAMP WITH TIME ZONE NOT NULL,
    assignment_end TIMESTAMP WITH TIME ZONE NOT NULL,
    allocation_percentage INTEGER DEFAULT 100,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_resource_assignment UNIQUE (task_id, resource_id, assignment_start, assignment_end)
);

-- Create indexes for resource_assignments
CREATE INDEX idx_resource_assignments_task_id ON resource_assignments(task_id);
CREATE INDEX idx_resource_assignments_resource_id ON resource_assignments(resource_id);
CREATE INDEX idx_resource_assignments_assignment_start ON resource_assignments(assignment_start);
CREATE INDEX idx_resource_assignments_assignment_end ON resource_assignments(assignment_end);

-- Create updated_at trigger for resource_assignments
CREATE TRIGGER set_timestamp_resource_assignments
BEFORE UPDATE ON resource_assignments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Scheduling Constraints
CREATE TABLE scheduling_constraints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
    constraint_type TEXT NOT NULL,
    constraint_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_hard_constraint BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for scheduling_constraints
CREATE INDEX idx_scheduling_constraints_project_id ON scheduling_constraints(project_id);
CREATE INDEX idx_scheduling_constraints_task_id ON scheduling_constraints(task_id);
CREATE INDEX idx_scheduling_constraints_constraint_date ON scheduling_constraints(constraint_date);

-- Create updated_at trigger for scheduling_constraints
CREATE TRIGGER set_timestamp_scheduling_constraints
BEFORE UPDATE ON scheduling_constraints
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Weather Data
CREATE TABLE weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id TEXT NOT NULL,
    forecast_date DATE NOT NULL,
    temperature_high DECIMAL(5, 2),
    temperature_low DECIMAL(5, 2),
    precipitation_probability INTEGER,
    precipitation_amount DECIMAL(5, 2),
    wind_speed DECIMAL(5, 2),
    weather_condition TEXT,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_weather_forecast UNIQUE (location_id, forecast_date)
);

-- Create indexes for weather_data
CREATE INDEX idx_weather_data_location_id ON weather_data(location_id);
CREATE INDEX idx_weather_data_forecast_date ON weather_data(forecast_date);

-- Create updated_at trigger for weather_data
CREATE TRIGGER set_timestamp_weather_data
BEFORE UPDATE ON weather_data
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Weather Impact Rules
CREATE TABLE weather_impact_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_template_id UUID REFERENCES task_templates(id) ON DELETE CASCADE,
    weather_condition TEXT NOT NULL,
    temperature_min DECIMAL(5, 2),
    temperature_max DECIMAL(5, 2),
    precipitation_threshold DECIMAL(5, 2),
    wind_threshold DECIMAL(5, 2),
    impact_type TEXT NOT NULL,
    impact_value DECIMAL(5, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for weather_impact_rules
CREATE INDEX idx_weather_impact_rules_task_template_id ON weather_impact_rules(task_template_id);
CREATE INDEX idx_weather_impact_rules_weather_condition ON weather_impact_rules(weather_condition);

-- Create updated_at trigger for weather_impact_rules
CREATE TRIGGER set_timestamp_weather_impact_rules
BEFORE UPDATE ON weather_impact_rules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Scheduling History
CREATE TABLE scheduling_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID,
    action_type TEXT NOT NULL,
    description TEXT,
    changes JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for scheduling_history
CREATE INDEX idx_scheduling_history_project_id ON scheduling_history(project_id);
CREATE INDEX idx_scheduling_history_user_id ON scheduling_history(user_id);
CREATE INDEX idx_scheduling_history_created_at ON scheduling_history(created_at);

-- Scheduling Conflicts
CREATE TABLE scheduling_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    conflict_type TEXT NOT NULL,
    description TEXT,
    affected_tasks UUID[],
    affected_resources UUID[],
    resolution_status TEXT DEFAULT 'unresolved',
    resolution_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for scheduling_conflicts
CREATE INDEX idx_scheduling_conflicts_project_id ON scheduling_conflicts(project_id);
CREATE INDEX idx_scheduling_conflicts_resolution_status ON scheduling_conflicts(resolution_status);

-- Create updated_at trigger for scheduling_conflicts
CREATE TRIGGER set_timestamp_scheduling_conflicts
BEFORE UPDATE ON scheduling_conflicts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================
-- Communications
-- =============================================

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES people(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for conversations
CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

-- Create updated_at trigger for conversations
CREATE TRIGGER set_timestamp_conversations
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID,
    content TEXT,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'chat', 'call', 'video')),
    status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'draft')),
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes for messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
CREATE INDEX idx_messages_status ON messages(status);

-- Create updated_at trigger for messages
CREATE TRIGGER set_timestamp_messages
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Message Attachments
CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for message_attachments
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);

-- Create updated_at trigger for message_attachments
CREATE TRIGGER set_timestamp_message_attachments
BEFORE UPDATE ON message_attachments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Conversation Participants
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID,
    customer_id UUID,
    type TEXT NOT NULL CHECK (type IN ('customer', 'team_member', 'system')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    last_read_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT participant_user_or_customer CHECK (
        (user_id IS NOT NULL AND customer_id IS NULL) OR
        (user_id IS NULL AND customer_id IS NOT NULL)
    )
);

-- Create indexes for conversation_participants
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_customer_id ON conversation_participants(customer_id);

-- Calls
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    caller_id UUID,
    caller_type TEXT CHECK (caller_type IN ('customer', 'team_member')),
    recipient_id UUID,
    recipient_type TEXT CHECK (recipient_type IN ('customer', 'team_member')),
    status TEXT NOT NULL CHECK (status IN ('missed', 'answered', 'voicemail', 'scheduled', 'in_progress')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for calls
CREATE INDEX idx_calls_conversation_id ON calls(conversation_id);
CREATE INDEX idx_calls_caller_id ON calls(caller_id);
CREATE INDEX idx_calls_recipient_id ON calls(recipient_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_started_at ON calls(started_at);

-- Create updated_at trigger for calls
CREATE TRIGGER set_timestamp_calls
BEFORE UPDATE ON calls
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Call Recordings
CREATE TABLE call_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    duration INTEGER NOT NULL,
    transcription TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for call_recordings
CREATE INDEX idx_call_recordings_call_id ON call_recordings(call_id);

-- Create updated_at trigger for call_recordings
CREATE TRIGGER set_timestamp_call_recordings
BEFORE UPDATE ON call_recordings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Video Sessions
CREATE TABLE video_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    recording_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for video_sessions
CREATE INDEX idx_video_sessions_conversation_id ON video_sessions(conversation_id);
CREATE INDEX idx_video_sessions_started_at ON video_sessions(started_at);

-- Create updated_at trigger for video_sessions
CREATE TRIGGER set_timestamp_video_sessions
BEFORE UPDATE ON video_sessions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Email Integrations
CREATE TABLE email_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    provider TEXT NOT NULL,
    email_address TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, email_address)
);

-- Create indexes for email_integrations
CREATE INDEX idx_email_integrations_user_id ON email_integrations(user_id);
CREATE INDEX idx_email_integrations_email_address ON email_integrations(email_address);
CREATE INDEX idx_email_integrations_is_active ON email_integrations(is_active);

-- Create updated_at trigger for email_integrations
CREATE TRIGGER set_timestamp_email_integrations
BEFORE UPDATE ON email_integrations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- SMS Integrations
CREATE TABLE sms_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    provider TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    access_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, phone_number)
);

-- Create indexes for sms_integrations
CREATE INDEX idx_sms_integrations_user_id ON sms_integrations(user_id);
CREATE INDEX idx_sms_integrations_phone_number ON sms_integrations(phone_number);
CREATE INDEX idx_sms_integrations_is_active ON sms_integrations(is_active);

-- Create updated_at trigger for sms_integrations
CREATE TRIGGER set_timestamp_sms_integrations
BEFORE UPDATE ON sms_integrations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Communication Templates
CREATE TABLE communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'chat')),
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for communication_templates
CREATE INDEX idx_communication_templates_user_id ON communication_templates(user_id);
CREATE INDEX idx_communication_templates_type ON communication_templates(type);
CREATE INDEX idx_communication_templates_is_global ON communication_templates(is_global);

-- Create updated_at trigger for communication_templates
CREATE TRIGGER set_timestamp_communication_templates
BEFORE UPDATE ON communication_templates
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================
-- Client Portal
-- =============================================

-- Client Portal Users
CREATE TABLE client_portal_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for client_portal_users
CREATE INDEX idx_client_portal_users_customer_id ON client_portal_users(customer_id);
CREATE INDEX idx_client_portal_users_email ON client_portal_users(email);
CREATE INDEX idx_client_portal_users_is_active ON client_portal_users(is_active);

-- Create updated_at trigger for client_portal_users
CREATE TRIGGER set_timestamp_client_portal_users
BEFORE UPDATE ON client_portal_users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Client Portal Sessions
CREATE TABLE client_portal_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES client_portal_users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Create indexes for client_portal_sessions
CREATE INDEX idx_client_portal_sessions_user_id ON client_portal_sessions(user_id);
CREATE INDEX idx_client_portal_sessions_token ON client_portal_sessions(token);
CREATE INDEX idx_client_portal_sessions_expires_at ON client_portal_sessions(expires_at);

-- Client Portal Invitations
CREATE TABLE client_portal_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(customer_id, email)
);

-- Create indexes for client_portal_invitations
CREATE INDEX idx_client_portal_invitations_customer_id ON client_portal_invitations(customer_id);
CREATE INDEX idx_client_portal_invitations_email ON client_portal_invitations(email);
CREATE INDEX idx_client_portal_invitations_token ON client_portal_invitations(token);
CREATE INDEX idx_client_portal_invitations_expires_at ON client_portal_invitations(expires_at);

-- Client Portal Notifications
CREATE TABLE client_portal_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES client_portal_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for client_portal_notifications
CREATE INDEX idx_client_portal_notifications_user_id ON client_portal_notifications(user_id);
CREATE INDEX idx_client_portal_notifications_is_read ON client_portal_notifications(is_read);
CREATE INDEX idx_client_portal_notifications_created_at ON client_portal_notifications(created_at);

-- Client Portal Activities
CREATE TABLE client_portal_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES client_portal_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ip_address TEXT
);

-- Create indexes for client_portal_activities
CREATE INDEX idx_client_portal_activities_user_id ON client_portal_activities(user_id);
CREATE INDEX idx_client_portal_activities_type ON client_portal_activities(type);
CREATE INDEX idx_client_portal_activities_created_at ON client_portal_activities(created_at);

-- Client Portal Settings
CREATE TABLE client_portal_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL UNIQUE,
    portal_name TEXT NOT NULL DEFAULT 'Client Portal',
    logo_url TEXT,
    primary_color TEXT DEFAULT '#4f46e5',
    enable_payments BOOLEAN DEFAULT TRUE,
    enable_messaging BOOLEAN DEFAULT TRUE,
    enable_document_signing BOOLEAN DEFAULT TRUE,
    enable_project_updates BOOLEAN DEFAULT TRUE,
    terms_and_conditions TEXT,
    privacy_policy TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger for client_portal_settings
CREATE TRIGGER set_timestamp_client_portal_settings
BEFORE UPDATE ON client_portal_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Customer Projects (junction table for client portal access)
CREATE TABLE customer_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, project_id)
);

-- Create indexes for customer_projects
CREATE INDEX idx_customer_projects_customer_id ON customer_projects(customer_id);
CREATE INDEX idx_customer_projects_project_id ON customer_projects(project_id);

-- =============================================
-- Membership and Rewards
-- =============================================

-- Membership Programs
CREATE TABLE membership_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for membership_programs
CREATE INDEX idx_membership_programs_is_active ON membership_programs(is_active);

-- Create updated_at trigger for membership_programs
CREATE TRIGGER set_timestamp_membership_programs
BEFORE UPDATE ON membership_programs
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Membership Tiers
CREATE TABLE membership_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES membership_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10, 2) NOT NULL,
    annual_price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    benefits JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for membership_tiers
CREATE INDEX idx_membership_tiers_program_id ON membership_tiers(program_id);
CREATE INDEX idx_membership_tiers_is_active ON membership_tiers(is_active);

-- Create updated_at trigger for membership_tiers
CREATE TRIGGER set_timestamp_membership_tiers
BEFORE UPDATE ON membership_tiers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Membership Included Services
CREATE TABLE membership_included_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_id UUID NOT NULL REFERENCES membership_tiers(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    frequency TEXT,
    visits_per_year INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for membership_included_services
CREATE INDEX idx_membership_included_services_tier_id ON membership_included_services(tier_id);
CREATE INDEX idx_membership_included_services_is_active ON membership_included_services(is_active);

-- Create updated_at trigger for membership_included_services
CREATE TRIGGER set_timestamp_membership_included_services
BEFORE UPDATE ON membership_included_services
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Customer Memberships
CREATE TABLE customer_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES membership_tiers(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL,
    payment_frequency TEXT NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    last_payment_date DATE,
    next_payment_date DATE,
    cancellation_date DATE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for customer_memberships
CREATE INDEX idx_customer_memberships_customer_id ON customer_memberships(customer_id);
CREATE INDEX idx_customer_memberships_tier_id ON customer_memberships(tier_id);
CREATE INDEX idx_customer_memberships_status ON customer_memberships(status);
CREATE INDEX idx_customer_memberships_start_date ON customer_memberships(start_date);
CREATE INDEX idx_customer_memberships_end_date ON customer_memberships(end_date);

-- Create updated_at trigger for customer_memberships
CREATE TRIGGER set_timestamp_customer_memberships
BEFORE UPDATE ON customer_memberships
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Membership Service History
CREATE TABLE membership_service_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    membership_id UUID NOT NULL REFERENCES customer_memberships(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES membership_included_services(id) ON DELETE RESTRICT,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    technician_id UUID,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for membership_service_history
CREATE INDEX idx_membership_service_history_membership_id ON membership_service_history(membership_id);
CREATE INDEX idx_membership_service_history_service_id ON membership_service_history(service_id);
CREATE INDEX idx_membership_service_history_technician_id ON membership_service_history(technician_id);
CREATE INDEX idx_membership_service_history_scheduled_date ON membership_service_history(scheduled_date);
CREATE INDEX idx_membership_service_history_status ON membership_service_history(status);

-- Create updated_at trigger for membership_service_history
CREATE TRIGGER set_timestamp_membership_service_history
BEFORE UPDATE ON membership_service_history
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Rewards Programs
CREATE TABLE rewards_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    points_expiration_months INTEGER,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for rewards_programs
CREATE INDEX idx_rewards_programs_is_active ON rewards_programs(is_active);

-- Create updated_at trigger for rewards_programs
CREATE TRIGGER set_timestamp_rewards_programs
BEFORE UPDATE ON rewards_programs
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Rewards Earning Rules
CREATE TABLE rewards_earning_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES rewards_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL,
    points_value INTEGER NOT NULL,
    unit_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for rewards_earning_rules
CREATE INDEX idx_rewards_earning_rules_program_id ON rewards_earning_rules(program_id);
CREATE INDEX idx_rewards_earning_rules_rule_type ON rewards_earning_rules(rule_type);
CREATE INDEX idx_rewards_earning_rules_is_active ON rewards_earning_rules(is_active);

-- Create updated_at trigger for rewards_earning_rules
CREATE TRIGGER set_timestamp_rewards_earning_rules
BEFORE UPDATE ON rewards_earning_rules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Rewards Catalog
CREATE TABLE rewards_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES rewards_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    reward_type TEXT NOT NULL,
    points_required INTEGER NOT NULL,
    discount_percentage INTEGER,
    discount_amount DECIMAL(10, 2),
    service_id UUID REFERENCES membership_included_services(id) ON DELETE SET NULL,
    merchandise_details JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    quantity_available INTEGER,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for rewards_catalog
CREATE INDEX idx_rewards_catalog_program_id ON rewards_catalog(program_id);
CREATE INDEX idx_rewards_catalog_reward_type ON rewards_catalog(reward_type);
CREATE INDEX idx_rewards_catalog_is_active ON rewards_catalog(is_active);
CREATE INDEX idx_rewards_catalog_points_required ON rewards_catalog(points_required);

-- Create updated_at trigger for rewards_catalog
CREATE TRIGGER set_timestamp_rewards_catalog
BEFORE UPDATE ON rewards_catalog
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Customer Rewards Accounts
CREATE TABLE customer_rewards_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES rewards_programs(id) ON DELETE RESTRICT,
    current_points INTEGER NOT NULL DEFAULT 0,
    lifetime_points INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    enrollment_date DATE NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, program_id)
);

-- Create indexes for customer_rewards_accounts
CREATE INDEX idx_customer_rewards_accounts_customer_id ON customer_rewards_accounts(customer_id);
CREATE INDEX idx_customer_rewards_accounts_program_id ON customer_rewards_accounts(program_id);
CREATE INDEX idx_customer_rewards_accounts_status ON customer_rewards_accounts(status);

-- Create updated_at trigger for customer_rewards_accounts
CREATE TRIGGER set_timestamp_customer_rewards_accounts
BEFORE UPDATE ON customer_rewards_accounts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Rewards Transactions
CREATE TABLE rewards_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES customer_rewards_accounts(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    points INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    source_type TEXT,
    source_id UUID,
    created_by_user_id UUID,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for rewards_transactions
CREATE INDEX idx_rewards_transactions_account_id ON rewards_transactions(account_id);
CREATE INDEX idx_rewards_transactions_transaction_type ON rewards_transactions(transaction_type);
CREATE INDEX idx_rewards_transactions_transaction_date ON rewards_transactions(transaction_date);
CREATE INDEX idx_rewards_transactions_source_id ON rewards_transactions(source_id);

-- Rewards Redemptions
CREATE TABLE rewards_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES rewards_transactions(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards_catalog(id) ON DELETE RESTRICT,
    status TEXT NOT NULL,
    fulfillment_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for rewards_redemptions
CREATE INDEX idx_rewards_redemptions_transaction_id ON rewards_redemptions(transaction_id);
CREATE INDEX idx_rewards_redemptions_reward_id ON rewards_redemptions(reward_id);
CREATE INDEX idx_rewards_redemptions_status ON rewards_redemptions(status);

-- Create updated_at trigger for rewards_redemptions
CREATE TRIGGER set_timestamp_rewards_redemptions
BEFORE UPDATE ON rewards_redemptions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================
-- User Authentication and Profiles
-- =============================================

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role user_role NOT NULL DEFAULT 'Technician',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Create updated_at trigger for users
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- User Sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for user_sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- User Profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'technician',
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for user_profiles
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Create updated_at trigger for user_profiles
CREATE TRIGGER set_timestamp_user_profiles
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- =============================================
-- AI Agent System
-- =============================================

-- AI Agents
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    provider TEXT NOT NULL, -- 'openai', 'anthropic', 'gemini', etc.
    model TEXT NOT NULL,
    system_prompt TEXT,
    temperature DECIMAL(3, 2),
    max_tokens INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for ai_agents
CREATE INDEX idx_ai_agents_provider ON ai_agents(provider);
CREATE INDEX idx_ai_agents_model ON ai_agents(model);
CREATE INDEX idx_ai_agents_is_active ON ai_agents(is_active);

-- Create updated_at trigger for ai_agents
CREATE TRIGGER set_timestamp_ai_agents
BEFORE UPDATE ON ai_agents
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- AI Tools
CREATE TABLE ai_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    function_definition JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for ai_tools
CREATE INDEX idx_ai_tools_is_active ON ai_tools(is_active);

-- Create updated_at trigger for ai_tools
CREATE TRIGGER set_timestamp_ai_tools
BEFORE UPDATE ON ai_tools
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Agent Tools (junction table)
CREATE TABLE agent_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, tool_id)
);

-- Create indexes for agent_tools
CREATE INDEX idx_agent_tools_agent_id ON agent_tools(agent_id);
CREATE INDEX idx_agent_tools_tool_id ON agent_tools(tool_id);

-- AI Tasks
CREATE TABLE ai_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    user_id UUID,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    result JSONB,
    error TEXT
);

-- Create indexes for ai_tasks
CREATE INDEX idx_ai_tasks_agent_id ON ai_tasks(agent_id);
CREATE INDEX idx_ai_tasks_user_id ON ai_tasks(user_id);
CREATE INDEX idx_ai_tasks_project_id ON ai_tasks(project_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_ai_tasks_created_at ON ai_tasks(created_at);

-- Create updated_at trigger for ai_tasks
CREATE TRIGGER set_timestamp_ai_tasks
BEFORE UPDATE ON ai_tasks
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- AI Logs
CREATE TABLE ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES ai_tasks(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    log_type TEXT NOT NULL,
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for ai_logs
CREATE INDEX idx_ai_logs_task_id ON ai_logs(task_id);
CREATE INDEX idx_ai_logs_agent_id ON ai_logs(agent_id);
CREATE INDEX idx_ai_logs_log_type ON ai_logs(log_type);
CREATE INDEX idx_ai_logs_created_at ON ai_logs(created_at);

-- =============================================
-- Initial Data
-- =============================================

-- Insert default expense categories
INSERT INTO expense_categories (name, description, is_active)
VALUES 
('Materials', 'Construction materials and supplies', true),
('Equipment', 'Equipment rental or purchase', true),
('Subcontractor', 'Payments to subcontractors', true),
('Permits', 'Building permits and inspections', true),
('Travel', 'Travel expenses related to the project', true),
('Labor', 'Labor costs not tracked through time entries', true),
('Office', 'Office supplies and expenses', true),
('Other', 'Miscellaneous expenses', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default payment methods
INSERT INTO payment_methods (name, description, is_online, is_active)
VALUES 
('Cash', 'Cash payment', false, true),
('Check', 'Check payment', false, true),
('Credit Card', 'Manual credit card payment', false, true),
('Bank Transfer', 'Direct bank transfer', false, true),
('Square', 'Online payment via Square', true, true),
('Other', 'Other payment method', false, true)
ON CONFLICT (name) DO NOTHING;

-- Insert default resource types
INSERT INTO resource_types (name, description)
VALUES
('Labor', 'Human resources including workers, craftsmen, and supervisors'),
('Equipment', 'Machinery, tools, and other equipment'),
('Subcontractor', 'External contractors and specialized service providers'),
('Material', 'Construction materials and supplies')
ON CONFLICT DO NOTHING;

-- Insert default task templates
INSERT INTO task_templates (name, description, estimated_duration, default_resources, predecessor_templates)
VALUES
('Site Preparation', 'Clear and prepare the construction site', 480, '{"Labor": 2, "Equipment": 1}', '{}'),
('Foundation Work', 'Excavation and foundation construction', 2400, '{"Labor": 4, "Equipment": 2, "Subcontractor": 1}', '{"predecessors": ["Site Preparation"]}'),
('Framing', 'Structural framing of the building', 4800, '{"Labor": 6, "Equipment": 1}', '{"predecessors": ["Foundation Work"]}'),
('Roofing', 'Installation of roof structure and materials', 1920, '{"Labor": 4, "Subcontractor": 1}', '{"predecessors": ["Framing"]}'),
('Electrical Rough-In', 'Initial electrical wiring and installations', 1440, '{"Labor": 2, "Subcontractor": 1}', '{"predecessors": ["Framing"]}'),
('Plumbing Rough-In', 'Initial plumbing installations', 1440, '{"Labor": 2, "Subcontractor": 1}', '{"predecessors": ["Framing"]}'),
('HVAC Installation', 'Heating, ventilation, and air conditioning installation', 1440, '{"Labor": 2, "Subcontractor": 1}', '{"predecessors": ["Framing"]}'),
('Insulation', 'Installation of insulation materials', 960, '{"Labor": 3}', '{"predecessors": ["Electrical Rough-In", "Plumbing Rough-In", "HVAC Installation"]}'),
('Drywall', 'Installation and finishing of drywall', 2400, '{"Labor": 4}', '{"predecessors": ["Insulation"]}'),
('Painting', 'Interior and exterior painting', 1920, '{"Labor": 3}', '{"predecessors": ["Drywall"]}'),
('Flooring', 'Installation of flooring materials', 1440, '{"Labor": 3, "Subcontractor": 1}', '{"predecessors": ["Painting"]}'),
('Trim and Finish Work', 'Installation of trim, cabinets, and finish details', 2400, '{"Labor": 4}', '{"predecessors": ["Flooring"]}'),
('Final Inspection', 'Final inspection and punch list completion', 480, '{"Labor": 2}', '{"predecessors": ["Trim and Finish Work"]}')
ON CONFLICT DO NOTHING;

-- Insert weather impact rules
INSERT INTO weather_impact_rules (task_template_id, weather_condition, temperature_min, temperature_max, precipitation_threshold, wind_threshold, impact_type, impact_value, notes)
VALUES
((SELECT id FROM task_templates WHERE name = 'Site Preparation'), 'rain', NULL, NULL, 0.1, NULL, 'delay', 100, 'Heavy rain stops site preparation'),
((SELECT id FROM task_templates WHERE name = 'Foundation Work'), 'rain', NULL, NULL, 0.25, NULL, 'delay', 100, 'Heavy rain stops foundation work'),
((SELECT id FROM task_templates WHERE name = 'Framing'), 'rain', NULL, NULL, 0.5, 20, 'reduce_productivity', 50, 'Rain reduces framing productivity'),
((SELECT id FROM task_templates WHERE name = 'Roofing'), 'rain', NULL, NULL, 0.1, 15, 'delay', 100, 'Any rain stops roofing work'),
((SELECT id FROM task_templates WHERE name = 'Roofing'), 'clear', NULL, NULL, NULL, 25, 'delay', 100, 'High winds stop roofing work'),
((SELECT id FROM task_templates WHERE name = 'Painting'), 'rain', NULL, NULL, 0.1, NULL, 'delay', 100, 'Rain stops exterior painting'),
((SELECT id FROM task_templates WHERE name = 'Painting'), 'clear', 40, 90, NULL, NULL, 'reduce_productivity', 25, 'Temperature affects paint drying')
ON CONFLICT DO NOTHING;