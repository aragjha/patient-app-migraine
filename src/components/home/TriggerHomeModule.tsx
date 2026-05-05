import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search, Target } from "lucide-react";
import {
  computeCorrelations,
  getStoredSessions,
  TriggerCorrelation,
} from "@/data/triggerIdentificationEngine";

interface TriggerHomeModuleProps {
  /** Opens the dedicated Trigger Investigation / Analysis page. Used only
   *  by the Session 3+ correlation card. The Session 0 carousel handles
   *  "See how it works" locally by advancing the carousel page. */
  onOpenTriggerInvestigation: () => void;
  onStartCheckin: () => void;
}

const TRIGGER_LABELS: Record<string, string> = {
  stress: "Stress",
  lack_of_sleep: "Poor sleep",
  poor_sleep: "Poor sleep",
  skipped_meal: "Skipped meal",
  variable_weather: "Weather shifts",
  weather: "Weather shifts",
  hormonal_changes: "Hormonal changes",
  bright_lights: "Bright lights",
  neck_pain: "Neck tension",
  caffeine: "Caffeine",
  alcohol: "Alcohol",
  dehydration: "Dehydration",
  screen_time: "Screen time",
};

const TRIGGER_EMOJI: Record<string, string> = {
  stress: "😰",
  lack_of_sleep: "😴",
  poor_sleep: "😴",
  skipped_meal: "🍽️",
  variable_weather: "🌦️",
  weather: "🌦️",
  hormonal_changes: "📅",
  bright_lights: "💡",
  neck_pain: "🦴",
  caffeine: "☕",
  alcohol: "🍷",
  dehydration: "💧",
  screen_time: "📱",
};

const carouselPages = [
  {
    icon: "🔍",
    eyebrow: "How it works · 1/3",
    title: "Neura watches for patterns",
    body: "Every check-in and attack log adds a data point. Over time, Neura looks for what consistently shows up before your migraines.",
  },
  {
    icon: "📊",
    eyebrow: "How it works · 2/3",
    title: "Triggers hide in your routine",
    body: "Sleep, caffeine, stress, weather — they interact. Most patterns surface after 5–10 logs.",
  },
  {
    icon: "🎯",
    eyebrow: "How it works · 3/3",
    title: "The more you log, the clearer it gets",
    body: "Most people spot their first pattern after 2 weeks of daily check-ins. Keep going.",
  },
];

const TriggerHomeModule = ({
  onOpenTriggerInvestigation,
  onStartCheckin,
}: TriggerHomeModuleProps) => {
  const [page, setPage] = useState(0);
  const [correlations, setCorrelations] = useState<TriggerCorrelation[]>([]);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    try {
      const sessions = getStoredSessions();
      setSessionCount(sessions.length);
      if (sessions.length >= 3) {
        const corr = computeCorrelations(sessions);
        setCorrelations(corr.slice(0, 3));
      }
    } catch {
      setCorrelations([]);
    }
  }, []);

  const hasData = sessionCount >= 3 && correlations.length > 0;

  // Auto-advance the teaser carousel every 6s while in Session 0 mode
  useEffect(() => {
    if (hasData) return;
    const id = setInterval(() => {
      setPage((p) => (p + 1) % carouselPages.length);
    }, 6000);
    return () => clearInterval(id);
  }, [hasData]);

  // ── Session 0: discovery carousel ───────────────────────────────────────
  if (!hasData) {
    const cur = carouselPages[page];
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="rounded-[20px] overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(27,42,78,0.06) 0%, rgba(124,58,237,0.10) 50%, rgba(59,130,246,0.06) 100%)",
          border: "1.5px solid rgba(124,58,237,0.22)",
        }}
      >
        <div className="p-4">
          <div
            className="flex items-center gap-2 mb-2"
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#7C3AED",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            }}
          >
            <Search className="w-3 h-3" strokeWidth={2.4} />
            <span>Trigger discovery</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="text-[28px] leading-none">{cur.icon}</div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-foreground mb-1 leading-tight">
                    {cur.title}
                  </div>
                  <div className="text-[12px] text-muted-foreground leading-snug">
                    {cur.body}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Pager dots */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              {carouselPages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  aria-label={`Page ${i + 1}`}
                  style={{
                    width: i === page ? 18 : 6,
                    height: 6,
                    borderRadius: 999,
                    background:
                      i === page ? "#7C3AED" : "rgba(124,58,237,0.25)",
                    border: 0,
                    cursor: "pointer",
                    padding: 0,
                    transition: "all .25s",
                  }}
                />
              ))}
            </div>
            <div
              className="text-[10.5px]"
              style={{
                color: "var(--ink-2)",
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              }}
            >
              {sessionCount}/5 logs
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-2 gap-2 px-3 pb-3"
          style={{ borderTop: "1px solid rgba(124,58,237,0.14)", paddingTop: 10 }}
        >
          <button
            onClick={onStartCheckin}
            className="text-[12.5px] font-bold py-2.5 rounded-full text-white border-0 cursor-pointer active:scale-[0.97] transition-transform"
            style={{
              background:
                "linear-gradient(135deg, #1B2A4E 0%, #7C3AED 60%, #3B82F6 140%)",
              boxShadow: "0 6px 18px rgba(124,58,237,0.28)",
            }}
          >
            Start a check-in
          </button>
          <button
            onClick={() => {
              // "See how it works" advances the explainer carousel — does
              // NOT navigate to Diary. Loops back to page 0 after the last.
              setPage((p) => (p + 1) % carouselPages.length);
            }}
            aria-label={
              page < carouselPages.length - 1
                ? "Next explainer"
                : "Restart explainer"
            }
            className="text-[12.5px] font-semibold py-2.5 rounded-full bg-transparent border cursor-pointer flex items-center justify-center gap-1.5"
            style={{
              borderColor: "rgba(124,58,237,0.4)",
              color: "#7C3AED",
            }}
          >
            {page < carouselPages.length - 1 ? "How it works ›" : "Got it"}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Session 3+: top correlations ────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="rounded-[20px] overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(27,42,78,0.04) 0%, rgba(124,58,237,0.08) 50%, rgba(59,130,246,0.04) 100%)",
        border: "1.5px solid rgba(124,58,237,0.18)",
      }}
    >
      <div className="p-4">
        <div
          className="flex items-center justify-between mb-2.5"
          style={{
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#7C3AED",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          }}
        >
          <span className="flex items-center gap-1.5">
            <Target className="w-3 h-3" strokeWidth={2.4} />
            Top triggers · last 30 days
          </span>
          <span style={{ color: "var(--ink-2)" }}>{sessionCount} logs</span>
        </div>

        <div className="flex flex-col gap-2">
          {correlations.map((t) => {
            const factor = t.factorId;
            const label =
              TRIGGER_LABELS[factor] ??
              t.label ??
              factor.replace(/_/g, " ");
            const emoji = TRIGGER_EMOJI[factor] ?? t.emoji ?? "⚡";
            const pct = Math.max(0, Math.min(100, Math.round(t.correlation)));
            return (
              <div
                key={factor}
                className="flex items-center gap-3 rounded-xl px-3 py-2"
                style={{ background: "hsl(var(--card))" }}
              >
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: "rgba(124,58,237,0.10)",
                    fontSize: 18,
                  }}
                >
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-foreground">
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "var(--ink-2)",
                      fontFamily:
                        "'JetBrains Mono', ui-monospace, monospace",
                    }}
                  >
                    {pct}% · {t.observations ?? 0} obs
                  </div>
                </div>
                <div
                  className="rounded-full overflow-hidden shrink-0"
                  style={{
                    height: 6,
                    width: 64,
                    background: "rgba(124,58,237,0.10)",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: "#7C3AED",
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onOpenTriggerInvestigation}
          className="w-full mt-3 flex items-center justify-center gap-1 bg-transparent border-0 cursor-pointer"
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "#7C3AED",
            padding: "8px 0",
          }}
        >
          Open trigger investigation
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.4} />
        </button>
      </div>
    </motion.div>
  );
};

export default TriggerHomeModule;
