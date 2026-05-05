import { motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";

interface NeuraResumePillProps {
  scriptName: string;
  stepIdx: number;
  totalSteps: number;
  questionPreview: string;
  onResume: () => void;
  onCancel: () => void;
}

/**
 * Resume pill — appears in the chat when the user dismisses a script modal.
 * Tappable to re-open the modal at the parked step. Long-press / X to cancel.
 */
const NeuraResumePill = ({
  scriptName,
  stepIdx,
  totalSteps,
  questionPreview,
  onResume,
  onCancel,
}: NeuraResumePillProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 6, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 6, scale: 0.97 }}
    transition={{ duration: 0.22, ease: "easeOut" }}
    className="w-full my-2 rounded-2xl flex items-stretch overflow-hidden"
    style={{
      background: "var(--nc-accent-soft)",
      border: "1.5px solid var(--nc-accent)",
      boxShadow: "0 4px 12px rgba(59,130,246,0.12)",
    }}
  >
    <button
      onClick={onResume}
      className="flex-1 flex items-center gap-3 text-left bg-transparent border-0 cursor-pointer px-3 py-2.5 active:opacity-80"
    >
      <div
        className="shrink-0 flex items-center justify-center rounded-xl"
        style={{
          width: 36,
          height: 36,
          background: "var(--nc-accent)",
          color: "#fff",
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.04em",
        }}
      >
        {stepIdx + 1}/{totalSteps}
      </div>
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--nc-accent)",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          }}
        >
          {scriptName} · paused
        </div>
        <div
          className="truncate"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink)",
            lineHeight: 1.25,
            marginTop: 1,
          }}
        >
          {questionPreview}
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: "var(--ink-2)",
            marginTop: 2,
          }}
        >
          Tap to continue · or just chat
        </div>
      </div>
      <ChevronRight className="shrink-0 w-4 h-4" style={{ color: "var(--nc-accent)" }} strokeWidth={2.4} />
    </button>
    <button
      onClick={onCancel}
      aria-label="Cancel this log"
      className="shrink-0 flex items-center justify-center bg-transparent border-0 cursor-pointer active:opacity-70"
      style={{
        width: 36,
        color: "var(--ink-2)",
        borderLeft: "1px solid rgba(59,130,246,0.18)",
      }}
    >
      <X className="w-3.5 h-3.5" strokeWidth={2.2} />
    </button>
  </motion.div>
);

export default NeuraResumePill;
