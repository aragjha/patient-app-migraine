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

// Helpers — exact-word matchers for very short phrases to prevent "hi" from
// matching "this" etc. These are checked before the generic substring rules.
const exactWordMatchers: Array<{ words: string[]; result: IntentResult }> = [
  {
    words: ["hi", "hey", "hello", "yo", "sup"],
    result: {
      type: "conversational",
      text:
        "Hey! What can I help with? Try 'Log a headache' or ask me anything about migraines.",
    },
  },
  {
    words: ["yes", "yeah", "yep", "yup", "sure"],
    result: { type: "conversational", text: "Great. What did you want to do?" },
  },
  {
    words: ["no", "nope", "nah"],
    result: {
      type: "conversational",
      text: "No worries. Just tap a quick action below when you're ready.",
    },
  },
  {
    words: ["thanks", "thank you", "ty", "thx"],
    result: {
      type: "conversational",
      text: "Anytime. I'm here whenever you need.",
    },
  },
  {
    words: ["help", "what can you do", "what do you do", "capabilities"],
    result: {
      type: "conversational",
      text:
        "I can help you log headaches, track your check-ins, fill diaries, check medications, find patterns in your triggers, or answer questions about migraines. Just ask or tap a quick action.",
    },
  },
];

const rules: IntentRule[] = [
  // Doctor share / export (specific — must come before generic "doctor" later)
  {
    keywords: [
      "share with doctor",
      "doctor share",
      "send to doctor",
      "export my data",
      "export data",
      "send data to doctor",
    ],
    result: {
      type: "conversational",
      text:
        "I can help you share your data with your doctor. For now, head to Profile → My Data → 'Share with Doctor'.",
    },
  },
  // Active migraine / start timer
  {
    keywords: [
      "start migraine timer",
      "active migraine",
      "start a migraine timer",
      "migraine timer",
    ],
    result: {
      type: "conversational",
      text: "Starting a migraine timer — I'll check on you in a bit.",
    },
  },
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
  // Strip trailing punctuation for exact-word match
  const stripped = query.replace(/[!?.,]+$/g, "").trim();

  // 0. Exact-word conversational matchers (short phrases like "hi", "yes")
  for (const matcher of exactWordMatchers) {
    if (matcher.words.some((w) => stripped === w)) {
      return { ...matcher.result };
    }
    // Also match "help" / "what can you do" as full-phrase questions
    if (matcher.words.some((w) => w.length >= 4 && stripped === w)) {
      return { ...matcher.result };
    }
  }
  // Additional multi-word phrase check for help-style questions
  if (
    stripped === "help" ||
    stripped === "what can you do" ||
    stripped === "what do you do" ||
    stripped.includes("what can you help")
  ) {
    return {
      type: "conversational",
      text:
        "I can help you log headaches, track your check-ins, fill diaries, check medications, find patterns in your triggers, or answer questions about migraines. Just ask or tap a quick action.",
    };
  }

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

  // 3. Fallback unknown (caller decides fallback copy based on context)
  return { type: "unknown" };
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

// ─── Guardrail: refuse non-health / off-topic questions ───────────────────────
// Matches obvious off-topic categories (sports, weather, jokes, politics, code,
// general trivia). NeuroCare's job is migraine support — politely redirect.
const offTopicPatterns: Array<{ tag: string; rx: RegExp }> = [
  { tag: "weather", rx: /\b(weather|forecast|rain|snow|temperature outside|how hot|how cold)\b/ },
  { tag: "sports", rx: /\b(score|football|cricket|nba|nfl|fifa|world cup|champions league|tennis|match)\b/ },
  { tag: "politics", rx: /\b(president|election|trump|biden|modi|vote|prime minister|politics)\b/ },
  { tag: "trivia", rx: /\b(capital of|tallest|fastest car|biggest country|how many planets|history of)\b/ },
  { tag: "jokes", rx: /\b(joke|tell me a joke|funny|riddle|pun)\b/ },
  { tag: "code", rx: /\b(write code|python|javascript|function|fix this bug|stack overflow)\b/ },
  { tag: "celebrity", rx: /\b(taylor swift|beyonce|kanye|messi|ronaldo|elon|musk)\b/ },
  { tag: "math", rx: /\b(\d+\s*[\+\-\*\/]\s*\d+|calculate|solve)\b/ },
  { tag: "time", rx: /\b(what time is it|current time|date today)\b/ },
  { tag: "navigation", rx: /\b(how do i get to|directions|nearest restaurant|find a coffee)\b/ },
  { tag: "shopping", rx: /\b(buy|order|amazon|cheapest|deal on)\b/ },
];

const HEALTH_ALLOWLIST = /\b(migraine|headache|aura|nausea|sleep|stress|caffeine|water|hydration|trigger|medication|med|pill|topiramate|sumatriptan|ibuprofen|aspirin|relief|pain|symptom|attack|streak|reward|profile|doctor|neurologist|menstrual|period|hormonal|appointment)\b/;

export function isOffTopic(input: string): boolean {
  const query = input.toLowerCase().trim();
  if (HEALTH_ALLOWLIST.test(query)) return false;
  return offTopicPatterns.some((p) => p.rx.test(query));
}

/** Polite refusal + redirect for off-topic queries. */
export function guardrailResponse(input: string): string {
  const query = input.toLowerCase().trim();
  const tag = offTopicPatterns.find((p) => p.rx.test(query))?.tag ?? "off-topic";

  const redirects: Record<string, string> = {
    weather:
      "I stay focused on your migraine care — I won't pull weather forecasts. But weather shifts are a real trigger; want to log today as a pressure-change day?",
    sports:
      "I'm here for your migraine journey, not scores. Want to do a quick check-in or log how you're feeling?",
    politics:
      "I keep myself out of politics. Let's stay on your health — anything you want to track today?",
    trivia:
      "That's outside what I help with. I focus on patterns in your migraines — want me to pull up your last attack?",
    jokes:
      "I'll skip the jokes — let's keep this useful. Want a quick check-in or a relief session?",
    code:
      "I'm not built for code. But I can help you spot patterns in your migraines — want to look at your triggers?",
    celebrity:
      "Not my lane. I'm here for your headaches — want to do today's check-in?",
    math:
      "I'm not a calculator. Want me to summarize how your week's been pain-wise?",
    time:
      "I don't track wall-clock time. But I do track your migraine timeline — want to see your last attack?",
    navigation:
      "I can't help with directions — I'm a migraine companion. Want to log how you're feeling?",
    shopping:
      "Not what I do. I help you understand your migraines — should we run a quick check-in?",
    "off-topic":
      "That's outside what I help with. I'm focused on your migraine care — want to log a headache or do a quick check-in?",
  };

  return redirects[tag] ?? redirects["off-topic"];
}
