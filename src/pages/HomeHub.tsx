import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import OnOffToggle from "@/components/OnOffToggle";
import ThemeToggle from "@/components/ThemeToggle";
import TodayMedsStrip from "@/components/home/TodayMedsStrip";
import HomeGuideSheet from "@/components/HomeGuideSheet";
import GuideCoachmark from "@/components/GuideCoachmark";
import TriggerHomeModule from "@/components/home/TriggerHomeModule";
import { Diagnosis } from "@/components/OnboardingFlow";
import { ScriptId } from "@/data/neuraScripts";
import { getStreakData, hasDoneActivityToday, seedStreakDemoData } from "@/data/streakEngine";
import {
  ClipboardCheck,
  BookOpen,
  Brain,
  Activity,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Circle,
  Zap,
  Wind,
  Music,
  Smile,
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
  onOpenRewards?: () => void;
  onOpenDiaries?: () => void;
  onLogHeadache?: () => void;
  activeMigraine?: { startTime: Date; painPeak?: number; zones?: string[]; medsTaken?: string[]; attackLogId?: string } | null;
  onStopMigraine?: () => void;
  headacheCount?: number;
  isOnMode: boolean;
  onToggleMode: (isOn: boolean) => void;
  onOpenTriggerMedication?: () => void;
  onOpenPainRelief?: () => void;
  onOpenReliefSession?: () => void;
  onOpenTriggerAnalysis?: () => void;
  onOpenLastAttack?: () => void;
}

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

function useElapsedMinutes(startTime: Date | null | undefined) {
  const [minutes, setMinutes] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const tick = () => setMinutes(Math.floor((Date.now() - startTime.getTime()) / 60000));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [startTime]);
  return minutes;
}

const HomeHub = ({
  diagnosis,
  onStartCheckin,
  onNavigate,
  onOpenLesson,
  onOpenNeuroGPT,
  onOpenNeuraWithScript,
  onOpenNeuraWithQuery,
  onOpenRewards,
  onOpenDiaries,
  onOpenMedications,
  onLogHeadache,
  activeMigraine,
  onStopMigraine,
  headacheCount = 0,
  isOnMode,
  onToggleMode,
  onOpenPainRelief,
  onOpenReliefSession,
  onOpenLastAttack,
  onOpenTriggerAnalysis,
}: HomeHubProps) => {
  const isMigraine = diagnosis === "migraine";

  const [guideOpen, setGuideOpen] = useState(false);
  const [showCoachmark, setShowCoachmark] = useState(false);
  const [checkinDone, setCheckinDone] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [lastAttackDismissed, setLastAttackDismissed] = useState(true);
  // Hours since the user was last on the app — drives the dynamic hero copy.
  const [hoursSinceLastVisit, setHoursSinceLastVisit] = useState<number | null>(null);
  // Most recent attack (if any) so the hero can reference it on return.
  const [lastAttackDaysAgo, setLastAttackDaysAgo] = useState<number | null>(null);

  useEffect(() => {
    if (!isMigraine) return;
    if (localStorage.getItem("nc-demo-mode") === "true") {
      seedStreakDemoData();
    }
    const sd = getStreakData();
    setStreakCount(sd.currentStreak);
    setCheckinDone(hasDoneActivityToday("check-in"));

    const guideShown = localStorage.getItem("nc-guide-shown");
    if (!guideShown) setShowCoachmark(true);

    const dismissed = localStorage.getItem("nc-last-attack-dismissed");
    setLastAttackDismissed(!!dismissed);

    // Track gap since previous app visit so the hero can welcome the user
    // back contextually. Stamp updates every render of Home — the value
    // captured here reflects the last time *before* this open.
    try {
      const prev = localStorage.getItem("nc-last-visit-at");
      if (prev) {
        const gapMs = Date.now() - new Date(prev).getTime();
        setHoursSinceLastVisit(Math.floor(gapMs / 36e5));
      }
      localStorage.setItem("nc-last-visit-at", new Date().toISOString());
    } catch {}

    // Find days since most recent attack (from persisted attack logs)
    try {
      const raw = localStorage.getItem("nc-attack-logs");
      if (raw) {
        const logs = JSON.parse(raw) as { startTime: string }[];
        if (Array.isArray(logs) && logs.length) {
          const newest = logs
            .slice()
            .sort(
              (a, b) =>
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
            )[0];
          if (newest?.startTime) {
            const gap = Date.now() - new Date(newest.startTime).getTime();
            setLastAttackDaysAgo(Math.floor(gap / 86_400_000));
          }
        }
      }
    } catch {}
  }, [isMigraine]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleNeuroGPTClick = onOpenNeuraWithScript
    ? () => onOpenNeuraWithScript(null)
    : (onOpenNeuroGPT ?? (() => {}));
  const handleLogHeadacheClick = onOpenNeuraWithScript
    ? () => onOpenNeuraWithScript("headache-log")
    : (onLogHeadache ?? (() => {}));
  const handleDailyDiscovery = onOpenNeuraWithScript
    ? () => onOpenNeuraWithScript("daily-discovery")
    : onStartCheckin;

  const elapsedMin = useElapsedMinutes(activeMigraine?.startTime);
  const elapsedHours = Math.floor(elapsedMin / 60);
  const elapsedMins = elapsedMin % 60;
  const elapsedLabel = elapsedHours > 0
    ? `${elapsedHours}h ${elapsedMins}m`
    : `${elapsedMins}m`;

  const pdQuickActions = [
    { id: "checkin", label: "Check-in", icon: ClipboardCheck, bg: "bg-blue-500", onClick: onStartCheckin },
    { id: "diary", label: "Diary", icon: BookOpen, bg: "bg-violet-500", onClick: onOpenDiaries },
    { id: "learn", label: "Learn", icon: Brain, bg: "bg-pink-500", onClick: onOpenLesson },
    { id: "activity", label: "Activity", icon: Activity, bg: "bg-teal-500", onClick: () => {} },
  ];

  // ── PD layout (unchanged) ──────────────────────────────────────────────────
  if (!isMigraine) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <div className="px-5 pt-3 pb-24 overflow-y-auto flex-1">
          {diagnosis === "parkinsons" && (
            <motion.div className="mb-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <OnOffToggle isOn={isOnMode} onChange={onToggleMode} />
            </motion.div>
          )}
          <motion.div className="mb-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl font-bold text-foreground">{getGreeting()}! 👋</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ready for your daily routine?</p>
          </motion.div>
          <motion.section className="mb-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Quick Access</h2>
            <div className="grid grid-cols-4 gap-2">
              {pdQuickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.id} onClick={action.onClick} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card border border-border/50 active:bg-muted transition-colors">
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
        <BottomNav activeTab="home" onTabChange={onNavigate} onOpenDiary={onOpenDiaries} onOpenNeura={handleNeuroGPTClick} onLog={handleLogHeadacheClick} />
      </div>
    );
  }

  // ── Migraine editorial home ────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <div className="flex-1 px-5 pt-4 pb-24 overflow-y-auto">

          {/* Top bar */}
          <motion.div className="flex items-center justify-between mb-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-[15px]" style={{ background: "linear-gradient(135deg, #1B2A4E, #3B82F6)", fontFamily: "'Fraunces', Georgia, serif" }}>
                N
              </div>
              <div className="text-[13px] font-semibold text-muted-foreground">NeuroCare</div>
            </div>
            <div className="flex items-center gap-2">
              {/* Streak pill */}
              <button
                onClick={() => (onOpenRewards ?? (() => onNavigate("profile")))()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
              >
                <span>🔥</span>
                <span>{streakCount > 0 ? `Day ${streakCount}` : "Start streak"}</span>
              </button>
              {/* ? guide icon */}
              <button
                data-coach="guide-button"
                onClick={() => setShowCoachmark(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "hsl(var(--muted))" }}
              >
                <HelpCircle className="w-4.5 h-4.5 text-muted-foreground" style={{ width: 18, height: 18 }} />
              </button>
              <ThemeToggle />
            </div>
          </motion.div>

          {/* Greeting */}
          <motion.div className="mb-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-1.5">
              {getGreeting()} · {formatDate(new Date())}
            </div>
            <h1 className="display text-[38px] text-foreground m-0 leading-[1.05] tracking-tight">
              How's your <em className="italic text-accent">head</em>
              <br />today?
            </h1>
          </motion.div>

          {/* ── EPISODE MODE ── */}
          {activeMigraine ? (
            <motion.div className="mb-4" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.06 }}>
              {/* Active migraine card */}
              <div
                className="rounded-[24px] p-5 mb-3 text-white"
                style={{ background: "linear-gradient(145deg, #7C0000 0%, #DC2626 60%, #EF4444 140%)", boxShadow: "0 16px 36px rgba(220,38,38,0.3)" }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/65 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
                  MIGRAINE ACTIVE
                </div>
                <div className="text-[32px] font-black tracking-tight mb-1">{elapsedLabel}</div>
                <div className="text-[13px] text-white/75 mb-4">Elapsed since onset</div>
                <div className="flex gap-2">
                  <button
                    onClick={onOpenReliefSession ?? onOpenPainRelief}
                    className="flex-1 py-2.5 rounded-full text-[13px] font-bold bg-white/15 backdrop-blur-sm"
                  >
                    Relief ↗
                  </button>
                  <button
                    onClick={onOpenMedications}
                    className="flex-1 py-2.5 rounded-full text-[13px] font-bold bg-white/15 backdrop-blur-sm"
                  >
                    Log medication
                  </button>
                </div>
              </div>

              {/* End migraine — primary, prominent (was buried in muted grey) */}
              <button
                onClick={onStopMigraine}
                className="w-full py-3.5 rounded-[18px] text-[14px] font-bold mb-3 text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                style={{
                  background: "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
                  boxShadow: "0 8px 22px rgba(59,130,246,0.30)",
                }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: "#fff" }}
                />
                End migraine
              </button>

              {/* Quick relief tiles */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "breathing", icon: Wind, label: "Breathe", sub: "4-7-8" },
                  { id: "audio", icon: Music, label: "Calm audio", sub: "Ambient" },
                  { id: "meditation", icon: Smile, label: "Meditate", sub: "Guided" },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={onOpenReliefSession ?? onOpenPainRelief}
                      className="flex flex-col items-center gap-1.5 py-3.5 rounded-[18px] bg-card border border-border active:scale-[0.97] transition-transform"
                    >
                      <Icon className="w-5 h-5 text-accent" />
                      <div className="text-[12px] font-bold text-foreground">{r.label}</div>
                      <div className="text-[10px] text-muted-foreground">{r.sub}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <>
              {/* ── NORMAL MODE ── */}

              {/* First-visit last-attack banner */}
              <AnimatePresence>
                {!lastAttackDismissed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="rounded-[20px] p-4 flex items-center gap-3 relative"
                      style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
                    >
                      <div className="text-2xl">📋</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-foreground mb-0.5">Tell us about your last migraine</div>
                        <div className="text-[11.5px] text-muted-foreground">Primes Neura to find patterns faster.</div>
                      </div>
                      <button
                        onClick={() => {
                          if (onOpenLastAttack) onOpenLastAttack();
                        }}
                        className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold text-white"
                        style={{ background: "#3B82F6" }}
                      >
                        Start →
                      </button>
                      <button
                        onClick={() => {
                          localStorage.setItem("nc-last-attack-dismissed", "true");
                          setLastAttackDismissed(true);
                        }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-muted-foreground"
                        style={{ background: "hsl(var(--muted))" }}
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hero — log headache. Copy adapts to gap since last visit
                  and most-recent attack so returning users see context. */}
              {(() => {
                let eyebrow = "Right now";
                let title = "Log a headache";
                let sub = "Neura will walk you through it · ~45 sec";
                let cta = "Start with Neura";
                if (
                  hoursSinceLastVisit !== null &&
                  hoursSinceLastVisit >= 24
                ) {
                  const days = Math.max(1, Math.round(hoursSinceLastVisit / 24));
                  eyebrow = `Welcome back · ${days} day${days > 1 ? "s" : ""}`;
                  if (lastAttackDaysAgo !== null && lastAttackDaysAgo <= 7) {
                    title = "How are you feeling now?";
                    sub = `Last attack was ${lastAttackDaysAgo} day${lastAttackDaysAgo === 1 ? "" : "s"} ago — Neura wants to check in.`;
                    cta = "Start a check-in";
                  } else {
                    title = "Catch Neura up";
                    sub = "60 sec — log anything that happened since your last visit.";
                    cta = "Log with Neura";
                  }
                } else if (headacheCount === 0) {
                  eyebrow = "First time";
                  title = "Tell Neura about your headaches";
                  sub = "30 sec — sets up your trigger profile.";
                  cta = "Start with Neura";
                } else if (
                  hoursSinceLastVisit !== null &&
                  hoursSinceLastVisit < 4 &&
                  checkinDone
                ) {
                  eyebrow = "Back so soon";
                  title = "Anything new to log?";
                  sub = "Quick add — or just chat.";
                  cta = "Open Neura";
                }
                return (
                  <motion.button
                    data-coach="log-headache"
                    onClick={handleLogHeadacheClick}
                    className="relative w-full text-left rounded-[24px] px-5 py-5 overflow-hidden text-white mb-3"
                    style={{
                      background:
                        "linear-gradient(145deg, #1B2A4E 0%, #2A3E6E 60%, #3B82F6 140%)",
                      boxShadow: "0 16px 36px rgba(27,42,78,0.25)",
                    }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
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
                      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/65 mb-2">
                        {eyebrow}
                      </div>
                      <div className="text-[24px] font-bold leading-[1.1] tracking-tight mb-1">
                        {title}
                      </div>
                      <div className="text-[13px] text-white/75 mb-4">{sub}</div>
                      <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold bg-white/15 backdrop-blur-sm">
                        <Sparkles className="w-3.5 h-3.5" strokeWidth={2} /> {cta}
                      </div>
                    </div>
                  </motion.button>
                );
              })()}

              {/* Daily check-in row */}
              <motion.button
                data-coach="daily-checkin"
                onClick={handleDailyDiscovery}
                className="w-full flex items-center gap-3 p-4 rounded-[20px] bg-card border border-border mb-3 text-left active:scale-[0.98] transition-transform"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
                  style={{ background: checkinDone ? "rgba(16,185,129,0.12)" : "rgba(232,168,56,0.12)" }}
                >
                  {checkinDone
                    ? <CheckCircle2 className="w-5 h-5" style={{ color: "#10B981" }} />
                    : <Sparkles className="w-5 h-5" style={{ color: "#E8A838" }} />}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-foreground">Daily check-in</div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {checkinDone ? "Done today ✓" : "1 min with Neura · Builds your streak"}
                  </div>
                </div>
                {!checkinDone && (
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#E8A838" }} />
                )}
              </motion.button>

              {/* Trigger discovery — carousel for Session 0, correlations for Session 3+.
                  "Open trigger investigation" routes to the dedicated Trigger
                  Analysis page (NOT the Diaries hub — was the bug). */}
              <div className="mb-3" data-coach="trigger-module">
                <TriggerHomeModule
                  onOpenTriggerInvestigation={
                    onOpenTriggerAnalysis ?? onOpenDiaries ?? (() => {})
                  }
                  onStartCheckin={handleDailyDiscovery}
                />
              </div>
            </>
          )}

          {/* Today's meds */}
          <motion.div className="mb-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <TodayMedsStrip onSeeAll={onOpenMedications} />
          </motion.div>

          {/* Open Neura chat chip */}
          <motion.button
            onClick={handleNeuroGPTClick}
            className="w-full flex items-center justify-between p-3.5 rounded-[20px] bg-card border border-border text-left active:scale-[0.99] transition-transform"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#1B2A4E] via-[#7C3AED] to-[#3B82F6] text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-[13px] font-semibold text-foreground">Chat with Neura</div>
            </div>
            <Circle className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>

        <BottomNav
          activeTab="home"
          onTabChange={onNavigate}
          onOpenDiary={onOpenDiaries}
          onOpenNeura={handleNeuroGPTClick}
          onLog={handleLogHeadacheClick}
        />
      </div>

      {/* Guide sheet */}
      <HomeGuideSheet open={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* First-visit coachmark */}
      <AnimatePresence>
        {showCoachmark && (
          <GuideCoachmark onDone={() => setShowCoachmark(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default HomeHub;
