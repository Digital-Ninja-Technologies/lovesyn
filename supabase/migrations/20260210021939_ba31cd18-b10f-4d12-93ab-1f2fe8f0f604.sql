-- Create a secure function to connect two partners
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