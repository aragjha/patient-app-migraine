import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import PainSlider from "@/components/PainSlider";
import GratificationScreen from "@/components/GratificationScreen";
import { HeadacheLog } from "@/types/logs";

interface PostMigraineFlowProps {
  activeMigraine: {
    startTime: Date;
    painPeak?: number;
    zones?: string[];
    medsTaken?: string[];
    attackLogId?: string;
  };
  onComplete: (patch: Partial<HeadacheLog>) => void;
  onBack: () => void;
}

type PostStep = "pain-now" | "helped" | "lingering";
const POST_STEPS: PostStep[] = ["pain-now", "helped", "lingering"];

const HELPED_OPTIONS = [
  { id: "medication", label: "Medication" },
  { id: "rest", label: "Rest" },
  { id: "darkness", label: "Darkness / quiet" },
  { id: "ice", label: "Ice pack" },
  { id: "nothing", label: "Nothing helped" },
];

const LINGERING_OPTIONS = [
  { id: "fatigue", label: "Fatigue" },
  { id: "nausea", label: "Nausea" },
  { id: "neck_stiffness", label: "Neck stiffness" },
  { id: "brain_fog", label: "Brain fog" },
  { id: "none", label: "None" },
];

function formatDuration(start: Date): string {
  const ms = Date.now() - start.getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const RecapCard = ({ am }: { am: PostMigraineFlowProps["activeMigraine"] }) => (
  <div className="bg-card border border-border rounded-[20px] p-4 mb-5">
    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2.5">
      This migraine
    </div>
    <div className="grid grid-cols-2 gap-y-2.5 gap-x-3">
      {[
        { label: "Duration", value: formatDuration(am.startTime) },
        { label: "Peak pain", value: am.painPeak != null ? `${am.painPeak}/10` : "—" },
        { label: "Location", value: am.zones?.slice(0, 2).join(", ") || "—" },
        { label: "Meds taken", value: am.medsTaken?.slice(0, 2).join(", ") || "—" },
      ].map(({ label, value }) => (
        <div key={label}>
          <div className="text-[10px] text-muted-foreground">{label}</div>
          <div className="text-[13px] font-semibold text-foreground truncate">{value}</div>
        </div>
      ))}
    </div>
  </div>
);

const PostMigraineFlow = ({ activeMigraine, onComplete, onBack }: PostMigraineFlowProps) => {
  const [step, setStep] = useState<PostStep>("pain-now");
  const [showComplete, setShowComplete] = useState(false);
  const [painEnd, setPainEnd] = useState(0);
  const [helped, setHelped] = useState<string[]>([]);
  const [lingering, setLingering] = useState<string[]>([]);

  const stepIndex = POST_STEPS.indexOf(step);

  const toggleChip = (setter: React.Dispatch<React.SetStateAction<string[]>>, id: string) => {
    setter((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]);
  };

  const handleNext = () => {
    if (step === "lingering") {
      const patch: Partial<HeadacheLog> = {
        endTime: new Date().toISOString(),
        painEnd,
        reliefEffectiveness: helped.includes("nothing") ? 0 : helped.length > 0 ? 7 : undefined,
        lingeringSymptoms: lingering.filter((l) => l !== "none"),
        status: "ended",
      };
      onComplete(patch);
      setShowComplete(true);
    } else {
      setStep(POST_STEPS[stepIndex + 1]);
    }
  };

  if (showComplete) {
    return (
      <GratificationScreen
        title="Migraine logged."
        subtitle="Rest up — the data is saved. We'll look for patterns as you track more."
        onContinue={onBack}
        ctaText="Back to Home"
        type="success"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-0 cursor-pointer active:bg-muted/70"
          aria-label="Back to home"
        >
          <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </button>
        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${((stepIndex + 1) / POST_STEPS.length) * 100}%`,
              background: "linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)",
            }}
          />
        </div>
        <div className="text-[11px] font-bold text-muted-foreground tabular-nums min-w-[28px] text-right">
          {stepIndex + 1}/{POST_STEPS.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.22 }}
          className="flex-1 flex flex-col px-5 pt-2 pb-8 overflow-y-auto"
        >
          <RecapCard am={activeMigraine} />

          {step === "pain-now" && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">How's the pain now?</h2>
              <p className="text-sm text-muted-foreground mb-6">Rate the pain as it is right now.</p>
              <div className="flex-1 flex flex-col items-center justify-center">
                <PainSlider value={painEnd} onChange={setPainEnd} />
              </div>
              <button
                onClick={handleNext}
                className="w-full h-14 rounded-[28px] border-0 text-white text-base font-bold mt-6 cursor-pointer active:scale-[0.98] transition-transform"
                style={{ background: "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)", boxShadow: "0 8px 22px rgba(59,130,246,0.25)" }}
              >
                Next
              </button>
            </>
          )}

          {step === "helped" && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">What helped most?</h2>
              <p className="text-sm text-muted-foreground mb-5">Select all that apply.</p>
              <div className="flex flex-wrap gap-2.5 mb-8">
                {HELPED_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => toggleChip(setHelped, o.id)}
                    className={`px-4 py-2.5 rounded-full border text-[13px] font-semibold transition-colors cursor-pointer min-h-[44px] ${
                      helped.includes(o.id)
                        ? "bg-accent/15 border-accent text-accent"
                        : "bg-card border-border text-foreground"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={helped.length === 0}
                className="w-full h-14 rounded-[28px] border-0 text-base font-bold cursor-pointer disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
                style={{
                  background: helped.length === 0 ? "hsl(var(--border))" : "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
                  color: helped.length === 0 ? "hsl(var(--muted-foreground))" : "#fff",
                  boxShadow: helped.length === 0 ? "none" : "0 8px 22px rgba(59,130,246,0.25)",
                }}
              >
                Next
              </button>
            </>
          )}

          {step === "lingering" && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Any lingering symptoms?</h2>
              <p className="text-sm text-muted-foreground mb-5">Select all that apply.</p>
              <div className="flex flex-wrap gap-2.5 mb-8">
                {LINGERING_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => toggleChip(setLingering, o.id)}
                    className={`px-4 py-2.5 rounded-full border text-[13px] font-semibold transition-colors cursor-pointer min-h-[44px] ${
                      lingering.includes(o.id)
                        ? "bg-accent/15 border-accent text-accent"
                        : "bg-card border-border text-foreground"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={lingering.length === 0}
                className="w-full h-14 rounded-[28px] border-0 text-base font-bold cursor-pointer disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
                style={{
                  background: lingering.length === 0 ? "hsl(var(--border))" : "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
                  color: lingering.length === 0 ? "hsl(var(--muted-foreground))" : "#fff",
                  boxShadow: lingering.length === 0 ? "none" : "0 8px 22px rgba(59,130,246,0.25)",
                }}
              >
                Done
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PostMigraineFlow;
