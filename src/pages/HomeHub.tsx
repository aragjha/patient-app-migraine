import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import OnOffToggle from "@/components/OnOffToggle";
import ThemeToggle from "@/components/ThemeToggle";
import AskAnythingBar from "@/components/home/AskAnythingBar";
import StreakPill from "@/components/home/StreakPill";
import PatternInsightCard from "@/components/home/PatternInsightCard";
import TodayMedsStrip from "@/components/home/TodayMedsStrip";
import RewardsNudge from "@/components/home/RewardsNudge";
import { Diagnosis } from "@/components/OnboardingFlow";
import { ActiveMigraineTimer } from "@/components/PainHistory";
import { ScriptId } from "@/data/neuraScripts";
import {
  ClipboardCheck,
  BookOpen,
  Brain,
  Activity,
  Sparkles,
  Play,
  Check,
  ArrowRight,
} from "lucide-react";

interface HomeHubProps {
  diagnosis: Diagnosis | null;
  onStartCheckin: () => void;
  onNavigate: (tab: "home" | "maps" | "tools" | "profile") => void;
  onOpenLesson?: () => void;
  onOpenAppointments?: () => void;
  onOpenMedications?: () => void;
  onOpenNeuroGPT?: () => void;
  onOpenNeuraWithScript?: (scriptId: ScriptId | null) => void;
  onOpenNeuraWithQuery?: (query: string) => void;
  onOpenDiaries?: () => void;
  onLogHeadache?: () => void;
  activeMigraine?: { startTime: Date } | null;
  onStopMigraine?: () => void;
  headacheCount?: number;
  isOnMode: boolean;
  onToggleMode: (isOn: boolean) => void;
  onOpenTriggerMedication?: () => void;
  onOpenPainRelief?: () => void;
  onOpenTriggerAnalysis?: () => void;
}

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

const HomeHub = ({
  diagnosis,
  onStartCheckin,
  onNavigate,
  onOpenLesson,
  onOpenNeuroGPT,
  onOpenNeuraWithScript,
  onOpenNeuraWithQuery,
  onOpenDiaries,
  onOpenMedications,
  onLogHeadache,
  activeMigraine,
  onStopMigraine,
  headacheCount = 0,
  isOnMode,
  onToggleMode,
  onOpenPainRelief,
}: HomeHubProps) => {
  const isMigraine = diagnosis === "migraine";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Neura-first handlers
  const handleNeuroGPTClick = onOpenNeuraWithScript
    ? () => onOpenNeuraWithScript(null)
    : (onOpenNeuroGPT ?? (() => {}));
  const handleLogHeadacheClick = onOpenNeuraWithScript
    ? () => onOpenNeuraWithScript("headache-log")
    : (onLogHeadache ?? (() => {}));
  const handleDailyCheckinClick = onOpenNeuraWithScript
    ? () => onOpenNeuraWithScript("daily-checkin")
    : onStartCheckin;
  const handleAsk = (query: string) => {
    if (onOpenNeuraWithQuery) onOpenNeuraWithQuery(query);
    else handleNeuroGPTClick();
  };

  const pdQuickActions = [
    { id: "checkin", label: "Check-in", icon: ClipboardCheck, bg: "bg-blue-500", onClick: onStartCheckin },
    { id: "diary", label: "Diary", icon: BookOpen, bg: "bg-violet-500", onClick: onOpenDiaries },
    { id: "learn", label: "Learn", icon: Brain, bg: "bg-pink-500", onClick: onOpenLesson },
    { id: "activity", label: "Activity", icon: Activity, bg: "bg-teal-500", onClick: () => {} },
  ];

  const d = 0.04;

  // Editorial home reserved for the migraine track; PD keeps its current layout.
  if (!isMigraine) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <div className="px-5 pt-3 pb-24 overflow-y-auto flex-1">
          {diagnosis === "parkinsons" && (
            <motion.div className="mb-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <OnOffToggle isOn={isOnMode} onChange={onToggleMode} />
            </motion.div>
          )}

          <motion.div className="mb-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d }}>
            <h1 className="text-xl font-bold text-foreground">{getGreeting()}! 👋</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ready for your daily routine?</p>
          </motion.div>

          <motion.section className="mb-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d * 2 }}>
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Quick Access</h2>
            <div className="grid grid-cols-4 gap-2">
              {pdQuickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.onClick}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card border border-border/50 active:bg-muted transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.bg}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-foreground">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.section>
        </div>
        <BottomNav activeTab="home" onTabChange={onNavigate} />
      </div>
    );
  }

  // Migraine editorial home
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="flex-1 px-5 pt-3 pb-24 overflow-y-auto">
        {/* Top bar: brand + streak pill */}
        <motion.div
          className="flex items-center justify-between mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-[15px]"
              style={{ background: "linear-gradient(135deg, #1B2A4E, #3B82F6)", fontFamily: "'Fraunces', Georgia, serif" }}
            >
              N
            </div>
            <div className="leading-tight">
              <div className="text-[11px] text-muted-foreground font-medium">NeuroCare</div>
              <div className="text-[13px] font-bold text-foreground">Good, Maya.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StreakPill streak={12} points={480} onClick={() => onNavigate("profile")} />
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Editorial greeting */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d, duration: 0.4 }}
        >
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2">
            {getGreeting()} · {formatDate(new Date())}
          </div>
          <h1
            className="text-[40px] leading-[1.05] font-extrabold tracking-tight text-foreground m-0"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            How's your <em className="italic text-accent font-extrabold">head</em>
            <br />
            today?
          </h1>
        </motion.div>

        {/* Ask anything — opens Neura with the query */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 2, duration: 0.4 }}
        >
          <AskAnythingBar onAsk={handleAsk} />
        </motion.div>

        {/* Hero action — Log headache via Neura */}
        <motion.button
          onClick={handleLogHeadacheClick}
          className="relative w-full text-left rounded-[28px] px-5 py-6 overflow-hidden text-white mb-3"
          style={{
            background:
              "linear-gradient(145deg, #1B2A4E 0%, #2A3E6E 60%, #3B82F6 140%)",
            boxShadow: "0 16px 36px rgba(27,42,78,0.25)",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 3, duration: 0.4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="absolute -right-10 -top-10 w-[180px] h-[180px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(96,165,250,0.35), transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/65 mb-2">Right now</div>
            <div className="text-[26px] font-bold leading-[1.1] tracking-tight mb-1">Log a headache</div>
            <div className="text-[13px] text-white/75 mb-4">Neura will walk you through it · ~45 sec</div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold bg-white/15 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} /> Start with Neura
            </div>
          </div>
        </motion.button>

        {/* Secondary row — check-in + relief */}
        <motion.div
          className="grid grid-cols-2 gap-2.5 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 4, duration: 0.4 }}
        >
          <button
            onClick={handleDailyCheckinClick}
            className="relative text-left bg-card border border-border rounded-[22px] p-4 active:scale-[0.98] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#FEF3D6] text-[#B97B12]">
              <Check className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="text-sm font-bold text-foreground mb-0.5">Daily check-in</div>
            <div className="text-[11px] text-muted-foreground">3 taps · +30 pts</div>
            <div className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#FF6B5C]" />
          </button>
          <button
            onClick={onOpenPainRelief}
            className="text-left bg-card border border-border rounded-[22px] p-4 active:scale-[0.98] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-accent" style={{ background: "var(--accent-soft)" }}>
              <Play className="w-4 h-4" strokeWidth={0} fill="currentColor" />
            </div>
            <div className="text-sm font-bold text-foreground mb-0.5">Relief guide</div>
            <div className="text-[11px] text-muted-foreground">12 min · audio</div>
          </button>
        </motion.div>

        {/* Active migraine timer */}
        {activeMigraine && onStopMigraine && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d * 5 }}
          >
            <ActiveMigraineTimer
              startTime={activeMigraine.startTime}
              onStopTimer={onStopMigraine}
              onOpenReliefGuide={onOpenPainRelief}
            />
          </motion.div>
        )}

        {/* Pattern insight */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 6, duration: 0.4 }}
        >
          <PatternInsightCard
            attacksThisMonth={headacheCount || 4}
            onSeeDiary={onOpenDiaries}
            onAskNeura={handleNeuroGPTClick}
          />
        </motion.div>

        {/* Today's meds */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 7, duration: 0.4 }}
        >
          <TodayMedsStrip onSeeAll={onOpenMedications} />
        </motion.div>

        {/* Rewards nudge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 8, duration: 0.4 }}
        >
          <RewardsNudge onClick={() => onNavigate("profile")} />
        </motion.div>

        {/* Quick-access Neura chip */}
        <motion.button
          onClick={handleNeuroGPTClick}
          className="mt-4 w-full flex items-center justify-between p-3 rounded-2xl bg-card border border-border text-left active:scale-[0.99] transition-transform"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 9, duration: 0.4 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#1B2A4E] via-[#7C3AED] to-[#3B82F6] text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="text-[13px] font-semibold text-foreground">Open Neura chat</div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>

      <BottomNav activeTab="home" onTabChange={onNavigate} />
    </div>
  );
};

export default HomeHub;
