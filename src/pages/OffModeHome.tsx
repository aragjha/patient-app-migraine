import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import SelectionChip from "@/components/SelectionChip";
import OnOffToggle from "@/components/OnOffToggle";
import { Phone, PhoneCall, AlertCircle, Timer, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface OffModeHomeProps {
  onSwitchToOn: () => void;
}

const symptoms = [
  { id: "frozen", label: "I feel frozen", icon: "🧊" },
  { id: "stiffness", label: "Severe stiffness", icon: "💪" },
  { id: "tremor", label: "Tremor worse", icon: "🫨" },
  { id: "dizzy", label: "Dizzy / faint", icon: "💫" },
  { id: "anxious", label: "Anxious / panicky", icon: "😰" },
  { id: "unsure", label: "Not sure", icon: "❓" },
];

const missedMedsOptions = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "unsure", label: "Not sure" },
];

const OffModeHome = ({ onSwitchToOn }: OffModeHomeProps) => {
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [missedMeds, setMissedMeds] = useState<string | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showTimer && timerStart) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - timerStart.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showTimer, timerStart]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLogAndStartTimer = () => {
    if (!selectedSymptom) {
      setShowHint(true);
      return;
    }
    setTimerStart(new Date());
    setShowTimer(true);
  };

  const handleBackToOn = () => {
    setShowTimer(false);
    setTimerStart(null);
    setElapsed(0);
    setSelectedSymptom(null);
    setMissedMeds(null);
    onSwitchToOn();
  };

  const handleQuickAction = (action: "caregiver" | "doctor" | "911") => {
    // In a real app, these would trigger actual calls or show contact sheets
    console.log(`Quick action: ${action}`);
  };

  const isDizzySelected = selectedSymptom === "dizzy";

  // Timer Screen
  if (showTimer) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="px-4 pt-safe-top">
          <Header showThemeToggle={true} />
        </div>

        <div className="flex-1 px-4 pb-32 overflow-y-auto">
          {/* Timer Section */}
          <motion.div
            className="text-center mb-8 pt-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Timer className="w-8 h-8 text-warning" />
              <h1 className="text-h1-lg text-foreground">OFF timer</h1>
            </div>

            {/* Big Timer */}
            <motion.div
              className="text-6xl font-bold text-foreground mb-4 font-mono"
              key={elapsed}
              initial={{ scale: 1.02 }}
              animate={{ scale: 1 }}
            >
              {formatTime(elapsed)}
            </motion.div>

            <p className="text-body text-muted-foreground mb-6">
              Started at {timerStart?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>

            {/* Log Summary Chips */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
                Most: {symptoms.find(s => s.id === selectedSymptom)?.label}
              </span>
              <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
                Meds: {missedMeds ? missedMedsOptions.find(m => m.id === missedMeds)?.label : "Not sure"}
              </span>
            </div>
          </motion.div>

          {/* Safety Contacts - Always visible during OFF period */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-h2 text-foreground mb-4">Safety Contacts</h2>
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                onClick={() => handleQuickAction("caregiver")}
                className="glass-card flex flex-col items-center justify-center py-4 gap-2"
                whileTap={{ scale: 0.98 }}
              >
                <Phone className="w-6 h-6 text-accent" />
                <span className="text-sm font-semibold text-foreground text-center">Call caregiver</span>
              </motion.button>

              <motion.button
                onClick={() => handleQuickAction("doctor")}
                className="glass-card flex flex-col items-center justify-center py-4 gap-2"
                whileTap={{ scale: 0.98 }}
              >
                <PhoneCall className="w-6 h-6 text-accent" />
                <span className="text-sm font-semibold text-foreground text-center">Call doctor</span>
              </motion.button>

              <motion.button
                onClick={() => handleQuickAction("911")}
                className="glass-card flex flex-col items-center justify-center py-4 gap-2 border-2 border-destructive/50"
                whileTap={{ scale: 0.98 }}
              >
                <AlertCircle className="w-6 h-6 text-destructive" />
                <span className="text-sm font-semibold text-destructive text-center">Call 911</span>
              </motion.button>
            </div>
          </motion.section>
        </div>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-gradient-to-t from-background to-transparent">
          <motion.button
            onClick={handleBackToOn}
            className="w-full min-h-[56px] px-6 rounded-2xl font-semibold bg-accent text-accent-foreground shadow-cta flex items-center justify-center gap-2 hover:bg-[hsl(var(--accent-hover))] transition-colors duration-200"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            I'm back ON
          </motion.button>
        </div>
      </div>
    );
  }

  // Main OFF Mode Screen
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-safe-top">
        <Header showThemeToggle={true} />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-32 overflow-y-auto">
        {/* ON/OFF Toggle at top */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OnOffToggle 
            isOn={false} 
            onChange={(isOn) => isOn && onSwitchToOn()} 
          />
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-h1-lg text-foreground mb-1">OFF mode</h1>
          <p className="text-body text-muted-foreground">2 quick questions.</p>
        </motion.div>

        {/* Question 1: Symptoms */}
        <motion.section
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-h2 text-foreground mb-3">What's happening most?</h2>
          <div className="grid grid-cols-2 gap-2">
            {symptoms.map((symptom) => (
              <SelectionChip
                key={symptom.id}
                label={symptom.label}
                icon={<span>{symptom.icon}</span>}
                selected={selectedSymptom === symptom.id}
                onClick={() => {
                  setSelectedSymptom(symptom.id);
                  setShowHint(false);
                }}
              />
            ))}
          </div>
          {showHint && !selectedSymptom && (
            <p className="text-sm text-warning mt-2">Pick one option (or tap Not sure).</p>
          )}
        </motion.section>

        {/* Question 2: Missed Meds */}
        <motion.section
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-h2 text-foreground mb-3">Did you miss meds?</h2>
          <div className="flex gap-2">
            {missedMedsOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => setMissedMeds(option.id)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-2xl font-semibold text-base transition-all min-h-[48px]",
                  missedMeds === option.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground border-2 border-border"
                )}
                whileTap={{ scale: 0.98 }}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Safety Banner (if dizzy selected) */}
        {isDizzySelected && (
          <motion.div
            className="bg-warning/20 border border-warning/50 rounded-2xl p-4 mb-4 flex items-center gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="text-sm text-foreground">If you feel faint or unsafe, call for help.</p>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.section
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              onClick={() => handleQuickAction("caregiver")}
              className={cn(
                "glass-card flex flex-col items-center justify-center py-4 gap-2 transition-all",
                isDizzySelected && "ring-2 ring-warning animate-pulse"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="w-6 h-6 text-accent" />
              <span className="text-sm font-semibold text-foreground text-center">Call caregiver</span>
            </motion.button>

            <motion.button
              onClick={() => handleQuickAction("doctor")}
              className={cn(
                "glass-card flex flex-col items-center justify-center py-4 gap-2 transition-all",
                isDizzySelected && "ring-2 ring-warning animate-pulse"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <PhoneCall className="w-6 h-6 text-accent" />
              <span className="text-sm font-semibold text-foreground text-center">Call doctor</span>
            </motion.button>

            <motion.button
              onClick={() => handleQuickAction("911")}
              className="glass-card flex flex-col items-center justify-center py-4 gap-2 border-2 border-destructive/50"
              whileTap={{ scale: 0.98 }}
            >
              <AlertCircle className="w-6 h-6 text-destructive" />
              <span className="text-sm font-semibold text-destructive text-center">Call 911</span>
            </motion.button>
          </div>
        </motion.section>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-gradient-to-t from-background to-transparent">
        <motion.button
          onClick={handleLogAndStartTimer}
          className="w-full min-h-[56px] px-6 rounded-2xl font-semibold bg-accent text-accent-foreground shadow-cta flex items-center justify-center gap-2 hover:bg-[hsl(var(--accent-hover))] transition-colors duration-200"
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Log & start timer
        </motion.button>
        
        {/* Footer trust line */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Private • Secure • You control your data</p>
        </div>
      </div>
    </div>
  );
};

export default OffModeHome;
