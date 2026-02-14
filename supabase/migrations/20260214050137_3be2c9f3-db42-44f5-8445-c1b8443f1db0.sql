
CREATE OR REPLACE FUNCTION public.disconnect_partner(requesting_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_couple_id uuid;
BEGIN
  SELECT couple_id INTO current_couple_id FROM profiles WHERE user_id = requesting_user_id;
  
  IF current_couple_id IS NULL THEN
    RAISE EXCEPTION 'You are not connected to a partner';
  END IF;

  -- Remove couple_id from both profiles
  UPDATE profiles SET couple_id = NULL WHERE couple_id = current_couple_id;

  -- Delete the couple record
  DELETE FROM couples WHERE id = current_couple_id;
END;
$$;
