ALTER TABLE change_orders
ADD COLUMN person_id UUID REFERENCES people(id),
ADD COLUMN approved_by_person_id UUID REFERENCES people(id);
