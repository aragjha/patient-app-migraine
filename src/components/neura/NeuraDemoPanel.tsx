import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ScriptId } from "@/data/neuraScripts";
import { NeuraAnswerKind } from "./NeuraInlineAnswer";
import { CASE_REPLAYS } from "@/data/neuraCaseReplays";

interface NeuraDemoPanelProps {
  open: boolean;
  episodeMode: boolean;
  onClose: () => void;
  onResetChat: () => void;
  onStartScript: (id: ScriptId) => void;
  onShowAnswer: (kind: NeuraAnswerKind) => void;
  onSimulateDigression: () => void;
  onToggleEpisodeMode: () => void;
  onForceSpeaking: () => void;
  onSeedDemoUser: () => void;
  onResetStorage: () => void;
  onStartReplay?: (id: string) => void;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-3">
    <div
      style={{
        fontSize: 9.5,
        fontWeight: 800,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--ink-2)",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        marginBottom: 6,
        paddingLeft: 2,
      }}
    >
      {title}
    </div>
    <div className="flex flex-col gap-1.5">{children}</div>
  </div>
);

const Row = ({
  label,
  hint,
  onClick,
  tone = "default",
}: {
  label: string;
  hint?: string;
  onClick: () => void;
  tone?: "default" | "danger" | "active";
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between rounded-xl border cursor-pointer active:scale-[0.99] transition-all px-3 py-2.5"
    style={{
      background:
        tone === "active"
          ? "var(--nc-accent-soft)"
          : tone === "danger"
            ? "rgba(239,68,68,0.06)"
            : "hsl(var(--card))",
      borderColor:
        tone === "active"
          ? "var(--nc-accent)"
          : tone === "danger"
            ? "rgba(239,68,68,0.3)"
            : "hsl(var(--border))",
    }}
  >
    <div className="text-left">
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: tone === "danger" ? "#DC2626" : "var(--ink)",
        }}
      >
        {label}
      </div>
      {hint && (
        <div
          style={{
            fontSize: 10.5,
            color: "var(--ink-2)",
            marginTop: 1,
          }}
        >
          {hint}
        </div>
      )}
    </div>
    <div style={{ fontSize: 14, color: "var(--ink-2)" }}>›</div>
  </button>
);

const NeuraDemoPanel = ({
  open,
  episodeMode,
  onClose,
  onResetChat,
  onStartScript,
  onShowAnswer,
  onSimulateDigression,
  onToggleEpisodeMode,
  onForceSpeaking,
  onSeedDemoUser,
  onResetStorage,
  onStartReplay,
}: NeuraDemoPanelProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{
          background: "rgba(15,18,32,0.4)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[440px] flex flex-col"
          style={{
            background: "hsl(var(--card))",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTop: "1px solid hsl(var(--border))",
            maxHeight: "82vh",
            paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: "1px solid hsl(var(--border))" }}
          >
            <div>
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--nc-accent)",
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                }}
              >
                Demo controls · prototype only
              </div>
              <div
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--ink)",
                  marginTop: 1,
                }}
              >
                Try a scenario
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="bg-transparent border-0 cursor-pointer flex items-center justify-center"
              style={{ width: 32, height: 32, color: "var(--ink-2)" }}
            >
              <X className="w-5 h-5" strokeWidth={2.2} />
            </button>
          </div>

          <div className="px-5 py-4 overflow-y-auto" style={{ flex: 1 }}>
            {onStartReplay && (
              <Section title="Case replays · tap-paced demos">
                {CASE_REPLAYS.map((r) => (
                  <Row
                    key={r.id}
                    label={r.name}
                    hint={r.description}
                    onClick={() => onStartReplay(r.id)}
                  />
                ))}
              </Section>
            )}

            <Section title="Scripts (modal flows)">
              <Row
                label="Log a headache"
                hint="5 steps · diagram, slider, chips"
                onClick={() => onStartScript("headache-log")}
              />
              <Row
                label="Daily check-in"
                hint="3 steps · sleep, pain, mood"
                onClick={() => onStartScript("daily-discovery")}
              />
              <Row
                label="Trigger diary"
                hint="1 step · multi-select chips"
                onClick={() => onStartScript("diary-triggers")}
              />
              <Row
                label="Medication check"
                hint="1 step · meds list"
                onClick={() => onStartScript("medication-check")}
              />
            </Section>

            <Section title="Inline answers (free-chat replies)">
              <Row
                label="How are my meds?"
                hint="→ Adherence chart card"
                onClick={() => onShowAnswer("adherence")}
              />
              <Row
                label="What are my triggers?"
                hint="→ Top triggers card"
                onClick={() => onShowAnswer("top-triggers")}
              />
              <Row
                label="Tell me about my last attack"
                hint="→ Last-attack card"
                onClick={() => onShowAnswer("last-attack")}
              />
              <Row
                label="Show my last trigger log"
                hint="→ Previous trigger log card"
                onClick={() => onShowAnswer("previous-trigger-log")}
              />
            </Section>

            <Section title="Conversational behavior">
              <Row
                label="Simulate digression mid-script"
                hint="User asks an off-topic question. Neura answers briefly, then resumes."
                onClick={onSimulateDigression}
              />
              <Row
                label={episodeMode ? "Disable episode mode" : "Enable episode mode"}
                hint="activeMigraine · short responses, dimmed UI, relief CTA"
                onClick={onToggleEpisodeMode}
                tone={episodeMode ? "active" : "default"}
              />
              <Row
                label="Force Neura speaking"
                hint="Plays the speaking-indicator state"
                onClick={onForceSpeaking}
              />
            </Section>

            <Section title="Utilities">
              <Row label="Reset chat" onClick={onResetChat} />
              <Row
                label="Seed demo user"
                hint="12-day streak · 10 logs · 3 meds"
                onClick={onSeedDemoUser}
              />
              <Row
                label="Reset all nc-* storage"
                onClick={onResetStorage}
                tone="danger"
              />
            </Section>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default NeuraDemoPanel;
