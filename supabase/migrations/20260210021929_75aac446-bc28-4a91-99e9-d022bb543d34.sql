-- Allow authenticated users to find a profile by partner_code for pairing purposes
CREATE POLICY "Users can find profiles by partner code"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Drop the overly restrictive existing select policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their partner's profile" ON public.profiles;