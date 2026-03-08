import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBookmarkedIds(new Set());
      setLoading(false);
      return;
    }
    supabase
      .from("article_bookmarks")
      .select("article_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setBookmarkedIds(new Set((data || []).map((d: any) => d.article_id)));
        setLoading(false);
      });
  }, [user]);

  const toggle = useCallback(
    async (articleId: string) => {
      if (!user) return;
      const isBookmarked = bookmarkedIds.has(articleId);
      // Optimistic update
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isBookmarked) next.delete(articleId);
        else next.add(articleId);
        return next;
      });

      if (isBookmarked) {
        await supabase
          .from("article_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("article_id", articleId);
      } else {
        await supabase
          .from("article_bookmarks")
          .insert({ user_id: user.id, article_id: articleId });
      }
    },
    [user, bookmarkedIds]
  );

  const isBookmarked = useCallback(
    (articleId: string) => bookmarkedIds.has(articleId),
    [bookmarkedIds]
  );

  return { bookmarkedIds, isBookmarked, toggle, loading };
}
