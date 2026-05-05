import { Mic, Keyboard } from "lucide-react";
import { motion } from "framer-motion";

interface NeuraVoicePillProps {
  /** When listening, the mic glows + dots animate. */
  listening: boolean;
  /** When speaking (Neura is talking back), shows pulsing waveform around mic. */
  speaking?: boolean;
  /** Tap mic — toggles listening on/off. */
  onMicTap: () => void;
  /** Tap keyboard icon — switches to typing mode. */
  onKeyboardTap: () => void;
  /** Optional caption above the pill (e.g. "Connecting to Neura…", "Listening…"). */
  caption?: string;
  /** Bottom offset (e.g. above BottomNav at 92px or floating without nav). */
  bottomOffset?: number;
}

/**
 * Compact voice pill — sits above BottomNav, matches Patient App v3 reference.
 * Layout: [(·))] · · · · · [MIC] · · · · · [⌨]
 *
 * No giant waveform — the mic itself is the visual focus. When listening, the
 * mic gets a pulse ring and the dot row animates left→right.
 */
const NeuraVoicePill = ({
  listening,
  speaking = false,
  onMicTap,
  onKeyboardTap,
  caption,
  bottomOffset = 92,
}: NeuraVoicePillProps) => {
  const dotCount = 5;
  const active = listening || speaking;

  return (
    <div
      className="fixed left-0 right-0 z-[35] flex flex-col items-center pointer-events-none"
      style={{ bottom: bottomOffset + 8 }}
    >
      {caption && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-1.5 px-3 py-1 rounded-full pointer-events-none"
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink-2)",
            background: "hsl(var(--card) / 0.85)",
            backdropFilter: "blur(8px)",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          }}
        >
          {caption}
        </motion.div>
      )}

      <div
        className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-full"
        style={{
          width: "calc(100% - 32px)",
          maxWidth: 374,
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          boxShadow:
            "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)",
        }}
      >
        {/* Sound-wave indicator (left) */}
        <div
          aria-hidden
          className="flex items-center justify-center shrink-0"
          style={{ width: 28, height: 28, color: active ? "var(--nc-accent)" : "var(--muted-2)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" opacity={active ? 1 : 0.5} />
            <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" opacity={active ? 1 : 0.4} />
            <path d="M18 12c0-3.3 2.7-6 6-6" opacity={active ? 1 : 0.3} />
          </svg>
        </div>

        {/* Left dots */}
        <div className="flex-1 flex items-center justify-center gap-[5px]">
          {Array.from({ length: dotCount }).map((_, i) => (
            <motion.span
              key={`l-${i}`}
              className="block rounded-full"
              style={{
                width: 4,
                height: 4,
                background: active ? "var(--nc-accent)" : "var(--muted-2)",
                opacity: active ? 1 : 0.4,
              }}
              animate={
                active
                  ? { opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }
                  : { opacity: 0.4, scale: 1 }
              }
              transition={
                active
                  ? { duration: 1.2, repeat: Infinity, delay: i * 0.08 }
                  : { duration: 0.2 }
              }
            />
          ))}
        </div>

        {/* MIC button (center hero) */}
        <button
          onClick={onMicTap}
          aria-label={listening ? "Stop listening" : "Start listening"}
          className="relative shrink-0 flex items-center justify-center border-0 cursor-pointer active:scale-95 transition-transform"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: active
              ? "linear-gradient(135deg, #3B82F6 0%, #1B2A4E 100%)"
              : "var(--ink)",
            color: "#fff",
            boxShadow: active
              ? "0 0 0 4px rgba(59,130,246,0.18), 0 6px 14px rgba(59,130,246,0.30)"
              : "0 4px 10px rgba(16,24,40,0.18)",
          }}
        >
          {active && (
            <>
              <span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: "2px solid #3B82F6",
                  animation: "ringOut 1.6s ease-out infinite",
                  opacity: 0.5,
                }}
              />
              <span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: "2px solid #7C3AED",
                  animation: "ringOut 1.6s 0.5s ease-out infinite",
                  opacity: 0.4,
                }}
              />
            </>
          )}
          <Mic className="w-[18px] h-[18px]" strokeWidth={2.4} />
        </button>

        {/* Right dots */}
        <div className="flex-1 flex items-center justify-center gap-[5px]">
          {Array.from({ length: dotCount }).map((_, i) => (
            <motion.span
              key={`r-${i}`}
              className="block rounded-full"
              style={{
                width: 4,
                height: 4,
                background: active ? "var(--nc-accent)" : "var(--muted-2)",
                opacity: active ? 1 : 0.4,
              }}
              animate={
                active
                  ? { opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }
                  : { opacity: 0.4, scale: 1 }
              }
              transition={
                active
                  ? { duration: 1.2, repeat: Infinity, delay: 0.4 + i * 0.08 }
                  : { duration: 0.2 }
              }
            />
          ))}
        </div>

        {/* Keyboard switch (right) */}
        <button
          onClick={onKeyboardTap}
          aria-label="Switch to keyboard"
          className="shrink-0 flex items-center justify-center border-0 cursor-pointer bg-transparent active:scale-95 transition-transform"
          style={{ width: 28, height: 28, color: "var(--muted-2)" }}
        >
          <Keyboard className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
};

export default NeuraVoicePill;
