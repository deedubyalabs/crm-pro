ALTER TABLE estimates
ADD COLUMN schedule_of_value_id UUID REFERENCES schedule_of_values(id),
ADD COLUMN initial_invoice_id UUID REFERENCES invoices(id);
