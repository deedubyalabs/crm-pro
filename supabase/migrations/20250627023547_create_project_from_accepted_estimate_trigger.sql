CREATE OR REPLACE FUNCTION public.create_project_from_accepted_estimate()
RETURNS TRIGGER AS $$
DECLARE
    project_id uuid;
    opportunity_id uuid;
    person_full_name text;
    material_list_id uuid;
BEGIN
    -- Check if the estimate is approved and retrieve the opportunity and person's full name
    SELECT o.id, p.full_name INTO opportunity_id, person_full_name
    FROM public.estimates e
    JOIN public.opportunities o ON e.opportunity_id = o.id
    JOIN public.people p ON o.person_id = p.id
    WHERE e.id = NEW.id AND e.status = 'Accepted';

    IF opportunity_id IS NOT NULL THEN
        -- Create a new project for the opportunity with the specified name and status
        INSERT INTO public.projects (opportunity_id, project_name, description, status)
        VALUES (opportunity_id, person_full_name || ' - Project', 'Created from accepted estimate', 'Pending Start')
        RETURNING id INTO project_id;

        -- Update the opportunity status to Accepted
        UPDATE public.opportunities
        SET opportunity_status = 'Accepted'
        WHERE id = opportunity_id;

        -- Create jobs for labor type line items
        INSERT INTO public.jobs (project_id, name, description)
        SELECT project_id, description, 'Job for estimate ' || NEW.id
        FROM public.estimate_line_items
        WHERE estimate_id = NEW.id AND type = 'Labor';

        -- Create a new material list for the estimate
        INSERT INTO public.material_lists (estimate_id, created_at)
        VALUES (NEW.id, NOW())
        RETURNING id INTO material_list_id;

        -- Insert material items into the material_list_items table
        INSERT INTO public.material_list_items (material_list_id, description, quantity, unit_cost)
        SELECT material_list_id, description, quantity, unit_cost
        FROM public.estimate_line_items
        WHERE estimate_id = NEW.id AND type = 'Material';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_project_on_estimate_accepted
AFTER UPDATE ON public.estimates
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Accepted')
EXECUTE FUNCTION public.create_project_from_accepted_estimate();
