import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, Send } from "lucide-react";
import NeuraAvatar from "@/components/NeuraAvatar";
import NeuraInlineWidget, { WidgetConfig, WidgetSubmission } from "@/components/NeuraInlineWidget";
import NeuraSummaryChip from "@/components/NeuraSummaryChip";
import NeuraContentCard, { NeuraContent } from "@/components/NeuraContentCard";
import NeuraContentModal from "@/components/NeuraContentModal";
import { pickPhrase } from "@/data/neuraPhrasePool";
import { ScriptId, getScript, Script } from "@/data/neuraScripts";
import { routeIntent, isDerailment, briefAnswerForDerailment } from "@/data/neuraIntentRouter";
import { getMockAttacks } from "@/data/mockUserData";

type MessageBlock =
  | { type: "text"; text: string }
  | { type: "widget"; config: WidgetConfig; submitted?: WidgetSubmission }
  | { type: "summary"; label: string }
  | { type: "content-card"; content: NeuraContent };

interface ChatMessage {
  id: string;
  role: "user" | "neura";
  blocks: MessageBlock[];
}

interface NeuraChatProps {
  onBack: () => void;
  initialScript?: ScriptId | null;
  contextualGreeting?: string;
}

const quickChips = [
  "Log a headache",
  "Quick check-in",
  "What's triggering me?",
  "Check my meds",
];

// Count attacks from mock data that happened in the last 7 days (relative to a
// reference date so the demo behaves predictably in April 2026).
const countRecentAttacks = (referenceDate: Date = new Date("2026-04-15")): number => {
  try {
    const attacks = getMockAttacks();
    const weekStart = new Date(referenceDate);
    weekStart.setDate(weekStart.getDate() - 7);
    return attacks.filter((a) => {
      const d = new Date(a.date);
      return d >= weekStart && d <= referenceDate;
    }).length;
  } catch {
    return 0;
  }
};

const NeuraChat = ({ onBack, initialScript = null, contextualGreeting }: NeuraChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [micActive, setMicActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [modalContent, setModalContent] = useState<NeuraContent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Script engine state
  const [activeScript, setActiveScript] = useState<ScriptId | null>(null);
  const [scriptStepIdx, setScriptStepIdx] = useState(0);

  // Seed greeting + optional proactive prompt or initial script once on mount
  useEffect(() => {
    const recentAttackCount = countRecentAttacks();
    const greeting: ChatMessage = {
      id: "greet-1",
      role: "neura",
      blocks: [
        {
          type: "text",
          text:
            contextualGreeting ??
            (recentAttackCount >= 3
              ? `You've had ${recentAttackCount} attacks this week. Want to explore what triggered them?`
              : "Hey! How's your head today?"),
        },
      ],
    };
    setMessages([greeting]);

    // If launched with an initial script, kick it off after a beat
    if (initialScript) {
      const timer = setTimeout(() => startScript(initialScript), 500);
      return () => clearTimeout(timer);
    }
    // If proactive (3+ attacks), start diary-triggers to let user explore
    if (!initialScript && recentAttackCount >= 3) {
      const timer = setTimeout(() => startScript("diary-triggers"), 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // --------- Message helpers ---------
  const appendNeura = (blocks: MessageBlock[]) => {
    const msg: ChatMessage = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: "neura",
      blocks,
    };
    setMessages((prev) => [...prev, msg]);
  };

  const appendUser = (text: string) => {
    const msg: ChatMessage = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: "user",
      blocks: [{ type: "text", text }],
    };
    setMessages((prev) => [...prev, msg]);
  };

  const withTyping = (fn: () => void, delayMs = 600) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      fn();
    }, delayMs);
  };

  // --------- Script engine ---------
  const startScript = (scriptId: ScriptId) => {
    const script = getScript(scriptId);
    if (!script) return;

    // Trigger insights: special-case — surface a short insight text, no widgets.
    if (scriptId === "trigger-insights") {
      withTyping(() => {
        appendNeura([
          {
            type: "text",
            text:
              "Looking at your recent attacks, poor sleep and stress show up most often. Keep logging for 2-3 more weeks to get cleaner patterns.",
          },
        ]);
      }, 500);
      return;
    }

    setActiveScript(scriptId);
    setScriptStepIdx(0);

    withTyping(() => {
      // 1. Opening phrase
      appendNeura([{ type: "text", text: pickPhrase(script.openPhraseKey) }]);

      // 2. First step phrase + widget (if any)
      if (script.steps.length > 0) {
        const step = script.steps[0];
        setTimeout(() => {
          const blocks: MessageBlock[] = [
            { type: "text", text: pickPhrase(step.phraseKey) },
          ];
          if (step.widget) {
            blocks.push({ type: "widget", config: step.widget });
          }
          appendNeura(blocks);
        }, 400);
      } else {
        // No steps — just close
        setTimeout(() => {
          appendNeura([{ type: "text", text: pickPhrase(script.closePhraseKey) }]);
          setActiveScript(null);
          setScriptStepIdx(0);
        }, 400);
      }
    }, 500);
  };

  const advanceScript = (script: Script, nextIdx: number) => {
    if (nextIdx >= script.steps.length) {
      // Close the script
      withTyping(() => {
        appendNeura([{ type: "text", text: pickPhrase(script.closePhraseKey) }]);
      }, 500);
      setActiveScript(null);
      setScriptStepIdx(0);
      return;
    }
    const step = script.steps[nextIdx];
    setScriptStepIdx(nextIdx);
    withTyping(() => {
      const blocks: MessageBlock[] = [
        { type: "text", text: pickPhrase(step.phraseKey) },
      ];
      if (step.widget) {
        blocks.push({ type: "widget", config: step.widget });
      }
      appendNeura(blocks);
    }, 500);
  };

  const reAskCurrentStep = () => {
    if (!activeScript) return;
    const script = getScript(activeScript);
    const step = script.steps[scriptStepIdx];
    if (!step) return;
    const blocks: MessageBlock[] = [
      { type: "text", text: `${pickPhrase("derail.return")} ${pickPhrase(step.phraseKey)}` },
    ];
    if (step.widget) {
      blocks.push({ type: "widget", config: step.widget });
    }
    appendNeura(blocks);
  };

  // --------- Input handlers ---------
  const sendUserMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    appendUser(trimmed);
    setInput("");

    // Mid-script: handle derailment or ignore-and-continue
    if (activeScript) {
      if (isDerailment(trimmed)) {
        withTyping(() => {
          appendNeura([{ type: "text", text: briefAnswerForDerailment(trimmed) }]);
          // then a moment later, re-ask current step with derail prefix
          setTimeout(() => reAskCurrentStep(), 500);
        }, 600);
      } else {
        // Treat as soft acknowledgement and re-prompt the current step
        withTyping(() => {
          appendNeura([{ type: "text", text: pickPhrase("ack.gotIt") }]);
          setTimeout(() => reAskCurrentStep(), 400);
        }, 500);
      }
      return;
    }

    // No active script — route intent
    const intent = routeIntent(trimmed);

    if (intent.type === "script" && intent.scriptId) {
      startScript(intent.scriptId);
      return;
    }
    if (intent.type === "insight" && intent.scriptId) {
      startScript(intent.scriptId);
      return;
    }
    if (intent.type === "content" && intent.content) {
      withTyping(() => {
        appendNeura([
          { type: "text", text: "Here's what I know — tap the card to dive deeper." },
          { type: "content-card", content: intent.content! },
        ]);
      }, 600);
      return;
    }
    if (intent.type === "appointment" && intent.text) {
      withTyping(() => {
        appendNeura([{ type: "text", text: intent.text! }]);
      }, 500);
      return;
    }
    // Conversational fallback
    withTyping(() => {
      appendNeura([
        {
          type: "text",
          text: intent.text ?? "Tell me more about what's going on. Or try a quick action below.",
        },
      ]);
    }, 500);
  };

  const handleWidgetSubmit = (msgId: string, blockIdx: number, result: WidgetSubmission) => {
    // Update the widget block to submitted (renders as summary chip)
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        return {
          ...m,
          blocks: m.blocks.map((b, i) =>
            i === blockIdx && b.type === "widget" ? { ...b, submitted: result } : b
          ),
        };
      })
    );

    // Advance active script if any
    if (activeScript) {
      const script = getScript(activeScript);
      advanceScript(script, scriptStepIdx + 1);
    } else {
      // Stand-alone widget completion
      withTyping(() => {
        appendNeura([{ type: "text", text: pickPhrase("ack.gotIt") }]);
      }, 400);
    }
  };

  // --------- Render helpers ---------
  const renderBlock = (
    msgId: string,
    role: "user" | "neura",
    block: MessageBlock,
    idx: number
  ) => {
    if (block.type === "text") {
      return (
        <div
          key={idx}
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[88%] ${
            role === "user"
              ? "bg-accent text-accent-foreground rounded-br-md"
              : "bg-card border border-border text-foreground rounded-bl-md shadow-sm-soft"
          }`}
        >
          {block.text}
        </div>
      );
    }
    if (block.type === "widget") {
      if (block.submitted) {
        return <NeuraSummaryChip key={idx} label={block.submitted.summary} />;
      }
      return (
        <div key={idx} className="w-full">
          <NeuraInlineWidget
            config={block.config}
            onSubmit={(result) => handleWidgetSubmit(msgId, idx, result)}
          />
        </div>
      );
    }
    if (block.type === "summary") {
      return <NeuraSummaryChip key={idx} label={block.label} />;
    }
    if (block.type === "content-card") {
      return (
        <div key={idx} className="w-full">
          <NeuraContentCard
            content={block.content}
            onExpand={() => setModalContent(block.content)}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-3 pb-3 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <NeuraAvatar size="md" animate={micActive} />
          <div className="flex-1">
            <h1 className="text-h2 text-foreground">Neura</h1>
            <span className="text-xs text-muted-foreground">
              {micActive ? "Listening…" : isTyping ? "Thinking…" : "Online"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 px-4 py-4 overflow-y-auto pb-56 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`mb-3 flex flex-col gap-1.5 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {msg.blocks.map((block, idx) => renderBlock(msg.id, msg.role, block, idx))}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              className="mb-3 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <NeuraAvatar size="sm" />
              <div className="px-3 py-2 rounded-2xl bg-card border border-border flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick chips + input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-20">
        <div className="px-4 pt-3 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => sendUserMessage(chip)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium text-foreground hover:bg-accent/10"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-2 pb-2">
          <button
            onClick={() => setMicActive((v) => !v)}
            className="relative w-14 h-14 rounded-full flex items-center justify-center"
            aria-label={micActive ? "Stop listening" : "Start listening"}
          >
            {micActive && (
              <motion.span
                className="absolute inset-0 rounded-full bg-accent/20"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <div
              className={`relative w-14 h-14 rounded-full flex items-center justify-center ${
                micActive ? "bg-accent shadow-cta" : "bg-muted"
              }`}
            >
              <Mic
                className={`w-6 h-6 ${micActive ? "text-accent-foreground" : "text-foreground"}`}
              />
            </div>
          </button>
        </div>

        <div className="px-4 pb-safe-bottom pb-3 flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && input.trim() && sendUserMessage(input.trim())}
            placeholder="Type or tap the mic…"
            className="flex-1 px-4 py-3 rounded-full bg-muted text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            style={{ minHeight: 44 }}
          />
          <button
            onClick={() => input.trim() && sendUserMessage(input.trim())}
            className="w-11 h-11 rounded-full bg-accent flex items-center justify-center shadow-cta shrink-0"
            aria-label="Send"
          >
            <Send className="w-4 h-4 text-accent-foreground" />
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground pb-2">
          Not medical advice. Not for emergencies.
        </p>
      </div>

      <NeuraContentModal content={modalContent} onClose={() => setModalContent(null)} />
    </div>
  );
};

export default NeuraChat;
