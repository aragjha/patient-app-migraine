import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, TrendingUp, CircleDot, FlaskConical, MessageCircle, ChevronRight } from "lucide-react";
import {
  computeCorrelations,
  getStoredSessions,
  ensureDemoData,
  TriggerCorrelation,
  getSolutions,
  getFactorDescription,
} from "@/data/triggerIdentificationEngine";

interface TriggerDiaryProps {
  onBack: () => void;
  onAskNeura?: () => void;
  onStartCheckin?: () => void;
}

// ─── Sub-components ───

const SignalBadge = ({ strength }: { strength: TriggerCorrelation["signalStrength"] }) => {
  const map = {
    strong: { label: "STRONG SIGNAL", bg: "#FFF3E0", color: "#E8A838" },
    building: { label: "BUILDING", bg: "rgba(124,58,237,0.10)", color: "#7C3AED" },
    early: { label: "EARLY DATA", bg: "rgba(59,130,246,0.10)", color: "#3B82F6" },
  };
  const s = map[strength];
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.12em",
        padding: "2px 7px",
        borderRadius: 6,
        background: s.bg,
        color: s.color,
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      }}
    >
      {s.label}
    </span>
  );
};

const CorrelationRing = ({ pct, size = 52 }: { pct: number; size?: number }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const color =
    pct >= 60 ? "#E8A838" :
    pct >= 35 ? "#7C3AED" : "#3B82F6";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: "stroke-dashoffset 0.7s ease" }}
      />
    </svg>
  );
};

const FactorRow = ({
  factor,
  index,
  onExpand,
  expanded,
}: {
  factor: TriggerCorrelation;
  index: number;
  onExpand: () => void;
  expanded: boolean;
}) => {
  const barColor =
    factor.correlation >= 60 ? "linear-gradient(90deg, #E8A838, #FF6B5C)" :
    factor.correlation >= 35 ? "linear-gradient(90deg, #7C3AED, #3B82F6)" :
    "linear-gradient(90deg, #3B82F6, #06B6D4)";

  const solutions = getSolutions(factor.factorId);
  const desc = getFactorDescription(factor.factorId);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <button
        onClick={onExpand}
        className="w-full text-left"
        style={{
          background: "hsl(var(--card))",
          border: "1.5px solid hsl(var(--border))",
          borderRadius: 16,
          padding: "12px 14px",
          marginBottom: 8,
          cursor: "pointer",
          display: "block",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "hsl(var(--muted))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {factor.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "hsl(var(--foreground))" }}>
                {factor.label}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <SignalBadge strength={factor.signalStrength} />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    color:
                      factor.correlation >= 60 ? "#E8A838" :
                      factor.correlation >= 35 ? "#7C3AED" : "#3B82F6",
                  }}
                >
                  {factor.correlation}%
                </span>
              </div>
            </div>
            <div
              style={{
                height: 5,
                borderRadius: 3,
                background: "hsl(var(--muted))",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${factor.correlation}%` }}
                transition={{ delay: index * 0.04 + 0.2, duration: 0.6, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 3, background: barColor }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 10.5, color: "hsl(var(--muted-foreground))" }}>
                {factor.category} · {factor.observations} data pts
              </span>
              <span style={{ fontSize: 10.5, color: "hsl(var(--muted-foreground))" }}>
                {factor.migrainesWhenPresent} / {factor.totalPresent} attacks when present
              </span>
            </div>
          </div>
          <ChevronRight
            style={{
              width: 14,
              height: 14,
              color: "hsl(var(--muted-foreground))",
              flexShrink: 0,
              transform: expanded ? "rotate(90deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden", marginBottom: 8, marginTop: -6 }}
          >
            <div
              style={{
                background: "hsl(var(--muted) / 0.5)",
                border: "1.5px solid hsl(var(--border))",
                borderTop: "none",
                borderRadius: "0 0 16px 16px",
                padding: "12px 14px 14px",
              }}
            >
              {desc && (
                <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 10, lineHeight: 1.5 }}>
                  {desc}
                </p>
              )}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  color: "hsl(var(--muted-foreground))",
                  marginBottom: 6,
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                }}
              >
                WHAT TO TRY
              </div>
              {solutions.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 6,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 6,
                      background: "hsl(var(--accent) / 0.15)",
                      color: "hsl(var(--accent))",
                      fontSize: 10,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 12.5, color: "hsl(var(--foreground))", lineHeight: 1.45 }}>{s}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Hero card for top suspect ───

const TopSuspectCard = ({ factor }: { factor: TriggerCorrelation }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    style={{
      borderRadius: 24,
      padding: "18px 18px 16px",
      marginBottom: 20,
      background: "linear-gradient(135deg, rgba(232,168,56,0.12) 0%, rgba(255,107,92,0.10) 100%)",
      border: "1.5px solid rgba(232,168,56,0.30)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,168,56,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.14em",
        color: "#E8A838",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <Zap style={{ width: 11, height: 11 }} />
      STRONGEST SIGNAL
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <CorrelationRing pct={factor.correlation} size={56} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          {factor.emoji}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "'Fraunces', Georgia, serif",
            color: "hsl(var(--foreground))",
            lineHeight: 1.1,
            marginBottom: 2,
          }}
        >
          {factor.label}
        </div>
        <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", lineHeight: 1.4 }}>
          Present before{" "}
          <span style={{ fontWeight: 700, color: "#E8A838" }}>{factor.correlation}%</span>{" "}
          of your migraines
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── Section header ───

const SectionLabel = ({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
      marginTop: 4,
    }}
  >
    <span style={{ color: "hsl(var(--muted-foreground))" }}>{icon}</span>
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.13em",
        color: "hsl(var(--muted-foreground))",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
    <span
      style={{
        marginLeft: "auto",
        fontSize: 10,
        fontWeight: 700,
        color: "hsl(var(--muted-foreground))",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      }}
    >
      {count} factor{count !== 1 ? "s" : ""}
    </span>
  </div>
);

// ─── Session-0 carousel ───

const TriggerDiscoveryCarousel = ({ sessionCount, onStartCheckin }: { sessionCount: number; onStartCheckin?: () => void }) => {
  const [page, setPage] = useState(0);
  const pages = [
    {
      icon: "🔍",
      title: "Neura watches for patterns",
      body: "Every check-in and attack log adds a data point. Over time, Neura looks for what consistently shows up before your migraines.",
    },
    {
      icon: "📊",
      title: "Triggers hide in your daily routine",
      body: `Sleep, caffeine, stress, weather — they interact. Most patterns take 5–10 logs to surface. You've done ${sessionCount} so far.`,
    },
    {
      icon: "🎯",
      title: "The more you log, the clearer it gets",
      body: "Most people spot their first pattern after 2 weeks of daily check-ins. Keep going.",
      cta: "Start today's check-in",
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px 48px" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          style={{ width: "100%", maxWidth: 360, textAlign: "center" }}
        >
          <div style={{ fontSize: 56, marginBottom: 20 }}>{pages[page].icon}</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, fontWeight: 600, color: "hsl(var(--foreground))", margin: "0 0 12px", lineHeight: 1.2 }}>
            {pages[page].title}
          </h2>
          <p style={{ fontSize: 14.5, color: "hsl(var(--muted-foreground))", lineHeight: 1.6, margin: "0 0 32px" }}>
            {pages[page].body}
          </p>
          {page < 2 ? (
            <button
              onClick={() => setPage((p) => p + 1)}
              style={{ padding: "14px 40px", borderRadius: 26, border: 0, cursor: "pointer", color: "white", fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)", boxShadow: "0 8px 22px rgba(59,130,246,0.32)" }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onStartCheckin}
              style={{ padding: "14px 40px", borderRadius: 26, border: 0, cursor: "pointer", color: "white", fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)", boxShadow: "0 8px 22px rgba(59,130,246,0.32)" }}
            >
              {pages[page].cta}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
      {/* Dots */}
      <div style={{ display: "flex", gap: 6, marginTop: 32 }}>
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            style={{ width: i === page ? 20 : 6, height: 6, borderRadius: 3, border: 0, cursor: "pointer", background: i === page ? "#3B82F6" : "hsl(var(--border))", transition: "all 0.25s", padding: 0 }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main component ───

const TriggerDiary = ({ onBack, onAskNeura, onStartCheckin }: TriggerDiaryProps) => {
  const [correlations, setCorrelations] = useState<TriggerCorrelation[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Only seed demo data when explicitly in demo mode — otherwise carousel gating breaks
    if (localStorage.getItem("nc-demo-mode") === "true") {
      ensureDemoData();
    }
    const sessions = getStoredSessions();
    setSessionCount(sessions.length);
    setCorrelations(computeCorrelations(sessions));
  }, []);

  const strong = correlations.filter((c) => c.signalStrength === "strong");
  const building = correlations.filter((c) => c.signalStrength === "building");
  const early = correlations.filter((c) => c.signalStrength === "early");
  const topFactor = correlations[0] ?? null;

  const factorCount = correlations.length;
  const avgCorrelation =
    factorCount > 0 ? Math.round(correlations.reduce((s, c) => s + c.correlation, 0) / factorCount) : 0;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Header */}
      <div
        style={{
          padding: "52px 20px 0",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "hsl(var(--card))",
            border: "1.5px solid hsl(var(--border))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            marginTop: 4,
          }}
          aria-label="Back"
        >
          <ArrowLeft style={{ width: 18, height: 18, color: "hsl(var(--foreground))" }} />
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "hsl(var(--muted-foreground))",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
            Trigger Lab
          </div>
          <h1
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "hsl(var(--foreground))",
              margin: 0,
            }}
          >
            Under{" "}
            <em style={{ fontStyle: "italic", color: "hsl(var(--accent))" }}>
              investigation.
            </em>
          </h1>
          <p style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))", marginTop: 5, marginBottom: 0 }}>
            {sessionCount} conversation{sessionCount !== 1 ? "s" : ""} analyzed · {factorCount} factor{factorCount !== 1 ? "s" : ""} tracked
          </p>
        </div>
      </div>

      {/* Session-0: show discovery carousel instead of correlations */}
      {sessionCount < 3 && (
        <TriggerDiscoveryCarousel sessionCount={sessionCount} onStartCheckin={onStartCheckin ?? onAskNeura} />
      )}

      {/* Stats strip + full content (only shown when enough sessions) */}
      {sessionCount >= 3 && (<><motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          padding: "16px 20px 0",
        }}
      >
        {[
          { v: `${sessionCount}`, l: "Sessions", c: "#3B82F6" },
          { v: `${strong.length}`, l: "Strong signals", c: "#E8A838" },
          { v: `${avgCorrelation}%`, l: "Avg correlation", c: "#7C3AED" },
        ].map(({ v, l, c }) => (
          <div
            key={l}
            style={{
              background: "hsl(var(--card))",
              border: "1.5px solid hsl(var(--border))",
              borderRadius: 16,
              padding: "10px 12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: c,
                fontFamily: "'Fraunces', Georgia, serif",
                lineHeight: 1,
              }}
            >
              {v}
            </div>
            <div
              style={{
                fontSize: 9.5,
                color: "hsl(var(--muted-foreground))",
                fontWeight: 700,
                marginTop: 3,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        {/* Top suspect hero */}
        {topFactor && <TopSuspectCard factor={topFactor} />}

        {/* Strong signals */}
        {strong.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <SectionLabel
              icon={<Zap style={{ width: 12, height: 12 }} />}
              label="Strong signals"
              count={strong.length}
            />
            {strong.map((f, i) => (
              <FactorRow
                key={f.factorId}
                factor={f}
                index={i}
                expanded={expandedId === f.factorId}
                onExpand={() => setExpandedId(expandedId === f.factorId ? null : f.factorId)}
              />
            ))}
          </div>
        )}

        {/* Building signals */}
        {building.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <SectionLabel
              icon={<TrendingUp style={{ width: 12, height: 12 }} />}
              label="Building picture"
              count={building.length}
            />
            {building.map((f, i) => (
              <FactorRow
                key={f.factorId}
                factor={f}
                index={i + strong.length}
                expanded={expandedId === f.factorId}
                onExpand={() => setExpandedId(expandedId === f.factorId ? null : f.factorId)}
              />
            ))}
          </div>
        )}

        {/* Early signals */}
        {early.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <SectionLabel
              icon={<CircleDot style={{ width: 12, height: 12 }} />}
              label="Early signals — needs more data"
              count={early.length}
            />
            {early.map((f, i) => (
              <FactorRow
                key={f.factorId}
                factor={f}
                index={i + strong.length + building.length}
                expanded={expandedId === f.factorId}
                onExpand={() => setExpandedId(expandedId === f.factorId ? null : f.factorId)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {correlations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "hsl(var(--card))",
              border: "1.5px dashed hsl(var(--border))",
              borderRadius: 24,
            }}
          >
            <FlaskConical
              style={{ width: 40, height: 40, color: "hsl(var(--muted-foreground))", margin: "0 auto 12px" }}
            />
            <div
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 20,
                fontWeight: 600,
                color: "hsl(var(--foreground))",
                marginBottom: 6,
              }}
            >
              Investigation begins
            </div>
            <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", lineHeight: 1.5, maxWidth: 260, margin: "0 auto 20px" }}>
              Start a conversation with Neura about your day. Every chat builds the picture.
            </p>
            {onAskNeura && (
              <button
                onClick={onAskNeura}
                style={{
                  height: 44,
                  paddingLeft: 24,
                  paddingRight: 24,
                  borderRadius: 22,
                  border: 0,
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #1B2A4E 0%, #7C3AED 50%, #3B82F6 100%)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Talk to Neura
              </button>
            )}
          </motion.div>
        )}

        {/* How it works note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            borderRadius: 18,
            padding: "12px 14px",
            background: "hsl(var(--muted) / 0.5)",
            border: "1px solid hsl(var(--border))",
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "hsl(var(--muted-foreground))",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              marginBottom: 5,
            }}
          >
            HOW CORRELATION WORKS
          </div>
          <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", lineHeight: 1.5, margin: 0 }}>
            Percentage shows how much more likely a migraine follows when that factor is present versus absent.
            100% = always preceded by it. More conversations = higher confidence.
          </p>
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 20px calc(28px + env(safe-area-inset-bottom))",
          background: "linear-gradient(to top, hsl(var(--background)) 70%, transparent)",
          pointerEvents: "none",
        }}
      >
        <button
          onClick={onAskNeura ?? undefined}
          disabled={!onAskNeura}
          style={{
            pointerEvents: "auto",
            opacity: onAskNeura ? 1 : 0.5,
            width: "100%",
            height: 52,
            borderRadius: 26,
            border: 0,
            cursor: "pointer",
            background: "linear-gradient(135deg, #1B2A4E 0%, #7C3AED 50%, #3B82F6 100%)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
          }}
        >
          <MessageCircle style={{ width: 16, height: 16 }} />
          Tell Neura about today
        </button>
      </div></>)}
    </div>
  );
};

export default TriggerDiary;
