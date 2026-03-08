import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ArticleCard from "@/components/ArticleCard";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { ArticleCardSkeleton } from "@/components/SkeletonCards";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Search, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  source: string | null;
  image_url: string | null;
  published_at: string | null;
}

export default function Articles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from("health_articles")
        .select("id, title, slug, summary, content, source, image_url, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      setArticles(data || []);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary?.toLowerCase().includes(search.toLowerCase());
    const matchesBookmark = !showBookmarked || isBookmarked(a.id);
    return matchesSearch && matchesBookmark;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader title="Health Articles" />

      <main className="px-4 pt-4 max-w-lg md:max-w-4xl lg:max-w-[1400px] mx-auto space-y-4">
        {/* Search */}
        <div className="relative md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-11 lg:h-12 lg:text-base bg-secondary/50 border-0"
          />
        </div>

        <div className="md:max-w-2xl">
          <MedicalDisclaimer compact />
        </div>

        {/* Articles */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-sm">
              {articles.length === 0
                ? "No articles published yet. Check back soon!"
                : "No articles match your search."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filtered.map((article) => (
              <ArticleCard
                onClick={() => navigate(`/articles/${article.slug}`)}
                key={article.id}
                title={article.title}
                summary={article.summary || ""}
                source={article.source || "AfyaConnect"}
                imageUrl={article.image_url || undefined}
                publishedAt={
                  article.published_at
                    ? new Date(article.published_at).toLocaleDateString("en-KE", {
                        month: "short",
                        day: "numeric",
                      })
                    : undefined
                }
              />
            ))}
          </motion.div>
        )}
      </main>

      <div className="flex-1" />
      <Footer />
      <BottomNav />
    </div>
  );
}
