import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import NeuraAvatar from "@/components/NeuraAvatar";

interface NeuraEntryCardProps {
  onOpen: () => void;
  contextPrompts?: string[]; // optional contextual prompts passed from Home
}

const defaultPrompts = [
  "What's on your mind?",
  "Tell me how you're feeling",
  "Ask me anything about your migraines",
  "Why do I get migraines on Mondays?",
  "What helps my pain the most?",
  "Let's do a quick check-in",
];

const NeuraEntryCard = ({ onOpen, contextPrompts }: NeuraEntryCardProps) => {
  const prompts = contextPrompts?.length ? contextPrompts : defaultPrompts;
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((i) => (i + 1) % prompts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [prompts.length]);

  return (
    <motion.button
      onClick={onOpen}
      className="w-full rounded-3xl bg-card border border-border p-4 shadow-sm-soft text-left active:scale-[0.99] transition-transform"
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <NeuraAvatar size="sm" />
        <div className="flex-1">
          <span className="text-sm font-bold text-foreground">Neura</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      <div className="min-h-[24px] mb-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={promptIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-muted-foreground italic"
          >
            "{prompts[promptIndex]}"
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-2xl bg-accent/10 border border-accent/20">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <Mic className="w-4 h-4 text-accent-foreground" />
        </div>
        <span className="text-sm font-semibold text-accent">Tap to talk or type</span>
      </div>
    </motion.button>
  );
};

export default NeuraEntryCard;
