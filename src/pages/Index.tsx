import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePersistedState } from "@/hooks/usePersistedState";
import { HeadacheLog, CheckInLog } from "@/types/logs";
import SplashScreen from "@/components/SplashScreen";
import OnboardingFlow, { OnboardingState, Diagnosis } from "@/components/OnboardingFlow";
import AuthPage from "@/pages/AuthPage";
import OtpVerifyPage from "@/pages/OtpVerifyPage";
import HomeHub from "@/pages/HomeHub";
import OffModeHome from "@/pages/OffModeHome";
import DiariesHub from "@/pages/DiariesHub";
import DiaryFlow from "@/pages/DiaryFlow";
import DailyCheckinFlow from "@/pages/DailyCheckinFlow";
import MapsPage from "@/pages/MapsPage";
import ToolsHub from "@/pages/ToolsHub";
import NeuroQueryChat from "@/pages/NeuroQueryChat";
import NeuroGPTChat from "@/pages/NeuroGPTChat";
import NeuraChat from "@/pages/NeuraChat";
import ProfilePage from "@/pages/ProfilePage";
import RewardsPage from "@/pages/RewardsPage";
import ReliefSession from "@/pages/ReliefSession";
import MedicationOnboarding from "@/pages/MedicationOnboarding";
import MedicationHub from "@/pages/MedicationHub";
import MedicationLogScreen from "@/pages/MedicationLogScreen";
import AppointmentsHub from "@/pages/AppointmentsHub";
import GratificationScreen from "@/components/GratificationScreen";
import ConsentScreen from "@/components/ConsentScreen";
import ValuePropScreens from "@/components/ValuePropScreens";
import LogHeadacheFlow from "@/pages/LogHeadacheFlow";
import PainReliefGuide from "@/pages/PainReliefGuide";
import TriggerMedicationFlow from "@/pages/TriggerMedicationFlow";
import TriggerAnalysis from "@/pages/TriggerAnalysis";
import PostMigraineFlow from "@/pages/PostMigraineFlow";
import { getTodaysLesson } from "@/data/lessonContent";
import { getDiaryById } from "@/data/diaryContent";
import { getMigraineDiaryById } from "@/data/migraineDiaryContent";
import { Medication, MedicationLog } from "@/data/medicationContent";
import { Appointment, sampleAppointments } from "@/data/appointmentContent";
import { ScriptId } from "@/data/neuraScripts";

type AppScreen =
  | "splash"
  | "auth"
  | "consent"
  | "value-prop"
  | "onboarding"
  | "onboarding-complete"
  | "home"
  | "home-off"
  | "diaries"
  | "diary-flow"
  | "checkin"
  | "maps"
  | "maps-lesson"
  | "tools"
  | "chat"
  | "neurogpt"
  | "profile"
  | "medication-onboarding"
  | "medication-onboarding-from-flow"
  | "medication-hub"
  | "medication-log"
  | "appointments"
  | "log-headache"
  | "trigger-medication"
  | "pain-relief"
  | "trigger-analysis"
  | "rewards"
  | "relief-session"
  | "verify-otp"
  | "post-migraine";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("splash");
  const [previousScreen, setPreviousScreen] = useState<AppScreen>("home");
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [openDiaryId, setOpenDiaryId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [isGuestUser, setIsGuestUser] = useState(false);
  const [isOnMode, setIsOnMode] = useState(true);

  // Diagnosis state - drives the entire app experience
  const [diagnosis, setDiagnosis] = usePersistedState<Diagnosis | null>("nc-diagnosis", null);

  const [medications, setMedications] = usePersistedState<Medication[]>("nc-medications", []);
  const [medicationLogs, setMedicationLogs] = usePersistedState<MedicationLog[]>("nc-medication-logs", []);
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [savedOnboardingState, setSavedOnboardingState] = useState<OnboardingState | undefined>();

  // Headache tracking
  const [headacheCount, setHeadacheCount] = usePersistedState("nc-headache-count", 0);
  const [attackLogs, setAttackLogs] = usePersistedState<HeadacheLog[]>("nc-attack-logs", []);
  const [checkInLogs, setCheckInLogs] = usePersistedState<CheckInLog[]>("nc-checkin-logs", []);
  const [menstrualEnabled, setMenstrualEnabled] = usePersistedState<boolean>("nc-menstrual-enabled", false);
  const [otpEmail, setOtpEmail] = useState<string>("");
  const [activeMigraine, setActiveMigraine] = useState<{
    startTime: Date;
    painPeak?: number;
    zones?: string[];
    medsTaken?: string[];
    attackLogId?: string;
  } | null>(null);

  // Neura script targeting (set when home tiles/CTAs want Neura to start a specific flow)
  const [neuraInitialScript, setNeuraInitialScript] = useState<ScriptId | null>(null);
  const [neuraInitialQuery, setNeuraInitialQuery] = useState<string | null>(null);

  const updateAttackLog = (id: string, patch: Partial<HeadacheLog>) => {
    setAttackLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  };

  // Load mock data when demo mode is active
  useEffect(() => {
    if (localStorage.getItem("nc-demo-mode") === "true") {
      setDiagnosis("migraine");
      setMedications([
        { id: "med-topiramate", name: "Topiramate (Topamax)", dosage: 100, quantity: 1, type: "tablet" as const, frequency: "once" as const, times: ["evening" as const], reminderEnabled: true, color: "#4ECDC4" },
        { id: "med-sumatriptan", name: "Sumatriptan (Imitrex)", dosage: 50, quantity: 1, type: "tablet" as const, frequency: "as_needed" as const, times: [], reminderEnabled: false, color: "#FF6B6B" },
        { id: "med-ibuprofen", name: "Ibuprofen (Advil)", dosage: 400, quantity: 1, type: "tablet" as const, frequency: "as_needed" as const, times: [], reminderEnabled: false, color: "#45B7D1" },
      ]);
      setHeadacheCount(12);
      if (!localStorage.getItem("nc-consent-at")) {
        localStorage.setItem("nc-consent-at", new Date().toISOString());
      }
      if (!localStorage.getItem("nc-onboarding-complete")) {
        localStorage.setItem("nc-onboarding-complete", "true");
      }
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setIsGuestUser(false);
        const hasConsent = !!localStorage.getItem("nc-consent-at");
        const hasOnboarded = localStorage.getItem("nc-onboarding-complete") === "true";
        if (!hasConsent) {
          setCurrentScreen("consent");
        } else if (hasOnboarded) {
          setCurrentScreen("home");
        } else {
          setCurrentScreen("value-prop");
        }
      } else if (event === "SIGNED_OUT") {
        setIsGuestUser(false);
        setCurrentScreen("splash");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsGuestUser(false);
        setCurrentScreen("home");
      }
      setIsCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSplashContinue = () => setCurrentScreen("auth");
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const handleSplashSignIn = () => { setAuthMode("login"); setCurrentScreen("auth"); };
  const handleSplashGetStarted = () => { setAuthMode("signup"); setCurrentScreen("auth"); };
  const resolvePostAuthScreen = (): AppScreen => {
    const hasConsent = !!localStorage.getItem("nc-consent-at");
    const hasOnboarded = localStorage.getItem("nc-onboarding-complete") === "true";
    if (!hasConsent) return "consent";
    if (hasOnboarded) return "home";
    return "value-prop";
  };
  const handleAuthSuccess = () => {
    setIsGuestUser(false);
    setCurrentScreen(resolvePostAuthScreen());
  };
  const handleNeedsOtpVerify = (email: string) => {
    setOtpEmail(email);
    setCurrentScreen("verify-otp");
  };
  const handleAuthBack = () => setCurrentScreen("splash");
  const handleSkipToHome = () => {
    setIsGuestUser(true);
    setCurrentScreen(resolvePostAuthScreen());
  };
  const handleSkipOnboarding = () => setCurrentScreen("home");

  const handleOnboardingComplete = (selectedDiagnosis: Diagnosis) => {
    setDiagnosis(selectedDiagnosis);
    setCurrentScreen("onboarding-complete");
  };

  const handleOnboardingGratificationComplete = () => {
    localStorage.setItem("nc-onboarding-complete", "true");
    setCurrentScreen("home");
  };

  const handleNavigate = (tab: "home" | "maps" | "tools" | "profile") => {
    setOpenLessonId(null);
    if (tab === "home") {
      // Only PD has ON/OFF mode
      if (diagnosis === "parkinsons" && !isOnMode) {
        setCurrentScreen("home-off");
      } else {
        setCurrentScreen("home");
      }
    } else if (tab === "tools") {
      // Tools tab is deprecated — redirect to home
      setCurrentScreen("home");
    } else {
      setCurrentScreen(tab);
    }
  };

  const handleToggleMode = (isOn: boolean) => {
    setIsOnMode(isOn);
    setCurrentScreen(isOn ? "home" : "home-off");
  };

  // In the prototype, check-in runs as a scripted Neura conversation rather
  // than a standalone modal. Route through Neura with the daily-checkin script.
  const handleStartCheckin = () => {
    setPreviousScreen(currentScreen);
    setNeuraInitialScript("daily-checkin");
    setNeuraInitialQuery(null);
    setCurrentScreen("neurogpt");
  };
  const handleCheckinComplete = (log: CheckInLog) => {
    setCheckInLogs((prev) => [...prev, log]);
    setCurrentScreen("home");
  };
  const handleOpenChat = () => setCurrentScreen("chat");
  const handleOpenNeuroGPT = () => { setPreviousScreen(currentScreen); setNeuraInitialScript(null); setNeuraInitialQuery(null); setCurrentScreen("neurogpt"); };
  const handleOpenNeuraWithScript = (scriptId: ScriptId | null) => {
    setPreviousScreen(currentScreen);
    setNeuraInitialScript(scriptId);
    setNeuraInitialQuery(null);
    setCurrentScreen("neurogpt");
  };
  const handleOpenNeuraWithQuery = (query: string) => {
    setPreviousScreen(currentScreen);
    setNeuraInitialScript(null);
    setNeuraInitialQuery(query);
    setCurrentScreen("neurogpt");
  };
  // Log-headache also runs as a Neura conversation in the prototype.
  const handleLogHeadache = () => {
    setPreviousScreen(currentScreen);
    setNeuraInitialScript("headache-log");
    setNeuraInitialQuery(null);
    setCurrentScreen("neurogpt");
  };
  const handleOpenTriggerMedication = () => { setPreviousScreen(currentScreen); setCurrentScreen("trigger-medication"); };
  const handleOpenPainRelief = () => { setPreviousScreen(currentScreen); setCurrentScreen("pain-relief"); };
  const handleOpenTriggerAnalysis = () => { setPreviousScreen(currentScreen); setCurrentScreen("trigger-analysis"); };

  const handleOpenAppointments = () => {
    setPreviousScreen(currentScreen);
    setCurrentScreen("appointments");
  };

  const handleOpenLesson = () => {
    const todaysLesson = getTodaysLesson();
    setOpenLessonId(todaysLesson.id);
    setPreviousScreen("home");
    setCurrentScreen("maps-lesson");
  };

  const handleLessonClose = () => {
    if (previousScreen === "home") {
      setOpenLessonId(null);
      setCurrentScreen("home");
    }
  };

  const handleOpenDiary = (diaryId: string) => {
    setOpenDiaryId(diaryId);
    setPreviousScreen("diaries");
    setCurrentScreen("diary-flow");
  };

  const handleDiaryComplete = () => { setOpenDiaryId(null); setCurrentScreen("diaries"); };

  const handleOpenMedications = () => {
    setCurrentScreen("medication-hub");
  };

  const handleMedicationOnboardingComplete = (newMeds: Medication[]) => {
    setMedications(newMeds);
    setCurrentScreen("medication-hub");
  };

  const handleMedicationOnboardingFromFlowComplete = (newMeds: Medication[]) => {
    setMedications(newMeds);
    setCurrentScreen("onboarding");
  };

  const handleToggleMedicationReminder = (medId: string) => {
    setMedications((prev) =>
      prev.map((m) => m.id === medId ? { ...m, reminderEnabled: !m.reminderEnabled } : m)
    );
  };

  const handleMedicationLogComplete = (logs: MedicationLog[]) => {
    setMedicationLogs((prev) => [...prev, ...logs]);
    setCurrentScreen("medication-hub");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "splash":
        return <SplashScreen onContinue={handleSplashGetStarted} onSignIn={handleSplashSignIn} />;
      case "auth":
        return <AuthPage onAuthSuccess={handleAuthSuccess} onBack={handleAuthBack} onSkip={handleSkipToHome} initialMode={authMode} onNeedsOtpVerify={handleNeedsOtpVerify} />;
      case "verify-otp":
        return (
          <OtpVerifyPage
            email={otpEmail}
            onVerified={handleAuthSuccess}
            onBack={() => setCurrentScreen("auth")}
          />
        );
      case "consent":
        return (
          <ConsentScreen
            onConsent={() => setCurrentScreen("value-prop")}
            onSignOut={() => supabase.auth.signOut()}
          />
        );
      case "value-prop":
        return (
          <ValuePropScreens
            diagnosis={diagnosis ?? "migraine"}
            onComplete={() => setCurrentScreen("onboarding")}
            onBack={() => setCurrentScreen("consent")}
          />
        );
      case "onboarding":
        return (
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onSkip={handleSkipOnboarding}
            onAddMedications={(state) => {
              setSavedOnboardingState(state);
              setDiagnosis(state.diagnosis ?? null);
              setCurrentScreen("medication-onboarding-from-flow");
            }}
            initialState={savedOnboardingState}
            onMenstrualEnabled={() => setMenstrualEnabled(true)}
          />
        );
      case "onboarding-complete":
        return (
          <GratificationScreen
            title={diagnosis === "migraine" ? "You're all set!" : "Your plan is ready! 🎉"}
            subtitle={diagnosis === "migraine"
              ? "NeuroCare is personalized and ready. Let's start finding your patterns."
              : "Let's start your personalized journey together."}
            onContinue={handleOnboardingGratificationComplete}
            ctaText="Enter NeuroCare"
            type="milestone"
          />
        );
      case "home":
        return (
          <HomeHub
            diagnosis={diagnosis}
            onStartCheckin={handleStartCheckin}
            onNavigate={handleNavigate}
            onOpenLesson={handleOpenLesson}
            onOpenAppointments={handleOpenAppointments}
            onOpenMedications={handleOpenMedications}
            onOpenNeuroGPT={handleOpenNeuroGPT}
            onOpenNeuraWithScript={handleOpenNeuraWithScript}
            onOpenNeuraWithQuery={handleOpenNeuraWithQuery}
            onOpenRewards={() => { setPreviousScreen("home"); setCurrentScreen("rewards"); }}
            onOpenReliefSession={() => { setPreviousScreen("home"); setCurrentScreen("relief-session"); }}
            onOpenDiaries={() => setCurrentScreen("diaries")}
            onLogHeadache={handleLogHeadache}
            activeMigraine={activeMigraine}
            onStopMigraine={() => {
              setPreviousScreen("home");
              setCurrentScreen("post-migraine");
            }}
            headacheCount={headacheCount}
            isOnMode={isOnMode}
            onToggleMode={handleToggleMode}
            onOpenTriggerMedication={handleOpenTriggerMedication}
            onOpenPainRelief={handleOpenPainRelief}
            onOpenTriggerAnalysis={handleOpenTriggerAnalysis}
          />
        );
      case "home-off":
        return <OffModeHome onSwitchToOn={() => handleToggleMode(true)} />;
      case "diaries":
        return (
          <DiariesHub
            onStartCheckin={handleStartCheckin}
            onNavigate={handleNavigate}
            onOpenDiary={handleOpenDiary}
            onOpenNeuraWithScript={handleOpenNeuraWithScript}
            diagnosis={diagnosis}
            attackLogs={attackLogs}
            checkInLogs={checkInLogs}
          />
        );
      case "diary-flow":
        const diary = openDiaryId
          ? (diagnosis === "migraine" ? getMigraineDiaryById(openDiaryId) : getDiaryById(openDiaryId))
          : null;
        if (!diary) return null;
        return (
          <DiaryFlow
            diary={diary}
            onComplete={handleDiaryComplete}
            onBack={() => setCurrentScreen("diaries")}
          />
        );
      case "checkin":
        return (
          <DailyCheckinFlow
            onComplete={handleCheckinComplete}
            onBack={() => setCurrentScreen(previousScreen)}
            diagnosis={diagnosis}
            attackLogs={attackLogs}
            onUpdateAttackNote={(id, note) => updateAttackLog(id, { notes: note })}
          />
        );
      case "maps":
        return <MapsPage onNavigate={handleNavigate} diagnosis={diagnosis} />;
      case "maps-lesson":
        return (
          <MapsPage
            onNavigate={handleNavigate}
            initialLessonId={openLessonId}
            onLessonClose={handleLessonClose}
            diagnosis={diagnosis}
          />
        );
      case "tools":
        return (
          <ToolsHub
            onNavigate={handleNavigate}
            onStartCheckin={handleStartCheckin}
            onOpenChat={handleOpenChat}
            onOpenDiaries={() => setCurrentScreen("diaries")}
            onOpenMedications={handleOpenMedications}
            onOpenAppointments={handleOpenAppointments}
          />
        );
      case "appointments":
        return (
          <AppointmentsHub
            appointments={appointments}
            onUpdateAppointments={setAppointments}
            onBack={() => setCurrentScreen(previousScreen === "appointments" ? "home" : previousScreen)}
          />
        );
      case "medication-onboarding":
        return (
          <MedicationOnboarding
            onComplete={handleMedicationOnboardingComplete}
            onBack={() => setCurrentScreen("medication-hub")}
          />
        );
      case "medication-onboarding-from-flow":
        return (
          <MedicationOnboarding
            onComplete={handleMedicationOnboardingFromFlowComplete}
            onBack={() => setCurrentScreen("onboarding")}
          />
        );
      case "medication-hub":
        return (
          <MedicationHub
            medications={medications}
            onAddMedication={() => setCurrentScreen("medication-onboarding")}
            onEditMedication={(med) => console.log("Edit medication:", med)}
            onToggleReminder={handleToggleMedicationReminder}
            onOpenLog={() => setCurrentScreen("medication-log")}
            onBack={() => setCurrentScreen("home")}
          />
        );
      case "medication-log":
        return (
          <MedicationLogScreen
            medications={medications}
            onComplete={handleMedicationLogComplete}
            onBack={() => setCurrentScreen("medication-hub")}
          />
        );

      case "log-headache":
        return (
          <LogHeadacheFlow
            onComplete={(log) => {
              setHeadacheCount((c) => c + 1);
              setAttackLogs((prev) => [...prev, log]);
              setActiveMigraine({
                startTime: new Date(log.startTime),
                painPeak: log.painPeak,
                zones: log.zones,
                medsTaken: log.medications,
                attackLogId: log.id,
              });
              if (localStorage.getItem("smart-dark-mode") === "true") {
                document.documentElement.classList.add("dark");
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("theme", "dark");
              }
              setCurrentScreen("home");
            }}
            onBack={() => setCurrentScreen(previousScreen === "log-headache" ? "home" : previousScreen)}
          />
        );
      case "trigger-medication":
        return (
          <TriggerMedicationFlow
            onComplete={() => setCurrentScreen("home")}
            onBack={() => setCurrentScreen(previousScreen === "trigger-medication" ? "home" : previousScreen)}
            menstrualEnabled={menstrualEnabled}
          />
        );
      case "pain-relief":
        return (
          <PainReliefGuide
            onBack={() => setCurrentScreen(previousScreen === "pain-relief" ? "home" : previousScreen)}
          />
        );
      case "trigger-analysis":
        return (
          <TriggerAnalysis
            onBack={() => setCurrentScreen(previousScreen === "trigger-analysis" ? "home" : previousScreen)}
          />
        );
      case "chat":
        return <NeuroQueryChat onNavigate={handleNavigate} />;
      case "neurogpt":
        return (
          <NeuraChat
            onBack={() => {
              setNeuraInitialScript(null);
              setNeuraInitialQuery(null);
              setCurrentScreen(previousScreen === "neurogpt" ? "home" : previousScreen);
            }}
            initialScript={neuraInitialScript}
            initialQuery={neuraInitialQuery}
            onOpenTriggerAnalysis={() => {
              setNeuraInitialScript(null);
              setNeuraInitialQuery(null);
              handleOpenTriggerAnalysis();
            }}
            onNavigate={handleNavigate}
            onOpenDiary={() => setCurrentScreen("diaries")}
            onLog={() => {
              setPreviousScreen("neurogpt");
              handleOpenNeuraWithScript("headache-log");
            }}
            onHeadacheLogged={(data) => {
              const log: HeadacheLog = {
                id: crypto.randomUUID(),
                startTime: data.startTime.toISOString(),
                zones: data.zones ?? [],
                painPeak: data.painPeak ?? 5,
                symptoms: [],
                triggers: [],
                medications: [],
                status: "active",
              };
              setAttackLogs((prev) => [...prev, log]);
              setHeadacheCount((c) => c + 1);
              setActiveMigraine({
                startTime: data.startTime,
                zones: data.zones,
                painPeak: data.painPeak,
                attackLogId: log.id,
              });
            }}
          />
        );
      case "profile":
        return (
          <ProfilePage
            onNavigate={handleNavigate}
            onOpenRewards={() => { setPreviousScreen("profile"); setCurrentScreen("rewards"); }}
            onRestartOnboarding={() => setCurrentScreen("splash")}
            onOpenNeura={() => { setPreviousScreen("profile"); handleOpenNeuroGPT(); }}
            onOpenDiary={() => setCurrentScreen("diaries")}
            onLog={() => { setPreviousScreen("profile"); handleOpenNeuraWithScript("headache-log"); }}
          />
        );
      case "relief-session":
        return (
          <ReliefSession
            onClose={() => setCurrentScreen(previousScreen === "relief-session" ? "home" : previousScreen)}
          />
        );
      case "rewards":
        return (
          <RewardsPage
            onBack={() => setCurrentScreen(previousScreen === "rewards" ? "home" : previousScreen)}
            onOpenNeura={() => { setPreviousScreen("rewards"); handleOpenNeuroGPT(); }}
            onOpenNeuraWithScript={(id) => {
              setPreviousScreen("rewards");
              handleOpenNeuraWithScript(id as ScriptId);
            }}
          />
        );
      case "post-migraine":
        if (!activeMigraine) return null;
        return (
          <PostMigraineFlow
            activeMigraine={activeMigraine}
            onComplete={(patch) => {
              if (activeMigraine.attackLogId) {
                updateAttackLog(activeMigraine.attackLogId, patch);
              } else {
                const log: HeadacheLog = {
                  id: crypto.randomUUID(),
                  startTime: activeMigraine.startTime.toISOString(),
                  zones: activeMigraine.zones ?? [],
                  painPeak: activeMigraine.painPeak ?? 0,
                  symptoms: [],
                  triggers: [],
                  medications: activeMigraine.medsTaken ?? [],
                  ...patch,
                  status: "ended",
                };
                setAttackLogs((prev) => [...prev, log]);
              }
              setActiveMigraine(null);
              setCurrentScreen("home");
            }}
            onBack={() => {
              setActiveMigraine(null);
              setCurrentScreen("home");
            }}
          />
        );
      default:
        return <SplashScreen onContinue={handleSplashGetStarted} onSignIn={handleSplashSignIn} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
