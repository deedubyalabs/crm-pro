-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('materials', 'labor', 'equipment', 'subcontractor', 'travel', 'permits', 'office', 'marketing', 'insurance', 'utilities', 'rent', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2),
  date DATE NOT NULL,
  receipt_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'reimbursed', 'rejected')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'cash', 'check', 'bank_transfer', 'company_account', 'personal_funds', 'other')),
  vendor TEXT,
  notes TEXT,
  billable BOOLEAN NOT NULL DEFAULT true,
  reimbursable BOOLEAN NOT NULL DEFAULT false,
  reimbursed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS expenses_project_id_idx ON expenses(project_id);
CREATE INDEX IF NOT EXISTS expenses_job_id_idx ON expenses(job_id);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);
CREATE INDEX IF NOT EXISTS expenses_status_idx ON expenses(status);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_expenses_updated_at();
