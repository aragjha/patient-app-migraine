import { NeuraContent } from "@/components/NeuraContentCard";

export const neuraContentLibrary: Record<string, NeuraContent> = {
  "triggers-overview": {
    id: "triggers-overview",
    source: "maps-lesson",
    sourceLabel: "NeuroCare Learn",
    title: "Understanding Your Triggers",
    thumbnail: "🎯",
    duration: "5 min read",
    body: "Migraine triggers are factors that increase your likelihood of having an attack. The most common ones are stress, poor sleep, hormonal changes, skipped meals, and weather shifts. Not every trigger causes an attack every time — most people need a combination of triggers within a threshold period.\n\nThe goal of tracking isn't to avoid every trigger (impossible) — it's to understand which combinations matter most to YOU, so you can make targeted changes.\n\nStart by logging your next 10 attacks with as much trigger detail as you can. Patterns usually emerge within 3-4 weeks.",
  },
  "cgrp-medications": {
    id: "cgrp-medications",
    source: "explainer",
    sourceLabel: "Explainer",
    title: "CGRP Medications Explained",
    thumbnail: "💊",
    duration: "3 min read",
    body: "CGRP (calcitonin gene-related peptide) medications are a newer class of migraine treatments that block a protein involved in migraine attacks.\n\nPreventive CGRP options:\n• Erenumab (Aimovig) — monthly injection\n• Fremanezumab (Ajovy) — monthly or quarterly injection\n• Galcanezumab (Emgality) — monthly injection\n• Eptinezumab (Vyepti) — quarterly IV infusion\n• Atogepant (Qulipta) — daily pill\n\nAcute CGRP options:\n• Ubrogepant (Ubrelvy) — pill taken at attack onset\n• Rimegepant (Nurtec ODT) — dissolvable pill\n• Zavegepant (Zavzpret) — nasal spray\n\nCGRPs tend to have fewer side effects than older preventive drugs like topiramate or beta-blockers. Talk to your neurologist about whether they're right for you.",
  },
  "sleep-hygiene": {
    id: "sleep-hygiene",
    source: "maps-lesson",
    sourceLabel: "NeuroCare Learn",
    title: "Sleep & Migraine",
    thumbnail: "😴",
    duration: "4 min read",
    body: "Sleep and migraine have a complicated relationship — both too little and too much sleep can trigger attacks, and migraines can disrupt sleep.\n\nCore principles:\n• Keep a consistent bedtime and wake time (even weekends)\n• Aim for 7-8 hours\n• Wind down 30 minutes before bed — no screens\n• Keep the room cool (65-68°F), dark, and quiet\n• Limit caffeine after noon\n\nIf you consistently wake up with a headache, talk to your doctor about sleep apnea screening.",
  },
  "stress-management": {
    id: "stress-management",
    source: "maps-lesson",
    sourceLabel: "NeuroCare Learn",
    title: "Stress & Migraine Triggers",
    thumbnail: "🧘",
    duration: "5 min read",
    body: "Stress is the #1 reported migraine trigger. But it's not always acute stress that causes attacks — often it's the 'let-down' after stress ends (like getting a migraine on Friday evening after a tough week).\n\nStrategies that work:\n• Daily 10-minute breathing or meditation practice\n• Regular aerobic exercise (3-4 times per week)\n• Consistent meal times\n• Progressive muscle relaxation\n• Cognitive behavioral therapy (CBT) for chronic stress\n\nEven small daily habits can significantly reduce stress-triggered attacks over time.",
  },
  "menstrual-migraine": {
    id: "menstrual-migraine",
    source: "maps-lesson",
    sourceLabel: "NeuroCare Learn",
    title: "Menstrual Migraines",
    thumbnail: "📅",
    duration: "4 min read",
    body: "About 60% of women with migraine notice a connection between their attacks and their menstrual cycle. The drop in estrogen that happens just before your period is a known trigger.\n\nThese migraines often:\n• Hit 2 days before to 3 days after period starts\n• Are more severe and last longer than other attacks\n• Respond less well to standard triptans\n\nOptions to discuss with your doctor:\n• Short-term preventive medication during the menstrual window\n• Hormonal therapy (if appropriate)\n• CGRP medications for prevention\n\nTracking your cycle alongside your attacks helps confirm the pattern and gives your doctor clear data.",
  },
  "when-to-see-doctor": {
    id: "when-to-see-doctor",
    source: "explainer",
    sourceLabel: "Explainer",
    title: "When to See a Doctor",
    thumbnail: "👩‍⚕️",
    duration: "2 min read",
    body: "Most migraines are manageable at home, but see a doctor or seek emergency care if:\n\n🚨 Emergency (call 911):\n• 'Worst headache of your life' (thunderclap)\n• Sudden weakness on one side of the body\n• Trouble speaking or confusion\n• Fever + stiff neck + headache\n• Headache after a head injury\n\n📞 Call your doctor soon if:\n• You have a new type of headache after age 50\n• Frequency is increasing (more than 4 per month)\n• Rescue medications aren't working\n• Attacks are interfering with work or life regularly\n\nEven if none of these apply, a neurologist can help you build a better prevention plan and discuss newer medication options.",
  },
  "preventive-vs-acute": {
    id: "preventive-vs-acute",
    source: "explainer",
    sourceLabel: "Explainer",
    title: "Preventive vs Acute Medications",
    thumbnail: "💊",
    duration: "3 min read",
    body: "Migraine medications fall into two categories:\n\n**Acute (rescue)** — taken when an attack starts to stop it:\n• Triptans (sumatriptan, rizatriptan, eletriptan)\n• Gepants (ubrogepant, rimegepant, zavegepant)\n• NSAIDs (ibuprofen, naproxen, ketorolac)\n• Ditans (lasmiditan)\n• Combination analgesics (Excedrin Migraine)\n\n**Preventive** — taken daily or periodically to reduce attack frequency:\n• CGRP antibodies (Aimovig, Ajovy, Emgality, Vyepti)\n• CGRP gepant (Qulipta)\n• Botox injections (for chronic migraine)\n• Topiramate, propranolol, amitriptyline\n• Magnesium, riboflavin, CoQ10 supplements\n\nIf you're using acute medication more than 2 days per week, you likely need preventive treatment. Talk to your doctor.",
  },
  "aura-what-is-it": {
    id: "aura-what-is-it",
    source: "explainer",
    sourceLabel: "Explainer",
    title: "What Is Migraine Aura?",
    thumbnail: "⚡",
    duration: "3 min read",
    body: "Aura is a temporary neurological change that happens before or during a migraine attack. About 25-30% of migraine sufferers experience aura.\n\nCommon aura types:\n• **Visual** (most common) — flashing lights, zigzag patterns, blind spots\n• **Sensory** — tingling or numbness, often in hand/face\n• **Speech** — difficulty finding words\n• **Motor** — weakness (rare; called hemiplegic migraine)\n\nAura usually lasts 20-60 minutes and resolves before or as the headache begins. Most aura is harmless, but:\n\n⚠️ Seek immediate medical attention if:\n• Aura lasts over an hour\n• You experience sudden one-sided weakness that's new to you\n• You have symptoms that mimic stroke (facial drooping, arm weakness, speech trouble)",
  },
  "daily-habits": {
    id: "daily-habits",
    source: "maps-lesson",
    sourceLabel: "NeuroCare Learn",
    title: "Daily Habits That Reduce Attacks",
    thumbnail: "🌱",
    duration: "5 min read",
    body: "The 'SEEDS' framework is widely used by headache specialists:\n\n**S - Sleep:** Consistent 7-8 hours, same bedtime every day.\n**E - Exercise:** 30 min aerobic activity, 3-4 times per week.\n**E - Eat:** Regular meals, stay hydrated, limit known food triggers.\n**D - Diary:** Track daily to identify patterns.\n**S - Stress management:** Meditation, CBT, yoga, breathing exercises.\n\nConsistency matters more than intensity. A steady baseline of these habits can reduce attack frequency by 30-50% over 3 months — without any medication.",
  },
  "effective-rescue": {
    id: "effective-rescue",
    source: "explainer",
    sourceLabel: "Explainer",
    title: "Making Rescue Medication Work Better",
    thumbnail: "⏱️",
    duration: "3 min read",
    body: "Timing is everything with migraine rescue medication. Here's how to maximize effectiveness:\n\n**Take it early.** Rescue meds (triptans, gepants, NSAIDs) work best when taken within 30 minutes of pain starting. Once pain peaks, they're less effective.\n\n**Don't chase the pain.** If you're unsure, take it. Waiting often makes attacks harder to stop.\n\n**Pair with non-drug strategies:** Dark room, rest, hydration, ice pack, and caffeine (if you normally respond well) can boost medication effectiveness.\n\n**Track what works.** Rate each medication's effectiveness after each attack so you and your doctor know which drugs are worth continuing.\n\n**Watch for rebound.** Using acute medication more than 10 days per month can cause medication-overuse headache — a cycle that makes things worse. Talk to your doctor if you're approaching this.",
  },
};

/** Intent keywords → content IDs mapping */
export const intentToContentMap: Record<string, string[]> = {
  triggers: ["triggers-overview"],
  trigger: ["triggers-overview"],
  cgrp: ["cgrp-medications", "preventive-vs-acute"],
  gepant: ["cgrp-medications"],
  medication: ["preventive-vs-acute", "cgrp-medications"],
  sleep: ["sleep-hygiene", "daily-habits"],
  stress: ["stress-management"],
  menstrual: ["menstrual-migraine"],
  period: ["menstrual-migraine"],
  cycle: ["menstrual-migraine"],
  doctor: ["when-to-see-doctor"],
  emergency: ["when-to-see-doctor"],
  preventive: ["preventive-vs-acute", "cgrp-medications"],
  aura: ["aura-what-is-it"],
  habits: ["daily-habits"],
  rescue: ["effective-rescue"],
  triptan: ["preventive-vs-acute", "effective-rescue"],
};

export function findContentForIntent(query: string): NeuraContent[] {
  const normalized = query.toLowerCase();
  const matched = new Set<string>();
  Object.entries(intentToContentMap).forEach(([keyword, ids]) => {
    if (normalized.includes(keyword)) {
      ids.forEach((id) => matched.add(id));
    }
  });
  return Array.from(matched)
    .map((id) => neuraContentLibrary[id])
    .filter(Boolean);
}
