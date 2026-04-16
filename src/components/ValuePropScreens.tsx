import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CTAButton from "@/components/CTAButton";

interface ValuePropScreensProps {
  diagnosis: "migraine" | "parkinsons";
  onComplete: () => void;
  onBack: () => void;
}

const migraineStory = [
  {
    id: "triggers",
    title: "Your migraines have patterns",
    subtitle:
      "Most people don't realize their attacks follow predictable triggers. We'll help you find yours.",
    visual: "🔍",
    accent: "from-violet-500 to-purple-600",
    stat: "73% of users discover a new trigger in their first month",
  },
  {
    id: "data",
    title: "Your diary becomes your superpower",
    subtitle:
      "Every check-in builds a picture only you and your doctor can see. The more you track, the clearer the pattern.",
    visual: "📊",
    accent: "from-blue-500 to-cyan-600",
    stat: "Patients who track daily reduce attack frequency by 25%",
  },
  {
    id: "control",
    title: "Take control, one day at a time",
    subtitle:
      "NeuroCare connects your triggers, medications, and relief methods into a single story — so you can finally have that informed conversation with your doctor.",
    visual: "💪",
    accent: "from-emerald-500 to-teal-600",
    stat: "Built with neurologists at NDAI",
  },
];

const parkinsonsStory = [
  {
    id: "tracking",
    title: "Your symptoms tell a story",
    subtitle:
      "Daily patterns in movement, mood, and sleep reveal how PD affects YOU specifically.",
    visual: "📋",
    accent: "from-blue-500 to-indigo-600",
    stat: "Personalized tracking leads to better medication timing",
  },
  {
    id: "team",
    title: "Your care team sees what you see",
    subtitle:
      "Share your logs with your neurologist — no more guessing during appointments.",
    visual: "🤝",
    accent: "from-teal-500 to-emerald-600",
    stat: "82% of patients forget symptoms by appointment day",
  },
  {
    id: "together",
    title: "You're not alone in this",
    subtitle:
      "NeuroCare was built with Parkinson's patients and neurologists to give you tools that actually help.",
    visual: "🌟",
    accent: "from-amber-500 to-orange-600",
    stat: "Built with neurologists at NDAI",
  },
];

const ValuePropScreens = ({ diagnosis, onComplete, onBack }: ValuePropScreensProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const story = diagnosis === "migraine" ? migraineStory : parkinsonsStory;
  const screen = story[currentIndex];
  const isLast = currentIndex === story.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      onBack();
    } else {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 py-8 safe-area-inset">
      {/* Top bar: back + skip */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onComplete}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {story.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-3 h-3 bg-primary"
                : i < currentIndex
                ? "w-2.5 h-2.5 bg-primary/40"
                : "w-2.5 h-2.5 bg-muted-foreground/20"
            }`}
          />
        ))}
      </div>

      {/* Animated content area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={screen.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Visual */}
            <div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${screen.accent} flex items-center justify-center mb-8 shadow-lg`}
            >
              <span className="text-5xl">{screen.visual}</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground mb-4 leading-tight">
              {screen.title}
            </h2>

            {/* Subtitle */}
            <p className="text-base text-muted-foreground leading-relaxed max-w-xs mb-8">
              {screen.subtitle}
            </p>

            {/* Stat badge */}
            <div className="inline-flex items-center gap-2 bg-muted/60 rounded-full px-4 py-2">
              <span className="text-xs font-medium text-muted-foreground">
                {screen.stat}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="pt-6 pb-4">
        <CTAButton size="full" onClick={handleNext}>
          {isLast ? "Let's get started" : "Next"}
        </CTAButton>
      </div>
    </div>
  );
};

export default ValuePropScreens;
