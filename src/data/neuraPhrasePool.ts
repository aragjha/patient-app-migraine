// Phrases grouped by "step key" — each step has multiple variations.
// pickPhrase selects one that hasn't been used in the last 2 calls for that key,
// so running a script twice in a row produces different wording.
export const phrasePool: Record<string, string[]> = {
  // Headache log
  "headache.open": [
    "Sorry to hear that. Let's log it — 30 seconds.",
    "That's rough. Let's get it down so we can spot patterns.",
    "Ugh, let's log this one.",
  ],
  "headache.location": [
    "Where does it hurt?",
    "Show me the pain — tap the spots.",
    "Same spot as last time, or somewhere new?",
    "Tap the pain areas for me.",
  ],
  "headache.painLevel": [
    "How bad, 0-10?",
    "Pain level right now?",
    "Rate the pain for me.",
  ],
  "headache.timing": [
    "When did this start?",
    "How long has it been going?",
    "When did it begin?",
  ],
  "headache.symptoms": [
    "Anything else going on?",
    "Any other symptoms?",
    "Nausea, light sensitivity — any of that?",
  ],
  "headache.trigger": [
    "Any idea what triggered it?",
    "What do you think set this off?",
    "Anything unusual today — stress, sleep, food?",
  ],
  "headache.medication": [
    "Taking anything for it?",
    "Any meds so far?",
    "What have you tried?",
  ],
  "headache.close": [
    "Logged. Rest up — I'll check on you later.",
    "Got it all. Take care of yourself.",
    "All logged. Hope it passes soon.",
  ],

  // Daily check-in
  "checkin.open": [
    "Quick daily check — how are you feeling?",
    "Morning! How's today treating you?",
    "Let's do a quick 60-second check-in.",
  ],
  "checkin.overall": [
    "How are you feeling overall, 0-10?",
    "Where are you today, 1 to 10?",
    "Rate today for me.",
  ],
  "checkin.headache": [
    "Any headache today?",
    "Head hurting at all?",
    "How's the head?",
  ],
  "checkin.sleep": [
    "How'd you sleep?",
    "Sleep last night?",
    "Restful night or rough?",
  ],
  "checkin.meds": [
    "Take your meds today?",
    "All meds in?",
    "Meds today — yes or missed?",
  ],
  "checkin.mood": [
    "How's your mood?",
    "Feeling okay mentally?",
    "Mood today?",
  ],
  "checkin.close": [
    "Logged! Thanks for checking in.",
    "Got it. Keep up the streak.",
    "Check-in done. You're building a solid picture.",
  ],

  // Trigger diary
  "triggers.open": [
    "You've had a tough week. Want to spend a minute on what might have triggered your attacks?",
    "Let's dig into possible triggers.",
    "Time to look at what might be setting off your migraines.",
  ],
  "triggers.prompt": [
    "Select anything that applies from this week.",
    "Tap whatever feels relevant.",
    "Pick any that you noticed.",
  ],
  "triggers.close": [
    "Noted. Patterns usually emerge after 3-4 weeks of tracking.",
    "Logged. The more we track, the clearer your patterns get.",
    "Got it. I'll flag when I see something.",
  ],

  // Medication check
  "meds.open": [
    "Let's check your meds for today.",
    "Medication check — tap what you've taken.",
    "Which of these did you take today?",
  ],
  "meds.close": [
    "Logged. Adherence keeps your prevention working.",
    "Got it. Solid work staying on track.",
    "Tracked.",
  ],

  // Daily discovery (1-min check-in)
  "discovery.open": [
    "Hey — 60 seconds. Let's see how today went.",
    "Quick check-in time. Ready?",
    "One minute. Let's build your picture.",
  ],
  "discovery.lifestyle": [
    "How many hours did you sleep last night?",
    "Sleep check — how'd you do last night?",
    "How was your sleep?",
  ],
  "discovery.headPain": [
    "Any head pain today?",
    "How's your head been today?",
    "Head pain check — anything to note?",
  ],
  "discovery.quickFactor": [
    "How's your mood been?",
    "How stressed were you today?",
    "Any tension in your neck or shoulders?",
  ],
  "discovery.close": [
    "Done. You're building a real picture.",
    "That's it — streak updated. Keep it going.",
    "Logged. Patterns take shape with every check-in.",
  ],

  // Generic acknowledgements
  "ack.gotIt": ["Got it.", "Noted.", "Okay.", "Logged.", "Thanks."],
  "ack.anythingElse": ["Anything else?", "More to log?", "Keep going or done?"],
  "ack.continue": [
    "Next —",
    "Okay, next one.",
    "Good. One more thing —",
    "Alright —",
    "Thanks. Moving on —",
  ],

  // Derailment return
  "derail.return": [
    "Back to your headache —",
    "Back to the log —",
    "Now, where were we —",
  ],
};

// Track recently used phrases per step (last 2) to avoid repeats
const recentlyUsed: Record<string, string[]> = {};

export function pickPhrase(key: string): string {
  const options = phrasePool[key];
  if (!options || options.length === 0) return "";

  const recent = recentlyUsed[key] || [];
  const unused = options.filter((p) => !recent.includes(p));
  const pool = unused.length > 0 ? unused : options;

  const phrase = pool[Math.floor(Math.random() * pool.length)];

  // Remember last 2 used
  recentlyUsed[key] = [phrase, ...recent].slice(0, 2);

  return phrase;
}

// For test/deterministic picks
export function resetPhraseHistory() {
  Object.keys(recentlyUsed).forEach((k) => delete recentlyUsed[k]);
}
