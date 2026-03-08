-- Fix 1: Drop the overly permissive notification_history INSERT policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notification_history;

-- Fix 2: Refactor has_role to use auth.uid() internally instead of accepting arbitrary user_id
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  )
$$;