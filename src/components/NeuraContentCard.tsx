import { motion } from "framer-motion";
import { BookOpen, Play, FileText, Maximize2 } from "lucide-react";

export type ContentSource = "maps-lesson" | "youtube" | "explainer";

export interface NeuraContent {
  id: string;
  source: ContentSource;
  title: string;
  sourceLabel: string; // "NeuroCare Learn" / "YouTube" / "Explainer"
  thumbnail?: string; // emoji or URL
  duration?: string; // "5 min read" / "4:32"
  body?: string; // for explainer
  externalUrl?: string; // for YouTube
  lessonId?: string; // for Maps lesson
}

interface NeuraContentCardProps {
  content: NeuraContent;
  onExpand: () => void;
}

const iconBySource: Record<ContentSource, typeof BookOpen> = {
  "maps-lesson": BookOpen,
  youtube: Play,
  explainer: FileText,
};

const NeuraContentCard = ({ content, onExpand }: NeuraContentCardProps) => {
  const Icon = iconBySource[content.source];
  return (
    <motion.button
      onClick={onExpand}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.98 }}
      className="w-full rounded-2xl bg-card border border-border overflow-hidden shadow-sm-soft my-2 text-left"
    >
      {/* Thumbnail area */}
      <div className="h-32 bg-gradient-to-br from-accent/10 to-accent/20 flex items-center justify-center">
        {content.thumbnail ? (
          <span className="text-5xl">{content.thumbnail}</span>
        ) : (
          <Icon className="w-10 h-10 text-accent" />
        )}
      </div>
      {/* Content */}
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {content.sourceLabel}
          </span>
        </div>
        <h4 className="text-sm font-bold text-foreground mb-1 leading-snug">{content.title}</h4>
        <div className="flex items-center justify-between">
          {content.duration && (
            <span className="text-xs text-muted-foreground">{content.duration}</span>
          )}
          <div className="ml-auto flex items-center gap-1 text-xs text-accent font-semibold">
            <Maximize2 className="w-3 h-3" />
            Expand
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default NeuraContentCard;
