
-- Notification preferences table
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_reminders boolean NOT NULL DEFAULT true,
  health_tips boolean NOT NULL DEFAULT false,
  booking_confirmations boolean NOT NULL DEFAULT true,
  phone_number text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.notification_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.notification_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.notification_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Notification history table
CREATE TABLE public.notification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification history" ON public.notification_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notification_history
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
