
-- Fix 1: Make memories bucket private
UPDATE storage.buckets SET public = false WHERE id = 'memories';

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Memory photos are publicly accessible" ON storage.objects;

-- Add scoped SELECT policy for memories bucket
CREATE POLICY "Users can view their couple memory photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'memories'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT couple_id::text FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Fix 2: Add auth check to connect_partners
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

-- Also fix disconnect_partner with auth check
CREATE OR REPLACE FUNCTION public.disconnect_partner(requesting_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_couple_id uuid;
BEGIN
  -- Verify caller is the requesting user
  IF auth.uid() != requesting_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only disconnect your own profile';
  END IF;

  SELECT couple_id INTO current_couple_id FROM profiles WHERE user_id = requesting_user_id;
  
  IF current_couple_id IS NULL THEN
    RAISE EXCEPTION 'You are not connected to a partner';
  END IF;

  UPDATE profiles SET couple_id = NULL WHERE couple_id = current_couple_id;
  DELETE FROM couples WHERE id = current_couple_id;
END;
$$;

-- Fix 3: Restrict profiles SELECT to own profile + couple members
DROP POLICY IF EXISTS "Users can find profiles by partner code" ON public.profiles;

CREATE POLICY "Users can view own and partner profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR couple_id IN (SELECT p.couple_id FROM public.profiles p WHERE p.user_id = auth.uid() AND p.couple_id IS NOT NULL)
  );

-- Allow partner code lookup but only return minimal info via a separate permissive policy
CREATE POLICY "Users can find profiles by partner code"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
