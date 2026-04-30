import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import DiaryTile from "@/components/DiaryTile";
import { diaryCategories } from "@/data/diaryContent";
import { migraineDiaryCategories } from "@/data/migraineDiaryContent";
import { Diagnosis } from "@/components/OnboardingFlow";
import { ScriptId } from "@/data/neuraScripts";
import { BookOpen, ChevronLeft, ChevronRight, FlaskConical, Zap } from "lucide-react";
import { computeCorrelations, getStoredSessions } from "@/data/triggerIdentificationEngine";
import { HeadacheLog, CheckInLog } from "@/types/logs";

// Map diary category IDs to Neura scripts so tapping a diary tile opens Neura
// pre-loaded with the matching script.
const diaryCategoryToScript: Record<string, ScriptId> = {
  headache_pain: "diary-pain",
  aura_warning: "diary-aura",
  triggers: "diary-triggers",
  associated_symptoms: "diary-symptoms",
  relief_methods: "diary-relief",
  sleep_quality: "diary-sleep",
  mood_stress: "diary-mood",
};

interface DiariesHubProps {
  onStartCheckin: () => void;
  onNavigate: (tab: "home" | "maps" | "tools" | "profile") => void;
  onOpenDiary: (diaryId: string) => void;
  onOpenNeuraWithScript?: (scriptId: ScriptId | null) => void;
  onOpenTriggerDiary?: () => void;
  diagnosis?: Diagnosis | null;
  attackLogs?: HeadacheLog[];
  checkInLogs?: CheckInLog[];
}

// ─── Shared UI ───

const StatCard = ({ v, l, c }: { v: string; l: string; c: string }) => (
  <div className="bg-card border border-border rounded-[18px] p-3.5 text-center">
    <div
      className="text-2xl font-extrabold tracking-tight"
      style={{ color: c, fontFamily: "'Fraunces', Georgia, serif" }}
    >
      {v}
    </div>
    <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
      {l}
    </div>
  </div>
);

// ─── Calendar ───

const MonthCalendar = ({
  attacks,
  checkins,
  label,
  daysInMonth,
  offset,
  todayDay,
}: {
  attacks: Record<number, number>;
  checkins: Set<number>;
  label: string;
  daysInMonth: number;
  offset: number;
  todayDay: number;
}) => {
  const days: (number | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return (
    <div className="bg-card border border-border rounded-[22px] p-4">
      <div className="flex justify-between items-center mb-3.5">
        <div className="text-[15px] font-bold text-foreground">{label}</div>
        <div className="flex gap-1">
          {[ChevronLeft, ChevronRight].map((I, i) => (
            <button
              key={i}
              className="w-7 h-7 rounded-lg bg-muted border-0 cursor-pointer flex items-center justify-center text-foreground"
            >
              <I className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="text-[10px] font-bold text-center text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const p = attacks[d];
          const c = checkins.has(d);
          const today = d === todayDay;
          return (
            <div
              key={i}
              className="aspect-square rounded-[10px] flex flex-col items-center justify-center"
              style={{
                background: p
                  ? `rgba(255,107,92,${0.18 + (p / 10) * 0.4})`
                  : "var(--bg-deep)",
                border: today ? "2px solid hsl(var(--foreground))" : undefined,
              }}
            >
              <div
                className={`text-[11px] ${
                  today ? "font-extrabold" : "font-semibold"
                }`}
                style={{ color: p ? "var(--coral)" : "hsl(var(--foreground))" }}
              >
                {d}
              </div>
              {p !== undefined && (
                <div className="text-[8px] font-bold tabular-nums" style={{ color: "var(--coral)" }}>{p}/10</div>
              )}
              {c && p === undefined && (
                <div className="w-1 h-1 rounded-full bg-accent mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Attacks list ───

const AttackList = ({ items }: { items: { d: string; pain: number; dur: string; trig: string }[] }) => (
  <div>
    {items.map((a, i) => (
      <div
        key={i}
        className="bg-card border border-border rounded-[18px] p-3.5 mb-2 flex items-center gap-3.5"
      >
        <div
          className="w-[52px] h-[52px] rounded-[14px] flex flex-col items-center justify-center shrink-0"
          style={{ background: `rgba(255,107,92,${0.15 + (a.pain / 10) * 0.4})` }}
        >
          <div
            className="text-base font-extrabold"
            style={{ color: "#FF6B5C", fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {a.pain}
          </div>
          <div className="text-[8px] font-semibold" style={{ color: "#FF6B5C" }}>/ 10</div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">
            {a.d} · {a.dur}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{a.trig}</div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    ))}
  </div>
);

// ─── Main component ───

const DiariesHub = ({
  onStartCheckin: _onStartCheckin,
  onNavigate,
  onOpenDiary,
  onOpenNeuraWithScript,
  onOpenTriggerDiary,
  diagnosis,
  attackLogs = [],
  checkInLogs = [],
}: DiariesHubProps) => {
  const [view, setView] = useState<"cal" | "list">("cal");
  const isMigraine = diagnosis === "migraine";
  const categories = isMigraine ? migraineDiaryCategories : diaryCategories;

  // Current month for calendar
  const now = new Date();
  const calYear = now.getFullYear();
  const calMonth = now.getMonth(); // 0-indexed
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calOffset = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const calMonthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayDay = now.getDate();

  // Map attack logs to { day: painLevel } for current month
  const calAttacks: Record<number, number> = {};
  attackLogs.forEach((l) => {
    const d = new Date(l.startTime);
    if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
      const day = d.getDate();
      calAttacks[day] = Math.max(calAttacks[day] ?? 0, l.painPeak);
    }
  });

  // Map check-in logs to Set<day> for current month
  const calCheckins = new Set<number>();
  checkInLogs.forEach((l) => {
    const d = new Date(l.date);
    if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
      calCheckins.add(d.getDate());
    }
  });

  // Recent attacks list (last 10, newest first)
  const recentAttacks = [...attackLogs]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 10)
    .map((l) => ({
      d: new Date(l.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      pain: l.painPeak,
      dur: l.duration ? `${Math.round(l.duration / 60)}h` : "—",
      trig: l.triggers.length > 0 ? l.triggers.slice(0, 2).join(" + ") : "No triggers logged",
    }));

  const topTriggers = useMemo(() => {
    const correlations = computeCorrelations(getStoredSessions());
    const colors = ["#7C3AED", "#E8A838", "#EF4444", "#06B6D4", "#3B82F6"];
    if (correlations.length === 0) return [];
    return correlations.slice(0, 3).map((c, i) => ({
      t: `${c.emoji} ${c.label}`,
      pct: c.correlation,
      c: colors[i % colors.length],
    }));
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <div className="flex-1 px-5 pt-6 pb-24 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-1.5">
            Your story
          </div>
          <h1
            className="text-[40px] font-semibold leading-[1.02] text-foreground m-0"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              letterSpacing: "-0.03em",
            }}
          >
            April, in <em className="italic text-accent">patterns</em>
          </h1>
          <p className="text-muted-foreground text-[13px] mt-1 mb-5">
            Clinician-readable. Export anytime.
          </p>
        </motion.div>

        {/* Monthly summary */}
        <motion.div
          className="grid grid-cols-3 gap-2 mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <StatCard v="4" l="Attacks" c="#FF6B5C" />
          <StatCard v="6.2" l="Avg pain" c="#E8A838" />
          <StatCard v="92%" l="Adherence" c="#16A34A" />
        </motion.div>

        {/* View toggle */}
        <motion.div
          className="flex gap-1.5 mb-3.5 bg-muted p-1 rounded-[14px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {([
            ["cal", "Calendar"],
            ["list", "List"],
          ] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setView(k)}
              className="flex-1 py-2.5 rounded-[10px] border-0 text-sm font-bold transition-all"
              style={{
                background: view === k ? "hsl(var(--card))" : "transparent",
                color: view === k ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                boxShadow: view === k ? "var(--shadow-sm)" : "none",
              }}
            >
              {l}
            </button>
          ))}
        </motion.div>

        {view === "cal" && (
          <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MonthCalendar
              attacks={calAttacks}
              checkins={calCheckins}
              label={calMonthLabel}
              daysInMonth={daysInMonth}
              offset={calOffset}
              todayDay={todayDay}
            />
          </motion.div>
        )}

        {view === "list" && (
          <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AttackList items={recentAttacks} />
          </motion.div>
        )}

        {/* Top triggers */}
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2">
          Top triggers · April
        </div>
        <div className="bg-card border border-border rounded-[20px] p-4 mb-4">
          {topTriggers.length > 0 ? topTriggers.map((t) => (
            <div key={t.t} className="mb-2.5 last:mb-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-foreground">{t.t}</span>
                <span className="text-muted-foreground tabular-nums">{t.pct}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${t.pct}%`, background: t.c }}
                />
              </div>
            </div>
          )) : (
            <p className="text-xs text-muted-foreground text-center py-2">Log a few headaches to see your top triggers here.</p>
          )}
        </div>

        {/* Trigger Investigation entry */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          onClick={onOpenTriggerDiary}
          className="w-full text-left mb-4"
          style={{
            background: "linear-gradient(135deg, rgba(27,42,78,0.06) 0%, rgba(124,58,237,0.08) 50%, rgba(59,130,246,0.06) 100%)",
            border: "1.5px solid rgba(124,58,237,0.22)",
            borderRadius: 20,
            padding: "14px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 15,
              background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.12))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FlaskConical style={{ width: 22, height: 22, color: "#7C3AED" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="text-[14.5px] font-bold text-foreground mb-0.5">Trigger Investigation</div>
            <div className="text-[12px] text-muted-foreground">
              See which factors correlate with your attacks
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(232,168,56,0.12)",
              borderRadius: 8,
              padding: "3px 7px",
            }}
          >
            <Zap style={{ width: 10, height: 10, color: "#E8A838" }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#E8A838",
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                letterSpacing: "0.06em",
              }}
            >
              NEW
            </span>
          </div>
        </motion.button>

        {/* Diary categories — single-question flows; open Neura script if mapped */}
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2.5">
          Log today
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {categories.map((diary, index) => (
            <DiaryTile
              key={diary.id}
              title={diary.title}
              icon={diary.icon}
              onClick={() => {
                const scriptId = diaryCategoryToScript[diary.id];
                if (scriptId && onOpenNeuraWithScript) {
                  onOpenNeuraWithScript(scriptId);
                } else {
                  // Fallback to legacy single-question DiaryFlow page
                  onOpenDiary(diary.id);
                }
              }}
              delay={0.03 * index}
            />
          ))}
        </div>

        {/* Export */}
        <button
          className="w-full h-12 rounded-[26px] border-0 cursor-pointer text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{
            background: "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
            boxShadow: "0 8px 22px rgba(59,130,246,0.32)",
          }}
          onClick={() => alert("PDF export — coming soon")}
        >
          <BookOpen className="w-4 h-4" /> Export PDF for clinician
        </button>
      </div>
      <BottomNav
        activeTab="diary"
        onTabChange={onNavigate}
        onOpenNeura={() => onOpenNeuraWithScript?.(null)}
        onLog={() => onOpenNeuraWithScript?.("headache-log")}
      />
    </div>
  );
};

export default DiariesHub;
