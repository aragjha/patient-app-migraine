import { TrendingDown, Sparkles } from "lucide-react";

interface PatternInsightCardProps {
  attacksThisMonth?: number;
  deltaPercent?: number;
  trend?: number[];
  onSeeDiary?: () => void;
  onAskNeura?: () => void;
}

const DEFAULT_TREND = [2, 3, 5, 4, 6, 3, 2, 4, 3, 2, 1, 2, 3, 2];

const PatternInsightCard = ({
  attacksThisMonth = 4,
  deltaPercent = 33,
  trend = DEFAULT_TREND,
  onSeeDiary,
  onAskNeura,
}: PatternInsightCardProps) => {
  const maxT = Math.max(8, ...trend);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-2.5">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">This month</div>
        <button
          onClick={onSeeDiary}
          className="text-xs font-semibold text-accent active:opacity-70"
        >
          See diary →
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-border p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div
              className="text-[36px] font-extrabold text-foreground leading-none"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                letterSpacing: "-0.02em",
              }}
            >
              {attacksThisMonth}
              <span className="text-xl text-muted-foreground font-medium">/mo</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Attacks ·{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ↓ {deltaPercent}%
              </span>{" "}
              vs March
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
            <TrendingDown className="w-2.5 h-2.5" strokeWidth={2.5} />
            Improving
          </div>
        </div>

        {/* Mini bar chart */}
        <div className="flex items-end gap-1 h-[52px] mb-2.5">
          {trend.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-[3px] min-h-[3px]"
              style={{
                height: `${(v / maxT) * 100}%`,
                background: v > 5 ? "#FF6B5C" : v > 3 ? "#E8A838" : "hsl(var(--accent))",
                opacity: 0.35 + (i / trend.length) * 0.6,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Apr 7</span>
          <span>Apr 14</span>
          <span>Today</span>
        </div>

        <button
          onClick={onAskNeura}
          className="mt-4 w-full p-3.5 bg-muted rounded-2xl flex gap-3 items-center text-left active:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-[12.5px] text-foreground leading-snug">
            <b>Sleep &lt; 6h</b> preceded <b>3 of your last 4</b> attacks.{" "}
            <span className="text-accent font-semibold">Ask Neura →</span>
          </div>
        </button>
      </div>
    </section>
  );
};

export default PatternInsightCard;
