import { ScriptId } from "./neuraScripts";
import { findContentForIntent } from "./neuraContentLibrary";
import { NeuraContent } from "@/components/NeuraContentCard";

export interface IntentResult {
  type: "script" | "content" | "insight" | "appointment" | "conversational" | "unknown";
  scriptId?: ScriptId;
  content?: NeuraContent;
  text?: string;
}

interface IntentRule {
  keywords: string[]; // lowercased match; any of these = match
  result: Omit<IntentResult, "text"> | ((query: string) => IntentResult);
}

const rules: IntentRule[] = [
  // Headache / attack logging
  {
    keywords: [
      "i have a headache",
      "headache started",
      "log a headache",
      "log headache",
      "headache",
      "attack",
      "migraine now",
      "head hurts",
    ],
    result: { type: "script", scriptId: "headache-log" },
  },
  // Daily check-in
  {
    keywords: ["check-in", "checkin", "check in", "quick check", "daily check", "how i'm doing"],
    result: { type: "script", scriptId: "daily-checkin" },
  },
  // Medication check
  {
    keywords: ["check my meds", "did i take", "medication check", "meds today", "my pills", "my medications"],
    result: { type: "script", scriptId: "medication-check" },
  },
  // Trigger-specific diary
  {
    keywords: ["log my triggers", "trigger diary", "what triggered", "log triggers"],
    result: { type: "script", scriptId: "diary-triggers" },
  },
  // Diary categories
  {
    keywords: ["pain diary", "log pain"],
    result: { type: "script", scriptId: "diary-pain" },
  },
  {
    keywords: ["aura", "warning signs"],
    result: { type: "script", scriptId: "diary-aura" },
  },
  {
    keywords: ["relief", "what helped"],
    result: { type: "script", scriptId: "diary-relief" },
  },
  {
    keywords: ["sleep diary", "log sleep"],
    result: { type: "script", scriptId: "diary-sleep" },
  },
  {
    keywords: ["mood diary", "stress diary"],
    result: { type: "script", scriptId: "diary-mood" },
  },
  // Trigger insights
  {
    keywords: ["what's triggering", "show me triggers", "my triggers", "trigger patterns", "pattern found"],
    result: { type: "insight", scriptId: "trigger-insights" },
  },
  // Appointments (placeholder — just returns a text for now)
  {
    keywords: ["appointment", "when is my", "next visit", "doctor visit"],
    result: (_query) => ({
      type: "appointment",
      text: "Your next appointment is Thursday at 2pm with Dr. Patel.",
    }),
  },
];

/** Route user input to an intent. Falls back to content lookup, then generic. */
export function routeIntent(input: string): IntentResult {
  const query = input.toLowerCase().trim();

  // 1. Rule-based matching
  for (const rule of rules) {
    if (rule.keywords.some((kw) => query.includes(kw))) {
      if (typeof rule.result === "function") {
        return rule.result(query);
      }
      return { ...rule.result };
    }
  }

  // 2. Content library lookup (info question)
  const content = findContentForIntent(query);
  if (content.length > 0) {
    return { type: "content", content: content[0] };
  }

  // 3. Fallback conversational
  return {
    type: "conversational",
    text: "Tell me more about what's going on. Or try a quick action below.",
  };
}

/** Detect if an in-flight script should be interrupted by a question. */
export function isDerailment(input: string): boolean {
  const query = input.toLowerCase().trim();
  // If it's a question AND not an obvious widget response (e.g., "yes", "no", single word)
  if (query.length < 4) return false;
  const hasQuestionMark = query.includes("?");
  const hasWhWord = /\b(what|when|where|who|why|how|can|do you)\b/.test(query);
  return hasQuestionMark || hasWhWord;
}

/** Quick one-sentence answer for a derailment. Uses content lookup if possible, else falls back. */
export function briefAnswerForDerailment(input: string): string {
  const query = input.toLowerCase().trim();

  // Appointment-style questions get a direct short answer
  if (/(appointment|next visit|doctor visit|when is my)/.test(query)) {
    return "Your next appointment is Thursday at 2pm with Dr. Patel.";
  }

  // Try the content library, but respond with a single-sentence summary instead of a card
  const content = findContentForIntent(query);
  if (content.length > 0) {
    const first = content[0];
    return `${first.title} — I can pull up the full explainer after we finish logging.`;
  }

  return "Good question — I'll pull that up after we finish logging.";
}
