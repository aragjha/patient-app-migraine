import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, Send, Sparkles, Zap, Check, BookOpen, ChevronRight, Moon } from "lucide-react";
import BottomNav from "@/components/BottomNav";
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
  onNavigate?: (tab: "home" | "maps" | "tools" | "profile") => void;
  onOpenDiary?: () => void;
  onLog?: () => void;
  onHeadacheLogged?: (data: { startTime: Date; zones?: string[]; painPeak?: number }) => void;
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
  onNavigate,
  onOpenDiary,
  onLog,
  onHeadacheLogged,
}: NeuraChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  // Default to voice mode in free-chat (empty state); tap mode when a script drives the flow
  const [micActive, setMicActive] = useState(!initialScript && !initialQuery);
  const [inputMode, setInputMode] = useState<"tap" | "speak">(!initialScript && !initialQuery ? "speak" : "tap");
  const [isTyping, setIsTyping] = useState(false);
  const [modalContent, setModalContent] = useState<NeuraContent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Empty-state mode: only render starter layout when we have no greeting yet.
  // We suppress the mount-time greeting when launched with no initial script/query
  // so the editorial starter screen shows per the prototype.
  const [emptyState, setEmptyState] = useState<boolean>(
    !initialScript && !initialQuery,
  );

  // Script engine state
  const [activeScript, setActiveScript] = useState<ScriptId | null>(null);
  const [scriptStepIdx, setScriptStepIdx] = useState(0);

  // Seed greeting + optional proactive prompt or initial script once on mount.
  // When launched without any initial intent, leave `messages` empty so the
  // empty-state editorial layout (prototype) renders.
  useEffect(() => {
    if (initialScript) {
      setEmptyState(false);
      // Seed with a contextual greeting so the script has a lead-in bubble.
      setMessages([
        {
          id: "greet-1",
          role: "neura",
          blocks: [
            {
              type: "text",
              text:
                contextualGreeting ?? "Hey! How's your head today?",
            },
          ],
        },
      ]);
      const timer = setTimeout(() => startScript(initialScript), 500);
      return () => clearTimeout(timer);
    }
    if (initialQuery) {
      setEmptyState(false);
      setMessages([
        {
          id: "greet-1",
          role: "neura",
          blocks: [
            {
              type: "text",
              text:
                contextualGreeting ?? "Hey! How's your head today?",
            },
          ],
        },
      ]);
      const timer = setTimeout(() => sendUserMessage(initialQuery), 450);
      return () => clearTimeout(timer);
    }
    // Otherwise stay empty (empty-state renders).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exitEmpty = () => setEmptyState(false);

  const handleClearChat = () => {
    setMessages([]);
    setActiveScript(null);
    setScriptStepIdx(0);
    setEmptyState(true);
  };

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
    setEmptyState(false);

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
      // Fire headache-logged callback so home screen shows the active timer
      if (script.id === "headache-log" && onHeadacheLogged) {
        onHeadacheLogged({ startTime: new Date() });
      }
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
    setEmptyState(false);
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
      if (role === "user") {
        return (
          <div
            key={idx}
            className="text-sm leading-[1.4] max-w-[80%] bg-foreground text-background"
            style={{
              padding: "11px 14px",
              borderRadius: "18px 18px 6px 18px",
            }}
          >
            {block.text}
          </div>
        );
      }
      return (
        <div
          key={idx}
          className="text-sm leading-[1.4] max-w-[80%] text-foreground bg-card border border-border"
          style={{
            padding: "11px 14px",
            borderRadius: "18px 18px 18px 6px",
            boxShadow: "var(--shadow-sm-proto)",
          }}
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
      {/* Header — prototype design */}
      <div className="px-5 pt-12 pb-3 bg-background/95 backdrop-blur-sm sticky top-0 z-20 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:bg-muted/70"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2.2} />
          </button>
          <div
            className="flex items-center justify-center text-white shrink-0"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "linear-gradient(135deg, #1B2A4E 0%, #7C3AED 50%, #3B82F6 100%)",
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
            }}
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.4} />
          </div>
          <div className="flex-1 leading-tight min-w-0">
            <div
              className="text-[15px] font-bold text-foreground"
            >
              Neura
            </div>
            <div
              className="flex items-center gap-1.5 text-[10px]"
              style={{
                color: "var(--green)",
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              }}
            >
              <span
                className="inline-block shrink-0"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--green)",
                }}
              />
              {activeScript ? (
                <span>Running · {getScript(activeScript).name}</span>
              ) : micActive ? (
                <span>Listening…</span>
              ) : isTyping ? (
                <span>Thinking…</span>
              ) : (
                <span>Trained on your 43 logs</span>
              )}
            </div>
          </div>
          {/* Tap ↔ Speak mode toggle */}
          <div
            className="flex items-center gap-0.5 rounded-full"
            role="group"
            aria-label="Input mode"
            style={{ background: "var(--bg-deep)", padding: 3 }}
          >
            {(["tap", "speak"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setInputMode(m);
                  if (m === "speak") setMicActive(true);
                  else setMicActive(false);
                }}
                className={`flex items-center justify-center border-0 cursor-pointer ${
                  inputMode === m
                    ? "bg-foreground text-background"
                    : "bg-transparent text-muted-foreground"
                }`}
                style={{
                  width: 30,
                  height: 28,
                  borderRadius: 999,
                  transition: "background .15s",
                }}
                aria-pressed={inputMode === m}
                title={m === "tap" ? "Tap mode" : "Speak mode"}
              >
                {m === "tap" ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11V6a3 3 0 0 1 6 0v5" />
                    <path d="M9 11v3a3 3 0 0 0 6 0v-3" />
                    <path d="M7 14v1a5 5 0 0 0 10 0v-1" />
                  </svg>
                ) : (
                  <Mic style={{ width: 13, height: 13 }} strokeWidth={2.2} />
                )}
              </button>
            ))}
          </div>
          {!emptyState && messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="border-0 bg-transparent cursor-pointer text-muted-foreground"
              style={{ fontSize: 11, fontWeight: 600, padding: "4px 6px" }}
              title="Clear conversation"
            >
              Clear
            </button>
          )}
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
        {emptyState && messages.length === 0 && !activeScript && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-1"
          >
            {/* Contextual greeting */}
            <div
              style={{
                margin: "12px 4px 6px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--nc-muted)",
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              }}
            >
              {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}
            </div>
            <h2
              className="text-foreground"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 600,
                fontSize: 32,
                letterSpacing: "-0.035em",
                lineHeight: 1,
                margin: "0 4px 14px",
              }}
            >
              A clinician
              <br />
              in your{" "}
              <em className="italic" style={{ color: "var(--nc-accent)" }}>
                pocket
              </em>
              .
            </h2>
            <p
              className="text-muted-foreground"
              style={{
                fontSize: 13,
                margin: "0 4px 16px",
                lineHeight: 1.5,
              }}
            >
              Speaks from your diary. Tap to speak or pick a flow below.
            </p>

            {/* Rotating sample prompts */}
            <div style={{ margin: "0 0 20px" }}>
              {[
                "Why do I always get migraines on Monday?",
                "What helped with my last attack?",
                "Is my Topiramate actually working?",
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    exitEmpty();
                    sendUserMessage(prompt);
                  }}
                  className="w-full text-left mb-2 px-4 py-3 rounded-2xl border border-border bg-card active:bg-muted transition-colors"
                  style={{ fontFamily: "inherit" }}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={2.2} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", lineHeight: 1.4 }}>{prompt}</span>
                  </div>
                </button>
              ))}
            </div>
            <div
              className="eyebrow"
              style={{ marginBottom: 8, marginLeft: 4 }}
            >
              Guided
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              {(
                [
                  {
                    id: "headache-log" as ScriptId,
                    label: "Log a headache",
                    sub: "~30s · 5 questions",
                    Icon: Zap,
                  },
                  {
                    id: "daily-checkin" as ScriptId,
                    label: "Daily check-in",
                    sub: "~60s · 3 questions",
                    Icon: Check,
                  },
                  {
                    id: "diary-triggers" as ScriptId,
                    label: "Trigger diary",
                    sub: "This week · 1 question",
                    Icon: BookOpen,
                  },
                ]
              ).map((s) => {
                const I = s.Icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      exitEmpty();
                      startScript(s.id);
                    }}
                    className="starter-row w-full"
                  >
                    <div className="starter-row-icon">
                      <I className="w-[14px] h-[14px]" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div
                        className="text-foreground font-bold"
                        style={{ fontSize: 13 }}
                      >
                        {s.label}
                      </div>
                      <div
                        className="text-muted-foreground"
                        style={{
                          fontSize: 10,
                          fontFamily: "'JetBrains Mono', monospace",
                          marginTop: 1,
                        }}
                      >
                        {s.sub}
                      </div>
                    </div>
                    <ChevronRight
                      className="shrink-0"
                      style={{ width: 14, height: 14, color: "var(--muted-2)" }}
                    />
                  </button>
                );
              })}
            </div>
            <div
              className="eyebrow"
              style={{ marginBottom: 8, marginLeft: 4 }}
            >
              Ask anything
            </div>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  {
                    q: "Why did Tuesday's migraine last 8 hours?",
                    Icon: Sparkles,
                  },
                  {
                    q: "Is my sleep the main trigger right now?",
                    Icon: Moon,
                  },
                  {
                    q: "Summarize April for my neurologist visit",
                    Icon: BookOpen,
                  },
                ]
              ).map((s, i) => {
                const I = s.Icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      exitEmpty();
                      sendUserMessage(s.q);
                    }}
                    className="starter-row w-full"
                  >
                    <div className="starter-row-icon">
                      <I className="w-[14px] h-[14px]" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div
                        className="text-foreground font-semibold"
                        style={{ fontSize: 13, lineHeight: 1.25 }}
                      >
                        {s.q}
                      </div>
                    </div>
                    <ChevronRight
                      className="shrink-0"
                      style={{ width: 14, height: 14, color: "var(--muted-2)" }}
                    />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`mb-2 flex flex-col gap-1 ${
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
              className="mb-2 flex items-center gap-2"
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

      {/* Quick chips + input — sits above BottomNav (92px) */}
      <div
        className="fixed left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-20"
        style={{ bottom: onNavigate ? 92 : 0 }}
      >
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

        {/* Unified pill input bar */}
        <div className="px-4 pt-1 pb-3 flex gap-2 items-center">
          <div
            className="flex-1 flex items-center gap-2 bg-card border border-border rounded-full pl-4 pr-1.5"
            style={{ minHeight: 48 }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && input.trim() && sendUserMessage(input.trim())}
              placeholder="Ask Neura anything…"
              className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground py-2"
            />
            <button
              onClick={() => {
                setInputMode("speak");
                setMicActive(true);
              }}
              className="flex items-center justify-center shrink-0 active:scale-95 transition-transform border-0 cursor-pointer"
              aria-label="Voice input"
              title="Hold or tap to dictate"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "var(--nc-accent-soft)",
                color: "var(--nc-accent)",
              }}
            >
              <Mic className="w-[14px] h-[14px]" strokeWidth={2.2} />
            </button>
            <button
              onClick={() => input.trim() && sendUserMessage(input.trim())}
              className="flex items-center justify-center shrink-0 bg-foreground text-background active:scale-95 transition-transform border-0 cursor-pointer"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
              }}
              aria-label="Send"
            >
              <Send className="w-[13px] h-[13px]" strokeWidth={2.4} />
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground pb-2">
          Not medical advice. Not for emergencies.
        </p>
      </div>

      <NeuraContentModal content={modalContent} onClose={() => setModalContent(null)} />

      {onNavigate && (
        <BottomNav
          activeTab="neura"
          onTabChange={onNavigate}
          onOpenDiary={onOpenDiary}
          onOpenNeura={undefined}
          onLog={onLog}
        />
      )}
    </div>
  );
};

export default NeuraChat;
