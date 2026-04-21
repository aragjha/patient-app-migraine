import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import CTAButton from "@/components/CTAButton";
import GratificationScreen from "@/components/GratificationScreen";
import HeadDiagram, { HEAD_ZONES, BACK_ZONES } from "@/components/HeadDiagram";
import PainSlider from "@/components/PainSlider";
import { migraineAttackQuestions, AttackStep } from "@/data/migraineQuestionnaireContent";

interface LogHeadacheFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

type FlowStep =
  | "head-select"
  | "pain-level"
  | "timing"
  | "symptoms"
  | "triggers"
  | "medications"
  | "relief"
  | "notes"
  | "complete";

const stepOrder: FlowStep[] = [
  "head-select",
  "pain-level",
  "timing",
  "symptoms",
  "triggers",
  "medications",
  "relief",
  "notes",
];

const timingPresets = [
  { id: "just_now", label: "Just now" },
  { id: "1h_ago", label: "1h ago" },
  { id: "2h_ago", label: "2h ago" },
  { id: "this_morning", label: "This morning" },
  { id: "ongoing", label: "Still going" },
];

const painLabels: Record<number, { label: string; emoji: string }> = {
  0: { label: "No pain", emoji: "😊" },
  1: { label: "Barely noticeable", emoji: "🙂" },
  2: { label: "Hurts a bit", emoji: "😐" },
  3: { label: "Mild", emoji: "😐" },
  4: { label: "Uncomfortable", emoji: "🙁" },
  5: { label: "Moderate", emoji: "😣" },
  6: { label: "Moderate-Severe", emoji: "😣" },
  7: { label: "Severe", emoji: "😖" },
  8: { label: "Very Severe", emoji: "😖" },
  9: { label: "Hurts worst", emoji: "😫" },
  10: { label: "Worst imaginable", emoji: "😫" },
};

const painColors = [
  "bg-green-400", "bg-green-400", "bg-lime-400", "bg-yellow-300",
  "bg-yellow-400", "bg-amber-400", "bg-orange-400", "bg-orange-500",
  "bg-red-400", "bg-red-500", "bg-red-600",
];

const LogHeadacheFlow = ({ onComplete, onBack }: LogHeadacheFlowProps) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("head-select");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState(5);
  const [timing, setTiming] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  const [headView, setHeadView] = useState<"front" | "back">("front");

  const stepIndex = stepOrder.indexOf(currentStep);
  const totalSteps = stepOrder.length;

  const handleToggleZone = (zoneId: string) => {
    setSelectedZones((prev) =>
      prev.includes(zoneId) ? prev.filter((z) => z !== zoneId) : [...prev, zoneId]
    );
  };

  const handleMultiSelect = (stepId: string, optionId: string) => {
    const current = answers[stepId] || [];
    if (current.includes(optionId)) {
      setAnswers({ ...answers, [stepId]: current.filter((v) => v !== optionId) });
    } else {
      setAnswers({ ...answers, [stepId]: [...current, optionId] });
    }
  };

  const goNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex >= stepOrder.length) {
      setCurrentStep("complete");
    } else {
      setCurrentStep(stepOrder[nextIndex]);
    }
  };

  const goBack = () => {
    if (stepIndex <= 0) {
      onBack();
    } else {
      setCurrentStep(stepOrder[stepIndex - 1]);
    }
  };

  // Get attack question by id
  const getQuestion = (id: string) => migraineAttackQuestions.find((q) => q.id === id);

  if (currentStep === "complete") {
    return (
      <GratificationScreen
        title="Headache Logged ✅"
        subtitle="Tracking attacks helps identify patterns and triggers."
        onContinue={onComplete}
        ctaText="Back to Home"
        type="success"
      />
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case "head-select":
        return (
          <motion.div
            key="head-select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-xl font-bold text-foreground mb-1">Show us where it hurts</h2>
            <p className="text-sm text-muted-foreground mb-3">Tap the areas — you can check both sides</p>

            {/* Front / Back toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setHeadView("front")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  headView === "front" ? "bg-accent/20 text-accent border border-accent" : "bg-muted/50 text-muted-foreground border border-transparent"
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setHeadView("back")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  headView === "back" ? "bg-accent/20 text-accent border border-accent" : "bg-muted/50 text-muted-foreground border border-transparent"
                }`}
              >
                Back
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <HeadDiagram
                selectedZones={selectedZones}
                onToggleZone={handleToggleZone}
                view={headView}
              />
            </div>

            {selectedZones.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedZones.map((z) => {
                  const allZones = [...HEAD_ZONES, ...BACK_ZONES];
                  const zone = allZones.find((zd) => zd.id === z);
                  return (
                    <span
                      key={z}
                      className="px-3 py-1 rounded-full bg-red-500/15 text-red-500 text-xs font-medium"
                    >
                      {zone?.label ?? z.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  );
                })}
              </div>
            )}

            <CTAButton size="full" onClick={goNext} disabled={selectedZones.length === 0}>
              Next
            </CTAButton>
          </motion.div>
        );

      case "pain-level":
        return (
          <motion.div
            key="pain-level"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-xl font-bold text-foreground mb-1">At its worst, how bad was the pain?</h2>
            <p className="text-sm text-muted-foreground mb-6">Slide or tap to rate</p>

            <div className="flex-1 flex flex-col items-center justify-center">
              <PainSlider value={painLevel} onChange={setPainLevel} />
            </div>

            <CTAButton size="full" onClick={goNext} className="mt-6">
              Next
            </CTAButton>
          </motion.div>
        );

      case "timing":
        return (
          <motion.div
            key="timing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-xl font-bold text-foreground mb-1">When did you first notice it?</h2>
            <p className="text-sm text-muted-foreground mb-6">Pick the closest option</p>

            <div className="flex-1 flex flex-col justify-center space-y-3">
              {timingPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setTiming(preset.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    timing === preset.id
                      ? "bg-accent/20 border-accent text-foreground"
                      : "bg-card border-border text-foreground hover:border-accent/50"
                  }`}
                >
                  <span className="text-base font-medium">{preset.label}</span>
                </button>
              ))}
            </div>

            <CTAButton size="full" onClick={goNext} disabled={!timing} className="mt-6">
              Next
            </CTAButton>
          </motion.div>
        );

      case "symptoms": {
        const q = getQuestion("symptoms_during");
        if (!q) return null;
        const selected = answers["symptoms_during"] || [];
        return (
          <motion.div
            key="symptoms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-xl font-bold text-foreground mb-1">{q.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{q.helper}</p>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleMultiSelect("symptoms_during", opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    selected.includes(opt.id)
                      ? "bg-accent/20 border-accent"
                      : "bg-card border-border hover:border-accent/50"
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>

            <CTAButton size="full" onClick={goNext}>
              {selected.length > 0 ? "Next" : "Skip"}
            </CTAButton>
          </motion.div>
        );
      }

      case "triggers": {
        const q = getQuestion("triggers");
        if (!q) return null;
        const selected = answers["triggers"] || [];
        return (
          <motion.div
            key="triggers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-xl font-bold text-foreground mb-1">{q.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{q.helper}</p>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleMultiSelect("triggers", opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    selected.includes(opt.id)
                      ? "bg-accent/20 border-accent"
                      : "bg-card border-border hover:border-accent/50"
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>

            <CTAButton size="full" onClick={goNext}>
              {selected.length > 0 ? "Next" : "Skip"}
            </CTAButton>
          </motion.div>
        );
      }

      case "medications": {
        const q = getQuestion("medications_taken");
        if (!q) return null;
        const selected = answers["medications_taken"] || [];
        return (
          <motion.div
            key="medications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-xl font-bold text-foreground mb-1">{q.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{q.helper}</p>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleMultiSelect("medications_taken", opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    selected.includes(opt.id)
                      ? "bg-accent/20 border-accent"
                      : "bg-card border-border hover:border-accent/50"
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>

            <CTAButton size="full" onClick={goNext}>
              {selected.length > 0 ? "Next" : "Skip"}
            </CTAButton>
          </motion.div>
        );
      }

      case "relief": {
        const q = getQuestion("relief_methods");
        if (!q) return null;
        const selected = answers["relief_methods"] || [];
        return (
          <motion.div
            key="relief"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-xl font-bold text-foreground mb-1">{q.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{q.helper}</p>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleMultiSelect("relief_methods", opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    selected.includes(opt.id)
                      ? "bg-accent/20 border-accent"
                      : "bg-card border-border hover:border-accent/50"
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>

            <CTAButton size="full" onClick={goNext}>
              {selected.length > 0 ? "Next" : "Skip"}
            </CTAButton>
          </motion.div>
        );
      }

      case "notes":
        return (
          <motion.div
            key="notes"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-xl font-bold text-foreground mb-1">Anything else on your mind about this one?</h2>
            <p className="text-sm text-muted-foreground mb-6">Optional — jot down anything unusual.</p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Headache woke me up at 3am, took sumatriptan 30 min after onset..."
              className="flex-1 min-h-[120px] p-4 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
              maxLength={500}
            />

            <CTAButton size="full" onClick={goNext} className="mt-6">
              Save
            </CTAButton>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header with Progress */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={goBack} className="p-1 -ml-1 text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs text-muted-foreground font-medium">
            {stepIndex + 1} / {totalSteps}
          </span>
          <div className="w-6" />
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #ef4444, #f97316, #eab308)" }}
            initial={{ width: 0 }}
            animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-6 flex flex-col overflow-y-auto">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LogHeadacheFlow;
