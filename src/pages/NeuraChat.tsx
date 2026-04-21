import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, Send } from "lucide-react";
import NeuraAvatar from "@/components/NeuraAvatar";
import NeuraInlineWidget, { WidgetConfig, WidgetSubmission } from "@/components/NeuraInlineWidget";
import NeuraSummaryChip from "@/components/NeuraSummaryChip";
import NeuraContentCard, { NeuraContent } from "@/components/NeuraContentCard";
import NeuraContentModal from "@/components/NeuraContentModal";
import { findContentForIntent } from "@/data/neuraContentLibrary";

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
  initialScript?: string; // placeholder for Phase E — e.g., "log-headache"
}

const quickChips = [
  "Log a headache",
  "Quick check-in",
  "What's triggering me?",
  "Check my meds",
];

const NeuraChat = ({ onBack }: NeuraChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "1",
      role: "neura",
      blocks: [{ type: "text", text: "Hey! How's your head today?" }],
    },
  ]);
  const [input, setInput] = useState("");
  const [micActive, setMicActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [modalContent, setModalContent] = useState<NeuraContent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendUserMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      blocks: [{ type: "text", text }],
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simple intent detection — Phase E will replace with a full router
    setTimeout(() => {
      const matchedContent = findContentForIntent(text);
      const reply: ChatMessage = {
        id: `n-${Date.now()}`,
        role: "neura",
        blocks: [],
      };

      if (matchedContent.length > 0) {
        reply.blocks.push({
          type: "text",
          text: "Here's what I know — tap the card to dive deeper.",
        });
        reply.blocks.push({ type: "content-card", content: matchedContent[0] });
      } else if (
        text.toLowerCase().includes("headache") ||
        text.toLowerCase().includes("log")
      ) {
        reply.blocks.push({
          type: "text",
          text: "Sorry to hear that. Let's log it. Where does it hurt?",
        });
        reply.blocks.push({ type: "widget", config: { type: "head-diagram" } });
      } else if (
        text.toLowerCase().includes("check-in") ||
        text.toLowerCase().includes("checkin")
      ) {
        reply.blocks.push({ type: "text", text: "Quick check-in. How are you feeling?" });
        reply.blocks.push({ type: "widget", config: { type: "pain-slider" } });
      } else {
        reply.blocks.push({
          type: "text",
          text: "I hear you. Try a quick action below or tell me more.",
        });
      }
      setIsTyping(false);
      setMessages((prev) => [...prev, reply]);
    }, 700);
  };

  const handleWidgetSubmit = (msgId: string, blockIdx: number, result: WidgetSubmission) => {
    // Update the widget block to submitted and add a follow-up message
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
    // Neura follow-up
    setTimeout(() => {
      const followUp: ChatMessage = {
        id: `n-${Date.now()}`,
        role: "neura",
        blocks: [{ type: "text", text: "Got it. Anything else to log?" }],
      };
      setMessages((prev) => [...prev, followUp]);
    }, 400);
  };

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
