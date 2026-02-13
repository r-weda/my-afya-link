
-- Add slug column to health_articles
ALTER TABLE public.health_articles ADD COLUMN slug text UNIQUE;

-- Backfill existing articles with slugs derived from title
UPDATE public.health_articles
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Make slug NOT NULL after backfill
ALTER TABLE public.health_articles ALTER COLUMN slug SET NOT NULL;

-- Index for fast lookup
CREATE INDEX idx_health_articles_slug ON public.health_articles (slug);
