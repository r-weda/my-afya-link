import { Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import BookmarkButton from "@/components/BookmarkButton";

interface ArticleCardProps {
  title: string;
  summary: string;
  source: string;
  imageUrl?: string;
  publishedAt?: string;
  onClick?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export default function ArticleCard({
  title,
  summary,
  source,
  imageUrl,
  publishedAt,
  onClick,
  isBookmarked,
  onToggleBookmark,
}: ArticleCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left elevated-card rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]"
      whileTap={{ scale: 0.98 }}
    >
      {imageUrl && (
        <div className="relative h-40 lg:h-48 overflow-hidden bg-muted">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
          {onToggleBookmark && (
            <BookmarkButton
              isBookmarked={!!isBookmarked}
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
              className="absolute top-2 right-2"
            />
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-base lg:text-lg text-card-foreground leading-snug mb-1.5 line-clamp-2">
            {title}
          </h3>
          {!imageUrl && onToggleBookmark && (
            <BookmarkButton
              isBookmarked={!!isBookmarked}
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
              className="shrink-0"
            />
          )}
        </div>
        <p className="text-sm lg:text-base text-muted-foreground line-clamp-2 mb-3">{summary}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
            <span className="font-medium text-primary">{source}</span>
            {publishedAt && (
              <>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{publishedAt}</span>
              </>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </motion.button>
  );
}
