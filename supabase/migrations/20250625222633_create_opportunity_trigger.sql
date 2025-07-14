CREATE OR REPLACE FUNCTION create_opportunity_on_person_type_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Logic to create an opportunity goes here
    -- For example, inserting into an opportunities table
    INSERT INTO public.opportunities (person_id, opportunity_name, opportunity_status, description, estimated_value, source, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.business_name) || ' - New Opportunity',
        'New',
        'Automatically created opportunity for ' || COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.business_name) || ' after converting from Lead.',
        0,
        COALESCE(NEW.lead_source, 'Converted Lead'),
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_person_type_change
AFTER UPDATE OF person_type ON public.people
FOR EACH ROW
WHEN (OLD.person_type IS DISTINCT FROM NEW.person_type AND NEW.person_type = 'Opportunity')
EXECUTE FUNCTION create_opportunity_on_person_type_change();
