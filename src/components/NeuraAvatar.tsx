import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface NeuraAvatarProps {
  size?: "sm" | "md" | "lg";
  animate?: boolean; // whether to show pulsing ring
  className?: string;
}

const NeuraAvatar = ({ size = "md", animate = false, className = "" }: NeuraAvatarProps) => {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };
  const iconSizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      {animate && (
        <motion.span
          className="absolute inset-0 rounded-full bg-accent/20"
          animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <div
        className={`relative ${sizeMap[size]} rounded-full bg-gradient-to-br from-accent to-[var(--accent-hover)] flex items-center justify-center shadow-cta`}
      >
        <Sparkles className={`${iconSizeMap[size]} text-white`} strokeWidth={2.5} />
      </div>
    </div>
  );
};

export default NeuraAvatar;
