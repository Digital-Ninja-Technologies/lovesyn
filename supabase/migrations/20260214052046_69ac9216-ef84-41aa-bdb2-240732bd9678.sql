
-- Fix the profiles SELECT policies - drop both and create a single one
DROP POLICY IF EXISTS "Users can view own and partner profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can find profiles by partner code" ON public.profiles;

-- Single policy: users can see own profile, couple members, and do partner code lookups
-- Partner code lookup is needed for the connect flow
CREATE POLICY "Users can view relevant profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      auth.uid() = user_id
      OR couple_id IN (SELECT p.couple_id FROM public.profiles p WHERE p.user_id = auth.uid() AND p.couple_id IS NOT NULL)
    )
  );
