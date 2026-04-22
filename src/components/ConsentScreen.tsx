import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, X } from "lucide-react";
import { consentFullForm, termsShortForm } from "@/data/consentContent";

interface ConsentScreenProps {
  onConsent: () => void;
  onSignOut?: () => void;
  onBack?: () => void;
}

type ConsentRowProps = {
  locked?: boolean;
  checked: boolean;
  onToggle?: () => void;
  title: string;
  desc: string;
};

const ConsentRow = ({ locked, checked, onToggle, title, desc }: ConsentRowProps) => (
  <button
    onClick={locked ? undefined : onToggle}
    disabled={locked}
    className="w-full text-left p-4 bg-card rounded-[18px] border-[1.5px] flex gap-3.5 transition-all duration-150"
    style={{
      borderColor: checked ? "hsl(var(--accent))" : "hsl(var(--border))",
      cursor: locked ? "default" : "pointer",
    }}
  >
    <div
      className="shrink-0 w-6 h-6 flex items-center justify-center mt-0.5 border-[1.5px]"
      style={{
        borderRadius: 7,
        borderColor: checked ? "hsl(var(--accent))" : "hsl(var(--border))",
        background: checked ? "hsl(var(--accent))" : "transparent",
      }}
    >
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </div>
    <div className="flex-1">
      <div className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
        {title}
        {locked && (
          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-[2px] rounded-md tracking-[0.05em]">
            REQUIRED
          </span>
        )}
      </div>
      <div className="text-[13px] leading-[1.45] text-muted-foreground">{desc}</div>
    </div>
  </button>
);

const ConsentScreen = ({ onConsent, onSignOut, onBack }: ConsentScreenProps) => {
  const [sheet, setSheet] = useState<"consent" | "terms" | null>(null);
  const [research, setResearch] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const handleConsent = () => {
    localStorage.setItem("nc-consent-at", new Date().toISOString());
    localStorage.setItem(
      "nc-consent-prefs",
      JSON.stringify({ essential: true, research, marketing }),
    );
    onConsent();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="px-5 pt-14 pb-2 flex items-center gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:bg-muted/70"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.2} />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <div className="flex-1 h-1.5 rounded-sm bg-foreground/10 overflow-hidden">
          <div
            className="h-full w-full rounded-sm"
            style={{ background: "linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)" }}
          />
        </div>
        <div className="w-10 text-xs text-muted-foreground text-right tabular-nums">1/1</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <div className="px-6 pt-5 flex-1 overflow-y-auto">
          <div
            className="text-[34px] font-medium leading-[1.1] text-foreground mb-2"
            style={{ fontFamily: "'Fraunces', Georgia, serif", letterSpacing: "-0.02em" }}
          >
            Your data, your call
          </div>
          <div className="text-muted-foreground text-[14.5px] leading-[1.5] mb-6">
            NeuroCare is HIPAA-compliant. We never sell your information. You can change these anytime in Settings.
          </div>

          <div className="flex flex-col gap-2.5">
            <ConsentRow
              locked
              checked
              title="Essential app data"
              desc="Symptoms, logs, medication history — used to power your dashboard and AI companion. Stays on your account."
            />
            <ConsentRow
              checked={research}
              onToggle={() => setResearch((v) => !v)}
              title="De-identified research"
              desc="Help us understand migraine patterns across users. Never tied to your identity."
            />
            <ConsentRow
              checked={marketing}
              onToggle={() => setMarketing((v) => !v)}
              title="Product updates"
              desc="Occasional emails about new features. No spam — promise."
            />
          </div>

          <div className="mt-5 p-3.5 rounded-[14px] bg-muted text-[12.5px] leading-[1.55] text-muted-foreground">
            By continuing, you agree to our{" "}
            <button onClick={() => setSheet("terms")} className="text-accent font-semibold">
              Terms
            </button>{" "}
            and{" "}
            <button onClick={() => setSheet("consent")} className="text-accent font-semibold">
              Privacy Policy
            </button>
            .
          </div>
        </div>

        <div className="px-6 pb-7 pt-3">
          <button
            onClick={handleConsent}
            className="w-full h-14 rounded-[28px] border-0 cursor-pointer text-white text-base font-bold active:scale-[0.98] transition-transform"
            style={{
              background: "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
              boxShadow: "0 8px 22px rgba(59,130,246,0.32)",
            }}
          >
            I agree — continue
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full text-center text-xs text-muted-foreground mt-3 py-2"
            >
              Not now — sign out
            </button>
          )}
        </div>
      </motion.div>

      {/* Bottom sheet for full consent / T&C */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setSheet(null)}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t border-border shadow-lg-soft max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">
                  {sheet === "consent" ? "Core Patient Consent" : "Terms & Conditions"}
                </h2>
                <button
                  onClick={() => setSheet(null)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                  {sheet === "consent" ? consentFullForm : termsShortForm}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsentScreen;
