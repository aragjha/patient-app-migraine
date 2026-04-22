import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Keyboard, X } from "lucide-react";

interface VoiceOverlayProps {
  active: boolean;
  onStop: () => void;
  onSwapToKeyboard: () => void;
  onTranscribe?: (text: string) => void;
  mode?: "push" | "handsfree";
}

const SILENCE_MS = 2200;

/**
 * Voice overlay — dims the screen and surfaces a panel that mirrors the
 * prototype's inline `VoicePanel` (neuragpt.jsx:646–769). The panel itself
 * is 28-radius, card-tinted, with a 44×44 mic, an 18-bar waveform using an
 * accent→plum vertical gradient, a JetBrains-mono timer, a right-side
 * 34×34 close/keyboard button, and a single-line caption.
 *
 * Speech recognition is stubbed — wire a Web Speech API or backend hook
 * into onTranscribe.
 */
const VoiceOverlay = ({
  active,
  onStop,
  onSwapToKeyboard,
  onTranscribe,
  mode = "push",
}: VoiceOverlayProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const lastVoiceAt = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  // Timer + silence detection
  useEffect(() => {
    if (!active) {
      setElapsed(0);
      setTranscript("");
      lastVoiceAt.current = Date.now();
      return;
    }
    const started = Date.now();
    lastVoiceAt.current = started;
    const tick = () => {
      setElapsed(Math.floor((Date.now() - started) / 1000));
      if (mode === "handsfree" && Date.now() - lastVoiceAt.current > SILENCE_MS) {
        if (transcript.trim()) onTranscribe?.(transcript.trim());
        onStop();
        return;
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [active, mode, transcript, onStop, onTranscribe]);

  // Stub demo transcript — populate sample text over time
  useEffect(() => {
    if (!active) return;
    const DEMO =
      "Why did my Tuesday migraine last so long?";
    let i = 0;
    const id = setInterval(() => {
      if (i >= DEMO.length) {
        clearInterval(id);
        return;
      }
      setTranscript((t) => t + DEMO[i]);
      lastVoiceAt.current = Date.now();
      i++;
    }, 70);
    return () => clearInterval(id);
  }, [active]);

  const finish = () => {
    if (transcript.trim()) onTranscribe?.(transcript.trim());
    onStop();
  };

  const mm = Math.floor(elapsed / 60)
    .toString()
    .padStart(1, "0");
  const ss = (elapsed % 60).toString().padStart(2, "0");

  if (!active) return null;

  // Prototype: 18 waveform bars (neuragpt.jsx:648)
  const BAR_COUNT = 18;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{
        background: "rgba(15, 18, 32, 0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={onStop}
    >
      {/* Prototype VoicePanel — inline-sized, floating near bottom input area */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "calc(100% - 28px)",
          maxWidth: 374,
          marginBottom: 96,
          position: "relative",
          background:
            "linear-gradient(135deg, var(--accent-soft), rgba(124,58,237,0.12))",
          border: "1px solid var(--border)",
          borderRadius: 28,
          padding: "14px 14px",
          overflow: "hidden",
          boxShadow: "0 18px 40px rgba(16,24,40,0.22)",
        }}
      >
        {/* Listening pulse rings — accent & plum, 1.8s infinite, 0.6s staggered */}
        <div
          style={{
            position: "absolute",
            left: 26,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "2px solid var(--accent)",
            animation: "ringOut 1.8s ease-out infinite",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 26,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "2px solid var(--plum)",
            animation: "ringOut 1.8s 0.6s ease-out infinite",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "relative",
          }}
        >
          {/* Mic / stop — 44×44, coral→red gradient while listening, pulse anim */}
          <button
            onClick={finish}
            aria-label="Stop listening"
            style={{
              position: "relative",
              zIndex: 2,
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: 0,
              cursor: "pointer",
              background: "linear-gradient(135deg, #FF6B5C, #EF4444)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 0 rgba(239,68,68,0.4)",
              animation: "pulse 1.4s infinite",
              flexShrink: 0,
            }}
          >
            {/* Listening-state glyph: 12×12 white square, radius 3 */}
            <span
              style={{
                width: 12,
                height: 12,
                background: "#fff",
                borderRadius: 3,
                display: "block",
              }}
            />
          </button>

          {/* Waveform — 18 bars, width 3, accent→plum vertical gradient */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
              height: 34,
              minWidth: 0,
            }}
          >
            {Array.from({ length: BAR_COUNT }).map((_, i) => {
              const h = 8 + Math.abs(Math.sin((i + 1) * 1.3)) * 20;
              return (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: h,
                    borderRadius: 3,
                    background:
                      "linear-gradient(180deg, var(--accent), var(--plum))",
                    animation: `voiceWave ${0.6 + (i % 4) * 0.12}s ${i * 0.04}s ease-in-out infinite`,
                    transformOrigin: "center",
                  }}
                />
              );
            })}

            {/* Timer — 11/700 JetBrains Mono var(--accent), right-aligned */}
            <div
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                color: "var(--accent)",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {mm}:{ss}
            </div>
          </div>

          {/* Right action — 34×34 bg-deep ink — cancel (×) while listening */}
          <button
            onClick={onStop}
            title="Cancel"
            aria-label="Cancel"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "var(--bg-deep)",
              color: "var(--ink)",
              border: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X style={{ width: 14, height: 14, strokeWidth: 2.4 }} />
          </button>
        </div>

        {/* Listening hint — 10px JetBrains Mono accent weight 600 */}
        <div
          style={{
            fontSize: 10,
            color: "var(--accent)",
            textAlign: "center",
            marginTop: 8,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontWeight: 600,
          }}
        >
          Tap &#9632; when done · or pause 1.5s
        </div>

        {/* Live transcript preview (React-only — not in prototype but preserved
            so handsfree flow still shows what's being heard). Renders under the
            hint, subdued. */}
        {transcript && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "var(--ink)",
              textAlign: "center",
              opacity: 0.8,
              lineHeight: 1.4,
              maxWidth: 320,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {transcript}
          </div>
        )}
      </div>

      {/* Keyboard swap — sits above the panel, subtle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSwapToKeyboard();
        }}
        aria-label="Switch to keyboard"
        style={{
          position: "absolute",
          right: 20,
          bottom: 32,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.16)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Keyboard style={{ width: 18, height: 18 }} />
      </button>

      {/* Mode badge — top-center, prototype has no such label but retained as
          an affordance hint so users know what state they're in */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          opacity: 0.9,
        }}
      >
        <Mic style={{ width: 14, height: 14 }} />
        {mode === "handsfree" ? "Hands-free · listening" : "Listening"}
      </div>
    </motion.div>
  );
};

export default VoiceOverlay;
