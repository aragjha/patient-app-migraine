import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Clock,
  Square,
  TrendingUp,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  Lightbulb,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeadacheEntry {
  id: string;
  date: Date;
  painLevel: number;
  duration: string;
  triggers: string[];
  symptoms: string[];
  medications: string[];
  zones: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export function generateMockHeadacheHistory(): HeadacheEntry[] {
  const now = new Date();

  return [
    {
      id: "ha-1",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 9, 30),
      painLevel: 4,
      duration: "1h 20m",
      triggers: ["Poor sleep", "Skipped meal"],
      symptoms: ["Throbbing", "Nausea"],
      medications: ["Ibuprofen"],
      zones: ["left-temple"],
    },
    {
      id: "ha-2",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4, 14, 15),
      painLevel: 7,
      duration: "3h 45m",
      triggers: ["Stress", "Screen time"],
      symptoms: ["Throbbing", "Light sensitivity", "Nausea"],
      medications: ["Sumatriptan", "Ibuprofen"],
      zones: ["right-temple", "behind-eyes"],
    },
    {
      id: "ha-3",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 7, 0),
      painLevel: 3,
      duration: "45m",
      triggers: ["Weather change"],
      symptoms: ["Pressure", "Neck stiffness"],
      medications: ["Acetaminophen"],
      zones: ["forehead"],
    },
    {
      id: "ha-4",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 20, 30),
      painLevel: 6,
      duration: "2h 10m",
      triggers: ["Stress", "Poor sleep"],
      symptoms: ["Throbbing", "Light sensitivity"],
      medications: ["Sumatriptan"],
      zones: ["left-temple", "forehead"],
    },
  ];
}

// ─── Relief Tips ──────────────────────────────────────────────────────────────

const reliefTips = [
  "Try a cold compress on your forehead",
  "Rest in a dark, quiet room",
  "Stay hydrated - drink water slowly",
  "Try deep breathing: 4 seconds in, 7 hold, 8 out",
  "Avoid screens and bright lights",
  "Gentle neck stretches may help",
];

// Phased action plans for during/after migraine
const actionPhases = [
  {
    id: "during",
    label: "During Attack",
    icon: "🔴",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    actions: [
      { icon: "🌙", title: "Dark Room", desc: "Find a quiet, dark space" },
      { icon: "🧊", title: "Ice Pack", desc: "Cold compress on forehead/neck" },
      { icon: "💊", title: "Medication", desc: "Take acute meds if you haven't" },
      { icon: "💧", title: "Hydrate", desc: "Sip water slowly" },
    ],
  },
  {
    id: "winding",
    label: "Winding Down",
    icon: "🟡",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    actions: [
      { icon: "🍵", title: "Warm Drink", desc: "Herbal tea or warm water" },
      { icon: "🍌", title: "Light Snack", desc: "Something gentle if you can" },
      { icon: "🫁", title: "Breathing", desc: "4-7-8 breathing to ease tension" },
      { icon: "😌", title: "Rest", desc: "Don't rush — let your body recover" },
    ],
  },
  {
    id: "after",
    label: "After Attack",
    icon: "🟢",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    actions: [
      { icon: "🚶", title: "Ease Back In", desc: "Return to activities slowly" },
      { icon: "⚠️", title: "Avoid Triggers", desc: "Be extra careful today" },
      { icon: "📝", title: "Journal", desc: "Log details while they're fresh" },
      { icon: "💚", title: "Self-Care", desc: "Be gentle — you did great" },
    ],
  },
];

// ─── Helper: format elapsed time ──────────────────────────────────────────────

function formatElapsed(startTime: Date): string {
  const diff = Math.max(0, Math.floor((Date.now() - startTime.getTime()) / 1000));
  const h = String(Math.floor(diff / 3600)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
  const s = String(diff % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ─── Helper: short weekday ────────────────────────────────────────────────────

function shortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ─── Helper: pain level colour ────────────────────────────────────────────────

function painColor(level: number): string {
  if (level <= 2) return "text-green-500";
  if (level <= 4) return "text-yellow-500";
  if (level <= 6) return "text-orange-500";
  return "text-red-500";
}

function painBgColor(level: number): string {
  if (level <= 2) return "bg-green-500/15";
  if (level <= 4) return "bg-yellow-500/15";
  if (level <= 6) return "bg-orange-500/15";
  return "bg-red-500/15";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ActiveMigraineTimer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ActiveMigraineTimerProps {
  onStopTimer: () => void;
  startTime: Date;
}

interface ActiveMigraineTimerExtProps extends ActiveMigraineTimerProps {
  onOpenReliefGuide?: () => void;
}

export const ActiveMigraineTimer = ({ onStopTimer, startTime, onOpenReliefGuide }: ActiveMigraineTimerExtProps) => {
  const [elapsed, setElapsed] = useState(formatElapsed(startTime));
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(formatElapsed(startTime));
      setElapsedMs(Date.now() - startTime.getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Rotate relief tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % reliefTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Determine active phase based on elapsed time
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const activePhaseIdx = elapsedHours < 2 ? 0 : elapsedHours < 4 ? 1 : 2;
  const activePhase = actionPhases[activePhaseIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent p-5 mb-5"
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
        <span className="text-sm font-semibold text-red-500">Migraine in progress</span>
      </div>

      {/* Timer display */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-baseline gap-1">
          <Clock className="w-5 h-5 text-red-400 mr-2 self-center" />
          <span className="text-5xl font-mono font-bold text-foreground tracking-wider">
            {elapsed}
          </span>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="flex gap-1.5 mb-4">
        {actionPhases.map((phase, idx) => (
          <div key={phase.id} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
            idx === activePhaseIdx ? `${phase.bgColor} ${phase.color} border ${phase.borderColor}` : "bg-muted/30 text-muted-foreground"
          }`}>
            <span>{phase.icon}</span>
            <span>{phase.label}</span>
          </div>
        ))}
      </div>

      {/* Current phase actions */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {activePhase.actions.map((action) => (
          <div key={action.title} className={`shrink-0 w-[110px] p-2.5 rounded-xl border ${activePhase.borderColor} ${activePhase.bgColor}`}>
            <div className="text-lg mb-1">{action.icon}</div>
            <div className="text-xs font-semibold text-foreground">{action.title}</div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{action.desc}</div>
          </div>
        ))}
      </div>

      {/* Stop button */}
      <motion.button
        onClick={onStopTimer}
        whileTap={{ scale: 0.96 }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-500/25 active:shadow-md transition-shadow mb-3"
      >
        <Square className="w-4 h-4 fill-white" />
        Stop Timer
      </motion.button>

      {/* Rotating relief tip + guide link */}
      <div className="flex items-start gap-2 px-1">
        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-muted-foreground leading-relaxed"
          >
            {reliefTips[tipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {onOpenReliefGuide && (
        <button onClick={onOpenReliefGuide} className="mt-3 w-full text-center text-xs text-accent font-semibold hover:underline">
          Open Full Relief Guide →
        </button>
      )}
    </motion.div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PainHistoryChart
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PainHistoryChartProps {
  entries?: HeadacheEntry[];
}

export const PainHistoryChart = ({ entries }: PainHistoryChartProps) => {
  const data = entries ?? generateMockHeadacheHistory();
  const [expanded, setExpanded] = useState(false);

  // Build 7-day chart data
  const chartData = useMemo(() => {
    const now = new Date();
    const days: { name: string; pain: number | null; date: Date }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

      // Find highest pain on that day
      const dayEntries = data.filter(
        (e) =>
          e.date.getFullYear() === d.getFullYear() &&
          e.date.getMonth() === d.getMonth() &&
          e.date.getDate() === d.getDate()
      );

      const maxPain = dayEntries.length > 0 ? Math.max(...dayEntries.map((e) => e.painLevel)) : null;

      days.push({ name: dayLabel, pain: maxPain, date: d });
    }

    return days;
  }, [data]);

  // Summary stats
  const totalAttacks = data.length;
  const avgPain = totalAttacks > 0 ? (data.reduce((s, e) => s + e.painLevel, 0) / totalAttacks).toFixed(1) : "0";

  const triggerCounts: Record<string, number> = {};
  data.forEach((e) => e.triggers.forEach((t) => { triggerCounts[t] = (triggerCounts[t] || 0) + 1; }));
  const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None";

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length && payload[0].value !== null) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-muted-foreground">
            Pain: <span className="font-bold text-foreground">{payload[0].value}/10</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Migraine Report",
        text: `Migraine summary (last 7 days): ${totalAttacks} attacks, avg pain ${avgPain}/10, top trigger: ${topTrigger}.`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Migraine summary (last 7 days): ${totalAttacks} attacks, avg pain ${avgPain}/10, top trigger: ${topTrigger}.`
      );
    }
  };

  const handleDownload = () => {
    const lines = [
      "Migraine Report - Last 7 Days",
      "=============================",
      "",
      `Total Attacks: ${totalAttacks}`,
      `Average Pain: ${avgPain}/10`,
      `Most Common Trigger: ${topTrigger}`,
      "",
      "Detailed Attack Log:",
      "--------------------",
      ...data.map(
        (e) =>
          `${shortDate(e.date)} | Pain: ${e.painLevel}/10 | Duration: ${e.duration} | Triggers: ${e.triggers.join(", ")} | Symptoms: ${e.symptoms.join(", ")} | Meds: ${e.medications.join(", ")}`
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "migraine-report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border/50 bg-card p-4 mb-5"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          Your Pain History
        </h3>
        <span className="text-[10px] text-muted-foreground">Last 7 days</span>
      </div>

      {/* Chart */}
      <div className="w-full h-40 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="painStroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="pain"
              stroke="url(#painStroke)"
              strokeWidth={2.5}
              fill="url(#painGradient)"
              dot={{ r: 4, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2.5 rounded-xl bg-muted/50">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-orange-500" />
          </div>
          <div className="text-lg font-bold text-foreground">{totalAttacks}</div>
          <div className="text-[10px] text-muted-foreground">Total attacks</div>
        </div>
        <div className="text-center p-2.5 rounded-xl bg-muted/50">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-red-500" />
          </div>
          <div className="text-lg font-bold text-foreground">{avgPain}</div>
          <div className="text-[10px] text-muted-foreground">Avg pain</div>
        </div>
        <div className="text-center p-2.5 rounded-xl bg-muted/50">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="w-3 h-3 text-violet-500" />
          </div>
          <div className="text-lg font-bold text-foreground truncate text-sm">{topTrigger}</div>
          <div className="text-[10px] text-muted-foreground">Top trigger</div>
        </div>
      </div>

      {/* Expand / collapse detailed list */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
      >
        {expanded ? "Hide" : "Review Full History"}
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 mb-4">
              {data
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
                  >
                    {/* Pain badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${painBgColor(entry.painLevel)}`}
                    >
                      <span className={`text-sm font-bold ${painColor(entry.painLevel)}`}>
                        {entry.painLevel}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-foreground">
                          {shortDate(entry.date)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{entry.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {entry.triggers.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-medium"
                          >
                            {t}
                          </span>
                        ))}
                        {entry.symptoms.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share / Download */}
      <div className="flex gap-2">
        <motion.button
          onClick={handleShare}
          whileTap={{ scale: 0.96 }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share with Doctor
        </motion.button>
        <motion.button
          onClick={handleDownload}
          whileTap={{ scale: 0.96 }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-muted/60 text-foreground text-xs font-semibold hover:bg-muted transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download Report
        </motion.button>
      </div>
    </motion.div>
  );
};
