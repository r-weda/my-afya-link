import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Loader2, ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Article {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  source: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string | null;
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("health_articles")
        .select("id, title, summary, content, source, source_url, image_url, published_at")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      setArticle(data);
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        <AppHeader title="Article" />
        <main className="px-4 pt-8 max-w-lg md:max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground mb-4">Article not found.</p>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate("/articles")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader title="Article" />

      <motion.main
        className="px-4 pt-4 max-w-lg md:max-w-3xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl -ml-2 text-muted-foreground"
          onClick={() => navigate("/articles")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {article.image_url && (
          <div className="rounded-2xl overflow-hidden border border-border/50">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-48 md:h-72 object-cover"
            />
          </div>
        )}

        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-foreground leading-tight mb-3">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            {article.source && (
              <span className="font-medium text-primary">{article.source}</span>
            )}
            {article.published_at && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(article.published_at).toLocaleDateString("en-KE", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {article.summary && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 border-l-4 border-primary/30 pl-4 italic">
              {article.summary}
            </p>
          )}

          <div className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-line">
            {article.content}
          </div>

          {article.source_url && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-6"
            >
              Read original source
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <MedicalDisclaimer />
      </motion.main>

      <Footer />
      <BottomNav />
    </div>
  );
}
