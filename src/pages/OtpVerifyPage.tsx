import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface OtpVerifyPageProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const RESEND_SECONDS = 30;

const OtpVerifyPage = ({ email, onVerified, onBack }: OtpVerifyPageProps) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const autoSubmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup auto-submit timer on unmount
  useEffect(() => {
    return () => {
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    };
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const id = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCountdown]);

  const allFilled = digits.every((d) => d !== "");

  const handleVerify = useCallback((d = digits) => {
    const code = d.join("");
    if (code.length < 6 || loading) return;
    setLoading(true);
    setError(false);
    setTimeout(() => {
      setLoading(false);
      if (code === "000000") {
        setError(true);
      } else {
        onVerified();
      }
    }, 600);
  }, [digits, loading, onVerified]);

  const handleChange = (index: number, value: string) => {
    // Accept only digits; take last character typed (handles paste-one-char)
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError(false);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when 6th digit entered
    if (cleaned && index === 5) {
      const allDone = next.every((d) => d !== "");
      if (allDone) {
        if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
        autoSubmitTimerRef.current = setTimeout(() => handleVerify(next), 300);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index] !== "") {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("").map((_, i) => pasted[i] ?? "");
    setDigits(next);
    setError(false);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) {
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = setTimeout(() => handleVerify(next), 300);
    }
  };

  const handleResend = () => {
    if (resendCountdown > 0) return;
    setResendCountdown(RESEND_SECONDS);
    setDigits(Array(6).fill(""));
    setError(false);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Header bar — matches AuthPage shell */}
      <div className="px-5 pt-14 pb-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:bg-muted/70 cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.2} />
        </button>
        <div className="flex-1 h-1.5 rounded-sm bg-foreground/10 overflow-hidden">
          <div
            className="h-full w-full rounded-sm transition-[width] duration-300"
            style={{ background: "linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)" }}
          />
        </div>
        <div className="w-10 text-xs text-muted-foreground text-right tabular-nums">1/1</div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-5">
        {/* Heading */}
        <div
          className="text-[36px] font-medium leading-[1.05] text-foreground mb-2"
          style={{ fontFamily: "'Fraunces', Georgia, serif", letterSpacing: "-0.02em" }}
        >
          Check your email
        </div>
        <div className="text-muted-foreground text-[15px] mb-8">
          We sent a 6-digit code to{" "}
          <span className="text-foreground font-medium">{email}</span>
        </div>

        {/* OTP digit inputs */}
        <motion.div
          animate={error ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex gap-2.5 justify-center mb-8"
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              disabled={loading}
              aria-label={`Digit ${i + 1} of 6`}
              className={[
                "w-10 h-14 rounded-[14px] border-[1.5px] bg-card text-foreground",
                "text-center text-[22px] font-bold outline-none",
                "transition-colors duration-150 focus:border-accent cursor-text",
                "disabled:opacity-60",
                error ? "border-red-500" : "border-border",
              ].join(" ")}
            />
          ))}
        </motion.div>

        {/* Resend link */}
        <div className="text-center text-[14px] text-muted-foreground mb-2">
          {resendCountdown > 0 ? (
            <span>Resend code ({resendCountdown}s)</span>
          ) : (
            <button
              onClick={handleResend}
              className="text-accent font-semibold cursor-pointer bg-transparent border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              Resend code
            </button>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 pt-2">
        <button
          onClick={handleVerify}
          disabled={!allFilled || loading}
          className="w-full h-14 rounded-[28px] border-0 text-base font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: !allFilled || loading
              ? "hsl(var(--border))"
              : "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
            color: !allFilled || loading ? "hsl(var(--muted-foreground))" : "#fff",
            boxShadow: !allFilled || loading ? "none" : "0 8px 22px rgba(59,130,246,0.32)",
          }}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
};

export default OtpVerifyPage;
