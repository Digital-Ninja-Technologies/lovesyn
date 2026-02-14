
-- Update connect_partners to accept partner_code instead of partner_user_id
-- This way the partner code lookup happens inside SECURITY DEFINER, bypassing RLS
CREATE OR REPLACE FUNCTION public.connect_partners(current_user_id uuid, partner_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_couple_id uuid;
  partner_couple_id uuid;
  current_couple_id uuid;
BEGIN
  -- Verify caller is the current_user_id
  IF auth.uid() != current_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only connect your own profile';
  END IF;

  -- Prevent self-connection
  IF current_user_id = partner_user_id THEN
    RAISE EXCEPTION 'You cannot connect with yourself';
  END IF;

  -- Check partner isn't already coupled
  SELECT couple_id INTO partner_couple_id FROM profiles WHERE user_id = partner_user_id;
  IF partner_couple_id IS NOT NULL THEN
    RAISE EXCEPTION 'Partner is already connected';
  END IF;

  -- Check current user isn't already coupled
  SELECT couple_id INTO current_couple_id FROM profiles WHERE user_id = current_user_id;
  IF current_couple_id IS NOT NULL THEN
    RAISE EXCEPTION 'You are already connected';
  END IF;

  -- Create couple
  INSERT INTO couples DEFAULT VALUES RETURNING id INTO new_couple_id;

  -- Update both profiles
  UPDATE profiles SET couple_id = new_couple_id WHERE user_id = current_user_id;
  UPDATE profiles SET couple_id = new_couple_id WHERE user_id = partner_user_id;

  RETURN new_couple_id;
END;
$$;

-- Create a new RPC for partner code lookup that runs with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.lookup_partner_by_code(code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT json_build_object('user_id', user_id, 'couple_id', couple_id, 'display_name', display_name)
  INTO result
  FROM profiles
  WHERE partner_code = upper(code);

  IF result IS NULL THEN
    RAISE EXCEPTION 'Partner code not found';
  END IF;

  RETURN result;
END;
$$;
