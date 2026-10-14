-- ============================================================================
-- AMEN WELLNESS CENTRE — MULTI-REGION DATABASE MIGRATION 004
-- Auth, RBAC Custom Claims & Token Hook
-- ============================================================================

-- Function: Supabase custom access token hook
-- Injects role and region_ids into app_metadata inside the JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_region_id TEXT;
  v_region_ids jsonb;
  v_claims jsonb;
BEGIN
  v_user_id := (event->>'user_id')::UUID;
  v_claims := event->'claims';

  -- Lookup admin role
  SELECT role, region_id
  INTO v_role, v_region_id
  FROM public.admin_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  IF FOUND THEN
    IF v_role = 'super_admin' OR v_region_id IS NULL THEN
      v_region_ids := jsonb_build_array('nairobi', 'new-york', 'paris');
    ELSE
      v_region_ids := jsonb_build_array(v_region_id);
    END IF;

    -- Inject into app_metadata
    v_claims := jsonb_set(v_claims, '{app_metadata,role}', to_jsonb(v_role));
    v_claims := jsonb_set(v_claims, '{app_metadata,region_ids}', v_region_ids);
    v_claims := jsonb_set(v_claims, '{app_metadata,mfa_enabled}', 'true'::jsonb);
  ELSE
    -- Default customer role
    v_claims := jsonb_set(v_claims, '{app_metadata,role}', '"customer"'::jsonb);
    v_claims := jsonb_set(v_claims, '{app_metadata,mfa_enabled}', 'false'::jsonb);
  END IF;

  event := jsonb_set(event, '{claims}', v_claims);
  RETURN event;
END;
$$;

-- Seed initial admin roles for demo staff (flagged is_demo = true)
INSERT INTO public.admin_roles (user_id, role, region_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'super_admin', NULL),
  ('00000000-0000-0000-0000-000000000002', 'region_admin', 'nairobi'),
  ('00000000-0000-0000-0000-000000000003', 'region_admin', 'new-york'),
  ('00000000-0000-0000-0000-000000000004', 'region_admin', 'paris'),
  ('00000000-0000-0000-0000-000000000005', 'receptionist', 'nairobi'),
  ('00000000-0000-0000-0000-000000000006', 'therapist', 'paris'),
  ('00000000-0000-0000-0000-000000000007', 'content_editor', NULL)
ON CONFLICT (user_id) DO NOTHING;
