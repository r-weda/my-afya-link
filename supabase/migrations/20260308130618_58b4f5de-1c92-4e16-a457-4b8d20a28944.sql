ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS confirmation_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex');

-- Allow public access to read/update appointments by token (for clinic action edge function via service role)
-- No RLS change needed since edge function uses service role key