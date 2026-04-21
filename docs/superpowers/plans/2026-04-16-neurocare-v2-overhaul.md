# NeuroCare V2 Patient App Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform NeuroCare from a collection of independent features into a cohesive, story-driven migraine management experience with enhanced onboarding, AI chatbot, structured diary collection for pharma, gamification, and 1-2 years of mock data to demonstrate the full product.

**Architecture:** Six phases executed sequentially. Phase 1 lays data foundations (mock user, updated medications). Phase 2 enhances onboarding with demographics and value storytelling. Phase 3 overhauls the chatbot into a Claude-like conversational AI with modals. Phase 4 restructures diary collection for pharma-grade data. Phase 5 adds new features (notifications, rewards, EHR, NeuroBrowser). Phase 6 polishes the overall experience and adds tracking.

**Tech Stack:** React 18 + TypeScript, TailwindCSS, Framer Motion, Shadcn/ui, Recharts, Supabase (auth), localStorage (state persistence until backend is ready)

---

## Scope Note

This plan covers 9 requirements across 6 phases. Each phase is independently deployable. Phases can be executed in parallel by different subagents where noted.

**Phase dependencies:**
- Phase 1 (Mock Data + Medications) → No dependencies, do first
- Phase 2 (Onboarding) → No dependencies
- Phase 3 (Chatbot) → Benefits from Phase 1 mock data
- Phase 4 (Diary Collection) → Benefits from Phase 1 mock data
- Phase 5 (New Features) → Benefits from Phases 1-4
- Phase 6 (Polish) → Depends on all prior phases

---

## Phase 1: Mock Data Foundation & Medication Update

### Task 1.1: Create Mock User Data Store

**Files:**
- Create: `src/data/mockUserData.ts`

- [ ] **Step 1: Create the mock user profile and 2 years of historical data**

This is the foundational data layer. Create a comprehensive mock user named "Sarah Chen" — a 34-year-old female migraine patient with episodic-to-chronic migraine, 2 years of tracking history.

```typescript
// src/data/mockUserData.ts

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "female" | "male" | "non-binary" | "prefer-not-to-say";
  diagnosis: "migraine" | "parkinsons";
  onboardingCompletedAt: string;
  createdAt: string;
  // Migraine-specific profile
  migraineProfile: {
    frequency: "rare" | "moderate" | "frequent" | "chronic";
    averagePainLevel: number;
    knownTriggers: string[];
    warningSignType: "yes" | "no" | "unsure";
    painZones: string[];
    goals: string[];
    menstrualMigraines: boolean;
    auraType: string[];
  };
}

export interface HistoricalAttack {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string | null;
  durationMinutes: number;
  painLevel: number; // 0-10
  painZones: string[];
  triggers: string[];
  symptoms: string[];
  medicationsTaken: { name: string; dose: string; helpedLevel: number }[];
  reliefMethods: string[];
  auraPresent: boolean;
  auraSymptoms: string[];
  disability: number; // 0-3 MIDAS
  notes: string;
}

export interface HistoricalCheckin {
  id: string;
  date: string;
  overallFeeling: number; // 0-10
  hadHeadache: "no" | "mild" | "moderate" | "severe";
  painLocations: string[];
  symptoms: string[];
  triggers: string[];
  medicationTaken: "yes_helped" | "yes_no_help" | "no";
  disability: number;
}

export interface MedicationAdherenceRecord {
  date: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: "morning" | "afternoon" | "evening" | "night";
  taken: boolean;
  takenAt: string | null;
}

export interface DiaryEntry {
  id: string;
  date: string;
  categoryId: string;
  selectedSymptoms: string[];
  frequency: number; // 0-4
  impact: number; // 0-3
  worstTime: string | null;
  notes: string;
}

export interface MockRewardData {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: { id: string; name: string; earnedAt: string; icon: string }[];
  weeklyGoalProgress: number; // 0-100
}

// --- Mock User Profile ---
export const mockUser: UserProfile = {
  id: "mock-user-001",
  firstName: "Sarah",
  lastName: "Chen",
  email: "sarah.chen@example.com",
  dateOfBirth: "1992-03-15",
  gender: "female",
  diagnosis: "migraine",
  onboardingCompletedAt: "2024-04-10T09:30:00Z",
  createdAt: "2024-04-10T09:00:00Z",
  migraineProfile: {
    frequency: "frequent",
    averagePainLevel: 7,
    knownTriggers: ["stress", "lack_of_sleep", "hormonal_changes", "weather", "skipped_meal"],
    warningSignType: "yes",
    painZones: ["temporal-left", "behind-eyes", "frontal"],
    goals: ["triggers", "relief", "doctor"],
    menstrualMigraines: true,
    auraType: ["visual_disturbances", "tingling_head"],
  },
};

// --- Generate 2 years of attack history ---
function generateAttackHistory(): HistoricalAttack[] {
  const attacks: HistoricalAttack[] = [];
  const startDate = new Date("2024-04-15");
  const endDate = new Date("2026-04-15");

  const triggerPool = ["stress", "lack_of_sleep", "hormonal_changes", "weather", "skipped_meal", "bright_lights", "alcohol", "neck_pain", "anxiety"];
  const symptomPool = ["nausea", "light_sensitivity", "sound_sensitivity", "dizziness", "fatigue", "neck_stiffness", "vision_changes"];
  const painZonePool = ["temporal-left", "behind-eyes", "frontal", "one-sided-left", "occipital"];
  const reliefPool = ["dark_room_rest", "sleep", "ice_packs", "caffeine", "drink_water", "massage"];
  const medicationPool = [
    { name: "Sumatriptan", dose: "50mg" },
    { name: "Ibuprofen", dose: "400mg" },
    { name: "Rizatriptan", dose: "10mg" },
  ];
  const auraSymptomPool = ["visual_disturbances", "tingling_head", "fatigue_achiness"];

  const pick = <T>(arr: T[], min: number, max: number): T[] => {
    const count = min + Math.floor(Math.random() * (max - min + 1));
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  let current = new Date(startDate);
  let id = 1;

  while (current < endDate) {
    // Simulate 8-12 attacks per month, more around menstrual cycle (day 25-28, 1-3)
    const dayOfMonth = current.getDate();
    const isMenstrualWindow = dayOfMonth >= 25 || dayOfMonth <= 3;
    const baseChance = isMenstrualWindow ? 0.45 : 0.30;

    if (Math.random() < baseChance) {
      const painLevel = Math.min(10, Math.max(2, Math.round(4 + Math.random() * 6 + (isMenstrualWindow ? 1 : 0))));
      const hasAura = Math.random() < 0.35;
      const durationMinutes = Math.round(120 + Math.random() * 600); // 2-12 hours
      const startHour = Math.floor(6 + Math.random() * 14);
      const disability = painLevel >= 8 ? (Math.random() < 0.6 ? 3 : 2) : painLevel >= 6 ? (Math.random() < 0.5 ? 2 : 1) : painLevel >= 4 ? 1 : 0;

      attacks.push({
        id: `attack-${id++}`,
        date: current.toISOString().split("T")[0],
        startTime: `${String(startHour).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        endTime: null,
        durationMinutes,
        painLevel,
        painZones: pick(painZonePool, 1, 3),
        triggers: pick(triggerPool, 1, 3),
        symptoms: pick(symptomPool, 2, 4),
        medicationsTaken: pick(medicationPool, 1, 2).map((m) => ({
          ...m,
          helpedLevel: Math.floor(Math.random() * 4) + 1,
        })),
        reliefMethods: pick(reliefPool, 1, 3),
        auraPresent: hasAura,
        auraSymptoms: hasAura ? pick(auraSymptomPool, 1, 2) : [],
        disability,
        notes: "",
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return attacks;
}

// --- Generate daily check-ins (80% adherence) ---
function generateCheckinHistory(): HistoricalCheckin[] {
  const checkins: HistoricalCheckin[] = [];
  const startDate = new Date("2024-04-15");
  const endDate = new Date("2026-04-15");
  let current = new Date(startDate);
  let id = 1;

  while (current < endDate) {
    if (Math.random() < 0.80) {
      const hadAttackToday = Math.random() < 0.3;
      checkins.push({
        id: `checkin-${id++}`,
        date: current.toISOString().split("T")[0],
        overallFeeling: hadAttackToday ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 3) + 6,
        hadHeadache: hadAttackToday ? (Math.random() < 0.3 ? "severe" : Math.random() < 0.5 ? "moderate" : "mild") : "no",
        painLocations: hadAttackToday ? ["temples", "behind_eyes"] : [],
        symptoms: hadAttackToday ? ["nausea", "light_sensitivity"] : [],
        triggers: hadAttackToday ? ["stress", "poor_sleep"] : [],
        medicationTaken: hadAttackToday ? (Math.random() < 0.7 ? "yes_helped" : "yes_no_help") : "no",
        disability: hadAttackToday ? Math.floor(Math.random() * 3) + 1 : 0,
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return checkins;
}

// --- Generate medication adherence (user takes Topiramate daily, Sumatriptan PRN) ---
function generateMedicationAdherence(): MedicationAdherenceRecord[] {
  const records: MedicationAdherenceRecord[] = [];
  const startDate = new Date("2024-06-01"); // started preventive 2 months in
  const endDate = new Date("2026-04-15");
  let current = new Date(startDate);

  while (current < endDate) {
    const dateStr = current.toISOString().split("T")[0];
    // Topiramate - daily evening, ~85% adherence
    records.push({
      date: dateStr,
      medicationId: "med-topiramate",
      medicationName: "Topiramate",
      scheduledTime: "evening",
      taken: Math.random() < 0.85,
      takenAt: Math.random() < 0.85 ? `${dateStr}T20:${String(Math.floor(Math.random() * 30)).padStart(2, "0")}:00Z` : null,
    });
    current.setDate(current.getDate() + 1);
  }

  return records;
}

// --- Generate diary entries ---
function generateDiaryEntries(): DiaryEntry[] {
  const entries: DiaryEntry[] = [];
  const startDate = new Date("2024-04-20");
  const endDate = new Date("2026-04-15");
  const categories = ["headache_pain", "aura_warning", "triggers", "associated_symptoms", "relief_methods", "sleep_quality", "mood_stress"];
  let current = new Date(startDate);
  let id = 1;

  while (current < endDate) {
    // ~2-3 diary entries per week
    if (Math.random() < 0.35) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      entries.push({
        id: `diary-${id++}`,
        date: current.toISOString().split("T")[0],
        categoryId: cat,
        selectedSymptoms: [], // populated per category
        frequency: Math.floor(Math.random() * 4) + 1,
        impact: Math.floor(Math.random() * 3) + 1,
        worstTime: ["Morning", "Afternoon", "Evening", "Night"][Math.floor(Math.random() * 4)],
        notes: "",
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return entries;
}

// --- Reward/Gamification mock data ---
export const mockRewards: MockRewardData = {
  totalPoints: 4_280,
  currentStreak: 12,
  longestStreak: 47,
  badges: [
    { id: "first-checkin", name: "First Check-in", earnedAt: "2024-04-15", icon: "star" },
    { id: "7-day-streak", name: "7-Day Streak", earnedAt: "2024-04-22", icon: "fire" },
    { id: "30-day-streak", name: "30-Day Streak", earnedAt: "2024-05-15", icon: "trophy" },
    { id: "first-diary", name: "Diary Explorer", earnedAt: "2024-04-20", icon: "book" },
    { id: "trigger-detective", name: "Trigger Detective", earnedAt: "2024-06-01", icon: "search" },
    { id: "med-adherence-80", name: "Adherence Champion", earnedAt: "2024-07-01", icon: "pill" },
    { id: "100-checkins", name: "Century Check-in", earnedAt: "2024-08-10", icon: "hundred" },
    { id: "pattern-finder", name: "Pattern Finder", earnedAt: "2024-09-15", icon: "chart" },
  ],
  weeklyGoalProgress: 72,
};

// Pre-generate and export (lazily instantiated)
let _attacks: HistoricalAttack[] | null = null;
let _checkins: HistoricalCheckin[] | null = null;
let _adherence: MedicationAdherenceRecord[] | null = null;
let _diaries: DiaryEntry[] | null = null;

export const getMockAttacks = (): HistoricalAttack[] => {
  if (!_attacks) _attacks = generateAttackHistory();
  return _attacks;
};

export const getMockCheckins = (): HistoricalCheckin[] => {
  if (!_checkins) _checkins = generateCheckinHistory();
  return _checkins;
};

export const getMockAdherence = (): MedicationAdherenceRecord[] => {
  if (!_adherence) _adherence = generateMedicationAdherence();
  return _adherence;
};

export const getMockDiaries = (): DiaryEntry[] => {
  if (!_diaries) _diaries = generateDiaryEntries();
  return _diaries;
};

// --- Aggregate stats for dashboard display ---
export const getMockStats = () => {
  const attacks = getMockAttacks();
  const checkins = getMockCheckins();
  const now = new Date("2026-04-15");

  const last30 = attacks.filter((a) => {
    const d = new Date(a.date);
    return d >= new Date(now.getTime() - 30 * 86400000);
  });

  const last90 = attacks.filter((a) => {
    const d = new Date(a.date);
    return d >= new Date(now.getTime() - 90 * 86400000);
  });

  const triggerCounts: Record<string, number> = {};
  last90.forEach((a) => a.triggers.forEach((t) => {
    triggerCounts[t] = (triggerCounts[t] || 0) + 1;
  }));
  const topTriggers = Object.entries(triggerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([trigger, count]) => ({ trigger, count }));

  const avgPain30 = last30.length > 0
    ? Math.round((last30.reduce((s, a) => s + a.painLevel, 0) / last30.length) * 10) / 10
    : 0;

  return {
    attacksLast30Days: last30.length,
    attacksLast90Days: last90.length,
    avgPainLast30Days: avgPain30,
    topTriggers,
    totalCheckins: checkins.length,
    checkinStreak: mockRewards.currentStreak,
    medicationAdherenceRate: 85,
  };
};
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd "/Users/anurag/Desktop/NDAI/V1 Patient App/V2 Patient App" && npx tsc --noEmit src/data/mockUserData.ts 2>&1 | head -20`
Expected: No errors or only non-blocking warnings

- [ ] **Step 3: Commit**

```bash
git add src/data/mockUserData.ts
git commit -m "feat: add mock user with 2 years of migraine history data"
```

---

### Task 1.2: Update Popular Migraine Medication List

**Files:**
- Modify: `src/data/migraineMedicationContent.ts:25-62`

- [ ] **Step 1: Replace the popularMedications array with a comprehensive, up-to-date list**

Add the following missing medications that are widely prescribed as of 2026:

```typescript
// Replace the existing popularMedications array (lines 25-62) with:
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
```

- [ ] **Step 2: Run type check**

Run: `cd "/Users/anurag/Desktop/NDAI/V1 Patient App/V2 Patient App" && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/data/migraineMedicationContent.ts
git commit -m "feat: update migraine medication list with gepants, ditans, CGRP antibodies, supplements, devices"
```

---

## Phase 2: Enhanced Onboarding with Demographics & Value Story

### Task 2.1: Add Demographics Step (DOB + Gender) to Migraine Onboarding

**Files:**
- Modify: `src/components/MigraineOnboarding.tsx`

- [ ] **Step 1: Add new state and types for demographics**

At the top of the component (after existing state declarations around line 53-58), add:

```typescript
// Add after line 58 (const [headView, setHeadView] = useState...)
const [dateOfBirth, setDateOfBirth] = useState("");
const [gender, setGender] = useState<string | null>(null);
```

Change the total steps from 5 to 7 and update the Step type:

```typescript
// Replace line 49
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Replace line 61
const totalSteps = 7;
```

- [ ] **Step 2: Add gender options data**

After the `warningOptions` array (line 47), add:

```typescript
const genderOptions = [
  { id: "female", label: "Female", icon: "♀️" },
  { id: "male", label: "Male", icon: "♂️" },
  { id: "non-binary", label: "Non-binary", icon: "⚧️" },
  { id: "prefer-not-to-say", label: "Prefer not to say", icon: "🤐" },
];
```

- [ ] **Step 3: Update canContinue to handle new steps**

Replace the `canContinue` function:

```typescript
const canContinue = () => {
  switch (step) {
    case 0: return dateOfBirth.length > 0;
    case 1: return gender !== null;
    case 2: return goals.length > 0;
    case 3: return painZones.length > 0;
    case 4: return frequency !== null;
    case 5: return true; // pain scale always valid
    case 6: return warningSign !== null;
  }
};
```

- [ ] **Step 4: Update handleNext and handleBack for 7 steps**

```typescript
const handleNext = () => {
  if (step < 6) {
    setStep((step + 1) as Step);
  } else {
    onComplete();
  }
};
```

- [ ] **Step 5: Add DOB screen (step 0) and Gender screen (step 1) to the render**

Insert two new AnimatePresence children at the beginning. The DOB screen uses a native date input styled for mobile. The gender screen uses the same card pattern as other steps. Shift all existing steps by +2 (old step 0 becomes step 2, etc.).

DOB step (new step 0):
```tsx
{step === 0 && (
  <motion.div key="dob" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 flex flex-col">
    <h1 className="text-xl font-bold text-foreground mt-4 mb-1">When were you born?</h1>
    <p className="text-sm text-muted-foreground mb-6">This helps us personalize your care plan</p>
    <div className="flex-1 flex flex-col items-center justify-center">
      <input
        type="date"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
        className="w-full px-4 py-4 rounded-2xl bg-card border-2 border-border text-foreground text-lg text-center focus:border-accent focus:outline-none transition-colors"
      />
      {dateOfBirth && (
        <p className="text-sm text-muted-foreground mt-3">
          Age: {Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / 31557600000)} years
        </p>
      )}
    </div>
    <CTAButton size="full" onClick={handleNext} disabled={!canContinue()} className="mt-5">
      Continue
    </CTAButton>
  </motion.div>
)}
```

Gender step (new step 1):
```tsx
{step === 1 && (
  <motion.div key="gender" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 flex flex-col">
    <h1 className="text-xl font-bold text-foreground mt-4 mb-1">How do you identify?</h1>
    <p className="text-sm text-muted-foreground mb-6">This affects which symptoms we track — like hormonal triggers</p>
    <div className="flex-1 flex flex-col justify-center gap-3">
      {genderOptions.map((opt) => (
        <motion.button
          key={opt.id}
          onClick={() => { setGender(opt.id); autoAdvance(); }}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            gender === opt.id
              ? "border-accent bg-accent/10 shadow-md"
              : "border-border bg-card hover:border-accent/30"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-2xl">{opt.icon}</span>
          <span className="text-base font-semibold text-foreground">{opt.label}</span>
          {gender === opt.id && (
            <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  </motion.div>
)}
```

- [ ] **Step 6: Shift existing steps (goals→2, head→3, freq→4, pain→5, warning→6)**

Update all `{step === N &&` conditions:
- `step === 0` (goals) → `step === 2`
- `step === 1` (head) → `step === 3`
- `step === 2` (freq) → `step === 4`
- `step === 3` (pain) → `step === 5`
- `step === 4` (warning) → `step === 6`

Update the final warning step's `onClick` to call `onComplete` when `step === 6`:
```typescript
onClick={() => { setWarningSign(opt.id); setTimeout(onComplete, 400); }}
```

- [ ] **Step 7: Run dev server and verify the onboarding flow**

Run: `cd "/Users/anurag/Desktop/NDAI/V1 Patient App/V2 Patient App" && npm run dev`
Expected: App compiles, onboarding shows DOB → Gender → Goals → Head → Frequency → Pain → Warning (7 steps)

- [ ] **Step 8: Commit**

```bash
git add src/components/MigraineOnboarding.tsx
git commit -m "feat: add DOB and gender to migraine onboarding with conditional flow setup"
```

---

### Task 2.2: Add Conditional Menstruation Tracking Question

**Files:**
- Modify: `src/components/MigraineOnboarding.tsx`

- [ ] **Step 1: Add menstrual tracking state and conditional step**

After the gender step (step 1), when gender is "female", insert a menstrual tracking question as step 2. This shifts subsequent steps again.

Add state:
```typescript
const [tracksMenstruation, setTracksMenstruation] = useState<string | null>(null);
```

Add data:
```typescript
const menstrualOptions = [
  { id: "yes", label: "Yes, I notice a pattern", sub: "Migraines around my period", icon: "📅" },
  { id: "maybe", label: "I'm not sure yet", sub: "Let's find out together", icon: "🤔" },
  { id: "no", label: "No / Not applicable", sub: "Skip this tracking", icon: "➡️" },
];
```

Logic: If `gender !== "female"`, skip step 2 entirely. Update `totalSteps` dynamically:
```typescript
const hasMenstrualStep = gender === "female";
const totalSteps = hasMenstrualStep ? 8 : 7;
```

Update step numbering to be dynamic — use an array of step IDs instead of numeric indices:

```typescript
const stepSequence = [
  "dob",
  "gender",
  ...(hasMenstrualStep ? ["menstrual"] : []),
  "goals",
  "head",
  "frequency",
  "pain",
  "warning",
];
const currentStepId = stepSequence[step];
const totalSteps = stepSequence.length;
```

- [ ] **Step 2: Add the menstrual step render block**

```tsx
{currentStepId === "menstrual" && (
  <motion.div key="menstrual" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 flex flex-col">
    <h1 className="text-xl font-bold text-foreground mt-4 mb-1">Do your migraines relate to your menstrual cycle?</h1>
    <p className="text-sm text-muted-foreground mb-6">Hormonal migraines affect ~60% of women with migraine</p>
    <div className="flex-1 flex flex-col justify-center gap-3">
      {menstrualOptions.map((opt) => (
        <motion.button
          key={opt.id}
          onClick={() => { setTracksMenstruation(opt.id); autoAdvance(); }}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            tracksMenstruation === opt.id
              ? "border-accent bg-accent/10 shadow-md"
              : "border-border bg-card hover:border-accent/30"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-2xl">{opt.icon}</span>
          <div className="text-left flex-1">
            <div className="text-base font-semibold text-foreground">{opt.label}</div>
            <div className="text-xs text-muted-foreground">{opt.sub}</div>
          </div>
        </motion.button>
      ))}
    </div>
  </motion.div>
)}
```

- [ ] **Step 3: Update canContinue for dynamic steps**

```typescript
const canContinue = () => {
  switch (currentStepId) {
    case "dob": return dateOfBirth.length > 0;
    case "gender": return gender !== null;
    case "menstrual": return tracksMenstruation !== null;
    case "goals": return goals.length > 0;
    case "head": return painZones.length > 0;
    case "frequency": return frequency !== null;
    case "pain": return true;
    case "warning": return warningSign !== null;
    default: return false;
  }
};
```

- [ ] **Step 4: Test the conditional flow**

Run the dev server. Test:
1. Select gender "Female" → menstrual question appears
2. Select gender "Male" → menstrual question is skipped
3. Select gender "Non-binary" → menstrual question is skipped
4. Back button works correctly through conditional steps

- [ ] **Step 5: Commit**

```bash
git add src/components/MigraineOnboarding.tsx
git commit -m "feat: add conditional menstrual cycle tracking for female users"
```

---

### Task 2.3: Add Value Proposition Story Screens to Onboarding

**Files:**
- Create: `src/components/ValuePropScreens.tsx`
- Modify: `src/components/OnboardingFlow.tsx` (to integrate value props before diagnosis-specific onboarding)

- [ ] **Step 1: Create the ValuePropScreens component**

These are 3 animated "story" screens shown after diagnosis selection but before the diagnosis-specific onboarding. They set up the WHY of the app — making the experience feel stitched together.

```tsx
// src/components/ValuePropScreens.tsx
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
    subtitle: "Most people don't realize their attacks follow predictable triggers. We'll help you find yours.",
    visual: "🔍",
    accent: "from-violet-500 to-purple-600",
    stat: "73% of users discover a new trigger in their first month",
  },
  {
    id: "data",
    title: "Your diary becomes your superpower",
    subtitle: "Every check-in builds a picture only you and your doctor can see. The more you track, the clearer the pattern.",
    visual: "📊",
    accent: "from-blue-500 to-cyan-600",
    stat: "Patients who track daily reduce attack frequency by 25%",
  },
  {
    id: "control",
    title: "Take control, one day at a time",
    subtitle: "NeuroCare connects your triggers, medications, and relief methods into a single story — so you can finally have that informed conversation with your doctor.",
    visual: "💪",
    accent: "from-emerald-500 to-teal-600",
    stat: "Built with neurologists at NDAI",
  },
];

const parkinsonsStory = [
  {
    id: "tracking",
    title: "Your symptoms tell a story",
    subtitle: "Daily patterns in movement, mood, and sleep reveal how PD affects YOU specifically.",
    visual: "📋",
    accent: "from-blue-500 to-indigo-600",
    stat: "Personalized tracking leads to better medication timing",
  },
  {
    id: "team",
    title: "Your care team sees what you see",
    subtitle: "Share your logs with your neurologist — no more guessing during appointments.",
    visual: "🤝",
    accent: "from-teal-500 to-emerald-600",
    stat: "82% of patients forget symptoms by appointment day",
  },
  {
    id: "together",
    title: "You're not alone in this",
    subtitle: "NeuroCare was built with Parkinson's patients and neurologists to give you tools that actually help.",
    visual: "🌟",
    accent: "from-amber-500 to-orange-600",
    stat: "Built with neurologists at NDAI",
  },
];

const ValuePropScreens = ({ diagnosis, onComplete, onBack }: ValuePropScreensProps) => {
  const [step, setStep] = useState(0);
  const screens = diagnosis === "migraine" ? migraineStory : parkinsonsStory;
  const current = screens[step];

  const handleNext = () => {
    if (step < screens.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Progress dots */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={handleBack} className="p-1 -ml-1 text-muted-foreground">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex gap-1.5">
            {screens.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-accent" : "w-1.5 bg-muted"}`} />
            ))}
          </div>
          <button onClick={onComplete} className="text-xs text-muted-foreground">Skip</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col px-6 pb-6"
        >
          {/* Visual */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${current.accent} flex items-center justify-center mb-8 shadow-lg`}
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <span className="text-5xl">{current.visual}</span>
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground text-center mb-3 leading-tight">{current.title}</h1>
            <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-[280px] mb-6">{current.subtitle}</p>

            {/* Stat badge */}
            <motion.div
              className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-xs font-medium text-accent">{current.stat}</span>
            </motion.div>
          </div>

          <CTAButton size="full" onClick={handleNext}>
            {step < screens.length - 1 ? "Next" : "Let's get started"}
          </CTAButton>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ValuePropScreens;
```

- [ ] **Step 2: Integrate ValuePropScreens into OnboardingFlow**

In `src/components/OnboardingFlow.tsx`, after the user selects their diagnosis (migraine or parkinsons), show the ValuePropScreens before proceeding to the diagnosis-specific onboarding.

Add a new phase state to OnboardingFlow:
```typescript
const [showValueProp, setShowValueProp] = useState(false);
```

After diagnosis selection, instead of immediately showing the migraine/PD onboarding, set `showValueProp = true`. When ValuePropScreens completes, proceed to the diagnosis-specific flow.

The exact integration depends on OnboardingFlow's current phase structure — insert the ValuePropScreens between diagnosis selection and the migraine/PD-specific screens.

- [ ] **Step 3: Test the full onboarding flow**

Expected flow: Splash → Auth → Diagnosis Selection → Value Prop (3 screens) → DOB → Gender → [Menstrual if female] → Goals → Head → Frequency → Pain → Warning → Gratification → Home

- [ ] **Step 4: Commit**

```bash
git add src/components/ValuePropScreens.tsx src/components/OnboardingFlow.tsx
git commit -m "feat: add value proposition story screens to onboarding flow"
```

---

## Phase 3: Chatbot Overhaul — Claude-like Conversational Experience

### Task 3.1: Redesign NeuroGPT Chat with Modal System

**Files:**
- Create: `src/components/ChatModals.tsx`
- Modify: `src/pages/NeuroGPTChat.tsx`

- [ ] **Step 1: Create the ChatModals component for rich interactive cards**

These are bottom-sheet modals that the chatbot can trigger — for diary entry, medication logging, etc. They slide up from the bottom, similar to how Claude shows artifacts.

```tsx
// src/components/ChatModals.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export type ChatModalType =
  | "diary-quick"
  | "medication-check"
  | "trigger-log"
  | "pain-scale"
  | "summary-card"
  | null;

interface ChatModalProps {
  type: ChatModalType;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

const DiaryQuickModal = ({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) => {
  const symptoms = [
    { id: "nausea", label: "Nausea", icon: "🤢" },
    { id: "light", label: "Light sensitivity", icon: "💡" },
    { id: "sound", label: "Sound sensitivity", icon: "🔊" },
    { id: "fatigue", label: "Fatigue", icon: "😓" },
    { id: "dizziness", label: "Dizziness", icon: "💫" },
    { id: "neck_pain", label: "Neck pain", icon: "🦴" },
  ];
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">Quick symptom check</h3>
      <p className="text-sm text-muted-foreground">Tap what you're feeling right now</p>
      <div className="grid grid-cols-2 gap-2">
        {symptoms.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
              selected.includes(s.id) ? "border-accent bg-accent/10" : "border-border bg-card"
            }`}
          >
            <span>{s.icon}</span>
            <span className="text-sm font-medium text-foreground">{s.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => onSubmit({ symptoms: selected })}
        className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold"
      >
        Log symptoms
      </button>
    </div>
  );
};

import { useState } from "react";

const PainScaleModal = ({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) => {
  const [pain, setPain] = useState(5);
  const emojis = ["😊", "🙂", "😐", "🙁", "😣", "😖", "😫"];
  const emojiIndex = Math.min(Math.floor(pain / 1.5), 6);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">Rate your pain</h3>
      <div className="flex flex-col items-center py-4">
        <span className="text-5xl mb-3">{emojis[emojiIndex]}</span>
        <span className="text-3xl font-bold text-foreground">{pain}/10</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={pain}
        onChange={(e) => setPain(Number(e.target.value))}
        className="w-full accent-accent"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>No pain</span>
        <span>Worst</span>
      </div>
      <button
        onClick={() => onSubmit({ painLevel: pain })}
        className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold"
      >
        Log pain level
      </button>
    </div>
  );
};

const MedicationCheckModal = ({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) => {
  const meds = [
    { id: "topiramate", name: "Topiramate", dose: "100mg", time: "Evening" },
    { id: "sumatriptan", name: "Sumatriptan", dose: "50mg", time: "As needed" },
  ];
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">Today's medications</h3>
      <p className="text-sm text-muted-foreground">Did you take these?</p>
      {meds.map((med) => (
        <button
          key={med.id}
          onClick={() => setChecked((prev) => ({ ...prev, [med.id]: !prev[med.id] }))}
          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
            checked[med.id] ? "border-green-500 bg-green-500/10" : "border-border bg-card"
          }`}
        >
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">{med.name}</div>
            <div className="text-xs text-muted-foreground">{med.dose} - {med.time}</div>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${checked[med.id] ? "bg-green-500" : "bg-muted"}`}>
            {checked[med.id] && <span className="text-white text-xs">✓</span>}
          </div>
        </button>
      ))}
      <button
        onClick={() => onSubmit({ medications: checked })}
        className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold"
      >
        Save
      </button>
    </div>
  );
};

const ChatModal = ({ type, onClose, onSubmit }: ChatModalProps) => {
  const renderModal = () => {
    switch (type) {
      case "diary-quick": return <DiaryQuickModal onSubmit={onSubmit} />;
      case "pain-scale": return <PainScaleModal onSubmit={onSubmit} />;
      case "medication-check": return <MedicationCheckModal onSubmit={onSubmit} />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      {type && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t border-border shadow-2xl max-h-[75vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-1 rounded-full bg-muted mx-auto" />
                <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full bg-muted/50">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              {renderModal()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ChatModals.tsx
git commit -m "feat: add interactive chat modal system for diary, meds, pain scale"
```

---

### Task 3.2: Rewrite NeuroGPT with Shorter Questions & Modal Integration

**Files:**
- Modify: `src/pages/NeuroGPTChat.tsx`

- [ ] **Step 1: Redesign the chat to be conversational and prompt-driven**

The key changes:
1. Replace long demo messages with short, conversational ones
2. Add smart quick-action chips that change based on context
3. Integrate ChatModals — when user asks about symptoms, pop up the symptom modal
4. Make the bot proactive: "Hey, you haven't checked in today. Quick 30-second check?"

Replace the `demoMessages` array with a shorter, more conversational opening:

```typescript
const demoMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: [
      {
        type: "text",
        text: "Hey Sarah! How's your head today?",
      },
    ],
  },
];
```

Replace `quickChips` with contextual, shorter chips:

```typescript
const quickChips = [
  { label: "Log a headache", icon: Zap, action: "log-headache" },
  { label: "How am I doing?", icon: TrendingUp, action: "stats" },
  { label: "Check my meds", icon: Pill, action: "open-modal:medication-check" },
  { label: "Rate my pain", icon: Activity, action: "open-modal:pain-scale" },
  { label: "Log symptoms", icon: ClipboardCheck, action: "open-modal:diary-quick" },
];
```

- [ ] **Step 2: Add modal state and smart responses**

Add to the component:
```typescript
import ChatModal, { ChatModalType } from "@/components/ChatModals";

// Inside the component:
const [activeModal, setActiveModal] = useState<ChatModalType>(null);
```

Update `handleChipClick` to handle modal actions:
```typescript
const handleChipClick = (chip: typeof quickChips[number]) => {
  if (chip.action.startsWith("open-modal:")) {
    const modalType = chip.action.replace("open-modal:", "") as ChatModalType;
    setActiveModal(modalType);
    return;
  }

  // Add user message
  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    role: "user",
    content: [{ type: "text", text: chip.label }],
  };

  // Smart contextual response
  let response: MessageContent[];
  switch (chip.action) {
    case "stats":
      response = [
        { type: "text", text: "This month: 8 attacks, avg pain 6.2/10. Your top trigger is stress (5 attacks). That's down from 11 attacks last month — nice progress!" },
      ];
      break;
    case "log-headache":
      response = [
        { type: "text", text: "Sorry to hear that. Let me help you log it quickly." },
      ];
      // Could trigger navigation to LogHeadacheFlow
      break;
    default:
      response = [
        { type: "text", text: "I can help with that! What would you like to know?" },
      ];
  }

  const botMsg: ChatMessage = {
    id: (Date.now() + 1).toString(),
    role: "assistant",
    content: response,
  };

  setMessages((prev) => [...prev, userMsg, botMsg]);
};
```

- [ ] **Step 3: Add ChatModal to the render, handle modal submit**

At the end of the component's return, before the closing `</div>`:
```tsx
<ChatModal
  type={activeModal}
  onClose={() => setActiveModal(null)}
  onSubmit={(data) => {
    setActiveModal(null);
    // Add confirmation message
    const botMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: [{ type: "text", text: "Got it, logged! Anything else?" }],
    };
    setMessages((prev) => [...prev, botMsg]);
  }}
/>
```

- [ ] **Step 4: Make the input area cleaner — larger mic button, persistent input**

Keep the existing mic + text input layout but ensure the quick chips update contextually. The mic button should be the primary interaction (tap and speak).

- [ ] **Step 5: Test the chatbot flow**

Run dev server. Test:
1. Quick chips open modals correctly
2. Modal submissions add confirmation messages
3. "How am I doing?" shows stats
4. Mic button toggles listening state
5. Text input still works

- [ ] **Step 6: Commit**

```bash
git add src/pages/NeuroGPTChat.tsx
git commit -m "feat: redesign NeuroGPT with short conversational prompts and modal integration"
```

---

## Phase 4: Structured Migraine Diary Collection for Pharma

### Task 4.1: Create Pharma-Grade Diary Export Data Model

**Files:**
- Create: `src/data/diaryExportSchema.ts`

- [ ] **Step 1: Define the structured export schema**

This is the data format pharma companies need. Every diary entry, attack log, and check-in should be exportable in this standardized format.

```typescript
// src/data/diaryExportSchema.ts

export interface PharmaExportRecord {
  patientId: string;
  recordType: "attack" | "daily-checkin" | "diary-entry" | "medication-log";
  timestamp: string; // ISO 8601
  date: string; // YYYY-MM-DD

  // Demographics (de-identified for pharma)
  demographics: {
    ageAtRecord: number;
    gender: string;
    diagnosisType: string;
    migraineSubtype: string; // episodic, chronic, menstrual, with-aura
    yearsWithDiagnosis: number;
  };

  // Attack data (when recordType === "attack")
  attack?: {
    painLevel: number;
    painLocations: string[];
    painQuality: string[]; // throbbing, pressing, stabbing
    durationMinutes: number;
    auraPresent: boolean;
    auraTypes: string[];
    triggers: string[];
    symptoms: string[];
    medicationsTaken: { name: string; dose: string; category: string; effectiveRating: number }[];
    reliefMethods: string[];
    disabilityScore: number; // MIDAS 0-3
    functionalImpact: string; // worked, reduced-activity, bedridden
  };

  // Daily check-in data
  checkin?: {
    overallWellbeing: number; // 0-10
    headachePresent: boolean;
    headacheSeverity: string;
    associatedSymptoms: string[];
    triggersNoticed: string[];
    medicationTaken: boolean;
    medicationEffective: boolean;
    sleepQuality: number;
    stressLevel: number;
    menstrualDay?: number; // day of cycle if tracked
  };

  // Medication adherence
  medicationLog?: {
    medicationName: string;
    medicationCategory: string;
    scheduledTime: string;
    taken: boolean;
    timeTaken?: string;
    sideEffects?: string[];
  };

  // Diary entry
  diaryEntry?: {
    categoryId: string;
    categoryName: string;
    selectedSymptoms: string[];
    frequency: number;
    impact: number;
    worstTime: string;
  };
}

export interface PharmaExportPackage {
  exportVersion: "1.0";
  exportDate: string;
  patientId: string;
  dateRange: { start: string; end: string };
  totalRecords: number;
  summary: {
    totalAttacks: number;
    averagePainLevel: number;
    attacksPerMonth: number;
    topTriggers: { trigger: string; frequency: number }[];
    medicationAdherenceRate: number;
    midasScore: number; // calculated
    diaryCompletionRate: number;
  };
  records: PharmaExportRecord[];
}

export const calculateMIDAS = (attacks: { disabilityScore: number; date: string }[]): number => {
  const last90Days = attacks.filter((a) => {
    const d = new Date(a.date);
    return d >= new Date(Date.now() - 90 * 86400000);
  });
  const totalDisabilityDays = last90Days.reduce((sum, a) => sum + a.disabilityScore, 0);
  if (totalDisabilityDays <= 5) return 1; // Grade I - Little or no disability
  if (totalDisabilityDays <= 10) return 2; // Grade II - Mild disability
  if (totalDisabilityDays <= 20) return 3; // Grade III - Moderate disability
  return 4; // Grade IV - Severe disability
};
```

- [ ] **Step 2: Commit**

```bash
git add src/data/diaryExportSchema.ts
git commit -m "feat: add pharma-grade diary export schema with MIDAS scoring"
```

---

### Task 4.2: Add Diary Completion Tracking to DiariesHub

**Files:**
- Modify: `src/pages/DiariesHub.tsx`

- [ ] **Step 1: Add weekly/monthly diary completion progress**

Add a visual tracker at the top of DiariesHub showing diary completion rates. This encourages users to fill all diary categories regularly.

Import mock data:
```typescript
import { getMockDiaries, getMockStats } from "@/data/mockUserData";
```

Add a completion card above the diary grid:
```tsx
const stats = getMockStats();
const diaries = getMockDiaries();

// At the top of the scrollable area, add:
<div className="mb-4 rounded-2xl bg-card border border-border/50 p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-bold text-foreground">This Week's Diaries</h3>
    <span className="text-xs text-accent font-semibold">4/7 days</span>
  </div>
  <div className="flex gap-1">
    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
      <div key={day} className="flex-1 flex flex-col items-center gap-1">
        <div className={`w-full h-2 rounded-full ${i < 4 ? "bg-accent" : i === 4 ? "bg-accent/30" : "bg-muted"}`} />
        <span className="text-[9px] text-muted-foreground">{day}</span>
      </div>
    ))}
  </div>
  <p className="text-xs text-muted-foreground mt-2">Complete 5+ days this week to earn the Dedicated Tracker badge</p>
</div>
```

- [ ] **Step 2: Test the diary hub**

- [ ] **Step 3: Commit**

```bash
git add src/pages/DiariesHub.tsx
git commit -m "feat: add weekly diary completion tracking to DiariesHub"
```

---

### Task 4.3: Add "Export My Data" Button to Profile

**Files:**
- Modify: `src/pages/ProfilePage.tsx`

- [ ] **Step 1: Add an export section to ProfilePage**

Add a new section with "Export My Data" and "Share with Doctor" buttons. For now, these create a JSON blob and show a success toast — full backend integration comes later.

```tsx
// In the settings list, add a new section:
<div className="mb-4">
  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">My Data</h3>
  <div className="space-y-2">
    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 text-left">
      <Download className="w-5 h-5 text-accent" />
      <div>
        <div className="text-sm font-semibold text-foreground">Export My Data</div>
        <div className="text-xs text-muted-foreground">Download diary, attacks & medication logs</div>
      </div>
    </button>
    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 text-left">
      <Share2 className="w-5 h-5 text-accent" />
      <div>
        <div className="text-sm font-semibold text-foreground">Share with Doctor</div>
        <div className="text-xs text-muted-foreground">Generate a report for your next appointment</div>
      </div>
    </button>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/ProfilePage.tsx
git commit -m "feat: add data export and doctor sharing buttons to profile"
```

---

## Phase 5: New Features — Notifications, Rewards, EHR, NeuroBrowser

### Task 5.1: Build Reward & Gamification System

**Files:**
- Create: `src/components/RewardsCard.tsx`
- Modify: `src/pages/HomeHub.tsx`

- [ ] **Step 1: Create the RewardsCard component**

```tsx
// src/components/RewardsCard.tsx
import { motion } from "framer-motion";
import { Flame, Trophy, Star, Target } from "lucide-react";

interface RewardsCardProps {
  currentStreak: number;
  totalPoints: number;
  weeklyProgress: number;
  badges: { id: string; name: string; icon: string }[];
}

const badgeIcons: Record<string, string> = {
  star: "⭐", fire: "🔥", trophy: "🏆", book: "📖",
  search: "🔍", pill: "💊", hundred: "💯", chart: "📊",
};

const RewardsCard = ({ currentStreak, totalPoints, weeklyProgress, badges }: RewardsCardProps) => (
  <div className="rounded-2xl bg-card border border-border/50 p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Your Progress</h3>
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10">
        <Star className="w-3 h-3 text-amber-500" />
        <span className="text-xs font-bold text-amber-500">{totalPoints.toLocaleString()}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-3">
      <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-500/10">
        <Flame className="w-5 h-5 text-orange-500" />
        <div>
          <div className="text-lg font-bold text-foreground">{currentStreak}</div>
          <div className="text-[9px] text-muted-foreground">Day streak</div>
        </div>
      </div>
      <div className="flex items-center gap-2 p-2 rounded-xl bg-accent/10">
        <Target className="w-5 h-5 text-accent" />
        <div>
          <div className="text-lg font-bold text-foreground">{weeklyProgress}%</div>
          <div className="text-[9px] text-muted-foreground">Weekly goal</div>
        </div>
      </div>
    </div>

    {/* Recent badges */}
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {badges.slice(-5).map((badge) => (
        <motion.div
          key={badge.id}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 shrink-0"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-sm">{badgeIcons[badge.icon] || "🏅"}</span>
          <span className="text-[9px] font-medium text-muted-foreground whitespace-nowrap">{badge.name}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

export default RewardsCard;
```

- [ ] **Step 2: Add RewardsCard to HomeHub**

Import and add above the "Today's Summary" section:
```typescript
import RewardsCard from "@/components/RewardsCard";
import { mockRewards } from "@/data/mockUserData";
```

```tsx
<motion.div className="mb-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d * 4.8 }}>
  <RewardsCard
    currentStreak={mockRewards.currentStreak}
    totalPoints={mockRewards.totalPoints}
    weeklyProgress={mockRewards.weeklyGoalProgress}
    badges={mockRewards.badges}
  />
</motion.div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RewardsCard.tsx src/pages/HomeHub.tsx
git commit -m "feat: add gamification rewards card with streaks, points, and badges"
```

---

### Task 5.2: Add Notification Preferences UI

**Files:**
- Create: `src/components/NotificationSettings.tsx`
- Modify: `src/pages/ProfilePage.tsx`

- [ ] **Step 1: Create NotificationSettings component**

```tsx
// src/components/NotificationSettings.tsx
import { useState } from "react";
import { Bell, Clock, Pill, ClipboardCheck, Calendar, Brain } from "lucide-react";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: "daily-checkin", label: "Daily Check-in Reminder", description: "Remind me to check in every day", icon: ClipboardCheck, enabled: true },
    { id: "medication", label: "Medication Reminders", description: "Remind me to take my medications", icon: Pill, enabled: true },
    { id: "diary", label: "Diary Prompts", description: "Encourage me to complete diary entries", icon: Brain, enabled: true },
    { id: "appointments", label: "Appointment Reminders", description: "Notify before upcoming appointments", icon: Calendar, enabled: true },
    { id: "streak", label: "Streak Alerts", description: "Warn me before I lose my streak", icon: Clock, enabled: false },
    { id: "insights", label: "Weekly Insights", description: "Summary of my weekly patterns", icon: Bell, enabled: true },
  ]);

  const toggle = (id: string) => {
    setSettings((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="space-y-2">
      {settings.map((setting) => {
        const Icon = setting.icon;
        return (
          <button
            key={setting.id}
            onClick={() => toggle(setting.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
          >
            <Icon className="w-5 h-5 text-accent shrink-0" />
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-foreground">{setting.label}</div>
              <div className="text-xs text-muted-foreground">{setting.description}</div>
            </div>
            <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${setting.enabled ? "bg-accent justify-end" : "bg-muted justify-start"}`}>
              <div className="w-5 h-5 rounded-full bg-white shadow-sm mx-0.5" />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default NotificationSettings;
```

- [ ] **Step 2: Add notification settings section to ProfilePage**

```tsx
import NotificationSettings from "@/components/NotificationSettings";

// In ProfilePage, add a new section:
<div className="mb-4">
  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Notifications</h3>
  <NotificationSettings />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/NotificationSettings.tsx src/pages/ProfilePage.tsx
git commit -m "feat: add notification preferences UI to profile settings"
```

---

### Task 5.3: Add EHR Connection & NeuroBrowser Extension UI

**Files:**
- Create: `src/components/ConnectionsCard.tsx`
- Modify: `src/pages/ProfilePage.tsx`

- [ ] **Step 1: Create the ConnectionsCard component**

This shows connection status for EHR (Electronic Health Records) and the NeuroBrowser extension. Both are "coming soon" with a waitlist-style CTA.

```tsx
// src/components/ConnectionsCard.tsx
import { motion } from "framer-motion";
import { Link2, Chrome, Hospital, ChevronRight, CheckCircle2 } from "lucide-react";

interface Connection {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "connected" | "available" | "coming-soon";
  color: string;
}

const connections: Connection[] = [
  {
    id: "ehr",
    name: "Connect to EHR",
    description: "Sync with your hospital's electronic health records",
    icon: Hospital,
    status: "available",
    color: "bg-blue-500",
  },
  {
    id: "neurobrowser",
    name: "NeuroBrowser Extension",
    description: "Track screen time triggers from your browser",
    icon: Chrome,
    status: "coming-soon",
    color: "bg-purple-500",
  },
];

const ConnectionsCard = () => (
  <div className="space-y-2">
    {connections.map((conn) => {
      const Icon = conn.icon;
      return (
        <motion.button
          key={conn.id}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 text-left"
          whileTap={{ scale: 0.98 }}
        >
          <div className={`w-10 h-10 rounded-xl ${conn.color} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{conn.name}</span>
              {conn.status === "connected" && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
              {conn.status === "coming-soon" && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-[9px] font-semibold text-amber-500">Soon</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{conn.description}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.button>
      );
    })}
  </div>
);

export default ConnectionsCard;
```

- [ ] **Step 2: Add to ProfilePage**

```tsx
import ConnectionsCard from "@/components/ConnectionsCard";

// Add to ProfilePage:
<div className="mb-4">
  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Connections</h3>
  <ConnectionsCard />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ConnectionsCard.tsx src/pages/ProfilePage.tsx
git commit -m "feat: add EHR and NeuroBrowser extension connection UI"
```

---

## Phase 6: Polish, Tracking & Cohesive Experience

### Task 6.1: Add Persistent State with localStorage

**Files:**
- Create: `src/hooks/usePersistedState.ts`
- Modify: `src/pages/Index.tsx`

- [ ] **Step 1: Create the usePersistedState hook**

```typescript
// src/hooks/usePersistedState.ts
import { useState, useEffect } from "react";

export function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage full or unavailable
    }
  }, [key, value]);

  return [value, setValue];
}
```

- [ ] **Step 2: Replace key state in Index.tsx with persisted versions**

```typescript
import { usePersistedState } from "@/hooks/usePersistedState";

// Replace these useState calls:
const [diagnosis, setDiagnosis] = usePersistedState<Diagnosis | null>("nc-diagnosis", null);
const [medications, setMedications] = usePersistedState<Medication[]>("nc-medications", []);
const [medicationLogs, setMedicationLogs] = usePersistedState<MedicationLog[]>("nc-medication-logs", []);
const [headacheCount, setHeadacheCount] = usePersistedState("nc-headache-count", 0);
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePersistedState.ts src/pages/Index.tsx
git commit -m "feat: add localStorage persistence for app state across sessions"
```

---

### Task 6.2: Add Mock Data Toggle for Demo Mode

**Files:**
- Modify: `src/pages/ProfilePage.tsx`
- Modify: `src/pages/Index.tsx`

- [ ] **Step 1: Add a "Demo Mode" toggle to ProfilePage**

This loads the mock user's 2-year history into all the dashboards so stakeholders and pharma partners can see what a mature user experience looks like.

```tsx
// In ProfilePage, add to settings:
<button
  onClick={() => {
    localStorage.setItem("nc-demo-mode", localStorage.getItem("nc-demo-mode") === "true" ? "false" : "true");
    window.location.reload();
  }}
  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 text-left"
>
  <Database className="w-5 h-5 text-accent" />
  <div className="flex-1">
    <div className="text-sm font-semibold text-foreground">Demo Mode</div>
    <div className="text-xs text-muted-foreground">Load Sarah's 2-year mock data</div>
  </div>
  <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${localStorage.getItem("nc-demo-mode") === "true" ? "bg-accent justify-end" : "bg-muted justify-start"}`}>
    <div className="w-5 h-5 rounded-full bg-white shadow-sm mx-0.5" />
  </div>
</button>
```

- [ ] **Step 2: In Index.tsx, load mock data when demo mode is active**

```typescript
useEffect(() => {
  if (localStorage.getItem("nc-demo-mode") === "true") {
    setDiagnosis("migraine");
    // Load mock medications
    setMedications([
      { id: "med-topiramate", name: "Topiramate (Topamax)", dosage: 100, quantity: 1, type: "tablet", frequency: "once", times: ["evening"], reminderEnabled: true, color: "#4ECDC4" },
      { id: "med-sumatriptan", name: "Sumatriptan (Imitrex)", dosage: 50, quantity: 1, type: "tablet", frequency: "as_needed", times: [], reminderEnabled: false, color: "#FF6B6B" },
      { id: "med-ibuprofen", name: "Ibuprofen (Advil)", dosage: 400, quantity: 1, type: "tablet", frequency: "as_needed", times: [], reminderEnabled: false, color: "#45B7D1" },
    ]);
    setHeadacheCount(8);
  }
}, []);
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProfilePage.tsx src/pages/Index.tsx
git commit -m "feat: add demo mode toggle to load mock user data for stakeholder demos"
```

---

### Task 6.3: Polish HomeHub with Mock Data Stats

**Files:**
- Modify: `src/pages/HomeHub.tsx`

- [ ] **Step 1: Add insights section using mock stats**

Import and display real-looking insights when mock data is available:

```typescript
import { getMockStats, mockRewards } from "@/data/mockUserData";
```

Add a monthly insights card after the Today's Summary:
```tsx
{/* Monthly Insights */}
<motion.div
  className="mb-4 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 p-4"
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: d * 5.5 }}
>
  <h3 className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-2">This Month's Insights</h3>
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">Attacks</span>
      <span className="text-sm font-bold text-foreground">8 <span className="text-green-500 text-xs font-normal">(-3 vs last month)</span></span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">Avg pain</span>
      <span className="text-sm font-bold text-foreground">6.2/10</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">Top trigger</span>
      <span className="text-sm font-bold text-foreground">Stress (5 attacks)</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">Med adherence</span>
      <span className="text-sm font-bold text-foreground">85%</span>
    </div>
  </div>
</motion.div>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/HomeHub.tsx
git commit -m "feat: add monthly insights card with pattern data to home dashboard"
```

---

### Task 6.4: Final Integration Test & Build Verification

- [ ] **Step 1: Run full type check**

Run: `cd "/Users/anurag/Desktop/NDAI/V1 Patient App/V2 Patient App" && npx tsc --noEmit 2>&1`
Expected: No errors

- [ ] **Step 2: Run build**

Run: `cd "/Users/anurag/Desktop/NDAI/V1 Patient App/V2 Patient App" && npm run build 2>&1`
Expected: Build succeeds

- [ ] **Step 3: Run dev server and test all flows**

Manual test checklist:
- [ ] Splash → Auth → Onboarding (DOB → Gender → [Menstrual] → Value Props → Goals → Head → Freq → Pain → Warning → Gratification)
- [ ] Home dashboard shows insights, rewards, quick actions
- [ ] NeuroGPT chat with modals works (symptom log, pain scale, med check)
- [ ] Diary hub shows completion tracking
- [ ] Profile has notifications, connections, data export, demo mode
- [ ] Demo mode loads mock data correctly
- [ ] All navigation flows work (back buttons, bottom nav, screen transitions)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: NeuroCare V2 overhaul - enhanced onboarding, chatbot, rewards, mock data, medication update"
```

---

## Summary of Files Created/Modified

### New Files (10):
1. `src/data/mockUserData.ts` — Mock user profile + 2 years historical data
2. `src/data/diaryExportSchema.ts` — Pharma export schema + MIDAS scoring
3. `src/components/ValuePropScreens.tsx` — 3-screen value story during onboarding
4. `src/components/ChatModals.tsx` — Interactive bottom-sheet modals for chatbot
5. `src/components/RewardsCard.tsx` — Gamification card (streaks, points, badges)
6. `src/components/NotificationSettings.tsx` — Notification preferences UI
7. `src/components/ConnectionsCard.tsx` — EHR + NeuroBrowser connection cards
8. `src/hooks/usePersistedState.ts` — localStorage persistence hook

### Modified Files (7):
1. `src/data/migraineMedicationContent.ts` — Updated medication list (25 → 60+ meds)
2. `src/components/MigraineOnboarding.tsx` — Added DOB, Gender, conditional menstrual step
3. `src/components/OnboardingFlow.tsx` — Integrated value prop screens
4. `src/pages/NeuroGPTChat.tsx` — Redesigned with short prompts + modal integration
5. `src/pages/DiariesHub.tsx` — Added weekly completion tracking
6. `src/pages/ProfilePage.tsx` — Added notifications, connections, data export, demo mode
7. `src/pages/HomeHub.tsx` — Added rewards card, monthly insights
8. `src/pages/Index.tsx` — Added persisted state + demo mode data loading
