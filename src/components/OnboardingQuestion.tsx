import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import CTAButton from "@/components/CTAButton";
import SelectionChip from "@/components/SelectionChip";
import QuestionSlider from "@/components/QuestionSlider";

interface OnboardingQuestionProps {
  progress: number;
  totalSteps: number;
  title: string;
  helper?: string;
  questionType: "single" | "multi" | "slider";
  options?: Array<{ id: string; label: string; icon?: string }>;
  selectedValues: string[];
  sliderValue?: number;
  onSelect: (id: string) => void;
  onSliderChange?: (value: number) => void;
  onSliderCommit?: (value: number) => void;
  onContinue: () => void;
  canContinue: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
}

const OnboardingQuestion = ({
  progress,
  totalSteps,
  title,
  helper,
  questionType,
  options = [],
  selectedValues,
  sliderValue = 5,
  onSelect,
  onSliderChange,
  onSliderCommit,
  onContinue,
  canContinue,
  showBackButton = false,
  onBack,
  showSkip = false,
  onSkip,
}: OnboardingQuestionProps) => {
  // Show continue button only for multi-select (single and slider auto-advance)
  const showContinueButton = questionType === "multi";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Modern flow header — progress bar + optional back */}
      <div className="px-5 pt-14 pb-2 flex items-center gap-3">
        {showBackButton && onBack ? (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:bg-muted/70 shrink-0"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={2.2} />
          </button>
        ) : (
          <div className="w-10 h-10 shrink-0" />
        )}
        <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${Math.max(0, (progress / totalSteps) * 100)}%`,
              background: "linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)",
            }}
          />
        </div>
        <div className="w-10 text-xs text-muted-foreground text-right tabular-nums">
          {progress}/{totalSteps}
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 px-6 pt-4 pb-4">
        {/* Title */}
        <motion.h1
          className="text-foreground mb-2 leading-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {title}
        </motion.h1>

        {/* Helper */}
        {helper && (
          <motion.p
            className="text-muted-foreground mb-6"
            style={{ fontSize: 14.5, lineHeight: 1.5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {helper}
          </motion.p>
        )}

        {/* Answer Area */}
        <div className="mt-6">
          {/* Slider */}
          {questionType === "slider" && (
            <QuestionSlider
              value={sliderValue}
              onChange={onSliderChange || (() => {})}
              onCommit={onSliderCommit}
            />
          )}

          {/* Chips */}
          {(questionType === "single" || questionType === "multi") && (
            <div className="space-y-3">
              {options.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SelectionChip
                    label={option.label}
                    icon={option.icon}
                    selected={selectedValues.includes(option.id)}
                    onClick={() => onSelect(option.id)}
                    multiSelect={questionType === "multi"}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA - only for multi-select and slider questions */}
      {(showContinueButton || showSkip) && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 px-4 pt-4 pb-6 bg-gradient-to-t from-background via-background to-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-3">
            {showContinueButton && (
              <CTAButton 
                size="full" 
                onClick={onContinue}
                disabled={!canContinue}
              >
                Continue
              </CTAButton>
            )}
            {showSkip && onSkip && (
              <button
                onClick={onSkip}
                className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Skip onboarding
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OnboardingQuestion;
