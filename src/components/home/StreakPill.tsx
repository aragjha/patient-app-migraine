import { Flame } from "lucide-react";

interface StreakPillProps {
  streak: number;
  points: number;
  onClick?: () => void;
}

const StreakPill = ({ streak, points, onClick }: StreakPillProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 bg-card border border-border rounded-full pr-3.5 pl-1.5 py-1.5 active:scale-[0.97] transition-transform"
      aria-label={`${streak}-day streak, ${points} points`}
    >
      <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#FF9B5A] to-[#FF6B5C] flex items-center justify-center text-white">
        <Flame className="w-4 h-4" strokeWidth={2.4} />
      </div>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-[13px] font-extrabold text-foreground">{streak} days</span>
        <span className="text-[10px] text-muted-foreground font-medium">{points} pts</span>
      </div>
    </button>
  );
};

export default StreakPill;
