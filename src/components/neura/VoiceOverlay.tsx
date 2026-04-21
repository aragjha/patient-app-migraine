import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Keyboard, X } from "lucide-react";

interface VoiceOverlayProps {
  active: boolean;
  onStop: () => void;
  onSwapToKeyboard: () => void;
  onTranscribe?: (text: string) => void;
  mode?: "push" | "handsfree";
}

const SILENCE_MS = 2200;

/**
 * Voice overlay that renders on top of Neura chat while the user is speaking.
 * Shows an animated waveform, a pulsing mic, a running timer, and keyboard /
 * stop controls. When `mode` is `handsfree`, simulates silence-detection and
 * auto-submits after SILENCE_MS of "quiet".
 *
 * The actual speech recognition hook is intentionally stubbed — wire your
 * Web Speech API or backend transcription call into onTranscribe.
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

  // Timer
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
      // Handsfree silence detection — if nothing has landed in the transcript
      // for SILENCE_MS, auto-commit whatever we have.
      if (mode === "handsfree" && Date.now() - lastVoiceAt.current > SILENCE_MS) {
        if (transcript.trim()) {
          onTranscribe?.(transcript.trim());
        }
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

  // Stub: demo transcript animation — populate with sample text over time so
  // the UI reads naturally even without a real speech backend wired in.
  useEffect(() => {
    if (!active) return;
    const DEMO =
      "I had a migraine this morning that came on around 8 and lasted about three hours";
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
    .padStart(2, "0");
  const ss = (elapsed % 60).toString().padStart(2, "0");

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between px-6 pt-14 pb-10 text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 30%, #3B82F6 0%, #1B2A4E 55%, #0E1220 100%)",
      }}
    >
      {/* Top row: close + timer + mode badge */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={onStop}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-xs font-semibold tracking-wider uppercase text-white/70">
          {mode === "handsfree" ? "Hands-free · listening" : "Listening"}
        </div>
        <div className="text-[13px] font-mono tabular-nums bg-white/10 px-2.5 py-1 rounded-full">
          {mm}:{ss}
        </div>
      </div>

      {/* Pulsing mic */}
      <div className="relative flex flex-col items-center gap-6">
        {[1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border border-white/25"
            initial={{ width: 112, height: 112, opacity: 0.6 }}
            animate={{ width: [112, 240], height: [112, 240], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
          />
        ))}
        <motion.div
          className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #fff 0%, #DBEAFE 100%)",
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <Mic className="w-12 h-12 text-[#1B2A4E]" strokeWidth={2.2} />
        </motion.div>

        {/* Waveform */}
        <div className="h-14 w-52 flex items-center justify-center gap-1">
          {Array.from({ length: 22 }).map((_, i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-white/85"
              animate={{
                height: [
                  6 + Math.random() * 6,
                  10 + Math.random() * 30,
                  6 + Math.random() * 6,
                ],
              }}
              transition={{
                duration: 0.9 + (i % 5) * 0.12,
                repeat: Infinity,
                delay: i * 0.04,
              }}
              style={{ height: 10 }}
            />
          ))}
        </div>

        <div className="text-center max-w-[280px] min-h-[24px] text-[15px] text-white/90 leading-snug">
          {transcript || (mode === "handsfree" ? "Start speaking…" : "Hold to speak")}
        </div>
      </div>

      {/* Actions */}
      <div className="w-full flex items-center justify-center gap-6">
        <button
          onClick={onSwapToKeyboard}
          className="flex flex-col items-center gap-1 text-white/85"
          aria-label="Switch to keyboard"
        >
          <div className="w-12 h-12 rounded-full bg-white/12 backdrop-blur flex items-center justify-center">
            <Keyboard className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold">Keyboard</span>
        </button>
        <button
          onClick={finish}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Send"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #FF9B5A, #FF6B5C)",
              boxShadow: "0 10px 30px rgba(255,107,92,0.45)",
            }}
          >
            <Square className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-[11px] font-semibold">Stop &amp; send</span>
        </button>
        <button
          onClick={onStop}
          className="flex flex-col items-center gap-1 text-white/60"
          aria-label="Cancel"
        >
          <div className="w-12 h-12 rounded-full bg-white/6 border border-white/15 flex items-center justify-center">
            <X className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold">Cancel</span>
        </button>
      </div>
    </motion.div>
  );
};

export default VoiceOverlay;
