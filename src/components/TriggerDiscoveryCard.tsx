import { motion } from "framer-motion";
import { Sparkles, Target, ChevronRight } from "lucide-react";
import { getTriggerLabel } from "@/data/triggerAnalysisEngine";

interface TriggerDiscoveryCardProps {
  hasEnoughData: boolean;
  progress: { logged: number; target: number };
  topTriggers: { trigger: string; count: number; percentage: number }[];
  coOccurrence: { triggerA: string; triggerB: string; count: number; percentage: number }[];
  totalAttacks: number;
  onLogHeadache: () => void;
  onLearnMore: () => void;
  onViewAnalysis: () => void;
}

const TriggerDiscoveryCard = ({
  hasEnoughData,
  progress,
  topTriggers,
  coOccurrence,
  totalAttacks,
  onLogHeadache,
  onLearnMore,
  onViewAnalysis,
}: TriggerDiscoveryCardProps) => {
  if (!hasEnoughData) {
    // Collecting state
    const percent = Math.round((progress.logged / progress.target) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-[#FFF0EE] to-white border border-accent/20 p-5 shadow-md-soft"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Trigger Discovery</span>
        </div>
        <h2 className="text-h2 text-foreground mb-2">Let's find your triggers</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Log your next {progress.target - progress.logged} headaches with trigger info, and we'll start spotting patterns.
        </p>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">{progress.logged}/{progress.target} attacks logged</span>
            <span className="text-xs font-semibold text-accent">{percent}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onLogHeadache}
            className="flex-1 py-3 rounded-2xl bg-accent text-accent-foreground font-semibold text-sm shadow-cta active:scale-[0.98] transition-transform"
          >
            Log a headache
          </button>
          <button
            onClick={onLearnMore}
            className="px-5 py-3 rounded-2xl border-2 border-accent text-accent font-semibold text-sm active:scale-[0.98] transition-transform"
          >
            Learn more
          </button>
        </div>
      </motion.div>
    );
  }

  // Insights state
  const topCo = coOccurrence[0];
  const topTrigger = topTriggers[0];
  const showCombo = topCo && topCo.count >= 4;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onViewAnalysis}
      className="w-full text-left rounded-3xl bg-gradient-to-br from-[#FFF0EE] to-white border border-accent/20 p-5 shadow-md-soft"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
          <Target className="w-4 h-4 text-accent" />
        </div>
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">Pattern Found</span>
      </div>
      {showCombo ? (
        <>
          <h2 className="text-h2 text-foreground mb-2">
            Your #1 trigger combo: {getTriggerLabel(topCo.triggerA)} + {getTriggerLabel(topCo.triggerB)}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Appeared in {topCo.count} of your last {totalAttacks} attacks. When both happen on the same day, you're more likely to get a migraine.
          </p>
        </>
      ) : topTrigger ? (
        <>
          <h2 className="text-h2 text-foreground mb-2">
            Your top trigger: {getTriggerLabel(topTrigger.trigger)}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Showed up in {topTrigger.count} of your last {totalAttacks} attacks ({topTrigger.percentage}%).
          </p>
        </>
      ) : null}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-accent">View full analysis</span>
        <ChevronRight className="w-4 h-4 text-accent" />
      </div>
    </motion.button>
  );
};

export default TriggerDiscoveryCard;
