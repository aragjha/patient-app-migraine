# NeuroCare V2 — Project Context

## Stack
- React 18 + TypeScript + Vite + Tailwind CSS
- UI: shadcn/ui (Radix UI primitives)
- Routing: react-router-dom v6
- Backend: Supabase
- State: TanStack Query v5
- Animation: Framer Motion

## Structure
- `src/pages/` — screen-level components (HomeHub, Index, NeuraChat, etc.)
- `src/components/` — shared UI components
- `src/hooks/` — custom hooks
- `src/integrations/` — Supabase client + types

## Key Routing Rules
- `"tools"` and `"maps"` routes are **deprecated** — always redirect to `"home"`
- BottomNav fallbacks: Diary → `"home"`, Neura → `"home"`
- Medication flow: always go to `"medication-hub"`, never re-trigger onboarding

## Key Architectural Decisions
- `Index.tsx` is the main state hub — manages `activeMigraine`, flow state, navigation
- `NeuraChat` defaults to voice mode (`inputMode="speak"`, `micActive=true`) in free-chat mode
- `NeuraChat` fires `onHeadacheLogged` callback when headache-log script completes
- `MedicationHub`/`MedicationOnboarding` `onBack` → `"home"` (not `"tools"`)
- `handleNavigate("tools")` → redirects to `"home"`

## Dev
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm test` — run tests (Vitest)
