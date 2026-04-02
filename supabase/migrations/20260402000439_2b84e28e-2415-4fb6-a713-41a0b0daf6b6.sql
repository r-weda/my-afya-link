-- Allow authenticated users to read their own feedback submissions
CREATE POLICY "Users can read own feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);