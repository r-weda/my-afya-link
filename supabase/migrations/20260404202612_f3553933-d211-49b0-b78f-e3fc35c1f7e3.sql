-- Fix: restrict clinics SELECT to authenticated role only
DROP POLICY IF EXISTS "Authenticated users read verified clinics" ON public.clinics;

CREATE POLICY "Authenticated users read verified clinics"
ON public.clinics
FOR SELECT
TO authenticated
USING (
  (is_verified = true) OR has_role(auth.uid(), 'admin'::app_role)
);