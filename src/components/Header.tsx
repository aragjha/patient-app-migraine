import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import logoLight from "@/assets/neurocare-logo.png";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  progress?: number;
  totalSteps?: number;
  showProgress?: boolean;
  showThemeToggle?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header = ({ 
  progress = 0, 
  totalSteps = 1, 
  showProgress = false,
  showThemeToggle = true,
  showBackButton = false,
  onBack
}: HeaderProps) => {
  const progressPercent = totalSteps > 0 ? (progress / totalSteps) * 100 : 0;

  return (
    <header className="w-full">
      {/* Logo/Back and Controls Row */}
      <div className="flex items-center justify-between mb-4">
        {showBackButton ? (
          <motion.button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
        ) : (
          <motion.img
            src={logoLight}
            alt="NeuroCare"
            className="h-10 w-auto object-contain"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
        
        {showThemeToggle && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <ThemeToggle />
          </motion.div>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <motion.div 
          className="progress-bar"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </header>
  );
};

export default Header;
