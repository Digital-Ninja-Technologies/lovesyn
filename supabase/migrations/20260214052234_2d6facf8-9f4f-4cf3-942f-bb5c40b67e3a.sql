
-- Create a SECURITY DEFINER helper function to get couple_id without RLS
CREATE OR REPLACE FUNCTION public.get_my_couple_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT couple_id FROM profiles WHERE user_id = auth.uid();
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.profiles;

-- Create non-recursive policy using the helper function
CREATE POLICY "Users can view relevant profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      auth.uid() = user_id
      OR (couple_id IS NOT NULL AND couple_id = public.get_my_couple_id())
    )
  );
