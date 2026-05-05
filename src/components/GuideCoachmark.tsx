import { useEffect, useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface GuideCoachmarkProps {
  onDone: () => void;
}

interface CoachStep {
  /** data-coach attribute value of the element to spotlight. */
  target: string;
  /** Where the tooltip sits relative to the target. */
  side: "above" | "below";
  /** ~12px label above the title — kept short. */
  eyebrow: string;
  title: string;
  body: string;
}

const STEPS: CoachStep[] = [
  {
    target: "log-headache",
    side: "below",
    eyebrow: "Step 1 · Right now",
    title: "Tap here to log a migraine",
    body: "Neura walks you through ~45 sec — pain, where, what triggered it.",
  },
  {
    target: "daily-checkin",
    side: "below",
    eyebrow: "Step 2 · Every day",
    title: "1-minute daily check-in",
    body: "Three quick questions. This is what builds your trigger profile.",
  },
  {
    target: "trigger-module",
    side: "above",
    eyebrow: "Step 3 · Patterns",
    title: "Your triggers live here",
    body: "After ~5 logs, Neura starts surfacing what's connected to your attacks.",
  },
  {
    target: "neura-tab",
    side: "above",
    eyebrow: "Step 4 · Anytime",
    title: "Talk to Neura",
    body: "Hold the mic to ask anything — meds, history, what's going on.",
  },
  {
    target: "guide-button",
    side: "below",
    eyebrow: "Always available",
    title: "Tap ? for this guide",
    body: "Re-run this walkthrough anytime — top-right of Home.",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8; // spotlight padding around target

const GuideCoachmark = ({ onDone }: GuideCoachmarkProps) => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Measure the spotlight target's bounding rect each step / on resize.
  useLayoutEffect(() => {
    const measure = () => {
      const el = document.querySelector(
        `[data-coach="${current.target}"]`,
      ) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
      });
      // Scroll target into view if needed
      const above = r.top < 80;
      const below = r.bottom > window.innerHeight - 220;
      if (above || below) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    // Defer to next paint so any pending scroll/layout settles first.
    requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [step, current.target]);

  // Re-measure after scroll-into-view animations (small follow-up).
  useEffect(() => {
    const t = setTimeout(() => {
      const el = document.querySelector(
        `[data-coach="${current.target}"]`,
      ) as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
      });
    }, 350);
    return () => clearTimeout(t);
  }, [step, current.target]);

  const handleNext = () => {
    if (isLast) {
      try {
        localStorage.setItem("nc-guide-shown", "true");
      } catch {}
      onDone();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem("nc-guide-shown", "true");
    } catch {}
    onDone();
  };

  // ── Tooltip placement ────────────────────────────────────────────────────
  // We place the tooltip card above OR below the spotlight, whichever has
  // room. The card always avoids covering the highlighted element.
  const tooltipStyle: React.CSSProperties = {};
  if (rect) {
    if (current.side === "below") {
      tooltipStyle.top = rect.top + rect.height + 14;
      tooltipStyle.bottom = "auto";
    } else {
      tooltipStyle.bottom = window.innerHeight - rect.top + 14;
      tooltipStyle.top = "auto";
    }
  } else {
    // Fallback: centered card if target wasn't found.
    tooltipStyle.top = "50%";
    tooltipStyle.transform = "translateY(-50%)";
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        pointerEvents: "auto",
      }}
    >
      {/* Dim overlay with a hole punched out around the target.
          We render four panels (top/bottom/left/right) so the spotlight area
          remains crystal-clear without needing SVG mask compositing. */}
      {rect && (
        <>
          <motion.div
            initial={false}
            animate={{
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(0, rect.top),
            }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            style={{
              position: "absolute",
              background: "rgba(10,13,28,0.78)",
              backdropFilter: "blur(2px)",
            }}
          />
          <motion.div
            initial={false}
            animate={{
              top: rect.top + rect.height,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            style={{
              position: "absolute",
              background: "rgba(10,13,28,0.78)",
              backdropFilter: "blur(2px)",
            }}
          />
          <motion.div
            initial={false}
            animate={{
              top: rect.top,
              left: 0,
              width: Math.max(0, rect.left),
              height: rect.height,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            style={{
              position: "absolute",
              background: "rgba(10,13,28,0.78)",
              backdropFilter: "blur(2px)",
            }}
          />
          <motion.div
            initial={false}
            animate={{
              top: rect.top,
              left: rect.left + rect.width,
              right: 0,
              height: rect.height,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            style={{
              position: "absolute",
              background: "rgba(10,13,28,0.78)",
              backdropFilter: "blur(2px)",
            }}
          />

          {/* Spotlight ring around the target */}
          <motion.div
            initial={false}
            animate={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            style={{
              position: "absolute",
              borderRadius: 22,
              border: "2px solid rgba(255,255,255,0.95)",
              boxShadow:
                "0 0 0 4px rgba(59,130,246,0.45), 0 24px 48px rgba(0,0,0,0.5)",
              pointerEvents: "none",
            }}
          />

          {/* Pulse ring */}
          <motion.div
            initial={false}
            animate={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            style={{
              position: "absolute",
              borderRadius: 22,
              border: "2px solid rgba(124,58,237,0.7)",
              animation: "ringOut 1.8s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {/* Fallback dim — full screen if target missing */}
      {!rect && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,13,28,0.82)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            maxWidth: 360,
            margin: "0 auto",
            ...tooltipStyle,
            background: "hsl(var(--card))",
            borderRadius: 22,
            padding: "18px 18px 14px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
            pointerEvents: "auto",
          }}
        >
          {/* Step dots */}
          <div className="flex gap-1.5 mb-2.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  height: 3,
                  flex: 1,
                  borderRadius: 2,
                  background:
                    i <= step ? "#3B82F6" : "hsl(var(--border))",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>

          {/* Eyebrow */}
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--nc-accent)",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              marginBottom: 4,
            }}
          >
            {current.eyebrow}
          </div>

          {/* Title */}
          <h3
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 19,
              fontWeight: 600,
              color: "hsl(var(--foreground))",
              margin: "0 0 6px",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {current.title}
          </h3>

          {/* Body */}
          <p
            style={{
              fontSize: 13,
              color: "hsl(var(--muted-foreground))",
              lineHeight: 1.5,
              margin: "0 0 14px",
            }}
          >
            {current.body}
          </p>

          {/* Actions */}
          <div className="flex gap-2 items-center">
            <button
              onClick={handleSkip}
              className="bg-transparent border-0 cursor-pointer"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "hsl(var(--muted-foreground))",
                padding: "8px 4px",
              }}
            >
              Skip
            </button>
            <div className="flex-1" />
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 border-0 cursor-pointer text-white active:scale-[0.98] transition-transform"
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "10px 18px",
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
                boxShadow: "0 6px 16px rgba(59,130,246,0.32)",
              }}
            >
              {isLast ? "Got it" : "Next"}
              {!isLast && <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.6} />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default GuideCoachmark;
