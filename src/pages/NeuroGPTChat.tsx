import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mic,
  Send,
  Pill,
  Sun,
  Moon,
  Clock,
  TrendingUp,
  Activity,
  Brain,
  Zap,
  ClipboardCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import ChatModal, { ChatModalType } from "@/components/ChatModals";

interface NeuroGPTChatProps {
  onBack: () => void;
}

// --- Types ---

interface MedicationItem {
  name: string;
  dose: string;
  time: "Morning" | "Night" | "Afternoon";
}

interface AdherenceDay {
  day: string;
  value: number;
}

type MessageContent =
  | { type: "text"; text: string }
  | { type: "medication-card"; medications: MedicationItem[] }
  | { type: "adherence-card"; rate: number; missed: number; data: AdherenceDay[] };

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: MessageContent[];
}

// --- Demo Data ---

const demoMedications: MedicationItem[] = [
  { name: "Sumatriptan", dose: "50 mg", time: "As needed" as "Morning" },
  { name: "Topiramate", dose: "100 mg", time: "Night" },
  { name: "Erenumab (Aimovig)", dose: "70 mg", time: "Monthly" as "Morning" },
  { name: "Ibuprofen", dose: "400 mg", time: "As needed" as "Morning" },
];

const adherenceData: AdherenceDay[] = [
  { day: "Mon", value: 100 },
  { day: "Tue", value: 80 },
  { day: "Wed", value: 60 },
  { day: "Thu", value: 100 },
  { day: "Fri", value: 40 },
  { day: "Sat", value: 80 },
  { day: "Sun", value: 60 },
];

const demoMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: [{ type: "text", text: "Hey! How's your head today?" }],
  },
];

const quickChips = [
  { label: "Log a headache", icon: Zap, action: "log-headache" },
  { label: "How am I doing?", icon: TrendingUp, action: "stats" },
  { label: "Check my meds", icon: Pill, action: "open-modal:medication-check" },
  { label: "Rate my pain", icon: Activity, action: "open-modal:pain-scale" },
  { label: "Log symptoms", icon: ClipboardCheck, action: "open-modal:diary-quick" },
];

// --- Sub-components ---

const TimeIcon = ({ time }: { time: string }) => {
  if (time === "Morning") return <Sun className="w-3.5 h-3.5 text-amber-400" />;
  if (time === "Night") return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
  return <Clock className="w-3.5 h-3.5 text-orange-400" />;
};

const MedicationCard = ({ medications }: { medications: MedicationItem[] }) => (
  <motion.div
    className="rounded-2xl bg-[hsl(221,28%,18%)] border border-[hsl(221,28%,28%)] overflow-hidden w-full"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="px-4 py-3 border-b border-[hsl(221,28%,28%)] flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
        <Pill className="w-4 h-4 text-accent" />
      </div>
      <span className="text-body font-bold text-white">Your medications</span>
    </div>
    <div className="divide-y divide-[hsl(221,28%,25%)]">
      {medications.map((med, i) => (
        <div key={i} className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <Pill className="w-4 h-4 text-accent/80" />
            </div>
            <div>
              <p className="text-helper-lg font-semibold text-white">{med.name}</p>
              <p className="text-helper text-[hsl(220,14%,65%)]">{med.dose}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(221,28%,24%)]">
            <TimeIcon time={med.time} />
            <span className="text-helper text-[hsl(220,14%,75%)]">{med.time}</span>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const AdherenceCard = ({
  rate,
  missed,
  data,
}: {
  rate: number;
  missed: number;
  data: AdherenceDay[];
}) => {
  const getBarColor = (value: number) => {
    if (value >= 80) return "hsl(186, 71%, 72%)"; // accent
    if (value >= 60) return "hsl(45, 93%, 58%)"; // gold/warning
    return "hsl(0, 84%, 60%)"; // destructive/red
  };

  return (
    <motion.div
      className="rounded-2xl bg-[hsl(221,28%,18%)] border border-[hsl(221,28%,28%)] overflow-hidden w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 py-3 border-b border-[hsl(221,28%,28%)] flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-accent" />
        </div>
        <span className="text-body font-bold text-white">
          Adherence -- this week
        </span>
      </div>

      {/* Big percentage */}
      <div className="px-4 pt-4 pb-2 flex items-end gap-3">
        <div>
          <span className="text-[3rem] leading-none font-extrabold text-white">
            {rate}%
          </span>
          <p className="text-helper text-[hsl(220,14%,65%)] mt-1">this week</p>
        </div>
        <div className="mb-2 px-3 py-1 rounded-full bg-[hsl(0,84%,60%)]/15">
          <span className="text-helper font-semibold text-[hsl(0,84%,70%)]">
            {missed} missed doses
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-4 pt-2">
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220,14%,65%)", fontSize: 12 }}
            />
            <YAxis hide domain={[0, 100]} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

const ListeningDots = () => (
  <span className="inline-flex items-center gap-0.5 ml-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1 h-1 rounded-full bg-accent"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut",
        }}
      />
    ))}
  </span>
);

// --- Main Component ---

const NeuroGPTChat = ({ onBack }: NeuroGPTChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(demoMessages);
  const [input, setInput] = useState("");
  const [isMicActive, setIsMicActive] = useState(true); // starts "listening"
  const [activeModal, setActiveModal] = useState<ChatModalType>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessages = (...msgs: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...msgs]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: [{ type: "text", text: input }],
    };
    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: [
        {
          type: "text",
          text: "I hear you! This is a demo — I'll be fully powered soon. Try the quick actions below.",
        },
      ],
    };
    addMessages(userMsg, botMsg);
    setInput("");
  };

  const handleChipClick = (chip: { label: string; action: string }) => {
    // Handle open-modal actions
    if (chip.action.startsWith("open-modal:")) {
      const modalType = chip.action.replace("open-modal:", "") as ChatModalType;
      setActiveModal(modalType);
      return;
    }

    // Handle stats action
    if (chip.action === "stats") {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: [{ type: "text", text: chip.label }],
      };
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: [
          {
            type: "text",
            text: "This month: 8 attacks, avg pain 6.2/10. Top trigger: stress (5 attacks). Down from 11 last month — nice progress!",
          },
        ],
      };
      addMessages(userMsg, botMsg);
      return;
    }

    // Handle log-headache action
    if (chip.action === "log-headache") {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: [{ type: "text", text: chip.label }],
      };
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: [
          {
            type: "text",
            text: "Sorry to hear that. Let's get it logged so we can spot patterns. How bad is the pain right now, 0-10?",
          },
        ],
      };
      addMessages(userMsg, botMsg);
      return;
    }

    // Fallback
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: [{ type: "text", text: chip.label }],
    };
    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: [
        {
          type: "text",
          text: "I hear you! This is a demo — I'll be fully powered soon. Try the quick actions below.",
        },
      ],
    };
    addMessages(userMsg, botMsg);
  };

  const handleModalSubmit = (data: Record<string, unknown>) => {
    setActiveModal(null);
    const botMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Got it, logged! Anything else?",
        },
      ],
    };
    addMessages(botMsg);
  };

  const toggleMic = () => setIsMicActive((v) => !v);

  // --- Render message content blocks ---
  const renderContent = (block: MessageContent, idx: number) => {
    switch (block.type) {
      case "text":
        return (
          <p key={idx} className="text-body leading-relaxed">
            {block.text}
          </p>
        );
      case "medication-card":
        return <MedicationCard key={idx} medications={block.medications} />;
      case "adherence-card":
        return (
          <AdherenceCard
            key={idx}
            rate={block.rate}
            missed={block.missed}
            data={block.data}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(221,28%,12%)]">
      {/* ---- HEADER ---- */}
      <div className="px-4 pt-safe-top pb-3 border-b border-[hsl(221,28%,22%)] bg-[hsl(221,28%,14%)]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[hsl(221,28%,22%)] flex items-center justify-center hover:bg-[hsl(221,28%,28%)] transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <h1 className="text-h2 text-white">NeuroGPT</h1>
            <div className="flex items-center">
              <span className="text-helper text-accent">
                {isMicActive ? "Listening" : "Online"}
              </span>
              {isMicActive && <ListeningDots />}
            </div>
          </div>
        </div>
      </div>

      {/* ---- MESSAGES ---- */}
      <div
        ref={scrollRef}
        className="flex-1 px-4 py-4 overflow-y-auto pb-72 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, mIdx) => (
            <motion.div
              key={msg.id}
              className={`mb-5 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mIdx * 0.08, duration: 0.35 }}
            >
              <div
                className={`max-w-[88%] space-y-2.5 ${
                  msg.role === "user" ? "items-end" : "items-start"
                } flex flex-col`}
              >
                {msg.content.map((block, bIdx) => {
                  // Cards render outside the bubble
                  if (block.type !== "text") {
                    return (
                      <div key={bIdx} className="w-full">
                        {renderContent(block, bIdx)}
                      </div>
                    );
                  }
                  // Text bubbles
                  return (
                    <div
                      key={bIdx}
                      className={`rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-accent text-accent-foreground rounded-br-sm"
                          : "bg-[hsl(221,28%,22%)] text-white rounded-bl-sm"
                      }`}
                    >
                      {renderContent(block, bIdx)}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ---- QUICK CHIPS (floating above input) ---- */}
      <div className="fixed bottom-[168px] left-0 right-0 px-4 z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleChipClick(chip)}
              className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full bg-[hsl(221,28%,22%)] border border-[hsl(221,28%,32%)] text-helper-lg text-[hsl(220,14%,80%)] hover:bg-[hsl(221,28%,28%)] hover:text-white transition-colors shrink-0"
            >
              <chip.icon className="w-3.5 h-3.5" />
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- BOTTOM INPUT AREA ---- */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[hsl(221,28%,10%)]/95 backdrop-blur-md border-t border-[hsl(221,28%,22%)]">
        {/* Mic button row */}
        <div className="flex justify-center pt-3 pb-2">
          <button
            onClick={toggleMic}
            className="relative w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-95"
            aria-label={isMicActive ? "Stop listening" : "Start listening"}
          >
            {/* Pulsing rings when active */}
            {isMicActive && (
              <>
                <motion.span
                  className="absolute inset-0 rounded-full bg-accent/20"
                  animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.span
                  className="absolute inset-0 rounded-full bg-accent/15"
                  animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.3,
                  }}
                />
              </>
            )}
            <span
              className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isMicActive
                  ? "bg-accent shadow-[0_0_24px_hsla(186,71%,72%,0.4)]"
                  : "bg-[hsl(221,28%,28%)]"
              }`}
            >
              <Mic
                className={`w-7 h-7 ${
                  isMicActive ? "text-accent-foreground" : "text-white"
                }`}
              />
            </span>
          </button>
        </div>

        {/* Text input row */}
        <div className="px-4 pb-safe-bottom pb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-full bg-[hsl(221,28%,20%)] text-white placeholder:text-[hsl(220,14%,50%)] focus:outline-none focus:ring-2 focus:ring-accent/60 border border-[hsl(221,28%,30%)] text-body"
            />
            <button
              onClick={handleSend}
              className="w-12 h-12 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="w-5 h-5 text-accent-foreground" />
            </button>
          </div>
          <p className="text-center text-xs text-[hsl(220,14%,45%)] mt-2">
            Not medical advice. Not for emergencies.
          </p>
        </div>
      </div>

      {/* ---- CHAT MODAL ---- */}
      <ChatModal
        type={activeModal}
        onClose={() => setActiveModal(null)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default NeuroGPTChat;
