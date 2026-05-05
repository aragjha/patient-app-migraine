import { motion } from "framer-motion";
import { ChevronRight, Pill, Activity, Calendar } from "lucide-react";

export type NeuraAnswerKind =
  | "adherence"
  | "top-triggers"
  | "last-attack"
  | "previous-trigger-log";

export interface AdherenceAnswer {
  kind: "adherence";
  weekPct: number;
  missedDoses: number;
  totalDoses: number;
  byMed: Array<{ name: string; taken: number; total: number }>;
}

export interface TopTriggersAnswer {
  kind: "top-triggers";
  triggers: Array<{
    id: string;
    label: string;
    icon: string;
    correlation: number; // 0–1
    observations: number;
  }>;
}

export interface LastAttackAnswer {
  kind: "last-attack";
  dateLabel: string;
  durationLabel: string;
  peakPain: number;
  zones: string[];
  whatHelped?: string;
  trigger?: string;
}

export interface PreviousTriggerLogAnswer {
  kind: "previous-trigger-log";
  dateLabel: string;
  daysAgo: number;
  /** Trigger ids the user marked, with their human labels. */
  triggers: Array<{ id: string; label: string; icon: string }>;
  /** Optional sleep / stress / mood snapshot from the same session. */
  context?: { sleep?: string; stress?: string; mood?: string };
}

export type NeuraAnswer =
  | AdherenceAnswer
  | TopTriggersAnswer
  | LastAttackAnswer
  | PreviousTriggerLogAnswer;

interface Props {
  answer: NeuraAnswer;
  onAction?: () => void;
}

const cardBase: React.CSSProperties = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 18,
  padding: 14,
  boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 4px 12px rgba(16,24,40,0.04)",
};

const eyebrow: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--ink-2)",
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const heading: React.CSSProperties = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22,
  fontWeight: 600,
  color: "var(--ink)",
  lineHeight: 1.15,
  letterSpacing: "-0.02em",
  marginTop: 4,
};

const NeuraInlineAnswer = ({ answer, onAction }: Props) => {
  if (answer.kind === "adherence") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
        style={cardBase}
      >
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-3.5 h-3.5" style={{ color: "var(--nc-accent)" }} strokeWidth={2.2} />
          <div style={eyebrow}>Adherence — this week</div>
        </div>
        <div className="flex items-baseline gap-2">
          <div
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 44,
              fontWeight: 600,
              color: answer.weekPct >= 80 ? "var(--green, #16A34A)" : "#EF4444",
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {answer.weekPct}%
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
            {answer.missedDoses} of {answer.totalDoses} missed
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {answer.byMed.map((m) => {
            const pct = m.total > 0 ? (m.taken / m.total) * 100 : 0;
            return (
              <div key={m.name}>
                <div className="flex justify-between" style={{ fontSize: 12 }}>
                  <span style={{ color: "var(--ink)", fontWeight: 600 }}>{m.name}</span>
                  <span
                    style={{
                      color: "var(--ink-2)",
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    }}
                  >
                    {m.taken}/{m.total}
                  </span>
                </div>
                <div
                  className="rounded-full mt-1 overflow-hidden"
                  style={{ background: "var(--bg-deep)", height: 6 }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: pct >= 80 ? "#16A34A" : "#EF4444",
                      borderRadius: 999,
                      transition: "width .4s",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  if (answer.kind === "top-triggers") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
        style={cardBase}
      >
        <div className="flex items-center gap-2 mb-1">
          <Pill className="w-3.5 h-3.5" style={{ color: "var(--nc-accent)" }} strokeWidth={2.2} />
          <div style={eyebrow}>Top triggers · last 30 days</div>
        </div>
        <div style={heading}>What's setting you off</div>
        <div className="mt-3 flex flex-col gap-2">
          {answer.triggers.slice(0, 3).map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2"
              style={{ background: "var(--bg-deep)" }}
            >
              <div
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: "hsl(var(--card))",
                  fontSize: 18,
                }}
              >
                {t.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                  {t.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ink-2)",
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  }}
                >
                  {Math.round(t.correlation * 100)}% correlation · {t.observations} obs
                </div>
              </div>
              <div
                className="rounded-full overflow-hidden shrink-0"
                style={{ background: "hsl(var(--card))", height: 6, width: 64 }}
              >
                <div
                  style={{
                    width: `${Math.round(t.correlation * 100)}%`,
                    height: "100%",
                    background: "var(--nc-accent)",
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        {onAction && (
          <button
            onClick={onAction}
            className="w-full mt-3 flex items-center justify-center gap-1 bg-transparent border-0 cursor-pointer"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--nc-accent)",
              padding: "6px 0",
            }}
          >
            View full analysis <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.4} />
          </button>
        )}
      </motion.div>
    );
  }

  if (answer.kind === "previous-trigger-log") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
        style={cardBase}
      >
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-3.5 h-3.5" style={{ color: "var(--nc-accent)" }} strokeWidth={2.2} />
          <div style={eyebrow}>
            Previous trigger log · {answer.daysAgo}d ago
          </div>
        </div>
        <div style={heading}>{answer.dateLabel}</div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {answer.triggers.length > 0 ? (
            answer.triggers.map((t) => (
              <span
                key={t.id}
                className="px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
                style={{
                  fontSize: 11.5,
                  background: "var(--bg-deep)",
                  color: "var(--ink)",
                  border: "1px solid hsl(var(--border))",
                  fontWeight: 600,
                }}
              >
                <span>{t.icon}</span>
                {t.label}
              </span>
            ))
          ) : (
            <span style={{ fontSize: 12, color: "var(--ink-2)" }}>
              No triggers selected on that day.
            </span>
          )}
        </div>
        {answer.context && (
          Object.values(answer.context).some(Boolean) && (
            <div
              className="mt-3 grid grid-cols-3 gap-2"
              style={{ fontSize: 11 }}
            >
              {answer.context.sleep && (
                <div>
                  <div style={{ color: "var(--ink-2)", fontWeight: 600 }}>Sleep</div>
                  <div style={{ color: "var(--ink)", fontWeight: 700 }}>
                    {answer.context.sleep}
                  </div>
                </div>
              )}
              {answer.context.stress && (
                <div>
                  <div style={{ color: "var(--ink-2)", fontWeight: 600 }}>Stress</div>
                  <div style={{ color: "var(--ink)", fontWeight: 700 }}>
                    {answer.context.stress}
                  </div>
                </div>
              )}
              {answer.context.mood && (
                <div>
                  <div style={{ color: "var(--ink-2)", fontWeight: 600 }}>Mood</div>
                  <div style={{ color: "var(--ink)", fontWeight: 700 }}>
                    {answer.context.mood}
                  </div>
                </div>
              )}
            </div>
          )
        )}
        {onAction && (
          <button
            onClick={onAction}
            className="w-full mt-3 flex items-center justify-center gap-1 bg-transparent border-0 cursor-pointer"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--nc-accent)",
              padding: "6px 0",
            }}
          >
            Log a new trigger
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.4} />
          </button>
        )}
      </motion.div>
    );
  }

  // last-attack
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
      style={cardBase}
    >
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-3.5 h-3.5" style={{ color: "var(--nc-accent)" }} strokeWidth={2.2} />
        <div style={eyebrow}>Last attack</div>
      </div>
      <div style={heading}>{answer.dateLabel}</div>
      <div className="mt-2 flex gap-3" style={{ fontSize: 12, color: "var(--ink-2)" }}>
        <span>
          <strong style={{ color: "var(--ink)" }}>{answer.durationLabel}</strong> long
        </span>
        <span>·</span>
        <span>
          peak <strong style={{ color: "var(--ink)" }}>{answer.peakPain}/10</strong>
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {answer.zones.map((z) => (
          <span
            key={z}
            className="px-2 py-0.5 rounded-full"
            style={{
              fontSize: 11,
              background: "var(--bg-deep)",
              color: "var(--ink)",
              border: "1px solid hsl(var(--border))",
            }}
          >
            {z}
          </span>
        ))}
      </div>
      {(answer.trigger || answer.whatHelped) && (
        <div className="mt-3 flex flex-col gap-1.5" style={{ fontSize: 12 }}>
          {answer.trigger && (
            <div>
              <span style={{ color: "var(--ink-2)" }}>Trigger: </span>
              <strong style={{ color: "var(--ink)" }}>{answer.trigger}</strong>
            </div>
          )}
          {answer.whatHelped && (
            <div>
              <span style={{ color: "var(--ink-2)" }}>What helped: </span>
              <strong style={{ color: "var(--ink)" }}>{answer.whatHelped}</strong>
            </div>
          )}
        </div>
      )}
      {onAction && (
        <button
          onClick={onAction}
          className="w-full mt-3 flex items-center justify-center gap-1 bg-transparent border-0 cursor-pointer"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--nc-accent)",
            padding: "6px 0",
          }}
        >
          Open in Diary <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.4} />
        </button>
      )}
    </motion.div>
  );
};

export default NeuraInlineAnswer;
