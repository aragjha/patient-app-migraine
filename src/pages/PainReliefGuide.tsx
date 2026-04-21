import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import {
  painTypes,
  reliefItems,
  getReliefsForPainType,
  getCategoryLabel,
  getCategoryIcon,
  PainType,
  ReliefItem,
} from "@/data/painReliefContent";

interface PainReliefGuideProps {
  onBack: () => void;
}

const effectivenessConfig = {
  high: { bg: "bg-green-500/15 text-green-700", label: "Most effective" },
  medium: { bg: "bg-yellow-500/15 text-yellow-700", label: "Helpful" },
  low: { bg: "bg-gray-500/15 text-gray-500", label: "May help" },
};

const categoryOrder: ReliefItem["category"][] = ["activity", "remedy", "lifestyle"];

const PainReliefGuide = ({ onBack }: PainReliefGuideProps) => {
  const [selectedType, setSelectedType] = useState<PainType | null>(null);

  const reliefs = selectedType ? getReliefsForPainType(selectedType.id) : [];

  const groupedReliefs = categoryOrder
    .map((cat) => ({
      category: cat,
      items: reliefs.filter((r) => r.category === cat),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center relative">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={selectedType ? () => setSelectedType(null) : onBack}
          className="p-2 -ml-2 rounded-full hover:bg-muted"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </motion.button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-foreground">
          Pain Relief Guide
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-6 overflow-y-auto">
        {!selectedType ? (
          /* ---- Pain Type Selection ---- */
          <div className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-foreground">
                What kind of pain are you feeling?
              </h2>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                Tap to see what might help
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              {painTypes.map((pt, i) => (
                <motion.button
                  key={pt.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(pt)}
                  className={`rounded-2xl border-2 border-border/50 p-4 bg-gradient-to-r ${pt.color} text-left`}
                >
                  <span className="text-3xl block mb-2">{pt.icon}</span>
                  <span className="font-semibold text-foreground block">
                    {pt.label}
                  </span>
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {pt.description}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* ---- Relief Results ---- */
          <div className="mt-4">
            {/* Back link */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType(null)}
              className="text-sm text-accent-foreground font-medium mb-4 inline-block"
            >
              ← Change pain type
            </motion.button>

            {/* Selected pain type card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl border-2 border-accent p-3 bg-gradient-to-r ${selectedType.color} flex items-center gap-3 mb-6`}
            >
              <span className="text-2xl">{selectedType.icon}</span>
              <div>
                <span className="font-semibold text-foreground block">
                  {selectedType.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedType.description}
                </span>
              </div>
            </motion.div>

            {/* Grouped relief items */}
            {groupedReliefs.map((group, gi) => (
              <div key={group.category} className="mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: gi * 0.08 }}
                  className="flex items-center gap-2 mb-3"
                >
                  <span className="text-lg">
                    {getCategoryIcon(group.category)}
                  </span>
                  <h3 className="font-semibold text-foreground">
                    {getCategoryLabel(group.category)}
                  </h3>
                </motion.div>

                <div className="flex flex-col gap-3">
                  {group.items.map((item, ii) => {
                    const eff = effectivenessConfig[item.effectiveness];
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: gi * 0.08 + ii * 0.05,
                        }}
                        className="rounded-2xl border border-border/50 bg-card p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-0.5">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-foreground">
                                {item.label}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${eff.bg}`}
                              >
                                {eff.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PainReliefGuide;
