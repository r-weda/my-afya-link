CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'clinics_count', (SELECT count(*) FROM public.clinics WHERE is_verified = true),
    'articles_count', (SELECT count(*) FROM public.health_articles WHERE is_published = true),
    'counties_count', (SELECT count(DISTINCT county) FROM public.clinics WHERE is_verified = true AND county IS NOT NULL)
  )
$$;