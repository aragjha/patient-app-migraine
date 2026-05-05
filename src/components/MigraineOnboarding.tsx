import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check } from "lucide-react";

/**
 * Migraine onboarding — 7-step flow
 * Steps: role → stage → gender → menstrual (female only) → goals → freq → pain → ready
 */

interface MigraineOnboardingProps {
  onComplete: (profile: MigraineProfile) => void;
  onSkip?: () => void;
  onBack?: () => void;
  onAddMedications?: (profile: MigraineProfile) => void;
  onMenstrualEnabled?: () => void;
}

export interface MigraineProfile {
  role: string | null;
  stage: string | null;
  sex: string | null;
  menstrual: string | null;
  freq: string | null;
  pain: number;
  triggers: string[];
  goals: string[];
}

type StepId = "role" | "stage" | "gender" | "menstrual" | "goals" | "freq" | "pain";

const ALL_STEPS: StepId[] = ["role", "stage", "gender", "menstrual", "goals", "freq", "pain"];

const PAIN_FACES = ["😌", "🙂", "😐", "😕", "😟", "😣", "😖", "😫", "😩", "🥵"];

// ───────────────────────── Building blocks ─────────────────────────

const FlowHeader = ({ step, total, onBack }: { step: number; total: number; onBack: () => void }) => (
  <div className="px-5 pt-14 pb-2 flex items-center gap-3">
    <button onClick={onBack} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:bg-muted/70" aria-label="Back">
      <ChevronLeft className="w-5 h-5" strokeWidth={2.2} />
    </button>
    <div className="flex-1 h-1.5 rounded-sm bg-foreground/10 overflow-hidden">
      <div
        className="h-full rounded-sm transition-[width] duration-300"
        style={{ width: `${Math.max(4, (step / total) * 100)}%`, background: "linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)" }}
      />
    </div>
    <div className="w-10 text-xs text-muted-foreground text-right tabular-nums">{step}/{total}</div>
  </div>
);

const PrimaryBtn = ({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full h-14 rounded-[28px] border-0 text-white text-base font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:cursor-not-allowed"
    style={{
      background: disabled ? "hsl(var(--border))" : "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
      color: disabled ? "hsl(var(--muted-foreground))" : "#fff",
      boxShadow: disabled ? "none" : "0 8px 22px rgba(59,130,246,0.32)",
    }}
  >
    {children}
  </button>
);

const ChoiceCard = ({ selected, onClick, emoji, label, desc, dot }: {
  selected?: boolean; onClick: () => void; emoji?: string; label: string; desc?: string; dot?: string;
}) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 rounded-[18px] border-2 flex gap-3.5 items-center transition-all duration-150"
    style={{
      background: selected ? "var(--accent-soft, hsl(var(--accent) / 0.1))" : "hsl(var(--card))",
      borderColor: selected ? "hsl(var(--accent))" : "hsl(var(--border))",
    }}
  >
    {emoji && <div className="text-[26px] leading-none">{emoji}</div>}
    {dot && (
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: dot }} />
    )}
    <div className="flex-1">
      <div className="text-[15px] font-bold text-foreground">{label}</div>
      {desc && <div className="text-[13px] text-muted-foreground mt-0.5">{desc}</div>}
    </div>
    {selected && <Check className="w-[18px] h-[18px] text-accent" strokeWidth={3} />}
  </button>
);

const StepShell = ({ step, total, onBack, onNext, nextLabel = "Continue", nextDisabled, title, sub, children }: {
  step: number; total: number; onBack: () => void; onNext: () => void;
  nextLabel?: string; nextDisabled?: boolean; title: string; sub?: string; children: React.ReactNode;
}) => (
  <div className="absolute inset-0 flex flex-col bg-background text-foreground">
    <FlowHeader step={step} total={total} onBack={onBack} />
    <div className="px-6 pt-4 flex-1 overflow-y-auto">
      <div className="text-[30px] font-medium tracking-tight leading-[1.1] text-foreground mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
        {title}
      </div>
      {sub && <div className="text-muted-foreground text-[14.5px] leading-[1.5] mb-5">{sub}</div>}
      <div className="pb-5">{children}</div>
    </div>
    <div className="px-6 pt-3 pb-7">
      <PrimaryBtn onClick={onNext} disabled={nextDisabled}>{nextLabel}</PrimaryBtn>
    </div>
  </div>
);

// ───────────────────────── Main component ─────────────────────────

const MigraineOnboarding = ({ onComplete, onBack, onAddMedications, onMenstrualEnabled }: MigraineOnboardingProps) => {
  const [stepId, setStepId] = useState<StepId>("role");
  const [data, setData] = useState<MigraineProfile>({
    role: null, stage: null, sex: null, menstrual: null, freq: null, pain: 6, triggers: [], goals: [],
  });

  const computeVisible = (sex: string | null): StepId[] =>
    ALL_STEPS.filter((s) => s !== "menstrual" || sex === "female");

  const visibleSteps = computeVisible(data.sex);
  const stepIdx = visibleSteps.indexOf(stepId);
  const total = visibleSteps.length;

  const upd = <K extends keyof MigraineProfile>(k: K, v: MigraineProfile[K]) => setData((d) => ({ ...d, [k]: v }));

  // Advance using a freshly-computed visibleSteps that takes the just-updated
  // data into account. Pass overrides for fields that were just set in the
  // same click handler — necessary because React state updates are async,
  // so reading `data` directly after `upd` in the same closure returns stale.
  const advanceFrom = (current: StepId, overrides: Partial<MigraineProfile> = {}) => {
    const nextSex = overrides.sex !== undefined ? overrides.sex : data.sex;
    const fresh = computeVisible(nextSex);
    const idx = fresh.indexOf(current);
    const nextIdx = idx + 1;
    if (idx === -1 || nextIdx >= fresh.length) {
      handleComplete();
      return;
    }
    setStepId(fresh[nextIdx]);
  };

  const next = () => advanceFrom(stepId);

  const back = () => {
    if (stepIdx <= 0) { onBack?.(); return; }
    setStepId(visibleSteps[stepIdx - 1]);
  };

  const toggleGoal = (v: string) => {
    setData((d) => {
      const cur = d.goals;
      if (cur.includes(v)) return { ...d, goals: cur.filter((x) => x !== v) };
      if (cur.length >= 2) return { ...d, goals: [cur[1], v] }; // keep last 2
      return { ...d, goals: [...cur, v] };
    });
  };

  const painColor = data.pain <= 3 ? "#16A34A" : data.pain <= 6 ? "#E8A838" : "#FF6B5C";
  const painLabel = data.pain <= 3 ? "Mild" : data.pain <= 6 ? "Moderate" : data.pain <= 8 ? "Severe" : "Debilitating";

  const handleComplete = () => {
    // Persist onboarding profile fields to localStorage
    localStorage.setItem("nc-role", data.role || "");
    localStorage.setItem("nc-stage", data.stage || "");
    localStorage.setItem("nc-gender", data.sex || "");
    localStorage.setItem("nc-frequency", data.freq || "");
    localStorage.setItem("nc-pain", String(data.pain));
    localStorage.setItem("nc-goals", JSON.stringify(data.goals));
    if (["yes", "pattern"].includes(data.menstrual ?? "")) {
      localStorage.setItem("nc-menstrual-enabled", "true");
      onMenstrualEnabled?.();
    }
    if (onAddMedications) onAddMedications(data);
    else onComplete(data);
  };

  const handleSkipMeds = () => {
    // Persist onboarding profile fields to localStorage
    localStorage.setItem("nc-role", data.role || "");
    localStorage.setItem("nc-stage", data.stage || "");
    localStorage.setItem("nc-gender", data.sex || "");
    localStorage.setItem("nc-frequency", data.freq || "");
    localStorage.setItem("nc-pain", String(data.pain));
    localStorage.setItem("nc-goals", JSON.stringify(data.goals));
    if (["yes", "pattern"].includes(data.menstrual ?? "")) {
      localStorage.setItem("nc-menstrual-enabled", "true");
      onMenstrualEnabled?.();
    }
    onComplete(data);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepId}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22 }}
        className="relative min-h-[100dvh]"
      >
        {/* STEP 1 — Role */}
        {stepId === "role" && (
          <StepShell step={1} total={total} onBack={back} onNext={next} nextDisabled={!data.role}
            title="Let's get to know you"
            sub="This helps us personalise your experience.">
            <div className="flex flex-col gap-2.5">
              {[
                { v: "patient", l: "I have migraines", e: "🙋" },
                { v: "caregiver", l: "I'm a caregiver", e: "💝" },
                { v: "both", l: "Both", e: "🤝" },
              ].map((o) => (
                <ChoiceCard key={o.v} selected={data.role === o.v} onClick={() => { upd("role", o.v); setTimeout(next, 300); }} emoji={o.e} label={o.l} />
              ))}
            </div>
          </StepShell>
        )}

        {/* STEP 2 — Journey stage */}
        {stepId === "stage" && (
          <StepShell step={2} total={total} onBack={back} onNext={next} nextDisabled={!data.stage}
            title="Where are you in your migraine journey?"
            sub="Choose what feels closest.">
            <div className="flex flex-col gap-2.5">
              {[
                { v: "recently", l: "Recently started", e: "🌱" },
                { v: "few_years", l: "A few years in", e: "🌿" },
                { v: "chronic", l: "Chronic migraine", e: "🌳" },
                { v: "unsure", l: "Not sure yet", e: "❓" },
              ].map((o) => (
                <ChoiceCard key={o.v} selected={data.stage === o.v} onClick={() => { upd("stage", o.v); setTimeout(next, 300); }} emoji={o.e} label={o.l} />
              ))}
            </div>
          </StepShell>
        )}

        {/* STEP 3 — Gender identity */}
        {stepId === "gender" && (
          <StepShell step={3} total={total} onBack={back} onNext={next} nextDisabled={!data.sex}
            title="How do you identify?"
            sub="This helps us track the right symptoms — like hormonal triggers.">
            <div className="flex flex-col gap-2.5">
              {[
                { v: "female", l: "Female" },
                { v: "male", l: "Male" },
                { v: "nonbinary", l: "Non-binary" },
                { v: "skip", l: "Prefer not to say" },
              ].map((o) => (
                <ChoiceCard
                  key={o.v}
                  selected={data.sex === o.v}
                  onClick={() => {
                    upd("sex", o.v);
                    // Pass the fresh sex value so advanceFrom sees the new
                    // visibleSteps that includes (or excludes) menstrual.
                    setTimeout(() => advanceFrom("gender", { sex: o.v }), 300);
                  }}
                  label={o.l}
                />
              ))}
            </div>
          </StepShell>
        )}

        {/* STEP 4 — Menstrual cycle (female only) */}
        {stepId === "menstrual" && (
          <StepShell step={4} total={total} onBack={back} onNext={next} nextDisabled={!data.menstrual}
            title="Do your migraines connect to your cycle?"
            sub="About 60% of women with migraine notice a menstrual pattern.">
            <div className="flex flex-col gap-2.5">
              {[
                { v: "pattern", l: "Yes, I notice a pattern", d: "Migraines around my period" },
                { v: "not_sure", l: "Not sure yet", d: "Let's track and find out" },
                { v: "no", l: "No", d: "Skip this tracking" },
              ].map((o) => (
                <ChoiceCard key={o.v} selected={data.menstrual === o.v} onClick={() => { upd("menstrual", o.v); setTimeout(next, 300); }} label={o.l} desc={o.d} />
              ))}
            </div>
          </StepShell>
        )}

        {/* STEP 5 — Goals (up to 2) */}
        {stepId === "goals" && (
          <StepShell step={visibleSteps.indexOf("goals") + 1} total={total} onBack={back} onNext={next} nextDisabled={data.goals.length === 0}
            title="What do you want most from NeuroCare?"
            sub="Pick what matters — we'll shape your experience around it.">
            <div className="flex flex-col gap-2.5">
              {[
                { v: "triggers", l: "Find my triggers", e: "⚡" },
                { v: "relief", l: "Find what relieves my pain", e: "✨" },
                { v: "understand", l: "Understand my migraine better", e: "🧠" },
                { v: "doctor", l: "Communicate better with my doctor", e: "👩‍⚕️" },
              ].map((o) => (
                <ChoiceCard key={o.v} selected={data.goals.includes(o.v)} onClick={() => toggleGoal(o.v)} emoji={o.e} label={o.l} />
              ))}
            </div>
            <p className="text-[12px] text-muted-foreground text-center mt-3">Pick up to 2</p>
          </StepShell>
        )}

        {/* STEP 6 — Frequency */}
        {stepId === "freq" && (
          <StepShell step={visibleSteps.indexOf("freq") + 1} total={total} onBack={back} onNext={next} nextDisabled={!data.freq}
            title="How often do you get migraines?"
            sub="A rough estimate is fine.">
            <div className="flex flex-col gap-2.5">
              {[
                { v: "episodic", l: "1–3 per month", d: "Episodic", dot: "#16A34A" },
                { v: "moderate", l: "4–7 per month", d: "Moderate", dot: "#E8A838" },
                { v: "frequent", l: "8–14 per month", d: "Frequent", dot: "#F97316" },
                { v: "chronic", l: "15+ per month", d: "Chronic", dot: "#EF4444" },
              ].map((o) => (
                <ChoiceCard key={o.v} selected={data.freq === o.v} onClick={() => { upd("freq", o.v); setTimeout(next, 300); }} dot={o.dot} label={o.l} desc={o.d} />
              ))}
            </div>
          </StepShell>
        )}

        {/* STEP 7 — Pain intensity */}
        {stepId === "pain" && (
          <StepShell step={visibleSteps.indexOf("pain") + 1} total={total} onBack={back} onNext={next} nextLabel="Continue"
            title="On a bad day, how intense is the pain?"
            sub="Slide to rate your typical worst.">
            <div className="py-8 px-5 rounded-3xl bg-card border-[1.5px] text-center" style={{ borderColor: "hsl(var(--border))" }}>
              <div className="text-[72px] leading-none mb-2">{PAIN_FACES[data.pain]}</div>
              <div className="text-[56px] font-medium leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif", color: painColor, letterSpacing: "-0.03em" }}>
                {data.pain}<span className="text-[22px] text-muted-foreground font-normal">/10</span>
              </div>
              <div className="text-sm text-muted-foreground mt-2.5 font-semibold">{painLabel}</div>
              <input
                type="range" min={0} max={9} value={data.pain}
                onChange={(e) => upd("pain", Number(e.target.value))}
                className="w-full mt-7 h-1.5"
                style={{ accentColor: painColor }}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 font-semibold">
                <span>NONE</span><span>WORST</span>
              </div>
            </div>
          </StepShell>
        )}

      </motion.div>
    </AnimatePresence>
  );
};

export default MigraineOnboarding;
