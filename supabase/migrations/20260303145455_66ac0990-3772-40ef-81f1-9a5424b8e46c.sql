-- Add explicit deny policies to user_roles for defense in depth
CREATE POLICY "Only system can insert roles" ON public.user_roles 
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Only system can update roles" ON public.user_roles 
  FOR UPDATE USING (false);

CREATE POLICY "Only system can delete roles" ON public.user_roles 
  FOR DELETE USING (false);