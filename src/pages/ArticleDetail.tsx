import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Loader2, ArrowLeft, Clock, ExternalLink, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";
import { useBookmarks } from "@/hooks/useBookmarks";
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

/** Extract lines that look like key tips (start with "Tip:" or "Key point:" etc.) */
function extractTips(content: string): string[] {
  const tips: string[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(tip|key point|important|note|remember):/i.test(trimmed)) {
      tips.push(trimmed);
    }
  }
  return tips;
}

const COLLAPSE_THRESHOLD = 2000; // characters

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();

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

  // Normalize content: convert literal \n strings to actual newlines
  const normalizedContent = article.content
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "  ");

  const isLong = normalizedContent.length > COLLAPSE_THRESHOLD;
  const displayContent = isLong && !expanded
    ? normalizedContent.slice(0, COLLAPSE_THRESHOLD) + "…"
    : normalizedContent;

  const tips = extractTips(normalizedContent);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader title="Article" />

      <motion.main
        className="px-4 pt-4 max-w-lg md:max-w-3xl mx-auto space-y-6 w-full"
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

        {/* Hero image */}
        {article.image_url && (
          <div className="rounded-2xl overflow-hidden border border-border/50">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-48 md:h-72 object-cover"
            />
          </div>
        )}

        {/* Article header card */}
        <div className="bg-card rounded-2xl border border-border/40 p-5 md:p-7 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-foreground leading-tight">
              {article.title}
            </h1>
            <BookmarkButton
              isBookmarked={isBookmarked(article.id)}
              onClick={() => toggleBookmark(article.id)}
              className="shrink-0 mt-1"
            />
          </div>

          <div className="flex items-center gap-3 text-sm lg:text-base text-muted-foreground">
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
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-4 italic">
              {article.summary}
            </p>
          )}
        </div>

        {/* Key tips box */}
        {tips.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold text-sm text-primary">Key Points</span>
            </div>
            <ul className="space-y-1.5">
              {tips.map((tip, i) => (
                <li key={i} className="text-sm text-foreground leading-relaxed pl-1">
                  • {tip.replace(/^(tip|key point|important|note|remember):\s*/i, "")}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article body */}
        <div className="bg-card rounded-2xl border border-border/40 p-5 md:p-7">
          <div className="article-content">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mt-8 mb-3 first:mt-0">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mt-8 mb-3 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display font-semibold text-lg md:text-xl text-foreground mt-6 mb-2">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="font-display font-semibold text-base md:text-lg text-foreground mt-5 mb-2">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-sm md:text-base text-foreground/90 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1.5 mb-4 ml-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-1.5 mb-4 ml-1 list-decimal list-inside">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm md:text-base text-foreground/90 leading-relaxed flex gap-2">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-foreground/80">{children}</em>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/30 pl-4 my-4 text-muted-foreground italic">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="border-border/50 my-6" />,
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>

          {/* Read more / collapse */}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Read more <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Source link */}
        {article.source_url && (
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Read original source
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        <MedicalDisclaimer />
      </motion.main>

      <div className="flex-1" />
      <Footer />
      <BottomNav />
    </div>
  );
}
