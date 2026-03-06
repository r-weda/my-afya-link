
-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Read verified clinics" ON public.clinics;

-- Create new policy requiring authentication for verified clinics, admin sees all
CREATE POLICY "Authenticated users read verified clinics" ON public.clinics
  FOR SELECT
  USING (
    (is_verified = true AND auth.uid() IS NOT NULL)
    OR has_role(auth.uid(), 'admin'::app_role)
  );
