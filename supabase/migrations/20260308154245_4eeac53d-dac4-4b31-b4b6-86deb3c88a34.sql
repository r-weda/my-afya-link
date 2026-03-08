
CREATE TABLE public.article_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  article_id uuid NOT NULL REFERENCES public.health_articles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_id)
);

ALTER TABLE public.article_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.article_bookmarks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.article_bookmarks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.article_bookmarks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
