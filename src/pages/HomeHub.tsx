import { motion } from "framer-motion";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import OnOffToggle from "@/components/OnOffToggle";
import RewardsCard from "@/components/RewardsCard";
import { Diagnosis } from "@/components/OnboardingFlow";
import { ActiveMigraineTimer, PainHistoryChart, generateMockHeadacheHistory } from "@/components/PainHistory";
import { mockRewards } from "@/data/mockUserData";
import {
  Search,
  Mic,
  ClipboardCheck,
  Pill,
  BookOpen,
  Calendar,
  Brain,
  Activity,
  Phone,
  PhoneCall,
  AlertCircle,
  Zap,
  Plus,
  Clock,
  ChevronRight,
} from "lucide-react";

interface HomeHubProps {
  diagnosis: Diagnosis | null;
  onStartCheckin: () => void;
  onNavigate: (tab: "home" | "maps" | "tools" | "profile") => void;
  onOpenLesson?: () => void;
  onOpenAppointments?: () => void;
  onOpenMedications?: () => void;
  onOpenNeuroGPT?: () => void;
  onOpenDiaries?: () => void;
  onLogHeadache?: () => void;
  activeMigraine?: { startTime: Date } | null;
  onStopMigraine?: () => void;
  headacheCount?: number;
  isOnMode: boolean;
  onToggleMode: (isOn: boolean) => void;
  onOpenTriggerMedication?: () => void;
  onOpenPainRelief?: () => void;
}

const HomeHub = ({
  diagnosis,
  onStartCheckin,
  onNavigate,
  onOpenLesson,
  onOpenAppointments,
  onOpenMedications,
  onOpenNeuroGPT,
  onOpenDiaries,
  onLogHeadache,
  activeMigraine,
  onStopMigraine,
  headacheCount = 0,
  isOnMode,
  onToggleMode,
  onOpenTriggerMedication,
  onOpenPainRelief,
}: HomeHubProps) => {
  const isMigraine = diagnosis === "migraine";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = isMigraine
    ? [
        { id: "checkin", label: "Check-in", icon: ClipboardCheck, bg: "bg-blue-500", onClick: onStartCheckin },
        { id: "diary", label: "Diary", icon: BookOpen, bg: "bg-violet-500", onClick: onOpenDiaries },
        { id: "learn", label: "Learn", icon: Brain, bg: "bg-pink-500", onClick: onOpenLesson },
        { id: "neurogpt", label: "NeuroGPT", icon: Mic, bg: "bg-cyan-500", onClick: onOpenNeuroGPT },
      ]
    : [
        { id: "checkin", label: "Check-in", icon: ClipboardCheck, bg: "bg-blue-500", onClick: onStartCheckin },
        { id: "diary", label: "Diary", icon: BookOpen, bg: "bg-violet-500", onClick: onOpenDiaries },
        { id: "learn", label: "Learn", icon: Brain, bg: "bg-pink-500", onClick: onOpenLesson },
        { id: "activity", label: "Activity", icon: Activity, bg: "bg-teal-500", onClick: () => {} },
      ];

  const d = 0.03; // animation delay step

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="px-5 pt-3">
        <Header />
      </div>

      <div className="flex-1 px-5 pb-24 overflow-y-auto">
        {/* PD ON/OFF */}
        {diagnosis === "parkinsons" && (
          <motion.div className="mb-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <OnOffToggle isOn={isOnMode} onChange={onToggleMode} />
          </motion.div>
        )}

        {/* Greeting */}
        <motion.div className="mb-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d }}>
          <h1 className="text-xl font-bold text-foreground">{getGreeting()}! 👋</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isMigraine ? "How's your head today?" : "Ready for your daily routine?"}
          </p>
        </motion.div>

        {/* Search Bar → NeuroGPT */}
        <motion.button
          onClick={onOpenNeuroGPT}
          className="w-full mb-4 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-border shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 2 }}
          whileTap={{ scale: 0.99 }}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-left text-xs text-muted-foreground">Ask anything about your health...</span>
          <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-accent" />
          </div>
        </motion.button>

        {/* LOG HEADACHE — Bold Primary CTA */}
        {isMigraine && (
          <motion.button
            onClick={onLogHeadache}
            className="w-full mb-4 flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20 active:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d * 3 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 48 48" className="w-9 h-9">
                <ellipse cx="24" cy="20" rx="16" ry="18" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2" />
                <circle cx="18" cy="18" r="1.5" fill="white" />
                <circle cx="30" cy="18" r="1.5" fill="white" />
                <line x1="10" y1="10" x2="14" y2="14" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="8" x2="12" y2="14" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                <line x1="38" y1="10" x2="34" y2="14" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                <line x1="36" y1="8" x2="36" y2="14" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                <rect x="20" y="36" width="8" height="5" rx="2" fill="none" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="text-base font-bold leading-tight">Log Headache</div>
              <div className="text-[11px] text-white/80 mt-0.5">Track pain, triggers & symptoms</div>
            </div>
            <Zap className="w-5 h-5 text-yellow-300" />
          </motion.button>
        )}

        {/* Active Migraine Timer */}
        {isMigraine && activeMigraine && onStopMigraine && (
          <motion.div className="mb-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d * 4 }}>
            <ActiveMigraineTimer startTime={activeMigraine.startTime} onStopTimer={onStopMigraine} onOpenReliefGuide={onOpenPainRelief} />
          </motion.div>
        )}

        {/* Pain History (when headaches logged, no active migraine) */}
        {isMigraine && headacheCount > 0 && !activeMigraine && (
          <motion.div className="mb-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d * 4 }}>
            <PainHistoryChart entries={generateMockHeadacheHistory()} />
          </motion.div>
        )}

        {/* Trigger-Medication & Pain Relief Cards — migraine only */}
        {isMigraine && (
          <>
            <motion.button
              onClick={onOpenTriggerMedication}
              className="w-full mb-3 flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/50 text-left"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d * 4.5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Set Triggers & Medicines</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Link triggers to meds & set reminders</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </motion.button>

            <motion.button
              onClick={onOpenPainRelief}
              className="w-full mb-3 flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/50 text-left"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d * 4.7 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Pain Relief Guide</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">What to do for different pain types</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </motion.button>
          </>
        )}

        {/* Rewards & Gamification */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 4.8 }}
        >
          <RewardsCard
            currentStreak={mockRewards.currentStreak}
            totalPoints={mockRewards.totalPoints}
            weeklyProgress={mockRewards.weeklyGoalProgress}
            badges={mockRewards.badges}
          />
        </motion.div>

        {/* Today's Summary */}
        <motion.div
          className="mb-4 rounded-2xl bg-card border border-border/50 p-3.5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 5 }}
        >
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Today</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">0/1</div>
              <div className="text-[10px] text-muted-foreground">Check-ins</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">0/3</div>
              <div className="text-[10px] text-muted-foreground">Meds</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{headacheCount}</div>
              <div className="text-[10px] text-muted-foreground">{isMigraine ? "Attacks" : "Logs"}</div>
            </div>
          </div>
        </motion.div>

        {/* Medicine Schedule Card */}
        <motion.button
          onClick={onOpenMedications}
          className="w-full mb-3 flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/50 text-left"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 6 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground">Medicine Schedule</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {isMigraine
                ? "We'll remind you about your medications"
                : "Track your daily doses"}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Plus className="w-4 h-4 text-accent" />
            <span className="text-[10px] text-accent font-semibold">Add</span>
          </div>
        </motion.button>

        {/* Appointments Card */}
        <motion.button
          onClick={onOpenAppointments}
          className="w-full mb-4 flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/50 text-left"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 7 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground">Appointments</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Your next visit • Add appointment</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.button>

        {/* Quick Access */}
        <motion.section
          className="mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 8 }}
        >
          <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Quick Access</h2>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card border border-border/50 active:bg-muted transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.bg}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* Emergency Contacts */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d * 9 }}
        >
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-card border border-border/50 active:bg-muted">
            <Phone className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] font-semibold text-foreground">Doctor</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-card border border-border/50 active:bg-muted">
            <PhoneCall className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] font-semibold text-foreground">Caregiver</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 active:bg-destructive/20">
            <AlertCircle className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[11px] font-semibold text-destructive">911</span>
          </button>
        </motion.div>
      </div>

      <BottomNav activeTab="home" onTabChange={onNavigate} />
    </div>
  );
};

export default HomeHub;
