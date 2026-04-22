import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Play, Pause, SkipBack, SkipForward } from "lucide-react";

/**
 * Relief Session — breathing orb + audio-session UX from the prototype.
 * Forced dark. Opens from Home's Relief tile and the log-complete flow.
 */

interface ReliefSessionProps {
  onClose: () => void;
  totalSeconds?: number;
}

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const ReliefSession = ({ onClose, totalSeconds = 720 }: ReliefSessionProps) => {
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(143);
  const [showEnd, setShowEnd] = useState(false);

  useEffect(() => {
    if (!playing || showEnd) return;
    const id = setInterval(() => {
      setTime((t) => {
        const next = Math.min(t + 1, totalSeconds);
        if (next >= totalSeconds) setShowEnd(true);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, showEnd, totalSeconds]);

  const pct = (time / totalSeconds) * 100;

  const skipBack = () => setTime((t) => Math.max(0, t - 15));
  const skipFwd = () => setTime((t) => Math.min(totalSeconds, t + 15));

  if (showEnd) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col px-6 pt-14 pb-10 text-white"
        style={{ background: "#0E0E14" }}
      >
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-3"
            style={{ color: "#8B8B96" }}
          >
            Session complete
          </div>
          <h2
            className="text-[38px] m-0"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 0.95,
            }}
          >
            Did it{" "}
            <em className="italic" style={{ color: "#60A5FA" }}>
              help?
            </em>
          </h2>
          <p className="text-sm mt-2.5" style={{ color: "#8B8B96" }}>
            Your answer trains the relief engine.
          </p>
          <div className="grid grid-cols-3 gap-2.5 mt-8">
            {[
              { e: "😌", l: "A lot" },
              { e: "🙂", l: "Some" },
              { e: "😐", l: "Not really" },
            ].map((b) => (
              <button
                key={b.l}
                onClick={onClose}
                className="rounded-[20px] p-5 flex flex-col gap-2 items-center text-white active:scale-[0.97] transition-transform"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span className="text-[32px]">{b.e}</span>
                <span className="text-xs font-semibold">{b.l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col text-white"
      style={{
        background: "radial-gradient(circle at 50% 30%, #1A1A28, #0E0E14 80%)",
      }}
    >
      {/* Top bar */}
      <div className="px-5 pt-14 flex justify-between items-center">
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-10 h-10 rounded-full border-0 cursor-pointer flex items-center justify-center text-white"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <X className="w-[18px] h-[18px]" />
        </button>
        <div
          className="text-[11px] font-semibold uppercase"
          style={{
            color: "#8B8B96",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          }}
        >
          DARK MODE · MOTION REDUCED
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Breathing orb — 3 layers per prototype */}
        <div className="relative w-60 h-60 mb-10">
          <div
            className="absolute inset-0 rounded-full animate-breathe"
            style={{
              background:
                "radial-gradient(circle, rgba(96,165,250,0.3), transparent 70%)",
            }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: 30,
              background:
                "radial-gradient(circle, rgba(124,58,237,0.35), rgba(59,130,246,0.2))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              inset: 70,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="text-xs font-semibold"
              style={{ color: "#BEB8C8", letterSpacing: "0.2em" }}
            >
              BREATHE IN
            </div>
          </div>
        </div>

        <div
          className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-2"
          style={{ color: "#8B8B96" }}
        >
          Session · 4-7-8 breathing
        </div>
        <h2
          className="text-[32px] m-0 text-center text-white mb-2"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 600,
            letterSpacing: "-0.035em",
            lineHeight: 0.95,
          }}
        >
          <em className="italic" style={{ color: "#60A5FA" }}>
            Settle
          </em>{" "}
          the storm
        </h2>
        <p
          className="text-[13px] text-center m-0"
          style={{ color: "#8B8B96" }}
        >
          Headphones in. Eyes closed is fine.
        </p>
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-10">
        <div
          className="h-[3px] rounded-full overflow-hidden mb-2.5"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${pct}%`,
              background: "#60A5FA",
            }}
          />
        </div>
        <div
          className="flex justify-between text-[11px] tabular-nums mb-5"
          style={{
            color: "#8B8B96",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          }}
        >
          <span>{fmt(time)}</span>
          <span>{fmt(totalSeconds)}</span>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={skipBack}
            aria-label="Previous"
            className="bg-transparent border-0 cursor-pointer"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <SkipBack className="w-[26px] h-[26px]" fill="currentColor" strokeWidth={0} />
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full flex items-center justify-center cursor-pointer border-0"
            style={{
              width: 76,
              height: 76,
              background: "#fff",
              color: "#0E0E14",
              boxShadow: "0 10px 30px rgba(96,165,250,0.35)",
            }}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="w-[30px] h-[30px]" fill="#0E0E14" strokeWidth={0} />
            ) : (
              <Play className="w-[30px] h-[30px] ml-[2px]" fill="#0E0E14" strokeWidth={0} />
            )}
          </button>
          <button
            onClick={skipFwd}
            aria-label="Next"
            className="bg-transparent border-0 cursor-pointer"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <SkipForward className="w-[26px] h-[26px]" fill="currentColor" strokeWidth={0} />
          </button>
        </div>

        <button
          onClick={() => setShowEnd(true)}
          className="mt-6 w-full rounded-[18px] py-[14px] text-[13px] font-semibold cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "#BEB8C8",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          End session
        </button>
      </div>
    </div>
  );
};

export default ReliefSession;
