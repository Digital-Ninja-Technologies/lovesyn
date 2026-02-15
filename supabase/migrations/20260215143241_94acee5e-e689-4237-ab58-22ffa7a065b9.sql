
-- Create table to track partner lookup attempts for rate limiting
CREATE TABLE public.partner_lookup_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

ALTER TABLE public.partner_lookup_attempts ENABLE ROW LEVEL SECURITY;

-- No direct client access needed - only used by SECURITY DEFINER function
-- RLS denies all by default with no policies

CREATE INDEX idx_lookup_attempts_user_time 
ON public.partner_lookup_attempts(user_id, attempted_at DESC);

-- Replace lookup function with rate-limited version
CREATE OR REPLACE FUNCTION public.lookup_partner_by_code(code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
  attempt_count int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check rate limit: max 10 attempts per hour
  SELECT COUNT(*) INTO attempt_count
  FROM partner_lookup_attempts
  WHERE user_id = auth.uid()
  AND attempted_at > NOW() - INTERVAL '1 hour';

  IF attempt_count >= 10 THEN
    RAISE EXCEPTION 'Too many lookup attempts. Please try again later.';
  END IF;

  -- Log attempt
  INSERT INTO partner_lookup_attempts (user_id, success)
  VALUES (auth.uid(), false);

  -- Perform lookup
  SELECT json_build_object('user_id', p.user_id, 'couple_id', p.couple_id, 'display_name', p.display_name)
  INTO result
  FROM profiles p
  WHERE p.partner_code = upper(code);

  IF result IS NULL THEN
    RAISE EXCEPTION 'Partner code not found';
  END IF;

  -- Mark latest attempt as success
  UPDATE partner_lookup_attempts
  SET success = true
  WHERE user_id = auth.uid()
  AND attempted_at = (SELECT MAX(attempted_at) FROM partner_lookup_attempts WHERE user_id = auth.uid());

  RETURN result;
END;
$$;

-- Clean up old attempts periodically (older than 24 hours) via a scheduled approach
-- For now, add a cleanup in the function itself for simplicity
CREATE OR REPLACE FUNCTION public.cleanup_old_lookup_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM partner_lookup_attempts WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$;
