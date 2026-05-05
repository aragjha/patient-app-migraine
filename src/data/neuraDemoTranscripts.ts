/**
 * Pre-baked transcripts for the dummy voice mode. The voice pill in the
 * prototype doesn't actually capture audio — it picks one of these and
 * "types it in" so we can demo every flow by tapping.
 *
 * Index by ScriptId + step index, or fall back to a free-chat pool.
 */

export const FREE_CHAT_TRANSCRIPTS: string[] = [
  "Why did my Tuesday migraine last so long?",
  "What helped with my last attack?",
  "Is my Topiramate actually working?",
  "How are my meds this week?",
  "What are my biggest triggers right now?",
  "Summarize April for my neurologist visit",
  "Did I sleep enough last week?",
];

export const DIGRESSION_TRANSCRIPTS: string[] = [
  "Wait — what's my next appointment?",
  "Hold on, when did I last take sumatriptan?",
  "Actually, what's the weather like today?",
  "Is this normal? Should I be worried?",
];

/**
 * Per-step transcripts that match a chip / slider value. Used to demo the
 * "speak → modal auto-selects" path. The first matching string is also what
 * gets shown as the live caption while listening.
 */
export const SCRIPT_STEP_TRANSCRIPTS: Record<string, Record<string, string>> = {
  "headache-log": {
    location: "Right side, behind my eye and the temple",
    painLevel: "Maybe a 7… it's pretty bad",
    timing: "About an hour ago",
    symptoms: "Nausea and lights are bothering me",
    trigger: "Stress and I slept like 4 hours",
  },
  "daily-discovery": {
    lifestyle: "I got about six hours",
    headPain: "Mild, just a dull ache",
    quickFactor: "Feeling a bit low today",
  },
  "daily-checkin": {
    overall: "Around a 4",
    headache: "Mild",
    sleep: "Okay, not great",
    meds: "Yes, all of them",
    mood: "Neutral",
  },
  "last-attack": {
    when: "About 3 days ago",
    duration: "Around 4 to 12 hours",
    pain: "Peaked at 8",
    relief: "Breathing exercises usually help me",
  },
  "diary-triggers": {
    triggers: "Stress, poor sleep, and the weather shifted",
  },
  "diary-pain": {
    location: "Top of my head and forehead",
    painLevel: "About a 6",
  },
  "diary-aura": {
    aura: "Some visual aura and tingling",
  },
  "diary-symptoms": {
    symptoms: "Nausea and sound sensitivity",
  },
  "diary-relief": {
    relief: "Dark room and sleep helped most",
  },
  "diary-sleep": {
    quality: "Poor — woke up a lot",
  },
  "diary-mood": {
    mood: "Anxious",
  },
};

export const getStepTranscript = (
  scriptId: string,
  stepId: string,
): string | null => {
  const map = SCRIPT_STEP_TRANSCRIPTS[scriptId];
  if (!map) return null;
  return map[stepId] ?? null;
};

export const pickFreeChat = (): string =>
  FREE_CHAT_TRANSCRIPTS[Math.floor(Math.random() * FREE_CHAT_TRANSCRIPTS.length)];

export const pickDigression = (): string =>
  DIGRESSION_TRANSCRIPTS[Math.floor(Math.random() * DIGRESSION_TRANSCRIPTS.length)];
