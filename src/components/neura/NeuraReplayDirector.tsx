import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Play } from "lucide-react";
import { ReplayAction } from "@/data/neuraCaseReplays";

interface NeuraReplayDirectorProps {
  open: boolean;
  /** Replay name shown in the bar, e.g. "5a · Log attack". */
  name: string;
  stepIdx: number;
  totalSteps: number;
  /** Current action — used to render an inline annotation when kind === "note". */
  currentAction: ReplayAction | null;
  onAdvance: () => void;
  onEnd: () => void;
}

/**
 * Floating director bar — anchors at the top of the chat surface during a
 * scripted case replay. Lets the user advance step-by-step (matching the
 * "(taps on speaker →)" pacing the user asked for) or end the replay early.
 *
 * Notes (annotations from the replay) render as a soft caption directly
 * underneath the bar so the demo viewer knows what's about to happen next.
 */
const NeuraReplayDirector = ({
  open,
  name,
  stepIdx,
  totalSteps,
  currentAction,
  onAdvance,
  onEnd,
}: NeuraReplayDirectorProps) => {
  const note =
    currentAction?.kind === "note" ? currentAction.text : null;
  const done = stepIdx >= totalSteps;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed left-0 right-0 z-[60] flex flex-col items-center pointer-events-none"
          style={{
            top: "calc(env(safe-area-inset-top) + 8px)",
          }}
        >
          <div
            className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-full"
            style={{
              maxWidth: "min(100% - 24px, 460px)",
              background: "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
              color: "#fff",
              boxShadow: "0 12px 28px rgba(27,42,78,0.32)",
            }}
          >
            <Play className="w-3.5 h-3.5 shrink-0" strokeWidth={2.4} />
            <div className="flex flex-col leading-tight min-w-0">
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  opacity: 0.85,
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                }}
              >
                Replay · {Math.min(stepIdx, totalSteps)}/{totalSteps}
              </span>
              <span
                className="truncate"
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                }}
              >
                {name}
              </span>
            </div>
            <div className="flex-1" />
            <button
              onClick={onAdvance}
              disabled={done}
              className="flex items-center gap-1 border-0 cursor-pointer active:scale-95 transition-transform"
              style={{
                background: done ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.95)",
                color: done ? "rgba(255,255,255,0.6)" : "#1B2A4E",
                fontSize: 12,
                fontWeight: 800,
                padding: "7px 12px",
                borderRadius: 999,
                cursor: done ? "default" : "pointer",
              }}
            >
              {done ? "Done" : "Next"}
              {!done && <ChevronRight className="w-3 h-3" strokeWidth={2.6} />}
            </button>
            <button
              onClick={onEnd}
              aria-label="End replay"
              className="border-0 cursor-pointer flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.4} />
            </button>
          </div>

          {note && (
            <motion.div
              key={note}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none mt-1.5 px-3 py-1.5 rounded-full"
              style={{
                maxWidth: "calc(100% - 32px)",
                background: "rgba(15,18,32,0.85)",
                color: "#fff",
                fontSize: 11.5,
                fontWeight: 600,
                fontStyle: "italic",
              }}
            >
              {note}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NeuraReplayDirector;
