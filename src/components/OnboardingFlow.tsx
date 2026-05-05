import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingQuestion from "@/components/OnboardingQuestion";
import GratificationScreen from "@/components/GratificationScreen";
import MigraineOnboarding from "@/components/MigraineOnboarding";

export type Diagnosis = "migraine" | "parkinsons";

// Diagnosis selection question (shown first)
const diagnosisQuestion = {
  id: "diagnosis",
  title: "What is your diagnosis?",
  helper: "This helps us tailor the entire experience for you.",
  type: "single" as const,
  options: [
    { id: "migraine", label: "Migraine", icon: "🧠" },
    { id: "parkinsons", label: "Parkinson's Disease", icon: "🫨" },
  ],
};

// Parkinson's-specific onboarding phases (existing flow)
const parkinsonsPhases = [
  {
    phase: "A",
    showInterstitialAfter: true,
    questions: [
      {
        id: "role",
        title: "Let's get to know you",
        helper: "This helps us personalize your experience.",
        type: "single" as const,
        options: [
          { id: "patient", label: "I am the patient", icon: "🙋" },
          { id: "caregiver", label: "I'm a caregiver", icon: "💝" },
          { id: "both", label: "Both", icon: "🤝" },
        ],
      },
      {
        id: "stage",
        title: "Where are you in your journey?",
        helper: "Choose what feels closest to you.",
        type: "single" as const,
        options: [
          { id: "newly", label: "Newly diagnosed", icon: "🌱" },
          { id: "few_years", label: "A few years in", icon: "🌿" },
          { id: "long_time", label: "Long-time warrior", icon: "🌳" },
          { id: "unsure", label: "Not sure yet", icon: "❓" },
        ],
      },
    ],
  },
  {
    phase: "B",
    showInterstitialAfter: false,
    questions: [
      {
        id: "main_concern",
        title: "What's on your mind lately?",
        helper: "Pick your biggest concern right now.",
        type: "single" as const,
        options: [
          { id: "movement", label: "Movement & tremors", icon: "🏃" },
          { id: "sleep", label: "Sleep problems", icon: "😴" },
          { id: "mood", label: "Mood & motivation", icon: "💭" },
          { id: "memory", label: "Memory & focus", icon: "🧠" },
          { id: "other", label: "Something else", icon: "📝" },
        ],
      },
      {
        id: "energy_level",
        title: "How are you feeling today?",
        helper: "Slide to show your energy level.",
        type: "slider" as const,
        options: [],
      },
    ],
  },
  {
    phase: "C",
    showInterstitialAfter: true,
    questions: [
      {
        id: "medications",
        title: "Are you taking any PD medications?",
        type: "single" as const,
        options: [
          { id: "yes", label: "Yes, I am", icon: "💊" },
          { id: "no", label: "Not yet", icon: "⏳" },
          { id: "unsure", label: "I'm not sure", icon: "🤔" },
        ],
      },
      {
        id: "add_medications",
        title: "Want to add your medications now?",
        helper: "You can always do this later in Tools.",
        type: "single" as const,
        showIf: "medications_yes",
        options: [
          { id: "yes", label: "Yes, let's do it", icon: "✅" },
          { id: "later", label: "I'll do it later", icon: "⏰" },
        ],
      },
      {
        id: "tracking_goal",
        title: "What would you like to track?",
        helper: "Pick as many as you'd like.",
        type: "multi" as const,
        options: [
          { id: "symptoms", label: "Daily symptoms", icon: "📊" },
          { id: "medications", label: "Medications", icon: "💊" },
          { id: "mood", label: "Mood changes", icon: "🎭" },
          { id: "sleep", label: "Sleep quality", icon: "🌙" },
          { id: "exercise", label: "Exercise & movement", icon: "🏃" },
        ],
      },
    ],
  },
  {
    phase: "D",
    showInterstitialAfter: false,
    questions: [
      {
        id: "reminder_time",
        title: "When should we check in?",
        helper: "We'll send a gentle daily reminder.",
        type: "single" as const,
        options: [
          { id: "morning", label: "Morning (8-10am)", icon: "🌅" },
          { id: "midday", label: "Midday (12-2pm)", icon: "☀️" },
          { id: "evening", label: "Evening (6-8pm)", icon: "🌆" },
          { id: "none", label: "No reminders", icon: "🔕" },
        ],
      },
      {
        id: "share_data",
        title: "Share updates with a caregiver?",
        helper: "They'll only see summaries, never raw data.",
        type: "single" as const,
        options: [
          { id: "yes", label: "Yes, I'd like that", icon: "👥" },
          { id: "later", label: "Maybe later", icon: "⏰" },
          { id: "no", label: "Keep it private", icon: "🔒" },
        ],
      },
    ],
  },
];

// Migraine-specific onboarding phases
const migrainePhases = [
  {
    phase: "A",
    showInterstitialAfter: true,
    questions: [
      {
        id: "role",
        title: "Let's get to know you",
        helper: "This helps us personalize your experience.",
        type: "single" as const,
        options: [
          { id: "patient", label: "I am the patient", icon: "🙋" },
          { id: "caregiver", label: "I'm a caregiver", icon: "💝" },
          { id: "both", label: "Both", icon: "🤝" },
        ],
      },
      {
        id: "migraine_stage",
        title: "Where are you in your migraine journey?",
        helper: "Choose what feels closest to you.",
        type: "single" as const,
        options: [
          { id: "newly", label: "Recently started", icon: "🌱" },
          { id: "few_years", label: "A few years in", icon: "🌿" },
          { id: "chronic", label: "Chronic migraine", icon: "🌳" },
          { id: "unsure", label: "Not sure yet", icon: "❓" },
        ],
      },
    ],
  },
  {
    phase: "B",
    showInterstitialAfter: false,
    questions: [
      {
        id: "migraine_goals",
        title: "What can we help you with?",
        helper: "Select up to 2 options.",
        type: "multi" as const,
        options: [
          { id: "triggers", label: "Find my triggers", icon: "⚡" },
          { id: "relief", label: "Find my reliefs", icon: "➕" },
          { id: "understand", label: "Understand my migraine", icon: "🧠" },
          { id: "communicate", label: "Communicate with my doctor", icon: "👩‍⚕️" },
        ],
      },
      {
        id: "attack_frequency",
        title: "How often do you get migraines?",
        helper: "An estimate is perfectly fine.",
        type: "single" as const,
        options: [
          { id: "rare", label: "1-3 per month", icon: "1️⃣" },
          { id: "moderate", label: "4-7 per month", icon: "2️⃣" },
          { id: "frequent", label: "8-14 per month", icon: "3️⃣" },
          { id: "chronic", label: "15+ per month", icon: "4️⃣" },
          { id: "unsure", label: "Not sure", icon: "❓" },
        ],
      },
      {
        id: "warning_signs",
        title: "Do you have warning signs before an attack?",
        helper: "Examples of warning signs may include: light sensitivity, visual disturbances, nausea, excessive yawning, fatigue, mood changes, or neck stiffness.",
        type: "single" as const,
        options: [
          { id: "no", label: "No", icon: "❌" },
          { id: "yes", label: "Yes", icon: "✅" },
          { id: "unsure", label: "I'm not sure (yet)", icon: "🤔" },
        ],
      },
    ],
  },
  {
    phase: "C",
    showInterstitialAfter: true,
    questions: [
      {
        id: "migraine_medications",
        title: "Are you taking any migraine medications?",
        type: "single" as const,
        options: [
          { id: "yes", label: "Yes, I am", icon: "💊" },
          { id: "no", label: "Not yet", icon: "⏳" },
          { id: "unsure", label: "I'm not sure", icon: "🤔" },
        ],
      },
      {
        id: "add_medications",
        title: "Want to add your medications now?",
        helper: "You can always do this later.",
        type: "single" as const,
        showIf: "migraine_medications_yes",
        options: [
          { id: "yes", label: "Yes, let's do it", icon: "✅" },
          { id: "later", label: "I'll do it later", icon: "⏰" },
        ],
      },
      {
        id: "tracking_goal",
        title: "What would you like to track?",
        helper: "Pick as many as you'd like.",
        type: "multi" as const,
        options: [
          { id: "attacks", label: "Migraine attacks", icon: "⚡" },
          { id: "medications", label: "Medications", icon: "💊" },
          { id: "triggers", label: "Triggers", icon: "🎯" },
          { id: "sleep", label: "Sleep quality", icon: "🌙" },
          { id: "mood", label: "Mood & stress", icon: "💭" },
        ],
      },
    ],
  },
  {
    phase: "D",
    showInterstitialAfter: false,
    questions: [
      {
        id: "reminder_time",
        title: "When should we check in?",
        helper: "We'll send a gentle daily reminder.",
        type: "single" as const,
        options: [
          { id: "morning", label: "Morning (8-10am)", icon: "🌅" },
          { id: "midday", label: "Midday (12-2pm)", icon: "☀️" },
          { id: "evening", label: "Evening (6-8pm)", icon: "🌆" },
          { id: "none", label: "No reminders", icon: "🔕" },
        ],
      },
      {
        id: "share_data",
        title: "Share updates with a caregiver or doctor?",
        helper: "They'll only see summaries, never raw data.",
        type: "single" as const,
        options: [
          { id: "yes", label: "Yes, I'd like that", icon: "👥" },
          { id: "later", label: "Maybe later", icon: "⏰" },
          { id: "no", label: "Keep it private", icon: "🔒" },
        ],
      },
    ],
  },
];

export interface OnboardingState {
  phaseIndex: number;
  questionIndex: number;
  answers: Record<string, string[] | number>;
  diagnosis?: Diagnosis;
}

interface OnboardingFlowProps {
  onComplete: (diagnosis: Diagnosis) => void;
  onSkip?: () => void;
  onAddMedications?: (state: OnboardingState) => void;
  initialState?: OnboardingState;
  onMenstrualEnabled?: () => void;
}

const OnboardingFlow = ({ onComplete, onSkip, onAddMedications, initialState, onMenstrualEnabled }: OnboardingFlowProps) => {
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(initialState?.diagnosis ?? null);
  const [showDiagnosisQuestion, setShowDiagnosisQuestion] = useState(!initialState?.diagnosis);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(initialState?.phaseIndex ?? 0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialState?.questionIndex ?? 0);
  const [showGratification, setShowGratification] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string[] | number>>(initialState?.answers ?? {});

  const onboardingPhases = diagnosis === "migraine" ? migrainePhases : parkinsonsPhases;
  const currentPhase = onboardingPhases[currentPhaseIndex];

  const getVisibleQuestions = () => {
    if (!currentPhase) return [];
    return currentPhase.questions.filter((q) => {
      const showIf = (q as any).showIf as string | undefined;
      if (showIf === "medications_yes") {
        const medsAnswer = answers["medications"];
        return Array.isArray(medsAnswer) && medsAnswer.includes("yes");
      }
      if (showIf === "migraine_medications_yes") {
        const medsAnswer = answers["migraine_medications"];
        return Array.isArray(medsAnswer) && medsAnswer.includes("yes");
      }
      return true;
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentQuestionIndex];

  const getTotalVisibleQuestions = () => {
    return onboardingPhases.reduce((sum, phase) => {
      return sum + phase.questions.filter((q) => {
        const showIf = (q as any).showIf as string | undefined;
        if (showIf === "medications_yes") {
          const medsAnswer = answers["medications"];
          return Array.isArray(medsAnswer) && medsAnswer.includes("yes");
        }
        if (showIf === "migraine_medications_yes") {
          const medsAnswer = answers["migraine_medications"];
          return Array.isArray(medsAnswer) && medsAnswer.includes("yes");
        }
        return true;
      }).length;
    }, 0);
  };

  // +1 for diagnosis question
  const totalQuestions = getTotalVisibleQuestions() + 1;
  const completedQuestions = showDiagnosisQuestion ? 0 : (
    onboardingPhases
      .slice(0, currentPhaseIndex)
      .reduce((sum, phase) => {
        return sum + phase.questions.filter((q) => {
          const showIf = (q as any).showIf as string | undefined;
          if (showIf === "medications_yes") {
            const medsAnswer = answers["medications"];
            return Array.isArray(medsAnswer) && medsAnswer.includes("yes");
          }
          if (showIf === "migraine_medications_yes") {
            const medsAnswer = answers["migraine_medications"];
            return Array.isArray(medsAnswer) && medsAnswer.includes("yes");
          }
          return true;
        }).length;
      }, 0) + currentQuestionIndex + 1
  );

  // Handle diagnosis selection
  const handleDiagnosisSelect = (id: string) => {
    const selectedDiagnosis = id as Diagnosis;
    setDiagnosis(selectedDiagnosis);
    setTimeout(() => {
      setShowDiagnosisQuestion(false);
      setCurrentPhaseIndex(0);
      setCurrentQuestionIndex(0);
    }, 300);
  };

  const handleSelect = (id: string) => {
    if (!currentQuestion) return;

    if (currentQuestion.type === "multi") {
      const current = (answers[currentQuestion.id] as string[]) || [];
      if (current.includes(id)) {
        setAnswers({ ...answers, [currentQuestion.id]: current.filter((v) => v !== id) });
      } else {
        setAnswers({ ...answers, [currentQuestion.id]: [...current, id] });
      }
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: [id] });
      setTimeout(() => {
        handleContinueInternal([id]);
      }, 300);
    }
  };

  const handleContinueInternal = (currentAnswer?: string[]) => {
    if (currentQuestion?.id === "add_medications") {
      const addMedsAnswer = currentAnswer || answers["add_medications"];
      if (Array.isArray(addMedsAnswer) && addMedsAnswer.includes("yes") && onAddMedications) {
        const nextQuestionIndex = currentQuestionIndex + 1;
        const isLastInPhase = nextQuestionIndex >= visibleQuestions.length;

        onAddMedications({
          phaseIndex: isLastInPhase ? currentPhaseIndex + 1 : currentPhaseIndex,
          questionIndex: isLastInPhase ? 0 : nextQuestionIndex,
          answers: { ...answers, [currentQuestion.id]: addMedsAnswer },
          diagnosis: diagnosis!,
        });
        return;
      }
    }

    const isLastQuestionInPhase = currentQuestionIndex >= visibleQuestions.length - 1;
    const isLastPhase = currentPhaseIndex >= onboardingPhases.length - 1;

    if (isLastQuestionInPhase) {
      if (isLastPhase) {
        onComplete(diagnosis!);
      } else if (currentPhase.showInterstitialAfter) {
        setShowGratification(true);
      } else {
        setCurrentPhaseIndex(currentPhaseIndex + 1);
        setCurrentQuestionIndex(0);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSliderChange = (value: number) => {
    if (!currentQuestion) return;
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleSliderCommit = (value: number) => {
    if (!currentQuestion) return;
    setAnswers({ ...answers, [currentQuestion.id]: value });
    setTimeout(() => {
      handleContinueInternal();
    }, 300);
  };

  const handleContinue = () => {
    handleContinueInternal();
  };

  const handleBack = () => {
    if (showDiagnosisQuestion) return;

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentPhaseIndex > 0) {
      const prevPhase = onboardingPhases[currentPhaseIndex - 1];
      const prevVisibleQuestions = prevPhase.questions.filter((q) => {
        const showIf = (q as any).showIf as string | undefined;
        if (showIf === "medications_yes") {
          const medsAnswer = answers["medications"];
          return Array.isArray(medsAnswer) && medsAnswer.includes("yes");
        }
        if (showIf === "migraine_medications_yes") {
          const medsAnswer = answers["migraine_medications"];
          return Array.isArray(medsAnswer) && medsAnswer.includes("yes");
        }
        return true;
      });
      setCurrentPhaseIndex(currentPhaseIndex - 1);
      setCurrentQuestionIndex(prevVisibleQuestions.length - 1);
    } else {
      // Go back to diagnosis question
      setShowDiagnosisQuestion(true);
    }
  };

  const canGoBack = !showDiagnosisQuestion;

  const handleGratificationContinue = () => {
    setShowGratification(false);
    setCurrentPhaseIndex(currentPhaseIndex + 1);
    setCurrentQuestionIndex(0);
  };

  const canContinue = () => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === "slider") return true;
    const answer = answers[currentQuestion.id];
    return Array.isArray(answer) && answer.length > 0;
  };

  const gratificationMessages: Record<number, { title: string; subtitle: string }> = {
    0: { title: "Great, nice to meet you! 🌟", subtitle: "Now let's understand how you're feeling." },
    2: { title: "You're all set! 🎯", subtitle: "Just a couple more preferences to go." },
  };

  if (showGratification) {
    const message = gratificationMessages[currentPhaseIndex] || {
      title: "Looking good! ✨",
      subtitle: "Let's keep going."
    };
    return (
      <GratificationScreen
        title={message.title}
        subtitle={message.subtitle}
        onContinue={handleGratificationContinue}
        type="celebration"
      />
    );
  }

  // After diagnosis selection, if migraine → use the streamlined 7-step
  // onboarding. Per spec (parsed-floating-newell.md): onboarding ends at
  // gratification → home. Medication setup is a HOME-screen action, not a
  // detour — wiring it into onboarding caused an infinite loop because
  // medication-onboarding-from-flow returned to "onboarding".
  if (!showDiagnosisQuestion && diagnosis === "migraine") {
    return (
      <MigraineOnboarding
        onComplete={(profile) => {
          try {
            localStorage.setItem(
              "nc-migraine-profile",
              JSON.stringify(profile),
            );
          } catch {}
          onComplete("migraine");
        }}
        onSkip={onSkip}
        onBack={() => setShowDiagnosisQuestion(true)}
        onMenstrualEnabled={onMenstrualEnabled}
      />
    );
  }

  // Render diagnosis question first
  if (showDiagnosisQuestion) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="diagnosis"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.25 }}
        >
          <OnboardingQuestion
            progress={1}
            totalSteps={totalQuestions}
            title={diagnosisQuestion.title}
            helper={diagnosisQuestion.helper}
            questionType={diagnosisQuestion.type}
            options={diagnosisQuestion.options}
            selectedValues={diagnosis ? [diagnosis] : []}
            onSelect={handleDiagnosisSelect}
            onContinue={() => {}}
            canContinue={false}
            showBackButton={false}
            onBack={() => {}}
            showSkip={!!onSkip}
            onSkip={onSkip}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!currentQuestion) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${currentPhaseIndex}-${currentQuestionIndex}`}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.25 }}
      >
        <OnboardingQuestion
          progress={completedQuestions + 1}
          totalSteps={totalQuestions}
          title={currentQuestion.title}
          helper={currentQuestion.helper}
          questionType={currentQuestion.type}
          options={currentQuestion.options}
          selectedValues={(answers[currentQuestion.id] as string[]) || []}
          sliderValue={typeof answers[currentQuestion.id] === "number" ? answers[currentQuestion.id] as number : 5}
          onSelect={handleSelect}
          onSliderChange={handleSliderChange}
          onSliderCommit={handleSliderCommit}
          onContinue={handleContinue}
          canContinue={canContinue()}
          showBackButton={canGoBack}
          onBack={handleBack}
          showSkip={false}
          onSkip={onSkip}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingFlow;
