import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Zone definitions — exported so consumers can render legend / chips / etc.
// ---------------------------------------------------------------------------
export interface ZoneDef {
  id: string;
  label: string;
}

export const HEAD_ZONES: ZoneDef[] = [
  { id: "top", label: "Top of Head" },
  { id: "forehead", label: "Forehead" },
  { id: "left-temple", label: "Left Temple" },
  { id: "right-temple", label: "Right Temple" },
  { id: "left-eye", label: "Behind Left Eye" },
  { id: "right-eye", label: "Behind Right Eye" },
  { id: "left-side", label: "Left Side" },
  { id: "right-side", label: "Right Side" },
  { id: "sinus", label: "Face / Sinus" },
  { id: "back", label: "Back of Head" },
  { id: "neck", label: "Neck" },
];

export const BACK_ZONES: ZoneDef[] = [
  { id: "back-top", label: "Crown" },
  { id: "occipital", label: "Occipital" },
  { id: "left-back", label: "Left Back" },
  { id: "right-back", label: "Right Back" },
  { id: "base-skull", label: "Base of Skull" },
  { id: "back-neck", label: "Neck (Back)" },
];

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------
interface HeadDiagramProps {
  selectedZones: string[];
  onToggleZone: (zoneId: string) => void;
  className?: string;
  view?: "front" | "back";
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
const BASE_TEAL = "#5b8a8a";
const BASE_TEAL_DARK = "#4a7676";
const SELECTED_FILL = "rgba(239, 68, 68, 0.45)";
const SELECTED_STROKE = "#ef4444";
const DIVIDER_COLOR = "rgba(255,255,255,0.5)";
const LABEL_COLOR = "rgba(255,255,255,0.9)";

// ---------------------------------------------------------------------------
// Interactive zone wrapper with pulse animation on selected zones
// ---------------------------------------------------------------------------
function Zone({
  id,
  active,
  onToggle,
  children,
}: {
  id: string;
  active: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <motion.g
      onClick={() => onToggle(id)}
      animate={
        active
          ? { opacity: [1, 0.75, 1] }
          : { opacity: 1 }
      }
      transition={
        active
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.2 }
      }
      style={{ cursor: "pointer" }}
      role="button"
      aria-pressed={active}
      aria-label={HEAD_ZONES.find((z) => z.id === id)?.label ?? id}
    >
      {children}
    </motion.g>
  );
}

// ---------------------------------------------------------------------------
// HeadDiagram — Migraine Buddy-style medical illustration
// ---------------------------------------------------------------------------
const HeadDiagram = ({
  selectedZones,
  onToggleZone,
  className,
  view = "front",
}: HeadDiagramProps) => {
  const is = (id: string) => selectedZones.includes(id);

  const zoneFill = (id: string) => (is(id) ? SELECTED_FILL : BASE_TEAL);
  const zoneStroke = (id: string) => (is(id) ? SELECTED_STROKE : "rgba(255,255,255,0.3)");

  if (view === "back") {
    return (
      <div className={cn("w-full max-w-[280px] mx-auto select-none", className)}>
        <svg viewBox="0 0 280 380" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <defs>
            <clipPath id="backHeadClip"><path d={BACK_HEAD_OUTLINE} /></clipPath>
            <clipPath id="backNeckClip"><path d={NECK_OUTLINE} /></clipPath>
          </defs>

          {/* Head silhouette */}
          <path d={BACK_HEAD_OUTLINE} fill={BASE_TEAL} stroke="white" strokeWidth="2" strokeLinejoin="round" />
          <path d={LEFT_EAR} fill={BASE_TEAL_DARK} stroke="white" strokeWidth="1.5" />
          <path d={RIGHT_EAR} fill={BASE_TEAL_DARK} stroke="white" strokeWidth="1.5" />
          <path d={NECK_OUTLINE} fill={BASE_TEAL} stroke="white" strokeWidth="2" strokeLinejoin="round" />

          {/* Back zones */}
          <g clipPath="url(#backHeadClip)">
            <Zone id="back-top" active={is("back-top")} onToggle={onToggleZone}>
              <path d="M 80 48 Q 140 20, 200 48 L 200 100 Q 140 85, 80 100 Z"
                fill={zoneFill("back-top")} stroke={zoneStroke("back-top")} strokeWidth={is("back-top") ? 1.5 : 0} />
            </Zone>

            <Zone id="occipital" active={is("occipital")} onToggle={onToggleZone}>
              <ellipse cx="140" cy="145" rx="55" ry="40"
                fill={zoneFill("occipital")} stroke={zoneStroke("occipital")} strokeWidth={is("occipital") ? 1.5 : 0} />
            </Zone>

            <Zone id="left-back" active={is("left-back")} onToggle={onToggleZone}>
              <ellipse cx="72" cy="195" rx="28" ry="35"
                fill={zoneFill("left-back")} stroke={zoneStroke("left-back")} strokeWidth={is("left-back") ? 1.5 : 0} />
            </Zone>

            <Zone id="right-back" active={is("right-back")} onToggle={onToggleZone}>
              <ellipse cx="208" cy="195" rx="28" ry="35"
                fill={zoneFill("right-back")} stroke={zoneStroke("right-back")} strokeWidth={is("right-back") ? 1.5 : 0} />
            </Zone>

            <Zone id="base-skull" active={is("base-skull")} onToggle={onToggleZone}>
              <ellipse cx="140" cy="240" rx="50" ry="22"
                fill={zoneFill("base-skull")} stroke={zoneStroke("base-skull")} strokeWidth={is("base-skull") ? 1.5 : 0} />
            </Zone>
          </g>

          {/* Neck zone */}
          <g clipPath="url(#backNeckClip)">
            <Zone id="back-neck" active={is("back-neck")} onToggle={onToggleZone}>
              <rect x="100" y="288" width="80" height="60"
                fill={zoneFill("back-neck")} stroke={zoneStroke("back-neck")} strokeWidth={is("back-neck") ? 1.5 : 0} />
            </Zone>
          </g>

          {/* Dividers */}
          <g clipPath="url(#backHeadClip)" pointerEvents="none">
            <line x1="70" y1="100" x2="210" y2="100" stroke={DIVIDER_COLOR} strokeWidth="1" strokeDasharray="4 3" />
            <line x1="140" y1="100" x2="140" y2="265" stroke={DIVIDER_COLOR} strokeWidth="0.8" strokeDasharray="3 4" />
            <path d="M 55 185 Q 140 195, 225 185" fill="none" stroke={DIVIDER_COLOR} strokeWidth="1" strokeDasharray="4 3" />
            <path d="M 75 225 Q 140 235, 205 225" fill="none" stroke={DIVIDER_COLOR} strokeWidth="1" strokeDasharray="4 3" />
          </g>

          {/* Hair texture hint */}
          <g pointerEvents="none" opacity="0.2">
            <path d="M 100 60 Q 110 55, 120 62" fill="none" stroke="white" strokeWidth="0.8" />
            <path d="M 130 50 Q 140 45, 150 52" fill="none" stroke="white" strokeWidth="0.8" />
            <path d="M 160 60 Q 170 55, 180 62" fill="none" stroke="white" strokeWidth="0.8" />
          </g>

          {/* Crisp outline on top */}
          <path d={BACK_HEAD_OUTLINE} fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round" pointerEvents="none" />
          <path d={NECK_OUTLINE} fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" pointerEvents="none" />

          {/* Zone labels */}
          <g pointerEvents="none">
            {BACK_ZONE_LABELS.map(({ id, x, y, fontSize: fs }) => (
              <text key={id} x={x} y={y} textAnchor="middle" fontSize={fs || 8} fontWeight={500}
                fill={LABEL_COLOR} fontFamily="system-ui, -apple-system, sans-serif"
                className="uppercase" style={{ letterSpacing: "0.05em" }}>
                {BACK_ZONES.find((z) => z.id === id)?.label ?? id}
              </text>
            ))}
          </g>

          {/* Side labels */}
          <text x="22" y="195" textAnchor="middle" fontSize="9" fontWeight="600"
            fill="#5b8a8a" fontFamily="system-ui, sans-serif" className="uppercase" style={{ letterSpacing: "0.08em" }}>
            RIGHT
          </text>
          <text x="258" y="195" textAnchor="middle" fontSize="9" fontWeight="600"
            fill="#5b8a8a" fontFamily="system-ui, sans-serif" className="uppercase" style={{ letterSpacing: "0.08em" }}>
            LEFT
          </text>

          {/* "FRONT" badge */}
          <rect x="105" y="10" width="70" height="26" rx="13" fill="#5b8a8a" stroke="white" strokeWidth="1.5" pointerEvents="none" />
          <text x="140" y="27" textAnchor="middle" fontSize="10" fontWeight="700" fill="white"
            fontFamily="system-ui, sans-serif" pointerEvents="none" style={{ letterSpacing: "0.08em" }}>
            BACK VIEW
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-[280px] mx-auto select-none", className)}>
      <svg
        viewBox="0 0 280 380"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <defs>
          <clipPath id="headClip">
            <path d={HEAD_OUTLINE} />
          </clipPath>
          <clipPath id="neckClip">
            <path d={NECK_OUTLINE} />
          </clipPath>
        </defs>

        <path d={HEAD_OUTLINE} fill={BASE_TEAL} stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <path d={LEFT_EAR} fill={BASE_TEAL_DARK} stroke="white" strokeWidth="1.5" />
        <path d={RIGHT_EAR} fill={BASE_TEAL_DARK} stroke="white" strokeWidth="1.5" />
        <path d={NECK_OUTLINE} fill={BASE_TEAL} stroke="white" strokeWidth="2" strokeLinejoin="round" />

        <g clipPath="url(#headClip)">
          <Zone id="top" active={is("top")} onToggle={onToggleZone}>
            <path d="M 80 48 Q 140 20, 200 48 L 200 82 Q 140 68, 80 82 Z"
              fill={zoneFill("top")} stroke={zoneStroke("top")} strokeWidth={is("top") ? 1.5 : 0} />
          </Zone>
          <Zone id="forehead" active={is("forehead")} onToggle={onToggleZone}>
            <ellipse cx="140" cy="112" rx="58" ry="24"
              fill={zoneFill("forehead")} stroke={zoneStroke("forehead")} strokeWidth={is("forehead") ? 1.5 : 0} />
          </Zone>
          <Zone id="left-temple" active={is("left-temple")} onToggle={onToggleZone}>
            <ellipse cx="62" cy="148" rx="20" ry="28"
              fill={zoneFill("left-temple")} stroke={zoneStroke("left-temple")} strokeWidth={is("left-temple") ? 1.5 : 0} />
          </Zone>
          <Zone id="right-temple" active={is("right-temple")} onToggle={onToggleZone}>
            <ellipse cx="218" cy="148" rx="20" ry="28"
              fill={zoneFill("right-temple")} stroke={zoneStroke("right-temple")} strokeWidth={is("right-temple") ? 1.5 : 0} />
          </Zone>
          <Zone id="left-eye" active={is("left-eye")} onToggle={onToggleZone}>
            <ellipse cx="107" cy="162" rx="24" ry="18"
              fill={zoneFill("left-eye")} stroke={zoneStroke("left-eye")} strokeWidth={is("left-eye") ? 1.5 : 0} />
          </Zone>
          <Zone id="right-eye" active={is("right-eye")} onToggle={onToggleZone}>
            <ellipse cx="173" cy="162" rx="24" ry="18"
              fill={zoneFill("right-eye")} stroke={zoneStroke("right-eye")} strokeWidth={is("right-eye") ? 1.5 : 0} />
          </Zone>
          <Zone id="left-side" active={is("left-side")} onToggle={onToggleZone}>
            <ellipse cx="68" cy="210" rx="22" ry="30"
              fill={zoneFill("left-side")} stroke={zoneStroke("left-side")} strokeWidth={is("left-side") ? 1.5 : 0} />
          </Zone>
          <Zone id="right-side" active={is("right-side")} onToggle={onToggleZone}>
            <ellipse cx="212" cy="210" rx="22" ry="30"
              fill={zoneFill("right-side")} stroke={zoneStroke("right-side")} strokeWidth={is("right-side") ? 1.5 : 0} />
          </Zone>
          <Zone id="sinus" active={is("sinus")} onToggle={onToggleZone}>
            <ellipse cx="140" cy="218" rx="32" ry="26"
              fill={zoneFill("sinus")} stroke={zoneStroke("sinus")} strokeWidth={is("sinus") ? 1.5 : 0} />
          </Zone>
        </g>

        <g clipPath="url(#neckClip)">
          <Zone id="neck" active={is("neck")} onToggle={onToggleZone}>
            <rect x="100" y="288" width="80" height="60"
              fill={zoneFill("neck")} stroke={zoneStroke("neck")} strokeWidth={is("neck") ? 1.5 : 0} />
          </Zone>
        </g>

        <g clipPath="url(#headClip)" pointerEvents="none">
          <line x1="70" y1="82" x2="210" y2="82" stroke={DIVIDER_COLOR} strokeWidth="1" strokeDasharray="4 3" />
          <path d="M 75 136 Q 140 148, 205 136" fill="none" stroke={DIVIDER_COLOR} strokeWidth="1" strokeDasharray="4 3" />
          <line x1="140" y1="82" x2="140" y2="250" stroke={DIVIDER_COLOR} strokeWidth="0.8" strokeDasharray="3 4" />
          <path d="M 52 180 Q 140 186, 228 180" fill="none" stroke={DIVIDER_COLOR} strokeWidth="1" strokeDasharray="4 3" />
          <path d="M 60 246 Q 140 258, 220 246" fill="none" stroke={DIVIDER_COLOR} strokeWidth="1" strokeDasharray="4 3" />
        </g>

        <g pointerEvents="none" opacity="0.35">
          <ellipse cx="107" cy="162" rx="14" ry="8" fill="none" stroke="white" strokeWidth="1" />
          <ellipse cx="173" cy="162" rx="14" ry="8" fill="none" stroke="white" strokeWidth="1" />
          <path d="M 88 148 Q 107 140, 124 148" fill="none" stroke="white" strokeWidth="1" />
          <path d="M 156 148 Q 173 140, 192 148" fill="none" stroke="white" strokeWidth="1" />
          <path d="M 140 175 L 136 206 Q 140 212, 144 206 Z" fill="none" stroke="white" strokeWidth="1" />
          <path d="M 124 232 Q 132 240, 140 238 Q 148 240, 156 232" fill="none" stroke="white" strokeWidth="1" />
        </g>

        <path d={HEAD_OUTLINE} fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round" pointerEvents="none" />
        <path d={NECK_OUTLINE} fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" pointerEvents="none" />

        <g pointerEvents="none">
          {ZONE_LABELS.map(({ id, x, y, fontSize: fs }) => (
            <text key={id} x={x} y={y} textAnchor="middle" fontSize={fs || 8} fontWeight={500}
              fill={LABEL_COLOR} fontFamily="system-ui, -apple-system, sans-serif"
              className="uppercase" style={{ letterSpacing: "0.05em" }}>
              {HEAD_ZONES.find((z) => z.id === id)?.label ?? id}
            </text>
          ))}
        </g>

        <text x="22" y="190" textAnchor="middle" fontSize="9" fontWeight="600"
          fill="#5b8a8a" fontFamily="system-ui, sans-serif" className="uppercase" style={{ letterSpacing: "0.08em" }}>
          LEFT
        </text>
        <text x="258" y="190" textAnchor="middle" fontSize="9" fontWeight="600"
          fill="#5b8a8a" fontFamily="system-ui, sans-serif" className="uppercase" style={{ letterSpacing: "0.08em" }}>
          RIGHT
        </text>

        <rect x="105" y="10" width="70" height="26" rx="13" fill="#5b8a8a" stroke="white" strokeWidth="1.5" pointerEvents="none" />
        <text x="140" y="27" textAnchor="middle" fontSize="10" fontWeight="700" fill="white"
          fontFamily="system-ui, sans-serif" pointerEvents="none" style={{ letterSpacing: "0.08em" }}>
          FRONT VIEW
        </text>
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// SVG path data
// ---------------------------------------------------------------------------

// Head outline — egg shape, wider at top, tapers at jaw, front view
const HEAD_OUTLINE = `
  M 140 42
  C 80 42, 48 90, 48 145
  C 48 175, 52 200, 62 220
  Q 68 234, 76 248
  C 82 258, 90 268, 100 276
  Q 115 288, 140 292
  Q 165 288, 180 276
  C 190 268, 198 258, 204 248
  Q 212 234, 218 220
  C 228 200, 232 175, 232 145
  C 232 90, 200 42, 140 42
  Z
`;

// Ears — small bumps on the sides
const LEFT_EAR = `
  M 48 140
  C 44 140, 36 148, 36 162
  C 36 176, 44 184, 48 184
`;

const RIGHT_EAR = `
  M 232 140
  C 236 140, 244 148, 244 162
  C 244 176, 236 184, 232 184
`;

// Neck — simple rectangular shape below chin
const NECK_OUTLINE = `
  M 108 286
  L 104 340
  Q 104 350, 112 352
  L 168 352
  Q 176 350, 176 340
  L 172 286
  Q 156 296, 140 298
  Q 124 296, 108 286
  Z
`;

// Label positions within each zone
const ZONE_LABELS: { id: string; x: number; y: number; fontSize?: number }[] = [
  { id: "top", x: 140, y: 68, fontSize: 7 },
  { id: "forehead", x: 140, y: 116, fontSize: 8.5 },
  { id: "left-temple", x: 55, y: 148, fontSize: 6 },
  { id: "right-temple", x: 225, y: 148, fontSize: 6 },
  { id: "left-eye", x: 104, y: 166, fontSize: 6 },
  { id: "right-eye", x: 176, y: 166, fontSize: 6 },
  { id: "left-side", x: 68, y: 214, fontSize: 6.5 },
  { id: "right-side", x: 212, y: 214, fontSize: 6.5 },
  { id: "sinus", x: 140, y: 222, fontSize: 7.5 },
  { id: "neck", x: 140, y: 326, fontSize: 8 },
];

// Back-of-head outline (same silhouette minus face, plus hair texture)
const BACK_HEAD_OUTLINE = `
  M 140 42
  C 80 42, 48 90, 48 145
  C 48 175, 52 200, 62 220
  Q 68 234, 76 248
  C 82 258, 90 268, 100 276
  Q 115 288, 140 292
  Q 165 288, 180 276
  C 190 268, 198 258, 204 248
  Q 212 234, 218 220
  C 228 200, 232 175, 232 145
  C 232 90, 200 42, 140 42
  Z
`;

const BACK_ZONE_LABELS: { id: string; x: number; y: number; fontSize?: number }[] = [
  { id: "back-top", x: 140, y: 75, fontSize: 7.5 },
  { id: "occipital", x: 140, y: 148, fontSize: 8 },
  { id: "left-back", x: 72, y: 198, fontSize: 6.5 },
  { id: "right-back", x: 208, y: 198, fontSize: 6.5 },
  { id: "base-skull", x: 140, y: 244, fontSize: 7 },
  { id: "back-neck", x: 140, y: 326, fontSize: 7.5 },
];

export default HeadDiagram;
