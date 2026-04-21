export interface PainType {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export interface ReliefItem {
  id: string;
  category: "activity" | "remedy" | "lifestyle";
  label: string;
  icon: string;
  description: string;
  painTypes: string[];
  effectiveness: "high" | "medium" | "low";
}

export const painTypes: PainType[] = [
  { id: "throbbing", label: "Throbbing", icon: "💓", description: "Pulsating pain that comes in waves", color: "from-red-500/20 to-red-600/10" },
  { id: "pressure", label: "Pressure", icon: "🫸", description: "Tight, squeezing feeling around the head", color: "from-blue-500/20 to-blue-600/10" },
  { id: "stabbing", label: "Stabbing", icon: "⚡", description: "Sharp, sudden jolts of pain", color: "from-yellow-500/20 to-yellow-600/10" },
  { id: "dull", label: "Dull Ache", icon: "😔", description: "Constant, low-grade discomfort", color: "from-gray-500/20 to-gray-600/10" },
  { id: "burning", label: "Burning", icon: "🔥", description: "Hot, searing sensation", color: "from-orange-500/20 to-orange-600/10" },
  { id: "behind_eyes", label: "Behind Eyes", icon: "👁️", description: "Deep pressure behind one or both eyes", color: "from-violet-500/20 to-violet-600/10" },
];

export const reliefItems: ReliefItem[] = [
  // Activities
  { id: "dark_room", category: "activity", label: "Dark Room Rest", icon: "🌙", description: "Lie down in a dark, quiet room. Reduce all light and sound. This is the most effective immediate action for most migraines.", painTypes: ["throbbing", "stabbing", "behind_eyes", "burning"], effectiveness: "high" },
  { id: "cold_compress", category: "activity", label: "Cold Compress", icon: "🧊", description: "Apply ice pack or cold cloth to forehead, temples, or back of neck for 15-20 minutes.", painTypes: ["throbbing", "burning", "behind_eyes"], effectiveness: "high" },
  { id: "warm_compress", category: "activity", label: "Warm Compress", icon: "♨️", description: "Apply warm cloth to neck and shoulders. Heat helps relax tight muscles that may be contributing to pain.", painTypes: ["pressure", "dull"], effectiveness: "medium" },
  { id: "breathing", category: "activity", label: "4-7-8 Breathing", icon: "🫁", description: "Breathe in for 4 seconds, hold for 7, exhale for 8. Repeat 4-5 times. This activates your parasympathetic nervous system.", painTypes: ["throbbing", "pressure", "stabbing", "dull", "burning", "behind_eyes"], effectiveness: "medium" },
  { id: "neck_stretch", category: "activity", label: "Gentle Neck Stretches", icon: "🧘", description: "Slowly tilt head side to side, hold 15 seconds each. Roll shoulders backward. Don't force any movement.", painTypes: ["pressure", "dull"], effectiveness: "medium" },
  { id: "acupressure", category: "activity", label: "Acupressure (LI-4)", icon: "👆", description: "Press the webbing between thumb and index finger firmly for 2-3 minutes. Switch hands. This is a well-known pressure point for headache relief.", painTypes: ["throbbing", "pressure", "behind_eyes"], effectiveness: "medium" },
  { id: "temple_massage", category: "activity", label: "Temple Massage", icon: "💆", description: "Use fingertips to gently massage in circles on both temples. Apply moderate pressure for 2-3 minutes.", painTypes: ["pressure", "behind_eyes", "dull"], effectiveness: "medium" },

  // Remedies
  { id: "hydrate", category: "remedy", label: "Drink Water", icon: "💧", description: "Dehydration is a major trigger. Drink 1-2 glasses of water slowly. Add electrolytes if you haven't eaten.", painTypes: ["throbbing", "pressure", "dull", "burning", "behind_eyes", "stabbing"], effectiveness: "high" },
  { id: "caffeine", category: "remedy", label: "Small Caffeine", icon: "☕", description: "A small amount of caffeine (half cup of coffee or tea) can help — it constricts blood vessels. Don't overdo it.", painTypes: ["throbbing", "dull"], effectiveness: "medium" },
  { id: "ginger_tea", category: "remedy", label: "Ginger Tea", icon: "🍵", description: "Ginger has anti-inflammatory properties and can help with nausea. Steep fresh ginger in hot water for 5 minutes.", painTypes: ["throbbing", "dull", "pressure"], effectiveness: "medium" },
  { id: "peppermint_oil", category: "remedy", label: "Peppermint Oil", icon: "🌿", description: "Apply diluted peppermint oil to temples and forehead. The menthol creates a cooling sensation that can ease pain.", painTypes: ["pressure", "dull", "behind_eyes"], effectiveness: "medium" },
  { id: "magnesium", category: "remedy", label: "Magnesium", icon: "💊", description: "If you have magnesium supplements, take as directed. Low magnesium is associated with migraines.", painTypes: ["throbbing", "pressure", "stabbing"], effectiveness: "medium" },
  { id: "light_snack", category: "remedy", label: "Light Snack", icon: "🍌", description: "If you haven't eaten, try a banana, crackers, or nuts. Low blood sugar can worsen migraines.", painTypes: ["throbbing", "dull", "pressure"], effectiveness: "medium" },

  // Lifestyle
  { id: "screen_break", category: "lifestyle", label: "Screen Break", icon: "📱", description: "Turn off all screens. Blue light and visual stimulation can intensify migraines. Rest your eyes completely.", painTypes: ["throbbing", "behind_eyes", "burning", "pressure"], effectiveness: "high" },
  { id: "reduce_noise", category: "lifestyle", label: "Reduce Noise", icon: "🔇", description: "Use earplugs or noise-cancelling headphones. Sound sensitivity (phonophobia) is common during migraines.", painTypes: ["throbbing", "stabbing", "pressure"], effectiveness: "high" },
  { id: "loose_clothing", category: "lifestyle", label: "Loosen Clothing", icon: "👕", description: "Remove tight headbands, ponytails, hats, or neckties. Even light pressure can worsen head pain.", painTypes: ["pressure", "dull"], effectiveness: "low" },
  { id: "cool_room", category: "lifestyle", label: "Cool the Room", icon: "❄️", description: "Lower the room temperature if possible. Heat can worsen migraines. Open a window for fresh air.", painTypes: ["throbbing", "burning"], effectiveness: "medium" },
  { id: "sleep", category: "lifestyle", label: "Try to Sleep", icon: "😴", description: "If possible, sleep. Many migraines resolve during sleep. Even a 20-30 minute nap can help.", painTypes: ["throbbing", "pressure", "stabbing", "dull", "burning", "behind_eyes"], effectiveness: "high" },
];

export const getCategoryLabel = (cat: ReliefItem["category"]): string => {
  switch (cat) {
    case "activity": return "Immediate Actions";
    case "remedy": return "Remedies";
    case "lifestyle": return "Environment";
  }
};

export const getCategoryIcon = (cat: ReliefItem["category"]): string => {
  switch (cat) {
    case "activity": return "⚡";
    case "remedy": return "💊";
    case "lifestyle": return "🏠";
  }
};

export const getReliefsForPainType = (painTypeId: string): ReliefItem[] => {
  return reliefItems
    .filter((r) => r.painTypes.includes(painTypeId))
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.effectiveness] - order[b.effectiveness];
    });
};
