import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

interface AuthPageProps {
  onAuthSuccess: () => void;
  onBack: () => void;
  onSkip?: () => void;
  initialMode?: AuthMode;
}

type AuthMode = "login" | "signup" | "forgot";

const TextField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  right,
  autoComplete,
  disabled,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  right?: React.ReactNode;
  autoComplete?: string;
  disabled?: boolean;
}) => (
  <label className="block">
    <div className="text-[12px] font-semibold text-muted-foreground mb-1.5 tracking-[0.02em]">
      {label}
    </div>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="w-full h-[54px] rounded-[14px] border-[1.5px] border-border bg-card text-foreground text-[15px] px-4 outline-none box-border focus:border-accent transition-colors"
        style={right ? { paddingRight: 48 } : undefined}
      />
      {right && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
      )}
    </div>
  </label>
);

const SocialBtn = ({
  onClick,
  disabled,
  icon,
  label,
  dark,
}: {
  onClick?: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  dark?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`h-[52px] rounded-[26px] cursor-pointer text-[15px] font-semibold flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 ${
      dark
        ? "bg-black text-white border border-black"
        : "bg-card text-foreground border border-border"
    }`}
  >
    {icon}
    {label}
  </button>
);

const PrimaryBtn = ({
  onClick,
  disabled,
  children,
  type = "button",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="w-full h-14 rounded-[28px] border-0 text-white text-base font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:cursor-not-allowed"
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

const AuthPage = ({ onAuthSuccess, onBack, onSkip, initialMode = "signup" }: AuthPageProps) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  // Prefill login with demo credentials to match the prototype's first-render
  // state (alex@example.com / ••••••••). Signup starts blank.
  const [email, setEmail] = useState(initialMode === "login" ? "alex@example.com" : "");
  const [password, setPassword] = useState(initialMode === "login" ? "demo1234" : "");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    if (initialMode === "login") {
      setEmail((prev) => prev || "alex@example.com");
      setPassword((prev) => prev || "demo1234");
    }
  }, [initialMode]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!result.redirected) onAuthSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === "signup" && !firstName)) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { first_name: firstName },
          },
        });
        if (error) throw error;
        toast.success("Check your email to verify your account!");
        onAuthSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset link sent");
      setMode("login");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";
  const isForgot = mode === "forgot";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Header bar */}
      <div className="px-5 pt-14 pb-2 flex items-center gap-3">
        <button
          onClick={isForgot ? () => setMode("login") : onBack}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:bg-muted/70"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.2} />
        </button>
        <div className="flex-1 h-1.5 rounded-sm bg-foreground/10 overflow-hidden">
          <div
            className="h-full rounded-sm transition-[width] duration-300"
            style={{
              width: "100%",
              background: "linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)",
            }}
          />
        </div>
        <div className="w-10 text-xs text-muted-foreground text-right tabular-nums">1/1</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col"
        >
          {isForgot ? (
            <>
              <div className="px-6 pt-5 flex-1 overflow-y-auto">
                <div
                  className="text-[36px] font-medium leading-[1.05] text-foreground mb-2"
                  style={{ fontFamily: "'Fraunces', Georgia, serif", letterSpacing: "-0.02em" }}
                >
                  Reset password
                </div>
                <div className="text-muted-foreground text-[15px] mb-8">
                  We'll email you a link to get back in.
                </div>
                <form onSubmit={handleForgot} className="space-y-4">
                  <TextField
                    label="EMAIL"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@email.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                </form>
              </div>
              <div className="px-6 pb-10">
                <PrimaryBtn onClick={handleForgot as any} disabled={!email || loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </PrimaryBtn>
              </div>
            </>
          ) : (
            <>
              <div className="px-6 pt-5 flex-1 overflow-y-auto">
                <div
                  className="text-[36px] font-medium leading-[1.05] text-foreground mb-2"
                  style={{ fontFamily: "'Fraunces', Georgia, serif", letterSpacing: "-0.02em" }}
                >
                  {isLogin ? "Welcome back" : "Create your account"}
                </div>
                <div className="text-muted-foreground text-[15px] mb-6">
                  {isLogin ? "Pick up right where you left off." : "Takes less than a minute."}
                </div>

                {/* Social buttons */}
                <div className="flex flex-col gap-2.5 mb-5">
                  <SocialBtn
                    dark
                    disabled={loading}
                    label="Continue with Apple"
                    icon={
                      <svg width="16" height="18" viewBox="0 0 16 18" fill="#fff">
                        <path d="M13.2 13.2c-.5 1.2-1.1 2.3-1.9 3.3-.7.9-1.5 1.4-2.3 1.4-.6 0-1.2-.2-1.9-.5-.7-.3-1.3-.5-1.9-.5s-1.3.2-2 .5-1.3.5-1.7.5c-.9 0-1.7-.5-2.5-1.5C-.5 15.1-1 13.7-1 12.1c0-1.7.4-3 1.2-4.1.8-1 1.8-1.6 3-1.6.5 0 1.1.1 1.8.4s1.2.4 1.5.4c.3 0 .9-.2 1.6-.5s1.4-.4 1.9-.3c1.5.1 2.6.7 3.3 1.8-1.3.8-2 1.9-2 3.4 0 1.2.4 2.1 1.2 2.9.4.3.8.6 1.3.8-.1.3-.2.6-.4.9zM9.9 1.8c0 1-.4 1.9-1.1 2.7-.9 1-2 1.6-3.2 1.5 0-.1 0-.3 0-.4 0-.9.4-2 1.2-2.8.4-.4.9-.8 1.4-1C8.9 1.5 9.4 1.3 9.8 1.3l.1.5z" />
                      </svg>
                    }
                  />
                  <SocialBtn
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    label="Continue with Google"
                    icon={
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path fill="#4285F4" d="M15.68 8.18c0-.6-.05-1.17-.15-1.73H8v3.27h4.3c-.18 1-.75 1.85-1.6 2.42v2h2.58c1.5-1.4 2.4-3.46 2.4-5.96z" />
                        <path fill="#34A853" d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2c-.72.48-1.64.77-2.72.77-2.1 0-3.87-1.4-4.5-3.3H.83v2.07C2.16 14.16 4.88 16 8 16z" />
                        <path fill="#FBBC05" d="M3.5 9.53c-.16-.48-.25-1-.25-1.53s.1-1.05.25-1.53V4.4H.83C.3 5.46 0 6.7 0 8s.3 2.54.83 3.6l2.67-2.07z" />
                        <path fill="#EA4335" d="M8 3.18c1.18 0 2.24.4 3.07 1.2l2.3-2.3C11.97.8 10.16 0 8 0 4.88 0 2.16 1.84.83 4.4L3.5 6.47C4.13 4.57 5.9 3.18 8 3.18z" />
                      </svg>
                    }
                  />
                </div>

                <div className="flex items-center gap-2.5 my-[18px]">
                  <div className="flex-1 h-px bg-border" />
                  <div className="text-[11px] font-semibold text-muted-foreground tracking-[0.15em]">OR</div>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <form onSubmit={handleEmailAuth} className="flex flex-col gap-3.5">
                  {!isLogin && (
                    <TextField
                      label="FIRST NAME"
                      value={firstName}
                      onChange={setFirstName}
                      placeholder="Alex"
                      autoComplete="given-name"
                      disabled={loading}
                    />
                  )}
                  <TextField
                    label="EMAIL"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@email.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                  <TextField
                    label="PASSWORD"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="8+ characters"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    disabled={loading}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="bg-transparent border-0 cursor-pointer text-muted-foreground p-1.5"
                      >
                        {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                      </button>
                    }
                  />
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="self-end bg-transparent border-0 cursor-pointer text-accent text-[13px] font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </form>
              </div>

              <div className="px-6 pb-7 pt-2 flex flex-col gap-3">
                <PrimaryBtn
                  type="submit"
                  onClick={handleEmailAuth as any}
                  disabled={!email || !password || (!isLogin && !firstName) || loading}
                >
                  {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
                </PrimaryBtn>
                <div className="text-center text-[13px] text-muted-foreground">
                  {isLogin ? "New here?" : "Already a member?"}{" "}
                  <button
                    onClick={() => setMode(isLogin ? "signup" : "login")}
                    className="bg-transparent border-0 cursor-pointer text-accent font-bold text-[13px] whitespace-nowrap"
                  >
                    {isLogin ? "Create an account" : "Sign in"}
                  </button>
                </div>
                {onSkip && (
                  <button
                    onClick={onSkip}
                    className="text-xs font-medium text-muted-foreground/70 mt-1"
                  >
                    Skip for now
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;
