import { Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ArticleCardProps {
  title: string;
  summary: string;
  source: string;
  imageUrl?: string;
  publishedAt?: string;
  onClick?: () => void;
}

export default function ArticleCard({
  title,
  summary,
  source,
  imageUrl,
  publishedAt,
  onClick,
}: ArticleCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left elevated-card rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]"
      whileTap={{ scale: 0.98 }}
    >
      {imageUrl && (
        <div className="h-40 overflow-hidden bg-muted">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-display font-semibold text-base md:text-lg text-card-foreground leading-snug mb-1.5 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground line-clamp-2 mb-3">{summary}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
