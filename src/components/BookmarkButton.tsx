import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export default function BookmarkButton({ isBookmarked, onClick, className }: BookmarkButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
        isBookmarked
          ? "bg-primary/10 text-primary"
          : "bg-muted/60 text-muted-foreground hover:bg-muted",
        className
      )}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
    >
      <Bookmark
        className={cn("w-4 h-4 transition-all", isBookmarked && "fill-primary")}
      />
    </button>
  );
}
