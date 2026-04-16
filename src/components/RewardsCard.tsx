import { motion } from "framer-motion";
import { Flame, Trophy, Star, Target } from "lucide-react";

interface RewardsCardProps {
  currentStreak: number;
  totalPoints: number;
  weeklyProgress: number;
  badges: { id: string; name: string; icon: string }[];
}

const badgeIcons: Record<string, string> = {
  star: "\u2B50",
  fire: "\uD83D\uDD25",
  trophy: "\uD83C\uDFC6",
  book: "\uD83D\uDCD6",
  search: "\uD83D\uDD0D",
  pill: "\uD83D\uDC8A",
  hundred: "\uD83D\uDCAF",
  chart: "\uD83D\uDCCA",
  magnifier: "\uD83D\uDD0D",
  shield: "\uD83D\uDEE1\uFE0F",
};

const RewardsCard = ({ currentStreak, totalPoints, weeklyProgress, badges }: RewardsCardProps) => {
  const recentBadges = badges.slice(-5);
  const weeklyPercent = Math.round(weeklyProgress * 100);

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Your Progress</h3>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15">
          <Star className="w-3 h-3 text-amber-500" />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
            {totalPoints.toLocaleString()} pts
          </span>
        </div>
      </div>

      {/* 2-column stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-500/10">
          <Flame className="w-4 h-4 text-orange-500" />
          <div>
            <div className="text-lg font-bold text-foreground leading-tight">{currentStreak}</div>
            <div className="text-[10px] text-muted-foreground">Day Streak</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/10">
          <Target className="w-4 h-4 text-accent" />
          <div>
            <div className="text-lg font-bold text-foreground leading-tight">{weeklyPercent}%</div>
            <div className="text-[10px] text-muted-foreground">Weekly Goal</div>
          </div>
        </div>
      </div>

      {/* Recent badges */}
      {recentBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recentBadges.map((badge) => (
            <span
              key={badge.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground"
            >
              {badgeIcons[badge.icon] || badgeIcons.star}
              {badge.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardsCard;
