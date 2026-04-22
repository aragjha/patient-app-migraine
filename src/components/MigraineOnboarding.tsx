import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Sparkles, BarChart3, Shield } from "lucide-react";

/**
 * Migraine onboarding — 8-step flow ported from the Claude Design prototype.
 * Steps: intro → sex → menstrual (female only) → frequency → pain → triggers → goals → ready.
 */

interface MigraineOnboardingProps {
  onComplete: (profile: MigraineProfile) => void;
  onSkip?: () => void;
  onBack?: () => void;
  onAddMedications?: (profile: MigraineProfile) => void;
}

export interface MigraineProfile {
  sex: string | null;
  menstrual: string | null;
  freq: string | null;
  pain: number;
  triggers: string[];
  goals: string[];
}

type StepId = "intro" | "sex" | "menstrual" | "freq" | "pain" | "triggers" | "goals" | "ready";

const ALL_STEPS: StepId[] = ["intro", "sex", "menstrual", "freq", "pain", "triggers", "goals", "ready"];

const PAIN_FACES = ["😌", "🙂", "😐", "😕", "😟", "😣", "😖", "😫", "😩", "🥵"];

const SEX_OPTIONS = [
  { v: "female", l: "Female", d: "Hormonal cycles often influence patterns" },
  { v: "male", l: "Male" },
  { v: "intersex", l: "Intersex" },
  { v: "skip", l: "Prefer not to say" },
] as const;

const MENSTRUAL_OPTIONS = [
  { v: "yes", l: "Yes, regularly" },
  { v: "irregular", l: "Yes, but irregularly" },
  { v: "peri", l: "Perimenopausal" },
  { v: "no", l: "No / post-menopausal" },
  { v: "skip", l: "Prefer not to say" },
] as const;

const FREQ_OPTIONS = [
  { v: "rare", l: "Rarely", d: "A few times a year" },
  { v: "monthly", l: "Monthly", d: "1–3 attacks a month" },
  { v: "weekly", l: "Weekly", d: "1–3 attacks a week" },
  { v: "chronic", l: "Chronic", d: "15+ headache days a month" },
  { v: "unsure", l: "Not sure yet", d: "That's okay — we'll figure it out together" },
] as const;

const TRIGGER_OPTIONS = [
  { v: "stress", l: "Stress", e: "😰" },
  { v: "sleep", l: "Poor sleep", e: "😴" },
  { v: "screens", l: "Screen time", e: "💻" },
  { v: "weather", l: "Weather", e: "🌦️" },
  { v: "hormonal", l: "Hormones", e: "🔄" },
  { v: "food", l: "Food / alcohol", e: "🍷" },
  { v: "caffeine", l: "Caffeine", e: "☕" },
  { v: "light", l: "Bright light", e: "💡" },
  { v: "smells", l: "Smells", e: "👃" },
  { v: "unsure", l: "Not sure yet", e: "🤷" },
] as const;

const GOAL_OPTIONS = [
  { v: "patterns", l: "Understand my patterns", d: "What triggers my attacks?" },
  { v: "fewer", l: "Have fewer migraines", d: "Track and prevent attacks" },
  { v: "meds", l: "Manage medication", d: "Adherence, refills, overuse alerts" },
  { v: "doctor", l: "Share with my doctor", d: "Clear reports for appointments" },
  { v: "relief", l: "Find quick relief", d: "Tools for when it hits" },
] as const;

// ───────────────────────── Building blocks ─────────────────────────

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

const ChoiceCard = ({
  selected,
  onClick,
  emoji,
  label,
  desc,
}: {
  selected?: boolean;
  onClick: () => void;
  emoji?: string;
  label: string;
  desc?: string;
}) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 rounded-[18px] border-2 flex gap-3.5 items-center transition-all duration-150"
    style={{
      background: selected ? "var(--accent-soft, hsl(var(--accent) / 0.1))" : "hsl(var(--card))",
      borderColor: selected ? "hsl(var(--accent))" : "hsl(var(--border))",
    }}
  >
    {emoji && <div className="text-[28px] leading-none">{emoji}</div>}
    <div className="flex-1">
      <div className="text-[15px] font-bold text-foreground">{label}</div>
      {desc && <div className="text-[13px] text-muted-foreground mt-0.5">{desc}</div>}
    </div>
    {selected && <Check className="w-[18px] h-[18px] text-accent" strokeWidth={3} />}
  </button>
);

const StepShell = ({
  step,
  total,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  title,
  sub,
  children,
}: {
  step: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) => (
  <div className="absolute inset-0 flex flex-col bg-background text-foreground">
    <FlowHeader step={step} total={total} onBack={onBack} />
    <div className="px-6 pt-4 flex-1 overflow-y-auto">
      <div
        className="text-[30px] font-medium tracking-tight leading-[1.1] text-foreground mb-2"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
      >
        {title}
      </div>
      {sub && (
        <div className="text-muted-foreground text-[14.5px] leading-[1.5] mb-5">{sub}</div>
      )}
      <div className="pb-5">{children}</div>
    </div>
    <div className="px-6 pt-3 pb-7">
      <PrimaryBtn onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </PrimaryBtn>
    </div>
  </div>
);

// ───────────────────────── Main component ─────────────────────────

const MigraineOnboarding = ({
  onComplete,
  onBack,
  onAddMedications,
}: MigraineOnboardingProps) => {
  const [stepId, setStepId] = useState<StepId>("intro");
  const [data, setData] = useState<MigraineProfile>({
    sex: null,
    menstrual: null,
    freq: null,
    pain: 6,
    triggers: [],
    goals: [],
  });

  const total = ALL_STEPS.length;
  const stepIdx = ALL_STEPS.indexOf(stepId);

  const upd = <K extends keyof MigraineProfile>(k: K, v: MigraineProfile[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const goto = (id: StepId) => setStepId(id);

  const next = () => {
    const nextIdx = Math.min(stepIdx + 1, ALL_STEPS.length - 1);
    let nextStep = ALL_STEPS[nextIdx];
    // Skip menstrual step if not female
    if (nextStep === "menstrual" && data.sex !== "female") nextStep = "freq";
    setStepId(nextStep);
  };
  const back = () => {
    if (stepIdx <= 0) {
      onBack?.();
      return;
    }
    const prevIdx = stepIdx - 1;
    let prev = ALL_STEPS[prevIdx];
    if (prev === "menstrual" && data.sex !== "female") prev = "sex";
    setStepId(prev);
  };

  const toggleInArray = (k: "triggers" | "goals", v: string) => {
    setData((d) => {
      const cur = d[k] as string[];
      return {
        ...d,
        [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v],
      };
    });
  };

  const painColor =
    data.pain <= 3 ? "#16A34A" : data.pain <= 6 ? "#E8A838" : "#FF6B5C";
  const painLabel =
    data.pain <= 3 ? "Mild" : data.pain <= 6 ? "Moderate" : data.pain <= 8 ? "Severe" : "Debilitating";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepId}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25 }}
        className="relative min-h-[100dvh]"
      >
        {stepId === "intro" && (
          <div className="absolute inset-0 flex flex-col bg-background text-foreground">
            <FlowHeader step={0} total={total} onBack={back} />
            <div className="flex-1 px-7 py-6 flex flex-col justify-center">
              <div
                className="text-[42px] font-medium leading-[1.02] text-foreground mb-4"
                style={{ fontFamily: "'Fraunces', Georgia, serif", letterSpacing: "-0.03em" }}
              >
                Let's get to know
                <br />
                your migraine.
              </div>
              <div className="text-muted-foreground text-base leading-[1.55] mb-8">
                A few questions so Neura can personalize your insights, scripts, and reminders.
              </div>
              <div className="flex flex-col gap-3.5">
                {[
                  { icon: Sparkles, t: "Personalized AI companion", s: "Neura adapts to your specific patterns." },
                  { icon: BarChart3, t: "Pattern detection", s: "Triggers and trends surface as you log." },
                  { icon: Shield, t: "Private by design", s: "Your data is encrypted, never sold." },
                ].map((b) => {
                  const I = b.icon;
                  return (
                    <div key={b.t} className="flex gap-3.5 items-start">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-accent"
                        style={{ background: "var(--accent-soft, hsl(var(--accent) / 0.1))" }}
                      >
                        <I className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="text-[15px] font-bold text-foreground">{b.t}</div>
                        <div className="text-[13px] text-muted-foreground mt-0.5">{b.s}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-6 pt-3 pb-7">
              <PrimaryBtn onClick={next}>Let's begin · 2 min</PrimaryBtn>
            </div>
          </div>
        )}

        {stepId === "sex" && (
          <StepShell
            step={1}
            total={total}
            onBack={back}
            onNext={next}
            nextDisabled={!data.sex}
            title="What's your sex assigned at birth?"
            sub="This helps us understand hormonal patterns — a common migraine trigger."
          >
            <div className="flex flex-col gap-2.5">
              {SEX_OPTIONS.map((o) => (
                <ChoiceCard
                  key={o.v}
                  selected={data.sex === o.v}
                  onClick={() => upd("sex", o.v)}
                  label={o.l}
                  desc={"d" in o ? (o as any).d : undefined}
                />
              ))}
            </div>
          </StepShell>
        )}

        {stepId === "menstrual" && (
          <StepShell
            step={2}
            total={total}
            onBack={back}
            onNext={next}
            nextDisabled={!data.menstrual}
            title="Do you currently menstruate?"
            sub="We can correlate attacks with your cycle if it's relevant."
          >
            <div className="flex flex-col gap-2.5">
              {MENSTRUAL_OPTIONS.map((o) => (
                <ChoiceCard
                  key={o.v}
                  selected={data.menstrual === o.v}
                  onClick={() => upd("menstrual", o.v)}
                  label={o.l}
                />
              ))}
            </div>
          </StepShell>
        )}

        {stepId === "freq" && (
          <StepShell
            step={3}
            total={total}
            onBack={back}
            onNext={next}
            nextDisabled={!data.freq}
            title="How often do migraines hit?"
            sub="A rough estimate is fine — this refines as you log."
          >
            <div className="flex flex-col gap-2.5">
              {FREQ_OPTIONS.map((o) => (
                <ChoiceCard
                  key={o.v}
                  selected={data.freq === o.v}
                  onClick={() => upd("freq", o.v)}
                  label={o.l}
                  desc={o.d}
                />
              ))}
            </div>
          </StepShell>
        )}

        {stepId === "pain" && (
          <StepShell
            step={4}
            total={total}
            onBack={back}
            onNext={next}
            title="Typical pain level?"
            sub="When a migraine hits, how intense does it usually feel?"
          >
            <div
              className="py-8 px-5 rounded-3xl bg-card border-[1.5px] text-center"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <div className="text-[72px] leading-none mb-2">{PAIN_FACES[data.pain]}</div>
              <div
                className="text-[56px] font-medium leading-none"
                style={{ fontFamily: "'Fraunces', Georgia, serif", color: painColor, letterSpacing: "-0.03em" }}
              >
                {data.pain}
                <span className="text-[22px] text-muted-foreground font-normal">/10</span>
              </div>
              <div className="text-sm text-muted-foreground mt-2.5 font-semibold">{painLabel}</div>
              <input
                type="range"
                min={0}
                max={9}
                value={data.pain}
                onChange={(e) => upd("pain", Number(e.target.value))}
                className="w-full mt-7 h-1.5"
                style={{ accentColor: painColor }}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 font-semibold">
                <span>NONE</span>
                <span>WORST</span>
              </div>
            </div>
          </StepShell>
        )}

        {stepId === "triggers" && (
          <StepShell
            step={5}
            total={total}
            onBack={back}
            onNext={next}
            title="Known triggers?"
            sub="Pick any that apply. Neura will track these — and help spot the ones you haven't noticed."
          >
            <div className="grid grid-cols-2 gap-2.5">
              {TRIGGER_OPTIONS.map((o) => {
                const sel = data.triggers.includes(o.v);
                return (
                  <button
                    key={o.v}
                    onClick={() => toggleInArray("triggers", o.v)}
                    className="py-3.5 px-3 rounded-2xl border-2 flex flex-col items-start gap-1.5 transition-all"
                    style={{
                      background: sel ? "var(--accent-soft, hsl(var(--accent) / 0.1))" : "hsl(var(--card))",
                      borderColor: sel ? "hsl(var(--accent))" : "hsl(var(--border))",
                    }}
                  >
                    <div className="text-[22px]">{o.e}</div>
                    <div className="text-[13.5px] font-bold text-foreground">{o.l}</div>
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        {stepId === "goals" && (
          <StepShell
            step={6}
            total={total}
            onBack={back}
            onNext={next}
            nextDisabled={data.goals.length === 0}
            title="What matters most?"
            sub="Pick up to 3. We'll tailor Neura around these."
          >
            <div className="flex flex-col gap-2.5">
              {GOAL_OPTIONS.map((o) => (
                <ChoiceCard
                  key={o.v}
                  selected={data.goals.includes(o.v)}
                  onClick={() => toggleInArray("goals", o.v)}
                  label={o.l}
                  desc={o.d}
                />
              ))}
            </div>
          </StepShell>
        )}

        {stepId === "ready" && (
          <div
            className="absolute inset-0 flex flex-col text-foreground"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--background)) 0%, var(--accent-soft, hsl(var(--accent) / 0.1)) 100%)",
            }}
          >
            <FlowHeader step={total} total={total} onBack={back} />
            <div className="flex-1 px-7 py-5 flex flex-col items-center justify-center text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{
                  background: "linear-gradient(135deg, #16A34A 0%, #3B82F6 100%)",
                  boxShadow: "0 20px 50px rgba(22,163,74,0.35)",
                }}
              >
                <Check className="w-12 h-12 text-white" strokeWidth={3.5} />
              </div>
              <div
                className="text-[36px] font-medium tracking-tight leading-[1.05] text-foreground mb-3"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                You're all set.
              </div>
              <div className="text-muted-foreground text-[15.5px] leading-[1.5] max-w-[300px]">
                Last thing — want to set up your medications now? You can always do it later.
              </div>
            </div>
            <div className="px-6 pb-7 flex flex-col gap-3">
              <PrimaryBtn
                onClick={() => {
                  if (onAddMedications) onAddMedications(data);
                  else onComplete(data);
                }}
              >
                Add my medications
              </PrimaryBtn>
              <button
                onClick={() => onComplete(data)}
                className="h-13 bg-transparent border-0 cursor-pointer text-muted-foreground text-[15px] font-semibold py-3.5"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MigraineOnboarding;
