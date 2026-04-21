import { Pill, Check } from "lucide-react";

interface MedItem {
  name: string;
  dose: string;
  time: string;
  taken: boolean;
  tintBg?: string;
  tintInk?: string;
}

interface TodayMedsStripProps {
  meds?: MedItem[];
  onSeeAll?: () => void;
}

const DEFAULT_MEDS: MedItem[] = [
  { name: "Sumatriptan", dose: "50mg", time: "8:00 AM", taken: true, tintBg: "#EFF6FF", tintInk: "#3B82F6" },
  { name: "Magnesium", dose: "400mg", time: "9:00 PM", taken: false, tintBg: "#F3E8FF", tintInk: "#7C3AED" },
];

const TodayMedsStrip = ({ meds = DEFAULT_MEDS, onSeeAll }: TodayMedsStripProps) => {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-2.5">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today's meds</div>
        <button onClick={onSeeAll} className="text-xs font-semibold text-accent active:opacity-70">
          All meds →
        </button>
      </div>
      <div className="flex gap-2.5">
        {meds.map((m, i) => (
          <div
            key={i}
            className="flex-1 bg-card border border-border rounded-2xl p-3.5"
          >
            <div className="flex justify-between items-start mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: m.tintBg, color: m.tintInk }}
              >
                <Pill className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              {m.taken ? (
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" strokeWidth={3} /> Taken
                </div>
              ) : (
                <div className="text-[10px] font-bold text-muted-foreground">{m.time}</div>
              )}
            </div>
            <div className="text-sm font-bold text-foreground leading-tight">{m.name}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{m.dose}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TodayMedsStrip;
