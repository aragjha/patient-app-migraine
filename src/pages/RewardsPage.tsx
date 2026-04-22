import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Flame,
  Check,
  Sparkles,
  Zap,
  Trophy,
  BookOpen,
  Gift,
  Snowflake,
} from "lucide-react";
import { usePersistedState } from "@/hooks/usePersistedState";

interface RewardsPageProps {
  onBack: () => void;
  onOpenNeura?: () => void;
  onOpenNeuraWithScript?: (scriptId: string) => void;
}

interface Tier {
  id: string;
  name: string;
  from: number;
  to: number;
  accent: string;
  bg: string;
}

const TIERS: Tier[] = [
  { id: "seed", name: "Seed", from: 0, to: 250, accent: "#94A3B8", bg: "linear-gradient(135deg, #E2E8F0, #CBD5E1)" },
  { id: "sprout", name: "Sprout", from: 250, to: 500, accent: "#16A34A", bg: "linear-gradient(135deg, #BBF7D0, #86EFAC)" },
  { id: "bloom", name: "Bloom", from: 500, to: 1000, accent: "#3B82F6", bg: "linear-gradient(135deg, #BFDBFE, #93C5FD)" },
  { id: "canopy", name: "Canopy", from: 1000, to: 2500, accent: "#7C3AED", bg: "linear-gradient(135deg, #DDD6FE, #C4B5FD)" },
  { id: "grove", name: "Grove", from: 2500, to: 5000, accent: "#D97757", bg: "linear-gradient(135deg, #FFB547, #FF6B5C)" },
  { id: "canyon", name: "Canyon", from: 5000, to: 10000, accent: "#1B2A4E", bg: "linear-gradient(135deg, #1B2A4E, #7C3AED)" },
];

const tierFor = (points: number): Tier =>
  TIERS.find((t) => points >= t.from && points < t.to) || TIERS[TIERS.length - 1];

const WeeklyRing = ({ done, goal }: { done: number; goal: number }) => {
  const R = 42;
  const C = 2 * Math.PI * R;
  const pct = Math.min(done / goal, 1);
  return (
    <div className="relative w-[108px] h-[108px]">
      <svg viewBox="0 0 108 108" width="108" height="108" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="54" cy="54" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle
          cx="54"
          cy="54"
          r={R}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.9,.2,1)" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF9B5A" />
            <stop offset="1" stopColor="#FF6B5C" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <div
          className="text-[28px] font-extrabold text-foreground"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {done}
        </div>
        <div className="text-[10px] text-muted-foreground font-semibold mt-0.5 tabular-nums">
          of {goal}
        </div>
      </div>
    </div>
  );
};

const StreakCalendar = () => {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const todayIdx = new Date().getDay();
  const visibleToday = todayIdx === 0 ? 6 : todayIdx - 1;
  return (
    <div className="flex gap-1.5 justify-between">
      {days.map((d, i) => {
        const done = i <= visibleToday;
        const today = i === visibleToday;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`text-[9px] tracking-wider ${
                today ? "text-foreground font-extrabold" : "text-muted-foreground font-semibold"
              }`}
            >
              {d}
            </div>
            <div
              className="w-full aspect-square rounded-[10px] flex items-center justify-center"
              style={{
                background: done
                  ? "linear-gradient(135deg, #FF9B5A, #FF6B5C)"
                  : "hsl(var(--muted))",
                border: today ? "2px solid hsl(var(--foreground))" : 0,
                color: done ? "#fff" : "hsl(var(--muted-foreground))",
              }}
            >
              {done ? <Flame className="w-3.5 h-3.5" strokeWidth={2.4} /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TierTrack = ({ points }: { points: number }) => {
  const cur = tierFor(points);
  const curIdx = TIERS.indexOf(cur);
  const nextTier = TIERS[Math.min(curIdx + 1, TIERS.length - 1)];
  const into = points - cur.from;
  const span = cur.to - cur.from;
  const pct = Math.min(into / span, 1);

  return (
    <div>
      <div className="flex justify-between mb-2 items-baseline">
        <div className="text-sm font-bold text-foreground">
          {cur.name}{" "}
          <span className="text-muted-foreground font-medium text-xs">
            · tier {curIdx + 1} of {TIERS.length}
          </span>
        </div>
        <div
          className="text-[11px] text-muted-foreground tabular-nums"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          {cur.to - points} pts to {nextTier.name}
        </div>
      </div>
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-0 rounded-full transition-[width] duration-700"
          style={{
            width: `${pct * 100}%`,
            background: cur.bg,
          }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {TIERS.map((t) => {
          const unlocked = points >= t.from;
          return (
            <div
              key={t.id}
              className="flex flex-col items-center gap-1"
              style={{ opacity: unlocked ? 1 : 0.35 }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full border-2 border-card"
                style={{ background: unlocked ? t.accent : "hsl(var(--border))" }}
              />
              <div
                className="text-[8.5px] text-muted-foreground font-semibold tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
              >
                {t.from}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RewardsPage = ({ onBack, onOpenNeura, onOpenNeuraWithScript }: RewardsPageProps) => {
  const [points] = usePersistedState("nc-points", 480);
  const [streak] = usePersistedState("nc-streak", 12);
  const [freezes] = usePersistedState("nc-freezes", 2);
  const [lastRewardAt] = usePersistedState<number | null>("nc-last-reward-at", null);

  const cur = tierFor(points);
  const curIdx = TIERS.indexOf(cur);
  const nextTier = TIERS[Math.min(curIdx + 1, TIERS.length - 1)];
  const weeklyDone = 4;
  const weeklyGoal = 7;

  const [boost, setBoost] = useState(false);
  useEffect(() => {
    if (lastRewardAt && Date.now() - lastRewardAt < 3000) {
      setBoost(true);
      const t = setTimeout(() => setBoost(false), 2400);
      return () => clearTimeout(t);
    }
  }, [lastRewardAt]);

  const quests = [
    {
      id: "checkin" as const,
      icon: Check,
      label: "Today's check-in",
      sub: "Locks your streak",
      pts: 30,
      done: false,
    },
    {
      id: "log" as const,
      icon: Zap,
      label: "Log an attack if any",
      sub: "Or skip if attack-free",
      pts: 50,
      done: false,
    },
    {
      id: "chat" as const,
      icon: Sparkles,
      label: "Ask Neura one thing",
      sub: "About your patterns",
      pts: 15,
      done: true,
    },
  ];

  const milestones = [
    { pts: 100, title: "First steps", desc: "10 days of check-ins", done: true },
    { pts: 250, title: "Consistent", desc: "2-week streak", done: true },
    {
      pts: 500,
      title: "Trigger Sleuth",
      desc: "Logged 20 attacks",
      done: points >= 500,
      progress: Math.min(Math.round((points / 500) * 100), 100),
    },
    {
      pts: 1000,
      title: "Diary Champion",
      desc: "$25 gift card",
      done: points >= 1000,
      progress: Math.min(Math.round((points / 1000) * 100), 100),
    },
    {
      pts: 2500,
      title: "Research Partner",
      desc: "$100 + Abbvie badge",
      done: points >= 2500,
      progress: Math.min(Math.round((points / 2500) * 100), 100),
    },
  ];

  const earnings = [
    { icon: Flame, l: "Daily check-in", p: "+30" },
    { icon: Zap, l: "Log a headache", p: "+50" },
    { icon: Sparkles, l: "Ask Neura one thing", p: "+15" },
    { icon: BookOpen, l: "Weekly questionnaire", p: "+200" },
    { icon: Gift, l: "Invite a friend", p: "+500" },
  ];

  const handleQuest = (id: "checkin" | "log" | "chat") => {
    if (id === "checkin") onOpenNeuraWithScript?.("daily-checkin");
    else if (id === "log") onOpenNeuraWithScript?.("headache-log");
    else onOpenNeura?.();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground flex flex-col">
      <style>{`
        @keyframes pointsPop {
          0% { transform: scale(1); }
          30% { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Modal shell — close + step + progress */}
      <div className="px-5 pt-14 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-0"
          style={{ background: "var(--bg-deep)", color: "var(--ink)" }}
          aria-label="Close"
        >
          <X className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </button>
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: "100%",
              background: "linear-gradient(90deg, var(--nc-accent), var(--plum))",
            }}
          />
        </div>
        <div
          className="text-[11px] font-bold tabular-nums"
          style={{
            color: "var(--nc-muted)",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            minWidth: 28,
            textAlign: "right",
          }}
        >
          1/1
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 px-5 pb-16 overflow-y-auto"
      >
        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-[28px] text-white mb-3.5"
          style={{ background: cur.bg, padding: "22px 22px 24px" }}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              right: -40,
              top: -40,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: -30,
              bottom: -50,
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.08)",
            }}
          />
          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/85">
                {cur.name} tier
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    title={i < freezes ? "Streak freeze available" : "Used"}
                    className="w-[26px] h-[26px] rounded-lg border flex items-center justify-center"
                    style={{
                      background:
                        i < freezes ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.25)",
                      opacity: i < freezes ? 1 : 0.45,
                    }}
                  >
                    <Snowflake className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-3.5">
              <div>
                <div className="flex items-baseline gap-2">
                  <div
                    key={points}
                    style={{
                      fontSize: 58,
                      fontWeight: 800,
                      fontFamily: "'Fraunces', Georgia, serif",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      animation: boost ? "pointsPop .6s ease-out" : "none",
                    }}
                  >
                    {points}
                  </div>
                  <div className="text-base font-semibold opacity-90">pts</div>
                </div>
                <div className="flex items-center gap-3 mt-2.5 text-xs">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold"
                    style={{ background: "rgba(0,0,0,0.18)" }}
                  >
                    <Flame className="w-3 h-3" /> {streak}d streak
                  </div>
                  <div className="opacity-85 text-[11px] tabular-nums">
                    {Math.max(nextTier.from - points, 0)} → {nextTier.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tier track */}
        <div className="bg-card border border-border rounded-[20px] p-4 mb-3.5">
          <TierTrack points={points} />
        </div>

        {/* Weekly goal + streak calendar */}
        <div className="bg-card border border-border rounded-[20px] p-4 mb-3.5 grid gap-3.5" style={{ gridTemplateColumns: "120px 1fr" }}>
          <WeeklyRing done={weeklyDone} goal={weeklyGoal} />
          <div className="flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Weekly goal
              </div>
              <div className="text-[13px] text-foreground font-semibold leading-[1.3]">
                {weeklyDone} of {weeklyGoal} check-ins.
                <br />
                <span className="text-muted-foreground font-medium">
                  Finish by Sunday for +100 bonus.
                </span>
              </div>
            </div>
            <StreakCalendar />
          </div>
        </div>

        {/* Today's quests */}
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Today's quests
        </div>
        <div className="bg-card border border-border rounded-[20px] overflow-hidden mb-3.5">
          {quests.map((q, i) => {
            const I = q.icon;
            return (
              <button
                key={q.id}
                onClick={() => !q.done && handleQuest(q.id)}
                disabled={q.done}
                className={`w-full flex items-center gap-3 px-4 py-3.5 min-h-[60px] ${
                  i < quests.length - 1 ? "border-b border-border/70" : ""
                } ${q.done ? "opacity-60 cursor-default" : "cursor-pointer active:bg-muted/40"}`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: q.done
                      ? "hsl(142 70% 45% / 0.12)"
                      : "var(--accent-soft, hsl(var(--accent) / 0.1))",
                    color: q.done ? "#16A34A" : "hsl(var(--accent))",
                  }}
                >
                  <I className="w-4 h-4" strokeWidth={q.done ? 3 : 2} />
                </div>
                <div className="flex-1 text-left">
                  <div
                    className={`text-sm font-bold text-foreground ${q.done ? "line-through" : ""}`}
                  >
                    {q.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{q.sub}</div>
                </div>
                <div
                  className="text-xs font-bold tabular-nums"
                  style={{
                    color: q.done ? "hsl(var(--muted-foreground))" : "hsl(var(--accent))",
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  }}
                >
                  +{q.pts}
                </div>
              </button>
            );
          })}
        </div>

        {/* Milestones */}
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Milestones
        </div>
        {milestones.map((m, i) => {
          const active = !m.done && m.progress !== undefined && m.progress < 100;
          return (
            <div
              key={i}
              className={`bg-card rounded-[18px] p-3.5 mb-2 flex items-center gap-3.5 ${
                m.done ? "opacity-70" : ""
              }`}
              style={{
                border: active ? "1.5px solid hsl(var(--accent))" : "1px solid hsl(var(--border))",
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: m.done
                    ? "hsl(142 70% 45% / 0.12)"
                    : active
                    ? "var(--accent-soft, hsl(var(--accent) / 0.1))"
                    : "hsl(var(--muted))",
                  color: m.done
                    ? "#16A34A"
                    : active
                    ? "hsl(var(--accent))"
                    : "hsl(var(--muted-foreground))",
                }}
              >
                {m.done ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <Trophy className="w-5 h-5" strokeWidth={2} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <div className="text-sm font-bold text-foreground">{m.title}</div>
                  <div className="text-[11px] text-muted-foreground font-semibold tabular-nums">
                    {m.pts} pts
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{m.desc}</div>
                {active && (
                  <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 bg-accent"
                      style={{ width: `${Math.min(m.progress!, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* How to earn */}
        <div className="mt-3.5 bg-muted rounded-[18px] p-4">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            Earn more
          </div>
          {earnings.map((r, i) => {
            const I = r.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-2.5 py-2 ${
                  i === 0 ? "" : "border-t border-border/60"
                }`}
              >
                <I className="w-4 h-4 text-accent" />
                <div className="flex-1 text-[13px] text-foreground">{r.l}</div>
                <div className="text-xs text-accent font-bold tabular-nums">{r.p}</div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default RewardsPage;
