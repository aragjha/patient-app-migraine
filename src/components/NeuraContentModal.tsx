import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, BookOpen, Play, FileText } from "lucide-react";
import { NeuraContent } from "./NeuraContentCard";

interface NeuraContentModalProps {
  content: NeuraContent | null;
  onClose: () => void;
}

const iconBySource = {
  "maps-lesson": BookOpen,
  youtube: Play,
  explainer: FileText,
};

const NeuraContentModal = ({ content, onClose }: NeuraContentModalProps) => {
  if (!content) return null;
  const Icon = iconBySource[content.source];

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-background/95 backdrop-blur-sm sticky top-0">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {content.sourceLabel}
                </span>
              </div>
              <h2 className="text-h2 text-foreground truncate">{content.title}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Hero */}
              <div className="rounded-2xl h-48 bg-gradient-to-br from-accent/10 to-accent/20 flex items-center justify-center mb-5">
                {content.thumbnail ? (
                  <span className="text-7xl">{content.thumbnail}</span>
                ) : (
                  <Icon className="w-16 h-16 text-accent" />
                )}
              </div>

              {content.body && (
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-line">
                  {content.body}
                </div>
              )}

              {content.externalUrl && (
                <a
                  href={content.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-3 rounded-2xl bg-accent text-accent-foreground font-semibold shadow-cta"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open video
                </a>
              )}

              {content.duration && (
                <p className="text-xs text-muted-foreground mt-6">{content.duration}</p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NeuraContentModal;
