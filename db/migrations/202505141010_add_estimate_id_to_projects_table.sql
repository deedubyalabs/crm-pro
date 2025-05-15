ALTER TABLE projects ADD COLUMN estimate_id UUID REFERENCES estimates(id);
