ALTER TABLE estimates
ADD COLUMN project_values_blueprint_id UUID REFERENCES project_values_blueprints(id),
ADD COLUMN initial_invoice_id UUID REFERENCES invoices(id);
