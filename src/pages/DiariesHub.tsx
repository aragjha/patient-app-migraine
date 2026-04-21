import { useState } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import DiaryTile from "@/components/DiaryTile";
import { diaryCategories } from "@/data/diaryContent";
import { migraineDiaryCategories } from "@/data/migraineDiaryContent";
import { Diagnosis } from "@/components/OnboardingFlow";
import { ScriptId } from "@/data/neuraScripts";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

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
  diagnosis?: Diagnosis | null;
}

// Mock April 2026 attack intensities + check-ins (matches prototype's vibe).
const MOCK_ATTACKS: Record<number, number> = { 3: 5, 4: 5, 7: 8, 15: 8, 16: 6 };
const MOCK_CHECKINS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21]);

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

const MonthCalendar = ({ attacks, checkins }: { attacks: Record<number, number>; checkins: Set<number> }) => {
  const days: (number | null)[] = [];
  // Apr 1 2026 → Wed (offset 3 from Sun).
  const offset = 3;
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= 30; d++) days.push(d);
  return (
    <div className="bg-card border border-border rounded-[22px] p-4">
      <div className="flex justify-between items-center mb-3.5">
        <div className="text-[15px] font-bold text-foreground">April 2026</div>
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
          const today = d === 21;
          return (
            <div
              key={i}
              className="aspect-square rounded-[10px] flex flex-col items-center justify-center"
              style={{
                background: p
                  ? `rgba(255,107,92,${0.18 + (p / 10) * 0.4})`
                  : "hsl(var(--muted))",
                border: today ? "2px solid hsl(var(--foreground))" : undefined,
              }}
            >
              <div
                className={`text-[11px] ${
                  today ? "font-extrabold" : "font-semibold"
                }`}
                style={{ color: p ? "#E8594C" : "hsl(var(--foreground))" }}
              >
                {d}
              </div>
              {p !== undefined && (
                <div className="text-[8px] text-[#E8594C] font-bold tabular-nums">{p}/10</div>
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
            style={{ color: "#E8594C", fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {a.pain}
          </div>
          <div className="text-[8px] font-semibold" style={{ color: "#E8594C" }}>/ 10</div>
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
  diagnosis,
}: DiariesHubProps) => {
  const [view, setView] = useState<"cal" | "list">("cal");
  const isMigraine = diagnosis === "migraine";
  const categories = isMigraine ? migraineDiaryCategories : diaryCategories;

  const attacks = [
    { d: "Apr 15", pain: 8, dur: "8h", trig: "Sleep deficit" },
    { d: "Apr 7", pain: 8, dur: "5h", trig: "Red wine + weather" },
    { d: "Apr 4", pain: 5, dur: "3h", trig: "Stress" },
    { d: "Apr 3", pain: 5, dur: "2h", trig: "Dehydration" },
  ];

  const topTriggers = [
    { t: "Sleep < 6h", pct: 78, c: "#7C3AED" },
    { t: "Barometric drops", pct: 54, c: "#06B6D4" },
    { t: "Red wine", pct: 31, c: "#EF4444" },
  ];

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
            className="text-[40px] font-medium tracking-tight leading-[1.02] text-foreground m-0"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            April, in <em className="italic text-accent font-extrabold">patterns</em>
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
            <MonthCalendar attacks={MOCK_ATTACKS} checkins={MOCK_CHECKINS} />
          </motion.div>
        )}

        {view === "list" && (
          <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AttackList items={attacks} />
          </motion.div>
        )}

        {/* Top triggers */}
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2">
          Top triggers · April
        </div>
        <div className="bg-card border border-border rounded-[20px] p-4 mb-4">
          {topTriggers.map((t) => (
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
          ))}
        </div>

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
      <BottomNav activeTab="tools" onTabChange={onNavigate} />
    </div>
  );
};

export default DiariesHub;
