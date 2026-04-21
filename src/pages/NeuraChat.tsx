import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, Send } from "lucide-react";
import NeuraAvatar from "@/components/NeuraAvatar";
import VoiceOverlay from "@/components/neura/VoiceOverlay";
import NeuraInlineWidget, { WidgetConfig, WidgetSubmission } from "@/components/NeuraInlineWidget";
import NeuraSummaryChip from "@/components/NeuraSummaryChip";
import NeuraContentCard, { NeuraContent } from "@/components/NeuraContentCard";
import NeuraContentModal from "@/components/NeuraContentModal";
import { pickPhrase } from "@/data/neuraPhrasePool";
import { ScriptId, getScript, Script } from "@/data/neuraScripts";
import { routeIntent, isDerailment, briefAnswerForDerailment } from "@/data/neuraIntentRouter";
import { getMockAttacks, getMockStats } from "@/data/mockUserData";

type MessageBlock =
  | { type: "text"; text: string }
  | { type: "widget"; config: WidgetConfig; submitted?: WidgetSubmission }
  | { type: "summary"; label: string }
  | { type: "content-card"; content: NeuraContent }
  | { type: "action-button"; label: string; action: "open-trigger-analysis" };

interface ChatMessage {
  id: string;
  role: "user" | "neura";
  blocks: MessageBlock[];
}

interface NeuraChatProps {
  onBack: () => void;
  initialScript?: ScriptId | null;
  initialQuery?: string | null;
  contextualGreeting?: string;
  onOpenTriggerAnalysis?: () => void;
}

// Map trigger IDs (used in mock data) to human labels for chat display.
const triggerLabels: Record<string, string> = {
  stress: "stress",
  lack_of_sleep: "poor sleep",
  skipped_meal: "skipped meals",
  variable_weather: "weather shifts",
  hormonal_changes: "hormonal changes",
  bright_lights: "bright lights",
  neck_pain: "neck pain / tension",
  caffeine: "caffeine",
  alcohol: "alcohol",
  dehydration: "dehydration",
};

const humanizeTrigger = (id: string): string =>
  triggerLabels[id] || id.replace(/_/g, " ");

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

const NeuraChat = ({
  onBack,
  initialScript = null,
  initialQuery = null,
  contextualGreeting,
  onOpenTriggerAnalysis,
}: NeuraChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [micActive, setMicActive] = useState(false);
  const [inputMode, setInputMode] = useState<"tap" | "speak">("tap");
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
    // If launched with a pre-filled query (e.g. Home's AskAnything bar), auto-send it
    if (initialQuery) {
      const timer = setTimeout(() => sendUserMessage(initialQuery), 450);
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

  // --------- Trigger insight ---------
  const showTriggerInsight = () => {
    withTyping(() => {
      try {
        const stats = getMockStats();
        const attacks = getMockAttacks();
        const totalAttacksWithTriggers = attacks.filter(
          (a) => a.triggers && a.triggers.length > 0
        ).length;

        if (
          !stats.topTriggers ||
          stats.topTriggers.length === 0 ||
          totalAttacksWithTriggers < 3
        ) {
          appendNeura([
            {
              type: "text",
              text:
                "You don't have enough data yet — log a few more attacks with trigger info and I'll start spotting patterns.",
            },
          ]);
          return;
        }

        const top = stats.topTriggers[0];
        const second = stats.topTriggers[1];
        const topLabel = humanizeTrigger(top.trigger);
        const summary = `Your top trigger is ${topLabel} — it showed up in ${top.count} of your last ${totalAttacksWithTriggers} attacks with trigger data.`;
        const secondLine = second
          ? ` ${humanizeTrigger(second.trigger)} is #2 (${second.count} attacks).`
          : "";

        appendNeura([{ type: "text", text: summary + secondLine }]);

        // Follow-up with an action affordance
        setTimeout(() => {
          const blocks: MessageBlock[] = [
            {
              type: "text",
              text: "Want the full breakdown with charts and timing?",
            },
          ];
          if (onOpenTriggerAnalysis) {
            blocks.push({
              type: "action-button",
              label: "View full analysis",
              action: "open-trigger-analysis",
            });
          }
          appendNeura(blocks);
        }, 500);
      } catch {
        appendNeura([
          {
            type: "text",
            text:
              "You don't have enough data yet — log a few more attacks with trigger info and I'll start spotting patterns.",
          },
        ]);
      }
    }, 500);
  };

  // --------- Script engine ---------
  const startScript = (scriptId: ScriptId) => {
    const script = getScript(scriptId);
    if (!script) return;

    // Trigger insights: special-case — surface a real insight using mock stats,
    // plus an action affordance to open the full trigger analysis page.
    if (scriptId === "trigger-insights") {
      showTriggerInsight();
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
      // Close the script (warm close phrase — no double "Got it")
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
      // Vary the lead-in between steps for warmth — first advance gets a soft
      // acknowledgement, subsequent advances get a continuation phrase or none.
      // Roughly 60% of steps drop the lead-in entirely (feels less robotic).
      let lead = "";
      if (nextIdx === 1) {
        lead = pickPhrase("ack.gotIt") + " ";
      } else if (Math.random() < 0.4) {
        lead = pickPhrase("ack.continue") + " ";
      }
      const blocks: MessageBlock[] = [
        { type: "text", text: `${lead}${pickPhrase(step.phraseKey)}`.trim() },
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
    if (intent.type === "insight") {
      showTriggerInsight();
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
    if (intent.type === "appointment") {
      withTyping(() => {
        appendNeura([
          {
            type: "text",
            text:
              "Your next appointment is Thursday, April 23 at 2:00pm with Dr. Patel (Neurology). I'll remind you the day before.",
          },
        ]);
      }, 500);
      return;
    }
    if (intent.type === "conversational" && intent.text) {
      withTyping(() => {
        appendNeura([{ type: "text", text: intent.text! }]);
      }, 500);
      return;
    }
    // Unknown — contextual fallback
    withTyping(() => {
      appendNeura([
        {
          type: "text",
          text:
            "I'm not sure I caught that. Try 'Log a headache', 'How am I doing?', or ask me a question about migraines.",
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
    if (block.type === "action-button") {
      return (
        <button
          key={idx}
          onClick={() => {
            if (block.action === "open-trigger-analysis" && onOpenTriggerAnalysis) {
              onOpenTriggerAnalysis();
            }
          }}
          className="px-4 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-medium shadow-cta hover:opacity-90 active:scale-95 transition-all"
        >
          {block.label} →
        </button>
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
          {/* Tap ↔ Speak mode toggle */}
          <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-full" role="group" aria-label="Input mode">
            {(["tap", "speak"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setInputMode(m);
                  if (m === "speak") setMicActive(true);
                  else setMicActive(false);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                  inputMode === m
                    ? "bg-card text-foreground shadow-sm-soft"
                    : "text-muted-foreground"
                }`}
                aria-pressed={inputMode === m}
              >
                {m === "tap" ? "Tap" : "Speak"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full-screen voice overlay */}
      <VoiceOverlay
        active={micActive && inputMode === "speak"}
        onStop={() => setMicActive(false)}
        onSwapToKeyboard={() => {
          setMicActive(false);
          setInputMode("tap");
        }}
        onTranscribe={(text) => sendUserMessage(text)}
        mode="handsfree"
      />

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
            aria-label={
              micActive
                ? "Voice input (preview) — tap to stop"
                : "Voice input (preview) — coming soon"
            }
            title="Voice input — preview (coming soon)"
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
        <p className="text-center text-[10px] text-muted-foreground -mt-1 pb-1">
          {micActive ? "Listening (preview)" : "Voice — preview"}
        </p>

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
