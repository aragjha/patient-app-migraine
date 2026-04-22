import { useEffect, useState } from "react";
import { Sparkles, ArrowUp } from "lucide-react";

interface AskAnythingBarProps {
  onAsk: (query: string) => void;
}

const PROMPTS = [
  "Why do my migraines hit on Sundays?",
  "What helps most when an attack starts?",
  "Is my sleep affecting this?",
  "Show my top triggers",
];

const AskAnythingBar = ({ onAsk }: AskAnythingBarProps) => {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (q) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % PROMPTS.length), 2800);
    return () => clearInterval(t);
  }, [q]);

  const submit = () => {
    const query = q.trim() || PROMPTS[idx];
    onAsk(query);
    setQ("");
  };

  return (
    <div className="flex items-center gap-2.5 bg-card border border-border rounded-full pl-4 pr-1.5 py-1.5 shadow-sm">
      <div
        className="flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#1B2A4E] via-[#7C3AED] to-[#3B82F6]"
        style={{ width: 22, height: 22, borderRadius: 7 }}
      >
        <Sparkles className="w-3 h-3" strokeWidth={2.2} />
      </div>
      <div className="flex-1 relative min-w-0">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full border-0 outline-none bg-transparent text-sm text-foreground py-2.5 placeholder:text-muted-foreground"
          aria-label="Ask Neura anything"
        />
        {!q && (
          <div className="pointer-events-none absolute inset-0 flex items-center text-sm text-muted-foreground overflow-hidden">
            <span className="whitespace-nowrap overflow-hidden text-ellipsis block w-full">
              Ask Neura · <span key={idx} className="text-foreground/80 animate-fade-in">{PROMPTS[idx]}</span>
            </span>
          </div>
        )}
      </div>
      <button
        onClick={submit}
        className="rounded-full text-white flex items-center justify-center shrink-0 bg-gradient-to-br from-accent to-[#7C3AED] active:scale-95 transition-transform"
        style={{ width: 38, height: 38 }}
        aria-label="Send question to Neura"
      >
        <ArrowUp className="w-4 h-4" strokeWidth={2.4} />
      </button>
    </div>
  );
};

export default AskAnythingBar;
