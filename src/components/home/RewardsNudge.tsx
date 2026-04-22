import { Trophy, ChevronRight } from "lucide-react";

interface RewardsNudgeProps {
  pointsToNext?: number;
  nextTierName?: string;
  perk?: string;
  onClick?: () => void;
}

const RewardsNudge = ({
  pointsToNext = 20,
  nextTierName = "Trigger Sleuth",
  perk = "$10 gift card + clinician badge",
  onClick,
}: RewardsNudgeProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-[20px] p-4 flex items-center gap-3.5 text-left active:scale-[0.99] transition-transform"
      style={{
        background: "linear-gradient(135deg, #FFF4D6, #FEF3D6)",
        border: "1px solid #F5E3A8",
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shrink-0"
        style={{
          background: "linear-gradient(135deg, #FFB547, #E8A838)",
          boxShadow: "0 4px 10px rgba(232,168,56,0.35)",
        }}
      >
        <Trophy className="w-[22px] h-[22px]" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[#6B4E1A]">
          {pointsToNext} pts to &ldquo;{nextTierName}&rdquo;
        </div>
        <div className="text-[11px] text-[#8F6A20] mt-0.5 truncate">{perk}</div>
      </div>
      <ChevronRight className="w-[18px] h-[18px] text-[#8F6A20] shrink-0" />
    </button>
  );
};

export default RewardsNudge;
