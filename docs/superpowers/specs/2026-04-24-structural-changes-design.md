# NeuroCare — Structural Changes Design Spec

**Date:** 2026-04-24  
**Author:** Anurag + Claude  
**Status:** Approved — ready for implementation  
**Source:** Chris feedback items #1 (2FA OTP), #9 (skip attack prompt), #11a (real calendar data), #11b (menstrual gating), #11c (skip med-help Qs), #12a (auto post-migraine flow), #12b (pre-fill post-migraine)

---

## 1. Data Foundation

### 1a. Persist Attack Logs

**Problem:** `LogHeadacheFlow.onComplete` is `() => void` — all captured data is discarded. `DiariesHub` calendar renders from hardcoded `MOCK_ATTACKS`.

**Schema:** Use the existing `HeadacheLog` type from `src/data/mockUserData.ts`:

```ts
interface HeadacheLog {
  id: string;             // crypto.randomUUID()
  startTime: string;      // ISO string
  endTime?: string;
  duration?: number;      // minutes
  zones: string[];        // e.g. ["temples", "behind_eyes"]
  painPeak: number;       // 0-10
  painEnd?: number;
  symptoms: string[];
  triggers: string[];
  medications: string[];
  reliefEffectiveness?: number; // 0-10
  lingeringSymptoms?: string[];
  notes?: string;
  status: "active" | "ended";
}
```

**Changes:**
- `Index.tsx`: add `attackLogs` to `usePersistedState` (key `"nc-attack-logs"`, default `[]`)
- `LogHeadacheFlow` props: change `onComplete: () => void` → `onComplete: (log: HeadacheLog) => void`
- `Index.tsx`: `onComplete` handler pushes new log into `attackLogs`; if the log has `status: "active"` (user started a timer), also set `activeMigraine = { startTime: new Date(log.startTime), zones: log.zones, medsTaken: log.medications, attackLogId: log.id }`
- `DiariesHub`: remove `MOCK_ATTACKS` import; receive `attackLogs: HeadacheLog[]` as prop

### 1b. Persist Check-in Logs

**Problem:** `DailyCheckinFlow.onComplete` discards captured data. `DiariesHub` calendar renders from hardcoded `MOCK_CHECKINS`.

**Schema:**

```ts
interface CheckInLog {
  id: string;
  date: string;           // ISO date string (YYYY-MM-DD)
  feeling: string;        // "good" | "okay" | "rough"
  hadHeadache: boolean;
  headacheSeverity?: string;
  sleepQuality?: string;
  medicationTaken?: string;
  mood?: string;
  disability?: number;    // 0-3 MIDAS
  notes?: string;
}
```

**Changes:**
- `Index.tsx`: add `checkInLogs` to `usePersistedState` (key `"nc-checkin-logs"`, default `[]`)
- `DailyCheckinFlow` props: change `onComplete: () => void` → `onComplete: (log: CheckInLog) => void`
- `DiariesHub`: remove `MOCK_CHECKINS`; receive `checkInLogs: CheckInLog[]` as prop

### 1c. Utility: hasAttackToday

```ts
// src/utils/attackUtils.ts
export function hasAttackToday(logs: HeadacheLog[]): boolean {
  const today = new Date().toDateString();
  return logs.some(l => new Date(l.startTime).toDateString() === today);
}
```

### 1d. Persist Menstrual Flag

- `Index.tsx`: add `menstrualEnabled` to `usePersistedState` (key `"nc-menstrual-enabled"`, default `false`)
- Set to `true` when MigraineOnboarding saves a "yes" answer to the menstrual_cycle question

---

## 2. OTP Verification Screen

### Context

Inserted between signup success and consent. Demo-safe: any 6-digit code advances. Real verification is a one-line swap.

### Screen: `verify-otp` (`src/pages/OtpVerifyPage.tsx`)

**Visual layout:**
- Back button + progress bar (matching AuthPage shell)
- Heading: "Check your email" (Fraunces serif, 36px)
- Subheading: "We sent a 6-digit code to `{email}`"
- 6 individual digit input boxes, auto-advance on each keystroke
- Auto-submit when 6th digit entered
- Error state: shake animation + red border on wrong code (demo: never wrong)
- Resend link with 30s cooldown countdown: "Resend code (29s)" → "Resend code"
- Primary CTA: "Verify" (disabled until 6 digits entered)

**Routing:**
- Add `"verify-otp"` to `AppScreen` union in `Index.tsx`
- `AuthPage` props: add `onNeedsOtpVerify: (email: string) => void`
- On signup success → call `onNeedsOtpVerify(email)` instead of `onAuthSuccess()`
- On login success → call `onAuthSuccess()` directly (no OTP)
- `OtpVerifyPage` props: `{ email: string; onVerified: () => void; onBack: () => void }`

**Demo vs real:**
```ts
// Demo (current):
if (code.length === 6) onVerified();

// Real (one-line swap):
const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" });
if (!error) onVerified();
```

---

## 3. Conditional Logic

### #9 — Skip attack re-entry in Daily Check-in if attack logged today

**Where:** `DailyCheckinFlow.tsx`

**Logic:** After user answers `headache_today = "yes"`, check `hasAttackToday(attackLogs)`:

- **True →** Replace pain-location/medication steps with a single interstitial screen:
  - Copy: "You already logged a migraine today."
  - Two options:
    - "All good — nothing to add" → advance to disability step
    - "Add a note" → free-text input, saved to the most recent today's attack's `notes` field → advance to disability step
- **False →** Continue current flow (pain location, meds, etc.) unchanged.

**Props change:** `DailyCheckinFlow` receives `attackLogs: HeadacheLog[]` from Index.tsx.

---

### #11b — Menstrual gating

**Gate condition:** `menstrualEnabled === true` (persisted flag from onboarding)

**Consumption points:**

1. `NotificationSettings` — wrap the "Cycle Alert" row in `{menstrualEnabled && …}`
2. `TriggerMedicationFlow` — wrap menstrual-specific step in `{menstrualEnabled && …}`; if flag is false, skip that step in the step array entirely (filter it out before rendering)

**MigraineOnboarding write:** When the user completes the menstrual_cycle question with answer `"yes"`, call `setMenstrualEnabled(true)`.

**Prop chain:** `Index.tsx` passes `onMenstrualEnabled={() => setMenstrualEnabled(true)}` → `OnboardingFlow` → `MigraineOnboarding`. `OnboardingFlow` already forwards arbitrary props to `MigraineOnboarding`, so this is a single new prop in each file.

---

### #11c — Skip medication-help questions when no medication taken

**Where:** `DailyCheckinFlow.tsx` step routing

**Logic:** After saving `medication_taken`:
- If value is `"no"` → `nextStep` jumps directly to `disability`
- If value is `"yes"` | `"yes_partial"` | `"yes_no_relief"` → continue to effectiveness/relief steps as normal

This is a 3-4 line condition in the existing step-advancement handler — no new components.

---

## 4. Post-Migraine Flow

### Context

Chris feedback #12a + #12b: after tapping "Mark migraine ended", auto-trigger a short recap flow. Pre-fill with already-captured data so user never re-enters start time, location, or meds.

### activeMigraine State Shape (extended)

Current: `{ startTime: Date } | null`

Extended:
```ts
interface ActiveMigraine {
  startTime: Date;
  painPeak?: number;      // captured during active timer if user rated
  zones?: string[];       // from LogHeadacheFlow that started the timer
  medsTaken?: string[];   // from LogHeadacheFlow
  attackLogId?: string;   // links to the HeadacheLog entry being updated
}
```

### Screen: `post-migraine` (`src/pages/PostMigraineFlow.tsx`)

**Triggered by:** `onStopTimer` → `setCurrentScreen("post-migraine")` in Index.tsx (instead of returning to home)

**Recap card (persistent, top of every step):**
- Duration: computed from `activeMigraine.startTime` → now (e.g., "3h 42m")
- Peak pain: `activeMigraine.painPeak` if set, else "—"
- Zones: `activeMigraine.zones?.join(", ")` if set, else "—"
- Meds: `activeMigraine.medsTaken?.join(", ")` if set, else "—"
- Styled as a compact summary card, not re-editable

**Steps:**

| Step | Question | Input |
|------|----------|-------|
| 1 | "How's the pain now?" | PainSlider 0-10 |
| 2 | "What helped most?" | Chip select (multi): Medication / Rest / Darkness / Ice pack / Nothing |
| 3 | "Any lingering symptoms?" | Chip select (multi): Fatigue / Nausea / Neck stiffness / Brain fog / None |
| 4 | Gratification | "Migraine logged. Rest up." |

**On complete:**
- If `attackLogId` set: update that `HeadacheLog` entry with `{ endTime, painEnd, reliefEffectiveness, lingeringSymptoms, status: "ended" }`
- Else: create a new minimal `HeadacheLog` entry with available data + the 3 recap answers
- Clear `activeMigraine` state
- Navigate to `"home"`

---

## 5. Implementation Order

1. **Data foundation** — persisted `attackLogs`, `checkInLogs`, `menstrualEnabled`; wire `onComplete` callbacks; delete MOCK_ATTACKS/MOCK_CHECKINS; add `hasAttackToday()` utility
2. **OTP screen** — `OtpVerifyPage`, AppScreen routing, AuthPage callback change
3. **Conditional logic** — #9 (hasAttackToday branch), #11b (menstrual gate), #11c (skip med-help on "no")
4. **PostMigraineFlow** — extended `activeMigraine` shape, new page, AppScreen routing, onStopTimer wiring

---

## 6. Files Affected

**New files:**
- `src/pages/OtpVerifyPage.tsx`
- `src/pages/PostMigraineFlow.tsx`
- `src/utils/attackUtils.ts`

**Modified files:**
- `src/pages/Index.tsx` — AppScreen union, new state, routing, callback wiring
- `src/pages/AuthPage.tsx` — `onNeedsOtpVerify` prop
- `src/pages/DailyCheckinFlow.tsx` — `attackLogs` prop, #9 branch, #11c skip
- `src/pages/LogHeadacheFlow.tsx` — `onComplete(log)` signature
- `src/pages/DiariesHub.tsx` — remove MOCK_*; receive real arrays
- `src/components/MigraineOnboarding.tsx` — write `menstrualEnabled` on menstrual answer
- `src/components/PainHistory.tsx` — `onStopTimer` triggers post-migraine route
- `src/pages/TriggerMedicationFlow.tsx` — #11b menstrual gate
- `src/components/NotificationSettings.tsx` — #11b menstrual gate

---

## 7. Out of Scope

- Supabase real OTP verification (one-line swap, deferred until auth backend is live)
- Profile toggle for menstrual flag (key is there; UI toggle is a future ticket)
- Doctor-share PDF (separate ticket)
- Neura chat integration with these flows
