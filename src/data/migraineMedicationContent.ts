// Migraine medication tracking types and utilities

export interface Medication {
  id: string;
  name: string;
  dosage: number; // in mg
  quantity: number; // number of pills/tablets
  type: "tablet" | "capsule" | "patch" | "injection" | "liquid" | "nasal_spray";
  frequency: "once" | "twice" | "three" | "four" | "as_needed";
  times: ("morning" | "afternoon" | "evening" | "night")[];
  reminderEnabled: boolean;
  color: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledTime: "morning" | "afternoon" | "evening" | "night";
  takenAt: Date | null;
  skipped: boolean;
  date: string; // YYYY-MM-DD
}

// Popular migraine medications grouped by use
export const popularMedications = [
  // === ACUTE / ABORTIVE TREATMENTS ===

  // Triptans
  { name: "Sumatriptan (Imitrex)", category: "Acute - Triptan" },
  { name: "Rizatriptan (Maxalt)", category: "Acute - Triptan" },
  { name: "Eletriptan (Relpax)", category: "Acute - Triptan" },
  { name: "Zolmitriptan (Zomig)", category: "Acute - Triptan" },
  { name: "Naratriptan (Amerge)", category: "Acute - Triptan" },
  { name: "Almotriptan (Axert)", category: "Acute - Triptan" },
  { name: "Frovatriptan (Frova)", category: "Acute - Triptan" },

  // Gepants (CGRP receptor antagonists) - Acute
  { name: "Ubrogepant (Ubrelvy)", category: "Acute - Gepant" },
  { name: "Rimegepant (Nurtec ODT)", category: "Acute/Preventive - Gepant" },
  { name: "Zavegepant (Zavzpret)", category: "Acute - Gepant (Nasal)" },

  // Ditans
  { name: "Lasmiditan (Reyvow)", category: "Acute - Ditan" },

  // NSAIDs & Analgesics
  { name: "Ibuprofen (Advil/Motrin)", category: "Acute - NSAID" },
  { name: "Naproxen (Aleve)", category: "Acute - NSAID" },
  { name: "Diclofenac (Cambia)", category: "Acute - NSAID" },
  { name: "Celecoxib (Celebrex)", category: "Acute - NSAID" },
  { name: "Ketorolac (Toradol)", category: "Acute - NSAID (Injection)" },
  { name: "Acetaminophen (Tylenol)", category: "Acute - Analgesic" },
  { name: "Aspirin", category: "Acute - Analgesic" },
  { name: "Excedrin Migraine", category: "Acute - Combination Analgesic" },

  // Ergots
  { name: "Ergotamine (Ergomar)", category: "Acute - Ergot" },
  { name: "Dihydroergotamine (Migranal/DHE-45)", category: "Acute - Ergot" },

  // Antiemetics (Rescue)
  { name: "Metoclopramide (Reglan)", category: "Rescue - Antiemetic" },
  { name: "Prochlorperazine (Compazine)", category: "Rescue - Antiemetic" },
  { name: "Ondansetron (Zofran)", category: "Rescue - Antiemetic" },
  { name: "Promethazine (Phenergan)", category: "Rescue - Antiemetic" },

  // === PREVENTIVE TREATMENTS ===

  // CGRP Monoclonal Antibodies (Injections)
  { name: "Erenumab (Aimovig)", category: "Preventive - CGRP Antibody" },
  { name: "Fremanezumab (Ajovy)", category: "Preventive - CGRP Antibody" },
  { name: "Galcanezumab (Emgality)", category: "Preventive - CGRP Antibody" },
  { name: "Eptinezumab (Vyepti)", category: "Preventive - CGRP Antibody (IV)" },

  // Gepants - Preventive
  { name: "Atogepant (Qulipta)", category: "Preventive - Gepant" },

  // Neurotoxin
  { name: "OnabotulinumtoxinA (Botox)", category: "Preventive - Neurotoxin" },

  // Beta Blockers
  { name: "Propranolol (Inderal)", category: "Preventive - Beta Blocker" },
  { name: "Metoprolol (Lopressor)", category: "Preventive - Beta Blocker" },
  { name: "Timolol", category: "Preventive - Beta Blocker" },
  { name: "Atenolol (Tenormin)", category: "Preventive - Beta Blocker" },

  // Anticonvulsants
  { name: "Topiramate (Topamax)", category: "Preventive - Anticonvulsant" },
  { name: "Divalproex Sodium (Depakote)", category: "Preventive - Anticonvulsant" },
  { name: "Gabapentin (Neurontin)", category: "Preventive - Anticonvulsant" },

  // Antidepressants
  { name: "Amitriptyline (Elavil)", category: "Preventive - Tricyclic" },
  { name: "Nortriptyline (Pamelor)", category: "Preventive - Tricyclic" },
  { name: "Venlafaxine (Effexor)", category: "Preventive - SNRI" },
  { name: "Duloxetine (Cymbalta)", category: "Preventive - SNRI" },

  // ARBs / ACE Inhibitors
  { name: "Candesartan (Atacand)", category: "Preventive - ARB" },
  { name: "Lisinopril (Zestril)", category: "Preventive - ACE Inhibitor" },

  // Calcium Channel Blockers
  { name: "Verapamil (Calan)", category: "Preventive - Calcium Channel Blocker" },
  { name: "Flunarizine", category: "Preventive - Calcium Channel Blocker" },

  // === SUPPLEMENTS & NUTRACEUTICALS ===
  { name: "Magnesium (400-600mg)", category: "Supplement" },
  { name: "Riboflavin / Vitamin B2 (400mg)", category: "Supplement" },
  { name: "Coenzyme Q10 (300mg)", category: "Supplement" },
  { name: "Feverfew", category: "Supplement - Herbal" },
  { name: "Butterbur (Petadolex)", category: "Supplement - Herbal" },
  { name: "Melatonin", category: "Supplement" },

  // === DEVICES ===
  { name: "Cefaly (eTNS device)", category: "Device - Neuromodulation" },
  { name: "SpringTMS (sTMS)", category: "Device - Neuromodulation" },
  { name: "gammaCore (nVNS)", category: "Device - Neuromodulation" },
];

export const medicationTypes = [
  { id: "tablet", label: "Tablet", icon: "💊" },
  { id: "capsule", label: "Capsule", icon: "💠" },
  { id: "patch", label: "Patch", icon: "🩹" },
  { id: "injection", label: "Injection", icon: "💉" },
  { id: "liquid", label: "Liquid", icon: "🧴" },
  { id: "nasal_spray", label: "Nasal Spray", icon: "👃" },
];

export const frequencyOptions = [
  { id: "once", label: "Once daily", shortLabel: "1x", icon: "1️⃣" },
  { id: "twice", label: "Twice daily", shortLabel: "2x", icon: "2️⃣" },
  { id: "three", label: "Three times", shortLabel: "3x", icon: "3️⃣" },
  { id: "four", label: "Four times", shortLabel: "4x", icon: "4️⃣" },
  { id: "as_needed", label: "As needed", shortLabel: "PRN", icon: "🔄" },
];

export const timeOptions = [
  { id: "morning", label: "Morning", time: "8:00 AM", icon: "🌅" },
  { id: "afternoon", label: "Afternoon", time: "12:00 PM", icon: "☀️" },
  { id: "evening", label: "Evening", time: "6:00 PM", icon: "🌆" },
  { id: "night", label: "Night", time: "10:00 PM", icon: "🌙" },
];

export const dosagePresets = [2.5, 5, 10, 20, 25, 40, 50, 100, 200, 400, 500];
export const quantityPresets = [1, 2, 3, 4];

export const medicationColors = [
  "#4ECDC4", // Teal
  "#FF6B6B", // Coral
  "#45B7D1", // Sky blue
  "#96CEB4", // Sage
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Gold
];

export const getTimeLabel = (time: string): string => {
  const option = timeOptions.find((t) => t.id === time);
  return option?.label || time;
};

export const getTimeIcon = (time: string): string => {
  const option = timeOptions.find((t) => t.id === time);
  return option?.icon || "⏰";
};

export const getFrequencyLabel = (freq: string): string => {
  const option = frequencyOptions.find((f) => f.id === freq);
  return option?.label || freq;
};

export const getTypeIcon = (type: string): string => {
  const option = medicationTypes.find((t) => t.id === type);
  return option?.icon || "💊";
};

export const formatDosage = (dosage: number, quantity: number, type: string): string => {
  const typeLabel = medicationTypes.find((t) => t.id === type)?.label.toLowerCase() || type;
  return `${dosage}mg × ${quantity} ${typeLabel}${quantity > 1 ? "s" : ""}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
