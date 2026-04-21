import { Check } from "lucide-react";

interface NeuraSummaryChipProps {
  label: string; // e.g., "Temples, behind eyes"
}

const NeuraSummaryChip = ({ label }: NeuraSummaryChipProps) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
    <Check className="w-3 h-3 text-accent" />
    <span className="text-xs font-medium text-foreground">{label}</span>
  </div>
);

export default NeuraSummaryChip;
