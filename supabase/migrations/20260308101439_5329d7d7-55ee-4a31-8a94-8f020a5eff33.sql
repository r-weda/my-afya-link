
CREATE TABLE public.symptom_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symptoms text[] NOT NULL,
  additional_notes text,
  is_urgent boolean NOT NULL DEFAULT false,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.symptom_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own checks"
  ON public.symptom_checks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own checks"
  ON public.symptom_checks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checks"
  ON public.symptom_checks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
