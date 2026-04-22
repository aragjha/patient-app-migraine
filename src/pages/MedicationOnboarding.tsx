import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, Pill, Plus, Search, X } from "lucide-react";
import { Medication, generateId } from "@/data/medicationContent";

/**
 * Medication Onboarding — ported from the Claude Design prototype.
 * Flow: intro → hub (3 categories) → picker sheet → hub with cabinet list → complete.
 * Emits a list of Medication objects mapped to the existing data model.
 */

interface MedicationOnboardingProps {
  onComplete: (medications: Medication[]) => void;
  onBack: () => void;
}

type MedKind = "acute" | "preventive" | "supplement";

interface Preset {
  id: string;
  name: string;
  dosage: number;
  kind: MedKind;
  color: string;
}

const PRESETS: Preset[] = [
  { id: "sumatriptan", name: "Sumatriptan", dosage: 50, kind: "acute", color: "#FF6B5C" },
  { id: "rimegepant", name: "Rimegepant", dosage: 75, kind: "acute", color: "#7C3AED" },
  { id: "ibuprofen", name: "Ibuprofen", dosage: 400, kind: "acute", color: "#E8A838" },
  { id: "propranolol", name: "Propranolol", dosage: 80, kind: "preventive", color: "#3B82F6" },
  { id: "topiramate", name: "Topiramate", dosage: 50, kind: "preventive", color: "#16A34A" },
  { id: "magnesium", name: "Magnesium", dosage: 400, kind: "supplement", color: "#06B6D4" },
];

const CATEGORIES: { k: MedKind; t: string; s: string; c: string; bg: string }[] = [
  { k: "acute", t: "Acute relief", s: "Triptans, NSAIDs, gepants", c: "#FF6B5C", bg: "#FFE8E4" },
  { k: "preventive", t: "Preventive daily", s: "Beta-blockers, anti-seizure", c: "#3B82F6", bg: "#EFF6FF" },
  { k: "supplement", t: "Supplements", s: "Magnesium, B2, CoQ10", c: "#16A34A", bg: "#DCFCE7" },
];

// ─── Shared UI ───

const FlowHeader = ({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  onBack: () => void;
}) => (
  <div className="px-5 pt-14 pb-2 flex items-center gap-3">
    <button
      onClick={onBack}
      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:bg-muted/70"
      aria-label="Back"
    >
      <ChevronLeft className="w-5 h-5" strokeWidth={2.2} />
    </button>
    <div className="flex-1 h-1.5 rounded-sm bg-foreground/10 overflow-hidden">
      <div
        className="h-full rounded-sm transition-[width] duration-300"
        style={{
          width: `${Math.max(0, (step / total) * 100)}%`,
          background: "linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)",
        }}
      />
    </div>
    <div className="w-10 text-xs text-muted-foreground text-right tabular-nums">
      {step}/{total}
    </div>
  </div>
);

const PrimaryBtn = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full h-14 rounded-[28px] border-0 text-white text-base font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:cursor-not-allowed"
    style={{
      background: disabled
        ? "hsl(var(--border))"
        : "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
      color: disabled ? "hsl(var(--muted-foreground))" : "#fff",
      boxShadow: disabled ? "none" : "0 8px 22px rgba(59,130,246,0.32)",
    }}
  >
    {children}
  </button>
);

const GhostBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="w-full h-13 py-3.5 rounded-[26px] cursor-pointer bg-transparent border-[1.5px] border-border text-foreground text-[15px] font-semibold"
  >
    {children}
  </button>
);

// Convert a picked Preset into the app's Medication model.
const presetToMedication = (p: Preset): Medication => ({
  id: generateId(),
  name: p.name,
  dosage: p.dosage,
  quantity: 1,
  type: "tablet",
  frequency: p.kind === "acute" ? "as_needed" : "once",
  times: p.kind === "acute" ? [] : ["morning"],
  reminderEnabled: p.kind !== "acute",
  color: p.color,
});

// ─── Main component ───

type Screen = "intro" | "hub" | "picker";

const MedicationOnboarding = ({ onComplete, onBack }: MedicationOnboardingProps) => {
  const [screen, setScreen] = useState<Screen>("intro");
  const [picker, setPicker] = useState<MedKind | null>(null);
  const [meds, setMeds] = useState<Array<Medication & { _kind: MedKind }>>([]);

  const addPreset = (p: Preset) => {
    if (meds.find((m) => m.name === p.name && m.dosage === p.dosage)) return;
    setMeds((m) => [...m, { ...presetToMedication(p), _kind: p.kind }]);
    setPicker(null);
    setScreen("hub");
  };

  const removeMed = (id: string) => setMeds((m) => m.filter((x) => x.id !== id));

  const finish = () => {
    const clean = meds.map(({ _kind, ...rest }) => rest);
    onComplete(clean);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${screen}-${picker ?? "none"}`}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25 }}
        className="relative min-h-[100dvh]"
      >
        {screen === "intro" && (
          <div className="absolute inset-0 flex flex-col bg-background text-foreground">
            <FlowHeader step={0} total={2} onBack={onBack} />
            <div className="flex-1 px-7 py-[10px] flex flex-col justify-center">
              <div
                className="text-[40px] font-medium leading-[1.05] text-foreground mb-3.5"
                style={{ fontFamily: "'Fraunces', Georgia, serif", letterSpacing: "-0.03em" }}
              >
                Your medication cabinet.
              </div>
              <div className="text-muted-foreground text-base leading-[1.55] mb-7">
                Track what you take, when. We'll flag overuse risk and refill reminders — quietly,
                in the background.
              </div>
              <div
                className="p-4 rounded-[18px] flex gap-3 items-start"
                style={{
                  background: "var(--accent-soft, hsl(var(--accent) / 0.1))",
                  border: "1px solid rgba(59,130,246,0.20)",
                }}
              >
                <Lock className="w-[22px] h-[22px] text-accent shrink-0 mt-0.5" strokeWidth={2} />
                <div className="text-[13.5px] text-foreground leading-[1.5] font-medium">
                  Medication data is encrypted end-to-end. Not shared without your explicit consent.
                </div>
              </div>
            </div>
            <div className="px-6 pb-7 pt-3">
              <PrimaryBtn onClick={() => setScreen("hub")}>Continue</PrimaryBtn>
            </div>
          </div>
        )}

        {screen === "hub" && picker === null && (
          <div className="absolute inset-0 flex flex-col bg-background text-foreground">
            <FlowHeader step={1} total={2} onBack={() => setScreen("intro")} />
            <div className="px-6 pt-4 flex-1 overflow-y-auto">
              <div
                className="text-[30px] font-medium tracking-tight leading-[1.1] text-foreground mb-1.5"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Add your medications
              </div>
              <div className="text-muted-foreground text-[14.5px] leading-[1.5] mb-5">
                Start with the most common. Skip any section that doesn't apply.
              </div>

              <div className="flex flex-col gap-3 mb-5">
                {CATEGORIES.map((cat) => {
                  const count = meds.filter((m) => m._kind === cat.k).length;
                  return (
                    <button
                      key={cat.k}
                      onClick={() => setPicker(cat.k)}
                      className="text-left p-4 rounded-[20px] bg-card border-[1.5px] border-border flex items-center gap-3.5 active:scale-[0.99] transition-transform"
                    >
                      <div
                        className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center shrink-0"
                        style={{ background: cat.bg, color: cat.c }}
                      >
                        <Pill className="w-6 h-6" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[15.5px] font-bold text-foreground">{cat.t}</div>
                        <div className="text-[12.5px] text-muted-foreground mt-0.5">{cat.s}</div>
                      </div>
                      {count > 0 && (
                        <div
                          className="px-2.5 py-1 rounded-[10px] text-[12px] font-extrabold"
                          style={{ background: cat.bg, color: cat.c }}
                        >
                          {count} added
                        </div>
                      )}
                      <ChevronRight className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2.2} />
                    </button>
                  );
                })}
              </div>

              {meds.length > 0 && (
                <>
                  <div className="text-[11px] font-extrabold text-muted-foreground tracking-[0.12em] mb-2.5">
                    IN YOUR CABINET
                  </div>
                  <div className="flex flex-col gap-2">
                    {meds.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-[14px] bg-card border border-border flex items-center gap-3"
                      >
                        <div
                          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0"
                          style={{ background: m.color + "22", color: m.color }}
                        >
                          <Pill className="w-[18px] h-[18px]" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-foreground">{m.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {m.dosage} mg · {m._kind}
                          </div>
                        </div>
                        <button
                          onClick={() => removeMed(m.id)}
                          className="bg-transparent border-0 cursor-pointer text-muted-foreground p-1.5"
                          aria-label={`Remove ${m.name}`}
                        >
                          <X className="w-4 h-4" strokeWidth={2.2} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="px-6 pb-7 pt-3 flex flex-col gap-2.5">
              <PrimaryBtn onClick={finish}>
                {meds.length
                  ? `Continue with ${meds.length} med${meds.length > 1 ? "s" : ""}`
                  : "Done"}
              </PrimaryBtn>
              {meds.length === 0 && (
                <button
                  onClick={finish}
                  className="h-11 bg-transparent border-0 cursor-pointer text-muted-foreground text-sm font-semibold"
                >
                  Skip — I'll add later
                </button>
              )}
            </div>
          </div>
        )}

        {screen === "hub" && picker !== null && (
          <div className="absolute inset-0 flex flex-col bg-background text-foreground">
            <FlowHeader step={1} total={2} onBack={() => setPicker(null)} />
            <div className="px-6 pt-4 flex-1 overflow-y-auto">
              <div
                className="text-[28px] font-medium tracking-tight leading-[1.1] text-foreground mb-1"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {picker === "acute"
                  ? "Acute relief"
                  : picker === "preventive"
                  ? "Preventive"
                  : "Supplement"}
              </div>
              <div className="text-muted-foreground text-sm mb-5">
                Tap a medication to add it. You can customize dose next.
              </div>
              <div className="flex flex-col gap-2.5">
                {PRESETS.filter((p) => p.kind === picker).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addPreset(p)}
                    className="text-left p-3.5 rounded-2xl bg-card border-[1.5px] border-border flex items-center gap-3.5 active:scale-[0.99] transition-transform"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: p.color + "22", color: p.color }}
                    >
                      <Pill className="w-[22px] h-[22px]" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-bold text-foreground">{p.name}</div>
                      <div className="text-[12.5px] text-muted-foreground mt-0.5">
                        {p.dosage} mg
                      </div>
                    </div>
                    <Plus className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2.5} />
                  </button>
                ))}
                <div className="p-3.5 rounded-2xl border-[1.5px] border-dashed border-border flex items-center gap-3.5 text-muted-foreground">
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 text-sm font-semibold">Search all medications…</div>
                </div>
              </div>
            </div>
            <div className="px-6 pb-7 pt-3">
              <GhostBtn onClick={() => setPicker(null)}>Done</GhostBtn>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MedicationOnboarding;
