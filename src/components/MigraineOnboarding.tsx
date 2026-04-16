import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import CTAButton from "@/components/CTAButton";
import HeadDiagram, { HEAD_ZONES, BACK_ZONES } from "@/components/HeadDiagram";
import PainSlider from "@/components/PainSlider";

/**
 * Dynamic migraine onboarding with DOB, gender, conditional menstrual step,
 * then goals, head pain location, frequency, pain level, warning signs.
 */

interface MigraineOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

const painColors = [
  "#22c55e", "#22c55e", "#84cc16", "#eab308", "#f59e0b",
  "#f97316", "#f97316", "#ef4444", "#dc2626", "#b91c1c", "#991b1b",
];
const painEmojis = ["😊", "🙂", "🙂", "😐", "🙁", "😣", "😣", "😖", "😖", "😫", "😫"];
const painLabels = [
  "No pain", "Barely there", "Hurts a bit", "Mild", "Uncomfortable",
  "Moderate", "Mod-Severe", "Severe", "Very Severe", "Extreme", "Worst",
];

const goalOptions = [
  { id: "triggers", label: "Find my triggers", icon: "⚡", color: "from-violet-500/20 to-violet-600/10 border-violet-500/30" },
  { id: "relief", label: "Find my reliefs", icon: "💊", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30" },
  { id: "understand", label: "Understand migraine", icon: "🧠", color: "from-blue-500/20 to-blue-600/10 border-blue-500/30" },
  { id: "doctor", label: "Talk to my doctor", icon: "👩‍⚕️", color: "from-pink-500/20 to-pink-600/10 border-pink-500/30" },
];

const frequencyOptions = [
  { id: "rare", label: "1-3 / month", sub: "Episodic", color: "bg-green-500" },
  { id: "moderate", label: "4-7 / month", sub: "Moderate", color: "bg-yellow-500" },
  { id: "frequent", label: "8-14 / month", sub: "Frequent", color: "bg-orange-500" },
  { id: "chronic", label: "15+ / month", sub: "Chronic", color: "bg-red-500" },
];

const warningOptions = [
  { id: "yes", label: "Yes, I get warning signs", sub: "Aura, visual changes, tingling, fatigue", icon: "⚠️" },
  { id: "no", label: "No, it hits suddenly", sub: "No prodrome or aura", icon: "⚡" },
  { id: "unsure", label: "I'm not sure yet", sub: "We'll help you figure it out", icon: "🤔" },
];

const genderOptions = [
  { id: "female", label: "Female", icon: "♀️" },
  { id: "male", label: "Male", icon: "♂️" },
  { id: "non-binary", label: "Non-binary", icon: "⚧️" },
  { id: "prefer-not-to-say", label: "Prefer not to say", icon: "🤐" },
];

const menstrualOptions = [
  { id: "yes", label: "Yes, I notice a pattern", sub: "Migraines around my period", icon: "📅" },
  { id: "maybe", label: "I'm not sure yet", sub: "Let's find out together", icon: "🤔" },
  { id: "no", label: "No / Not applicable", sub: "Skip this tracking", icon: "➡️" },
];

type StepId = "dob" | "gender" | "menstrual" | "goals" | "head" | "frequency" | "pain" | "warning";

const MigraineOnboarding = ({ onComplete, onSkip, onBack }: MigraineOnboardingProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [tracksMenstruation, setTracksMenstruation] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [painZones, setPainZones] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string | null>(null);
  const [painLevel, setPainLevel] = useState(5);
  const [warningSign, setWarningSign] = useState<string | null>(null);
  const [headView, setHeadView] = useState<"front" | "back">("front");

  const hasMenstrualStep = gender === "female";
  const stepSequence: StepId[] = useMemo(() => [
    "dob",
    "gender",
    ...(hasMenstrualStep ? ["menstrual" as StepId] : []),
    "goals",
    "head",
    "frequency",
    "pain",
    "warning",
  ], [hasMenstrualStep]);

  const totalSteps = stepSequence.length;
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const currentStepId = stepSequence[stepIndex];

  const toggleGoal = (id: string) => {
    setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  const canContinue = () => {
    switch (currentStepId) {
      case "dob": return dateOfBirth.length > 0;
      case "gender": return gender !== null;
      case "menstrual": return tracksMenstruation !== null;
      case "goals": return goals.length > 0;
      case "head": return painZones.length > 0;
      case "frequency": return frequency !== null;
      case "pain": return true;
      case "warning": return warningSign !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (stepIndex < stepSequence.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const autoAdvance = () => {
    setTimeout(handleNext, 400);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Top bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={handleBack} className="p-1 -ml-1 text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs text-muted-foreground font-medium">{stepIndex + 1} / {totalSteps}</span>
          {onSkip && stepIndex === 0 ? (
            <button onClick={onSkip} className="text-xs text-muted-foreground">Skip</button>
          ) : (
            <div className="w-8" />
          )}
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-6 flex flex-col overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentStepId === "dob" && (
            <motion.div key="dob" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 flex flex-col">
              <h1 className="text-xl font-bold text-foreground mt-4 mb-1">When were you born?</h1>
              <p className="text-sm text-muted-foreground mb-6">This helps us personalize your care plan</p>
              <div className="flex-1 flex flex-col items-center justify-center">
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-4 rounded-2xl bg-card border-2 border-border text-foreground text-lg text-center focus:border-accent focus:outline-none transition-colors"
                />
                {dateOfBirth && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Age: {Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / 31557600000)} years
                  </p>
                )}
              </div>
              <CTAButton size="full" onClick={handleNext} disabled={!canContinue()} className="mt-5">
                Continue
              </CTAButton>
            </motion.div>
          )}

          {currentStepId === "gender" && (
            <motion.div key="gender" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 flex flex-col">
              <h1 className="text-xl font-bold text-foreground mt-4 mb-1">How do you identify?</h1>
              <p className="text-sm text-muted-foreground mb-6">This helps us tailor migraine insights for you</p>
              <div className="flex-1 flex flex-col justify-center gap-3">
                {genderOptions.map((opt) => (
                  <motion.button
                    key={opt.id}
                    onClick={() => { setGender(opt.id); autoAdvance(); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      gender === opt.id
                        ? "border-accent bg-accent/10 shadow-md"
                        : "border-border bg-card hover:border-accent/30"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="text-left flex-1">
                      <div className="text-base font-semibold text-foreground">{opt.label}</div>
                    </div>
                    {gender === opt.id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStepId === "menstrual" && (
            <motion.div key="menstrual" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 flex flex-col">
              <h1 className="text-xl font-bold text-foreground mt-4 mb-1">Do your migraines relate to your menstrual cycle?</h1>
              <p className="text-sm text-muted-foreground mb-6">Hormonal migraines affect ~60% of women with migraine</p>
              <div className="flex-1 flex flex-col justify-center gap-3">
                {menstrualOptions.map((opt) => (
                  <motion.button
                    key={opt.id}
                    onClick={() => { setTracksMenstruation(opt.id); autoAdvance(); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      tracksMenstruation === opt.id
                        ? "border-accent bg-accent/10 shadow-md"
                        : "border-border bg-card hover:border-accent/30"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="text-left flex-1">
                      <div className="text-base font-semibold text-foreground">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.sub}</div>
                    </div>
                    {tracksMenstruation === opt.id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStepId === "goals" && (
            <motion.div key="goals" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 flex flex-col">
              <h1 className="text-xl font-bold text-foreground mt-4 mb-1">What matters most to you right now?</h1>
              <p className="text-sm text-muted-foreground mb-5">Select all that apply</p>
              <div className="flex flex-col gap-3 flex-1 justify-center">
                {goalOptions.map((opt) => (
                  <motion.button
                    key={opt.id}
                    onClick={() => toggleGoal(opt.id)}
                    className={`relative w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all bg-gradient-to-r ${opt.color} ${
                      goals.includes(opt.id) ? "ring-2 ring-accent border-accent shadow-lg" : "border-transparent"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <span className="text-2xl">{opt.icon}</span>
                    </div>
                    <span className="text-base font-semibold text-foreground">{opt.label}</span>
                    {goals.includes(opt.id) && (
                      <div className="ml-auto w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              <CTAButton size="full" onClick={handleNext} disabled={!canContinue()} className="mt-5">
                Continue
              </CTAButton>
            </motion.div>
          )}

          {currentStepId === "head" && (
            <motion.div key="head" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 flex flex-col">
              <h1 className="text-xl font-bold text-foreground mt-4 mb-1">Where do you usually feel the pain?</h1>
              <p className="text-sm text-muted-foreground mb-2">Tap the areas — check both sides</p>

              {/* Front / Back toggle */}
              <div className="flex gap-2 mb-2">
                <button onClick={() => setHeadView("front")}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${headView === "front" ? "bg-accent/20 text-accent border border-accent" : "bg-muted/50 text-muted-foreground border border-transparent"}`}>
                  Front
                </button>
                <button onClick={() => setHeadView("back")}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${headView === "back" ? "bg-accent/20 text-accent border border-accent" : "bg-muted/50 text-muted-foreground border border-transparent"}`}>
                  Back
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center -mt-2">
                <HeadDiagram selectedZones={painZones} onToggleZone={(z) => setPainZones((prev) => prev.includes(z) ? prev.filter((p) => p !== z) : [...prev, z])} view={headView} />
              </div>
              {painZones.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {painZones.map((z) => {
                    const allZones = [...HEAD_ZONES, ...BACK_ZONES];
                    const zone = allZones.find((zd) => zd.id === z);
                    return (
                      <span key={z} className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-500 text-[11px] font-medium">
                        {zone?.label ?? z.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    );
                  })}
                </div>
              )}
              <CTAButton size="full" onClick={handleNext} disabled={!canContinue()}>
                Continue
              </CTAButton>
            </motion.div>
          )}

          {currentStepId === "frequency" && (
            <motion.div key="freq" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 flex flex-col">
              <h1 className="text-xl font-bold text-foreground mt-4 mb-1">How often do you get migraines?</h1>
              <p className="text-sm text-muted-foreground mb-6">An estimate is perfectly fine</p>
              <div className="flex-1 flex flex-col justify-center gap-3">
                {frequencyOptions.map((opt) => (
                  <motion.button
                    key={opt.id}
                    onClick={() => { setFrequency(opt.id); autoAdvance(); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      frequency === opt.id
                        ? "border-accent bg-accent/10 shadow-md"
                        : "border-border bg-card hover:border-accent/30"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-4 h-4 rounded-full ${opt.color} shrink-0`} />
                    <div className="text-left">
                      <div className="text-base font-semibold text-foreground">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.sub}</div>
                    </div>
                    {frequency === opt.id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStepId === "pain" && (
            <motion.div key="pain" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 flex flex-col">
              <h1 className="text-xl font-bold text-foreground mt-4 mb-1">On a typical bad day, how intense is it?</h1>
              <p className="text-sm text-muted-foreground mb-6">Slide or tap to rate</p>
              <div className="flex-1 flex flex-col items-center justify-center">
                <PainSlider value={painLevel} onChange={setPainLevel} />
              </div>
              <CTAButton size="full" onClick={handleNext} className="mt-5">
                Continue
              </CTAButton>
            </motion.div>
          )}

          {currentStepId === "warning" && (
            <motion.div key="warning" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 flex flex-col">
              <h1 className="text-xl font-bold text-foreground mt-4 mb-1">Do you notice anything before an attack starts?</h1>
              <p className="text-sm text-muted-foreground mb-6">Like light sensitivity, visual changes, nausea, yawning...</p>
              <div className="flex-1 flex flex-col justify-center gap-3">
                {warningOptions.map((opt) => (
                  <motion.button
                    key={opt.id}
                    onClick={() => { setWarningSign(opt.id); setTimeout(handleNext, 400); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      warningSign === opt.id
                        ? "border-accent bg-accent/10 shadow-md"
                        : "border-border bg-card hover:border-accent/30"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="text-left flex-1">
                      <div className="text-base font-semibold text-foreground">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.sub}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MigraineOnboarding;
