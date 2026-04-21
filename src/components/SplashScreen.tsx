import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onContinue: () => void;
  onSignIn?: () => void;
}

const SplashScreen = ({ onContinue, onSignIn }: SplashScreenProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col text-white overflow-hidden"
      style={{
        background:
          "linear-gradient(165deg, #0E1220 0%, #1B2A4E 55%, #3B82F6 130%)",
      }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.55) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 120,
          left: -60,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,92,0.40) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-8">
        {/* Glyph */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: phase >= 0 ? 1 : 0.6, opacity: phase >= 0 ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.9, 0.3, 1.3] }}
          className="w-[108px] h-[108px] rounded-[32px] flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #fff 0%, #DBEAFE 100%)",
            boxShadow: "0 20px 60px rgba(59,130,246,0.45)",
          }}
        >
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <path
              d="M14 36 C14 24, 22 16, 28 16 C34 16, 42 24, 42 36"
              stroke="#1B2A4E"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="28" cy="28" r="4" fill="#3B82F6" />
            <path
              d="M20 40 L28 32 L36 40"
              stroke="#7C3AED"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 8 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div
            className="text-[44px] font-semibold leading-none tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            NeuroCare
          </div>
          <div className="mt-2.5 text-[12px] font-bold tracking-[0.3em] opacity-70">
            MIGRAINE · MAPPED
          </div>
        </motion.div>

        <motion.p
          className="text-center max-w-[280px] text-[15px] leading-[1.5] text-white/75"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 1 ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Understand your headaches with an AI companion that listens, not judges.
        </motion.p>
      </div>

      {/* CTAs */}
      <motion.div
        className="relative z-10 px-6 pb-12 flex flex-col gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 16 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={onContinue}
          className="w-full h-14 rounded-[28px] border-0 cursor-pointer text-white text-base font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{
            background: "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
            boxShadow: "0 8px 22px rgba(59,130,246,0.32)",
          }}
        >
          Get started
        </button>
        <button
          onClick={onSignIn ?? onContinue}
          className="h-13 py-3.5 bg-transparent border-0 cursor-pointer text-white/85 text-[15px] font-semibold"
        >
          I already have an account
        </button>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
