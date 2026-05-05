// useRef + useEffect + useCallback come from the same import block as useState.
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Zap,
  Check,
  BookOpen,
  ChevronRight,
  Moon,
  MoreHorizontal,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import NeuraAvatar from "@/components/NeuraAvatar";
import NeuraVoicePill from "@/components/neura/NeuraVoicePill";
import NeuraScriptModal from "@/components/neura/NeuraScriptModal";
import NeuraResumePill from "@/components/neura/NeuraResumePill";
import NeuraInlineAnswer, {
  NeuraAnswer,
  NeuraAnswerKind,
} from "@/components/neura/NeuraInlineAnswer";
import NeuraDemoPanel from "@/components/neura/NeuraDemoPanel";
import NeuraReplayDirector from "@/components/neura/NeuraReplayDirector";
import { CASE_REPLAYS, getReplayById, ReplayAction } from "@/data/neuraCaseReplays";
import { WidgetSubmission } from "@/components/NeuraInlineWidget";
import NeuraSummaryChip from "@/components/NeuraSummaryChip";
import NeuraContentCard, { NeuraContent } from "@/components/NeuraContentCard";
import NeuraContentModal from "@/components/NeuraContentModal";
import { pickPhrase } from "@/data/neuraPhrasePool";
import {
  ScriptId,
  getScript,
  getStepDisplay,
  Script,
} from "@/data/neuraScripts";
import {
  routeIntent,
  isDerailment,
  briefAnswerForDerailment,
  isOffTopic,
  guardrailResponse,
} from "@/data/neuraIntentRouter";
import { getMockAttacks, getMockStats } from "@/data/mockUserData";
import {
  getStepTranscript,
  pickFreeChat,
  pickDigression,
} from "@/data/neuraDemoTranscripts";

type MessageBlock =
  | { type: "text"; text: string; speaking?: boolean }
  | { type: "summary"; label: string }
  | { type: "content-card"; content: NeuraContent }
  | { type: "inline-answer"; answer: NeuraAnswer; actionKey?: NeuraAnswerKind }
  | { type: "resume-pill" }
  | { type: "what-else"; chips: string[] }
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
  onHeadacheLogged?: (data: {
    startTime: Date;
    zones?: string[];
    painPeak?: number;
    symptoms?: string[];
    triggers?: string[];
    timing?: string;
  }) => void;
  onScriptComplete?: (
    scriptId: string,
    answers?: Record<string, WidgetSubmission>,
  ) => void;
  /** Switches Neura into episode mode — short replies, dimmed UI. */
  episodeMode?: boolean;
}

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
  onScriptComplete,
  episodeMode: episodeModeProp = false,
}: NeuraChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  // Voice is the default mode at all times (per Patient App v3 ref); user can
  // switch to keyboard via the pill's keyboard icon.
  const [inputMode, setInputMode] = useState<"voice" | "type">("voice");
  const [voicePhase, setVoicePhase] = useState<
    "idle" | "listening" | "thinking" | "speaking"
  >("idle");
  const [isTyping, setIsTyping] = useState(false);
  const [modalContent, setModalContent] = useState<NeuraContent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [emptyState, setEmptyState] = useState<boolean>(
    !initialScript && !initialQuery,
  );

  // Script engine state
  const [activeScript, setActiveScript] = useState<ScriptId | null>(null);
  const [scriptStepIdx, setScriptStepIdx] = useState(0);
  const [scriptAnswers, setScriptAnswers] = useState<
    Record<string, WidgetSubmission>
  >({});
  // Re-entry guard — closeScript can be invoked twice if the speakHint timer
  // and a manual Confirm tap race. We use a ref so guard updates synchronously.
  const closingScriptRef = useRef<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCompressed, setModalCompressed] = useState(false);
  const [modalSpeakHint, setModalSpeakHint] = useState<string | null>(null);

  // Demo panel + episode mode (mirrors prop, allows local override)
  const [demoOpen, setDemoOpen] = useState(false);
  const [episodeMode, setEpisodeMode] = useState(episodeModeProp);

  // Replay director state — drives scripted case demos
  const [replayId, setReplayId] = useState<string | null>(null);
  const [replayIdx, setReplayIdx] = useState(0);
  const replayActions: ReplayAction[] = replayId
    ? (getReplayById(replayId)?.actions ?? [])
    : [];
  const replayName = replayId ? (getReplayById(replayId)?.name ?? "") : "";
  const currentReplayAction =
    replayId && replayIdx < replayActions.length ? replayActions[replayIdx] : null;

  useEffect(() => setEpisodeMode(episodeModeProp), [episodeModeProp]);

  // ------------------------------------------------------------------
  // Bootstrapping
  // ------------------------------------------------------------------

  // On mount with no script/query, surface the user's most recent trigger
  // log inline (per spec: "the initial 'previous trigger log' needs to be
  // shown in the chat itself"). We read from triggerIdentificationEngine
  // session storage; if nothing exists yet, we skip silently.
  const seedPreviousTriggerLog = () => {
    try {
      // Key matches triggerIdentificationEngine's persisted store.
      const raw = localStorage.getItem("nc-trigger-sessions-v1");
      if (!raw) return;
      const sessions = JSON.parse(raw) as Array<{
        timestamp?: string;
        observations?: Array<{ factorId: string; present: boolean }>;
      }>;
      if (!Array.isArray(sessions) || sessions.length === 0) return;
      const newest = sessions
        .slice()
        .sort((a, b) =>
          new Date(b.timestamp ?? 0).getTime() -
          new Date(a.timestamp ?? 0).getTime(),
        )[0];
      if (!newest?.timestamp) return;
      const date = new Date(newest.timestamp);
      const daysAgo = Math.max(
        0,
        Math.floor((Date.now() - date.getTime()) / 86_400_000),
      );
      const labelMap: Record<string, { label: string; icon: string }> = {
        stress: { label: "Stress", icon: "😰" },
        poor_sleep: { label: "Poor sleep", icon: "😴" },
        lack_of_sleep: { label: "Poor sleep", icon: "😴" },
        skipped_meal: { label: "Skipped meal", icon: "🍽️" },
        weather: { label: "Weather", icon: "🌦️" },
        variable_weather: { label: "Weather", icon: "🌦️" },
        caffeine: { label: "Caffeine", icon: "☕" },
        screen_time: { label: "Screen time", icon: "📱" },
        hormonal_changes: { label: "Hormonal", icon: "📅" },
      };
      const triggers = (newest.observations ?? [])
        .filter((o) => o.present)
        .map((o) => ({
          id: o.factorId,
          label: labelMap[o.factorId]?.label ?? o.factorId.replace(/_/g, " "),
          icon: labelMap[o.factorId]?.icon ?? "⚡",
        }));
      appendNeura([
        {
          type: "text",
          text: "Picking up where you left off — here's your last trigger log.",
        },
        {
          type: "inline-answer",
          answer: {
            kind: "previous-trigger-log",
            dateLabel: date.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            }),
            daysAgo,
            triggers,
          },
          actionKey: "previous-trigger-log",
        },
      ]);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (initialScript) {
      setEmptyState(false);
      setMessages([
        {
          id: "greet-1",
          role: "neura",
          blocks: [
            {
              type: "text",
              text: contextualGreeting ?? "Hey! How's your head today?",
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
              text: contextualGreeting ?? "Hey! How's your head today?",
            },
          ],
        },
      ]);
      const timer = setTimeout(() => sendUserMessage(initialQuery), 450);
      return () => clearTimeout(timer);
    }
    // No initial script/query — surface the previous trigger log if one
    // exists, after a brief delay so the editorial empty-state has time to
    // render first.
    const seedTimer = setTimeout(() => seedPreviousTriggerLog(), 700);
    return () => clearTimeout(seedTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ------------------------------------------------------------------
  // Message helpers
  // ------------------------------------------------------------------
  const appendNeura = (blocks: MessageBlock[]) => {
    const hasWhatElse = blocks.some((b) => b.type === "what-else");
    const msg: ChatMessage = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: "neura",
      blocks,
    };
    setMessages((prev) => {
      // De-duplicate what-else: drop any prior message that was *only* a
      // what-else block before adding the new one. Keeps the chat clean.
      const trimmed = hasWhatElse
        ? prev.filter(
            (m) =>
              !(m.blocks.length === 1 && m.blocks[0].type === "what-else"),
          )
        : prev;
      return [...trimmed, msg];
    });
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

  // Episode-mode trims long Neura responses to 2 sentences max.
  const trimForEpisode = (text: string): string => {
    if (!episodeMode) return text;
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return sentences.slice(0, 2).join(" ");
  };

  const sendNeuraReply = (text: string) => {
    appendNeura([{ type: "text", text: trimForEpisode(text), speaking: true }]);
  };

  // ------------------------------------------------------------------
  // Trigger insight (free-chat insight query)
  // ------------------------------------------------------------------
  const showTriggerInsight = useCallback(() => {
    withTyping(() => {
      try {
        const stats = getMockStats();
        const attacks = getMockAttacks();
        const totalAttacksWithTriggers = attacks.filter(
          (a) => a.triggers && a.triggers.length > 0,
        ).length;

        if (
          !stats.topTriggers ||
          stats.topTriggers.length === 0 ||
          totalAttacksWithTriggers < 3
        ) {
          appendNeura([
            {
              type: "text",
              text: "You don't have enough data yet — log a few more attacks with trigger info and I'll start spotting patterns.",
            },
          ]);
          return;
        }

        appendNeura([
          { type: "text", text: "Here's what I'm seeing —" },
          {
            type: "inline-answer",
            answer: {
              kind: "top-triggers",
              triggers: stats.topTriggers.slice(0, 3).map((t) => ({
                id: t.trigger,
                label: humanizeTrigger(t.trigger),
                icon: triggerEmoji(t.trigger),
                correlation: Math.min(
                  1,
                  t.count / Math.max(1, totalAttacksWithTriggers),
                ),
                observations: t.count,
              })),
            },
            actionKey: "top-triggers",
          },
        ]);
      } catch {
        appendNeura([
          {
            type: "text",
            text: "You don't have enough data yet — log a few more attacks with trigger info and I'll start spotting patterns.",
          },
        ]);
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------------
  // Script engine
  // ------------------------------------------------------------------
  const startScript = (scriptId: ScriptId) => {
    const script = getScript(scriptId);
    if (!script) return;
    setEmptyState(false);

    if (scriptId === "trigger-insights") {
      showTriggerInsight();
      return;
    }

    setActiveScript(scriptId);
    setScriptStepIdx(0);
    setScriptAnswers({});
    setModalCompressed(false);

    withTyping(() => {
      appendNeura([
        { type: "text", text: pickPhrase(script.openPhraseKey), speaking: true },
      ]);
      // Open the modal at step 0 after a brief beat
      setTimeout(() => {
        if (script.steps.length > 0) setModalOpen(true);
        else closeScript(script, {});
      }, 450);
    }, 400);
  };

  const closeScript = (
    script: Script,
    answers: Record<string, WidgetSubmission>,
  ) => {
    if (closingScriptRef.current === script.id) return;
    closingScriptRef.current = script.id;
    setTimeout(() => {
      closingScriptRef.current = null;
    }, 1500);
    setModalOpen(false);
    setModalCompressed(false);
    setActiveScript(null);
    setScriptStepIdx(0);
    setModalSpeakHint(null);

    withTyping(() => {
      sendNeuraReply(pickPhrase(script.closePhraseKey));
      // After every script close — offer "what else?" so the system never
      // dead-ends. User can keep going via voice or chips.
      setTimeout(() => {
        appendNeura([
          { type: "text", text: "What else can I help with?" },
          {
            type: "what-else",
            chips: [
              "Daily check-in",
              "What are my triggers?",
              "How are my meds?",
              "All done",
            ],
          },
        ]);
      }, 600);
    }, 350);

    // Persist — every read is optional-chained to survive partial answers
    // (user dismissed the modal mid-script, then resumed and saved).
    if (script.id === "headache-log" && onHeadacheLogged) {
      const zonesValue = answers?.["location"]?.value;
      const painValue = answers?.["painLevel"]?.value;
      const symptomsValue = answers?.["symptoms"]?.value;
      const triggerValue = answers?.["trigger"]?.value;
      const timingValue = answers?.["timing"]?.value;
      onHeadacheLogged({
        startTime: new Date(),
        zones: Array.isArray(zonesValue) ? (zonesValue as string[]) : undefined,
        painPeak: typeof painValue === "number" ? painValue : undefined,
        symptoms: Array.isArray(symptomsValue)
          ? (symptomsValue as string[])
          : undefined,
        triggers: Array.isArray(triggerValue)
          ? (triggerValue as string[])
          : undefined,
        timing: Array.isArray(timingValue)
          ? ((timingValue as string[])[0] ?? undefined)
          : undefined,
      });
    }
    if (onScriptComplete) onScriptComplete(script.id, answers);
  };

  const advanceScript = (
    script: Script,
    nextIdx: number,
    answers: Record<string, WidgetSubmission>,
  ) => {
    if (nextIdx >= script.steps.length) {
      closeScript(script, answers);
      return;
    }
    setScriptStepIdx(nextIdx);
    setModalSpeakHint(null);
  };

  const handleModalSubmit = (result: WidgetSubmission) => {
    if (!activeScript) return;
    const script = getScript(activeScript);
    const stepId = script.steps[scriptStepIdx]?.stepId ?? `step-${scriptStepIdx}`;
    const nextAnswers = { ...scriptAnswers, [stepId]: result };
    setScriptAnswers(nextAnswers);
    appendNeura([{ type: "summary", label: result.summary }]);
    advanceScript(script, scriptStepIdx + 1, nextAnswers);
  };

  const handleModalClose = () => {
    if (!activeScript) {
      setModalOpen(false);
      return;
    }
    setModalOpen(false);
    setModalCompressed(true);
    setModalSpeakHint(null);
    appendNeura([{ type: "resume-pill" }]);
  };

  const handleResumePill = () => {
    setModalCompressed(false);
    setModalOpen(true);
    // Drop the resume-pill block so chat doesn't pile them up
    setMessages((prev) =>
      prev.filter(
        (m) => !m.blocks.some((b) => b.type === "resume-pill"),
      ),
    );
  };

  const handleCancelScript = () => {
    setActiveScript(null);
    setScriptStepIdx(0);
    setModalOpen(false);
    setModalCompressed(false);
    setMessages((prev) =>
      prev.filter(
        (m) => !m.blocks.some((b) => b.type === "resume-pill"),
      ),
    );
    appendNeura([{ type: "text", text: "Okay, paused. We can pick this up anytime." }]);
  };

  // ------------------------------------------------------------------
  // Voice pill / "speak" demo behavior
  // ------------------------------------------------------------------
  const fakeTranscribe = useCallback(
    (text: string, onDone: (final: string) => void) => {
      let i = 0;
      setVoicePhase("listening");
      const id = setInterval(() => {
        i = Math.min(text.length, i + 2);
        if (modalOpen && activeScript) {
          setModalSpeakHint(text.slice(0, i));
        }
        if (i >= text.length) {
          clearInterval(id);
          setTimeout(() => {
            setVoicePhase("idle");
            onDone(text);
          }, 350);
        }
      }, 50);
    },
    [modalOpen, activeScript],
  );

  const handleVoiceMicTap = () => {
    if (voicePhase === "listening") {
      setVoicePhase("idle");
      setModalSpeakHint(null);
      return;
    }

    // Mid-script & modal open → fill the modal speak hint with the step transcript
    if (modalOpen && activeScript) {
      const script = getScript(activeScript);
      const step = script.steps[scriptStepIdx];
      const canned = getStepTranscript(activeScript, step.stepId) ?? "";
      fakeTranscribe(canned, () => {
        // Modal's useEffect on speakHint will auto-confirm; just clear voice phase.
      });
      return;
    }

    // Free-chat: pick a free chat transcript, append as user message, route intent
    fakeTranscribe(pickFreeChat(), (final) => {
      sendUserMessage(final);
    });
  };

  const handleKeyboardTap = () => {
    setInputMode("type");
    setVoicePhase("idle");
    setModalSpeakHint(null);
  };

  const handleSwitchToVoice = () => {
    setInputMode("voice");
  };

  const handleModalSpeak = () => {
    handleVoiceMicTap();
  };

  // ------------------------------------------------------------------
  // Send a message (text or transcribed voice)
  // ------------------------------------------------------------------
  const sendUserMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setEmptyState(false);
    appendUser(trimmed);
    setInput("");

    // Mid-script — handle digression
    if (activeScript) {
      const script = getScript(activeScript);
      if (isDerailment(trimmed)) {
        withTyping(() => {
          sendNeuraReply(briefAnswerForDerailment(trimmed));
          setTimeout(() => {
            sendNeuraReply(`${pickPhrase("derail.return")} reopening step ${scriptStepIdx + 1}.`);
            // If user dismissed modal, leave a resume pill; else re-open the modal
            if (modalCompressed) {
              // already has resume pill in chat
            } else if (!modalOpen) {
              setModalOpen(true);
            }
          }, 700);
        }, 500);
      } else {
        withTyping(() => {
          sendNeuraReply(`Got it — I'll add "${trimmed}" to your notes. ${pickPhrase("derail.return")} step ${scriptStepIdx + 1}.`);
          if (!modalOpen && !modalCompressed) setModalOpen(true);
        }, 500);
      }
      return;
    }

    // Free chat — guardrail off-topic first
    if (isOffTopic(trimmed)) {
      withTyping(() => {
        sendNeuraReply(guardrailResponse(trimmed));
        setTimeout(() => {
          appendNeura([
            {
              type: "what-else",
              chips: ["Log a headache", "Daily check-in", "What are my triggers?"],
            },
          ]);
        }, 500);
      }, 450);
      return;
    }

    // Heuristic: "add medication" → medication-add script
    if (
      /\b(add|new)\b.*\b(med|medication|drug|pill)\b/.test(trimmed.toLowerCase())
    ) {
      startScript("medication-add");
      return;
    }

    // Free chat — route intent
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
          { type: "text", text: "Here's what I know — tap to dive deeper." },
          { type: "content-card", content: intent.content! },
        ]);
      }, 600);
      return;
    }
    if (intent.type === "appointment") {
      withTyping(() => {
        sendNeuraReply(
          "Your next appointment is Thursday, April 23 at 2:00pm with Dr. Patel (Neurology). I'll remind you the day before.",
        );
      }, 500);
      return;
    }
    if (intent.type === "conversational" && intent.text) {
      withTyping(() => sendNeuraReply(intent.text!), 500);
      return;
    }

    withTyping(() => {
      sendNeuraReply(
        "I'm not sure I caught that. Try 'Log a headache', 'How am I doing?', or ask me a question about migraines.",
      );
    }, 500);
  };

  // ------------------------------------------------------------------
  // Demo controls
  // ------------------------------------------------------------------
  const handleDemoStartScript = (id: ScriptId) => {
    setDemoOpen(false);
    startScript(id);
  };

  const handleDemoShowAnswer = (kind: NeuraAnswerKind) => {
    setDemoOpen(false);
    setEmptyState(false);
    if (kind === "adherence") {
      const stats = getMockStats();
      const weekPct = Math.round(stats.medicationAdherenceRate ?? 87);
      withTyping(() => {
        appendNeura([
          {
            type: "text",
            text: "Here's your week — pretty mixed.",
          },
          {
            type: "inline-answer",
            answer: {
              kind: "adherence",
              weekPct,
              missedDoses: 4,
              totalDoses: 28,
              byMed: [
                { name: "Topiramate 100mg", taken: 7, total: 7 },
                { name: "Sumatriptan 50mg", taken: 2, total: 4 },
                { name: "Ibuprofen 400mg", taken: 12, total: 14 },
              ],
            },
          },
        ]);
      }, 500);
      return;
    }
    if (kind === "top-triggers") {
      showTriggerInsight();
      return;
    }
    if (kind === "previous-trigger-log") {
      withTyping(() => {
        appendNeura([
          { type: "text", text: "Pulled your last trigger session —" },
          {
            type: "inline-answer",
            answer: {
              kind: "previous-trigger-log",
              dateLabel: "Wednesday, Apr 30",
              daysAgo: 5,
              triggers: [
                { id: "stress", label: "Stress", icon: "😰" },
                { id: "poor_sleep", label: "Poor sleep", icon: "😴" },
                { id: "weather", label: "Weather shift", icon: "🌦️" },
              ],
              context: { sleep: "5h", stress: "High", mood: "Low" },
            },
            actionKey: "previous-trigger-log",
          },
        ]);
      }, 500);
      return;
    }
    if (kind === "last-attack") {
      const attacks = getMockAttacks();
      const last = attacks[0];
      const formatDuration = (mins?: number): string => {
        if (!mins) return "4h 20m";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m.toString().padStart(2, "0")}m`;
      };
      withTyping(() => {
        appendNeura([
          { type: "text", text: "Pulled the most recent log —" },
          {
            type: "inline-answer",
            answer: {
              kind: "last-attack",
              dateLabel: last
                ? new Date(last.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })
                : "Tuesday, Apr 16",
              durationLabel: formatDuration(last?.durationMinutes),
              peakPain: last?.painLevel ?? 7,
              zones:
                last?.painZones && last.painZones.length
                  ? last.painZones.map((z: string) =>
                      z.replace(/_/g, " "),
                    )
                  : ["Right temple", "Behind right eye"],
              whatHelped: "Dark room + sumatriptan",
              trigger: "Stress + poor sleep",
            },
          },
        ]);
      }, 500);
    }
  };

  const handleSimulateDigression = () => {
    setDemoOpen(false);
    if (!activeScript) {
      // Start a script first, then queue the digression
      startScript("headache-log");
      setTimeout(() => {
        const digression = pickDigression();
        appendUser(digression);
        withTyping(() => {
          sendNeuraReply(briefAnswerForDerailment(digression));
          setTimeout(() => {
            sendNeuraReply(
              `${pickPhrase("derail.return")} let's pick up where we were.`,
            );
          }, 700);
        }, 500);
      }, 1500);
      return;
    }
    const digression = pickDigression();
    appendUser(digression);
    withTyping(() => {
      sendNeuraReply(briefAnswerForDerailment(digression));
      setTimeout(() => {
        sendNeuraReply(
          `${pickPhrase("derail.return")} let's pick up step ${scriptStepIdx + 1}.`,
        );
      }, 700);
    }, 500);
  };

  const handleToggleEpisodeMode = () => {
    setDemoOpen(false);
    setEpisodeMode((v) => !v);
    if (!episodeMode) {
      withTyping(() => {
        sendNeuraReply("You're in a migraine. I'll keep this short.");
      }, 300);
    }
  };

  const handleForceSpeaking = () => {
    setDemoOpen(false);
    setVoicePhase("speaking");
    setTimeout(() => setVoicePhase("idle"), 2200);
  };

  const handleResetChat = () => {
    setDemoOpen(false);
    setMessages([]);
    setActiveScript(null);
    setScriptStepIdx(0);
    setModalOpen(false);
    setModalCompressed(false);
    setEmptyState(true);
    setEpisodeMode(false);
  };

  const handleSeedDemoUser = () => {
    setDemoOpen(false);
    sendNeuraReply(
      "Demo user seeded — 12-day streak, 10 attacks, 3 meds. Reload Home to see it populated.",
    );
  };

  // ------------------------------------------------------------------
  // Replay director — drives scripted case demos
  // ------------------------------------------------------------------
  const runReplayAction = (action: ReplayAction) => {
    switch (action.kind) {
      case "note":
        // Annotation only — rendered by the director bar.
        return;
      case "user":
        appendUser(action.text);
        return;
      case "neura":
        withTyping(() => sendNeuraReply(action.text), 350);
        return;
      case "start-script":
        startScript(action.scriptId);
        return;
      case "switch-script":
        // Pause whatever was running, then start the new script. The
        // closingScriptRef guard would otherwise no-op the new startScript
        // for up to 1.5s if the previous script was just completing.
        closingScriptRef.current = null;
        setActiveScript(null);
        setScriptStepIdx(0);
        setScriptAnswers({});
        setModalOpen(false);
        setModalCompressed(false);
        setMessages((prev) =>
          prev.filter(
            (m) => !m.blocks.some((b) => b.type === "resume-pill"),
          ),
        );
        setTimeout(() => startScript(action.scriptId), 200);
        return;
      case "auto-submit": {
        // Build a synthetic submission for whichever step is active.
        if (!activeScript) return;
        const script = getScript(activeScript);
        const step = script.steps[scriptStepIdx];
        if (!step?.widget) return;
        const value = action.value;
        const summary =
          typeof value === "number"
            ? `${value}/10`
            : Array.isArray(value)
              ? value.slice(0, 2).join(", ") +
                (value.length > 2 ? ` +${value.length - 2}` : "")
              : String(value);
        handleModalSubmit({
          type: step.widget.type,
          value,
          summary,
        });
        return;
      }
      case "close-modal":
        handleModalClose();
        return;
      case "tap-resume":
        handleResumePill();
        return;
      case "show-card":
        appendNeura([
          {
            type: "inline-answer",
            answer: action.answer,
            actionKey: action.actionKey,
          },
        ]);
        return;
      case "what-else":
        appendNeura([
          {
            type: "what-else",
            chips: action.chips ?? [
              "Daily check-in",
              "What are my triggers?",
              "How are my meds?",
              "All done",
            ],
          },
        ]);
        return;
      case "guardrail":
        appendUser(action.userText);
        withTyping(() => {
          sendNeuraReply(guardrailResponse(action.userText));
          setTimeout(() => {
            appendNeura([
              {
                type: "what-else",
                chips: [
                  "Log a headache",
                  "Daily check-in",
                  "What are my triggers?",
                ],
              },
            ]);
          }, 500);
        }, 450);
        return;
    }
  };

  const startReplay = (id: string) => {
    const replay = getReplayById(id);
    if (!replay) return;
    setDemoOpen(false);
    setReplayId(id);
    setReplayIdx(0);
    // Reset chat surface so the demo starts clean.
    setMessages([]);
    setActiveScript(null);
    setScriptStepIdx(0);
    setScriptAnswers({});
    setModalOpen(false);
    setModalCompressed(false);
    setEmptyState(false);
    // Auto-fire the first action so users see something immediately.
    setTimeout(() => {
      const first = replay.actions[0];
      if (first) runReplayAction(first);
      setReplayIdx(1);
    }, 200);
  };

  const advanceReplay = () => {
    if (!replayId) return;
    const replay = getReplayById(replayId);
    if (!replay) return;
    if (replayIdx >= replay.actions.length) {
      // Already at end
      return;
    }
    const action = replay.actions[replayIdx];
    runReplayAction(action);
    setReplayIdx((i) => i + 1);
  };

  const endReplay = () => {
    setReplayId(null);
    setReplayIdx(0);
  };

  const handleResetStorage = () => {
    if (!confirm("Clear all logs and reset to first-time flow?")) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith("nc-"))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  // ------------------------------------------------------------------
  // Modal data
  // ------------------------------------------------------------------
  const activeScriptObj: Script | null = activeScript
    ? getScript(activeScript)
    : null;
  const activeStep = activeScriptObj?.steps[scriptStepIdx];
  const stepDisplay = activeScriptObj
    ? getStepDisplay(activeScriptObj, scriptStepIdx)
    : { question: "" };

  // Caption is intentionally suppressed when idle to keep the voice pill clean
  // (matches Patient App v3 ref). Only meaningful states render a label.
  const voicePillCaption = (() => {
    if (voicePhase === "listening" && modalOpen) {
      return `Step ${scriptStepIdx + 1}/${activeScriptObj?.steps.length ?? 0} · listening`;
    }
    if (voicePhase === "listening") return "Listening…";
    if (voicePhase === "speaking") return "Neura is speaking…";
    if (modalCompressed) return "Paused · tap pill to resume";
    return undefined;
  })();

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  const renderBlock = (
    msgId: string,
    role: "user" | "neura",
    block: MessageBlock,
    idx: number,
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
          className="text-sm leading-[1.4] max-w-[80%] text-foreground bg-card border border-border relative"
          style={{
            padding: "11px 14px",
            borderRadius: "18px 18px 18px 6px",
            boxShadow: "var(--shadow-sm-proto)",
          }}
        >
          {block.text}
          {block.speaking && voicePhase === "speaking" && (
            <span className="absolute -left-2 top-3 flex gap-[2px]">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block rounded-full"
                  style={{
                    width: 3,
                    height: 12,
                    background: "var(--nc-accent)",
                  }}
                  animate={{ scaleY: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.12,
                  }}
                />
              ))}
            </span>
          )}
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
    if (block.type === "inline-answer") {
      return (
        <div key={idx} className="w-full">
          <NeuraInlineAnswer
            answer={block.answer}
            onAction={
              block.actionKey === "top-triggers" && onOpenTriggerAnalysis
                ? onOpenTriggerAnalysis
                : block.actionKey === "last-attack" && onOpenDiary
                  ? onOpenDiary
                  : undefined
            }
          />
        </div>
      );
    }
    if (block.type === "what-else") {
      return (
        <div key={idx} className="w-full flex flex-wrap gap-2">
          {block.chips.map((chip) => (
            <button
              key={chip}
              onClick={() => {
                if (chip === "All done") {
                  appendNeura([
                    {
                      type: "text",
                      text: "Anytime — I'm right here when you need me.",
                    },
                  ]);
                  return;
                }
                sendUserMessage(chip);
              }}
              className="px-3.5 py-2 rounded-full text-[12.5px] font-semibold border cursor-pointer active:scale-[0.97] transition-all"
              style={{
                background:
                  chip === "All done"
                    ? "transparent"
                    : "var(--nc-accent-soft)",
                color:
                  chip === "All done"
                    ? "var(--ink-2)"
                    : "var(--nc-accent)",
                borderColor:
                  chip === "All done"
                    ? "hsl(var(--border))"
                    : "var(--nc-accent)",
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      );
    }
    if (block.type === "resume-pill" && activeScriptObj) {
      return (
        <NeuraResumePill
          key={idx}
          scriptName={activeScriptObj.name}
          stepIdx={scriptStepIdx}
          totalSteps={activeScriptObj.steps.length}
          questionPreview={stepDisplay.question}
          onResume={handleResumePill}
          onCancel={handleCancelScript}
        />
      );
    }
    if (block.type === "action-button") {
      return (
        <button
          key={idx}
          onClick={() => {
            if (
              block.action === "open-trigger-analysis" &&
              onOpenTriggerAnalysis
            ) {
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
    <div
      className="min-h-[100dvh] flex flex-col bg-background relative"
      style={{
        filter: episodeMode ? "saturate(0.85)" : undefined,
        background: episodeMode ? "var(--bg-deep)" : undefined,
      }}
    >
      {/* Episode banner */}
      {episodeMode && (
        <div
          className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-2"
          style={{
            background: "rgba(239,68,68,0.95)",
            color: "#fff",
            paddingTop: "calc(env(safe-area-inset-top) + 8px)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          }}
        >
          <span className="flex items-center gap-2">
            <span
              className="block rounded-full"
              style={{
                width: 8,
                height: 8,
                background: "#fff",
                animation: "pulse 1.4s infinite",
              }}
            />
            Migraine active
          </span>
          <button
            onClick={() => setEpisodeMode(false)}
            className="bg-transparent border-0 cursor-pointer text-white"
            style={{ fontSize: 11, opacity: 0.95 }}
          >
            End migraine
          </button>
        </div>
      )}

      {/* Header */}
      <div
        className="px-5 pb-3 bg-background/95 backdrop-blur-sm sticky z-20 border-b border-border"
        style={{
          top: 0,
          paddingTop: episodeMode
            ? "calc(env(safe-area-inset-top) + 44px)"
            : "calc(env(safe-area-inset-top) + 12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:bg-muted/70"
            aria-label="Back"
          >
            <ArrowLeft
              className="w-5 h-5 text-foreground"
              strokeWidth={2.2}
            />
          </button>
          <div
            className="flex items-center justify-center text-white shrink-0"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, #1B2A4E 0%, #7C3AED 50%, #3B82F6 100%)",
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
                <span>
                  Running · {getScript(activeScript).name}
                </span>
              ) : voicePhase === "listening" ? (
                <span>Listening…</span>
              ) : voicePhase === "speaking" ? (
                <span>Speaking…</span>
              ) : isTyping ? (
                <span>Thinking…</span>
              ) : (
                <span>Trained on your 43 logs</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setDemoOpen(true)}
            aria-label="Demo controls"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:bg-muted/70 border-0 cursor-pointer"
            title="Demo controls"
          >
            <MoreHorizontal
              className="w-5 h-5 text-foreground"
              strokeWidth={2.2}
            />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 px-4 py-4 overflow-y-auto scroll-smooth"
        style={{ paddingBottom: 200 }}
      >
        {emptyState && messages.length === 0 && !activeScript && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-1"
          >
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
              {new Date().getHours() < 12
                ? "Good morning"
                : new Date().getHours() < 17
                  ? "Good afternoon"
                  : "Good evening"}
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
              Your migraine
              <br />
              <em
                className="italic"
                style={{ color: "var(--nc-accent)" }}
              >
                companion.
              </em>
            </h2>
            <p
              className="text-muted-foreground"
              style={{
                fontSize: 13,
                margin: "0 4px 16px",
                lineHeight: 1.5,
              }}
            >
              Hold the mic to speak, or tap the keyboard to type.
            </p>

            <div style={{ margin: "0 0 20px" }}>
              {[
                "Why do I always get migraines on Monday?",
                "What helped with my last attack?",
                "Is my Topiramate actually working?",
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setEmptyState(false);
                    sendUserMessage(prompt);
                  }}
                  className="w-full text-left mb-2 px-4 py-3 rounded-2xl border border-border bg-card active:bg-muted transition-colors"
                  style={{ fontFamily: "inherit" }}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles
                      className="w-3.5 h-3.5 text-accent shrink-0"
                      strokeWidth={2.2}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--ink)",
                        lineHeight: 1.4,
                      }}
                    >
                      {prompt}
                    </span>
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
                    id: "daily-discovery" as ScriptId,
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
                      setEmptyState(false);
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
                      style={{
                        width: 14,
                        height: 14,
                        color: "var(--muted-2)",
                      }}
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
                      setEmptyState(false);
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
                      style={{
                        width: 14,
                        height: 14,
                        color: "var(--muted-2)",
                      }}
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
              {msg.blocks.map((block, idx) =>
                renderBlock(msg.id, msg.role, block, idx),
              )}
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
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Script modal — full-page question modal, slides up over chat */}
      {activeScriptObj && activeStep && activeStep.widget && (
        <NeuraScriptModal
          open={modalOpen}
          scriptName={activeScriptObj.name}
          scriptId={`${activeScript}-${scriptStepIdx}`}
          stepIdx={scriptStepIdx}
          totalSteps={activeScriptObj.steps.length}
          question={stepDisplay.question}
          subtitle={stepDisplay.subtitle}
          coach={stepDisplay.coach}
          widget={activeStep.widget}
          isSpeaking={voicePhase === "listening"}
          speakHint={modalSpeakHint ?? undefined}
          onSubmit={handleModalSubmit}
          onClose={handleModalClose}
          onSpeak={handleModalSpeak}
        />
      )}

      {/* Bottom dock — voice pill OR keyboard pill — sits above BottomNav */}
      {inputMode === "voice" ? (
        <NeuraVoicePill
          listening={voicePhase === "listening"}
          speaking={voicePhase === "speaking"}
          onMicTap={handleVoiceMicTap}
          onKeyboardTap={handleKeyboardTap}
          caption={voicePillCaption}
          bottomOffset={onNavigate ? 92 : 0}
        />
      ) : (
        <div
          className="fixed left-0 right-0 z-30 px-4"
          style={{ bottom: (onNavigate ? 92 : 0) + 12 }}
        >
          <div
            className="mx-auto flex items-center gap-2 px-2 py-1.5 rounded-full"
            style={{
              maxWidth: 374,
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              boxShadow:
                "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && input.trim() && sendUserMessage(input.trim())
              }
              placeholder="Ask Neura anything…"
              className="flex-1 bg-transparent border-0 outline-none px-3 py-2"
              style={{ fontSize: 14, color: "var(--ink)" }}
            />
            <button
              onClick={handleSwitchToVoice}
              aria-label="Switch to voice"
              className="shrink-0 flex items-center justify-center bg-transparent border-0 cursor-pointer"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                color: "var(--ink-2)",
              }}
              title="Switch to voice"
            >
              <Sparkles className="w-[14px] h-[14px]" strokeWidth={2.2} />
            </button>
            <button
              onClick={() => input.trim() && sendUserMessage(input.trim())}
              aria-label="Send"
              className="shrink-0 flex items-center justify-center bg-foreground text-background border-0 cursor-pointer active:scale-95 transition-transform"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
              }}
            >
              <Send className="w-[13px] h-[13px]" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}

      <NeuraContentModal
        content={modalContent}
        onClose={() => setModalContent(null)}
      />

      <NeuraDemoPanel
        open={demoOpen}
        episodeMode={episodeMode}
        onClose={() => setDemoOpen(false)}
        onResetChat={handleResetChat}
        onStartScript={handleDemoStartScript}
        onShowAnswer={handleDemoShowAnswer}
        onSimulateDigression={handleSimulateDigression}
        onToggleEpisodeMode={handleToggleEpisodeMode}
        onForceSpeaking={handleForceSpeaking}
        onSeedDemoUser={handleSeedDemoUser}
        onResetStorage={handleResetStorage}
        onStartReplay={startReplay}
      />

      <NeuraReplayDirector
        open={!!replayId}
        name={replayName}
        stepIdx={replayIdx}
        totalSteps={replayActions.length}
        currentAction={currentReplayAction}
        onAdvance={advanceReplay}
        onEnd={endReplay}
      />

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

// Small helper — pick a representative emoji per trigger id
function triggerEmoji(triggerId: string): string {
  const map: Record<string, string> = {
    stress: "😰",
    lack_of_sleep: "😴",
    skipped_meal: "🍽️",
    variable_weather: "🌦️",
    hormonal_changes: "📅",
    bright_lights: "💡",
    neck_pain: "🦴",
    caffeine: "☕",
    alcohol: "🍷",
    dehydration: "💧",
  };
  return map[triggerId] ?? "⚡";
}

export default NeuraChat;
