import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "full";
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
  (
    {
      children,
      onClick,
      variant = "primary",
      size = "default",
      disabled = false,
      isLoading = false,
      className = "",
      type = "button",
    },
    ref
  ) => {
    const baseClasses =
      "rounded-2xl font-semibold transition-colors duration-200 min-h-[56px] px-6 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses: Record<NonNullable<CTAButtonProps["variant"]>, string> = {
      primary:
        "bg-accent text-accent-foreground shadow-cta hover:bg-[hsl(var(--accent-hover))] active:scale-[0.98]",
      secondary:
        "bg-card text-accent border-2 border-accent hover:bg-accent/5 active:scale-[0.98]",
      ghost: "bg-transparent text-accent hover:bg-accent/5",
    };

    const sizeClasses = size === "full" ? "w-full" : "";

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled || isLoading}
        className={cn(baseClasses, variantClasses[variant], sizeClasses, className)}
        whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
      >
        {isLoading ? (
          <motion.div
            className="w-6 h-6 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

CTAButton.displayName = "CTAButton";

export default CTAButton;
