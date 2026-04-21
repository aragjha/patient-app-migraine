import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { getInsightsFromMockData, getTriggerLabel } from "@/data/triggerAnalysisEngine";
import { mockUser, getMockAttacks } from "@/data/mockUserData";

interface TriggerAnalysisProps {
  onBack: () => void;
}

const TriggerAnalysis = ({ onBack }: TriggerAnalysisProps) => {
  const insights = getInsightsFromMockData();
  const attacks = getMockAttacks();

  const barData = insights.topTriggers.map((t) => ({
    name: getTriggerLabel(t.trigger),
    count: t.count,
    percentage: t.percentage,
  }));

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <div className="px-5 pt-3 pb-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-h1 text-foreground">Your triggers</h1>
      </div>

      <div className="flex-1 px-5 pb-24 overflow-y-auto">
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border p-4 mb-4 shadow-sm-soft"
        >
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Based on</div>
          <div className="text-body text-foreground">{attacks.length} attacks over the last 2 years</div>
        </motion.div>

        {/* Top Triggers Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-card border border-border p-4 mb-4 shadow-sm-soft"
        >
          <h3 className="text-sm font-bold text-foreground mb-3">Top triggers by frequency</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} layout="vertical" margin={{ left: 80, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }}
                width={80}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                formatter={(val: number, _name, props) => [`${val} attacks (${props.payload.percentage}%)`, "Count"]}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "hsl(var(--accent))" : "hsl(var(--accent) / 0.6)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Co-occurrence */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card border border-border p-4 mb-4 shadow-sm-soft"
        >
          <h3 className="text-sm font-bold text-foreground mb-3">Trigger combos</h3>
          <p className="text-xs text-muted-foreground mb-3">Pairs that often appear together</p>
          <div className="space-y-2">
            {insights.coOccurrence.slice(0, 3).map((pair) => (
              <div key={`${pair.triggerA}-${pair.triggerB}`} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <span className="font-semibold">{getTriggerLabel(pair.triggerA)}</span>
                  <span className="text-muted-foreground">+</span>
                  <span className="font-semibold">{getTriggerLabel(pair.triggerB)}</span>
                </div>
                <span className="text-xs font-semibold text-accent">{pair.count} times</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cycle correlation — only show if user tracks menstrual */}
        {mockUser.migraineProfile.menstrualMigraines && insights.cycleCorrelation.multiplier > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-card border border-border p-4 mb-4 shadow-sm-soft"
          >
            <h3 className="text-sm font-bold text-foreground mb-3">Menstrual cycle pattern</h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              You're <span className="font-bold text-foreground">{insights.cycleCorrelation.multiplier}x more likely</span> to get a migraine during your menstrual window (days 25-28 + 1-3) compared to other times.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-accent/10">
                <div className="text-xs text-muted-foreground">Menstrual window</div>
                <div className="text-h2 text-accent">{insights.cycleCorrelation.menstrualWindowAttacks}</div>
                <div className="text-xs text-muted-foreground">attacks</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <div className="text-xs text-muted-foreground">Other days</div>
                <div className="text-h2 text-foreground">{insights.cycleCorrelation.nonMenstrualWindowAttacks}</div>
                <div className="text-xs text-muted-foreground">attacks</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommended actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-accent/5 border border-accent/20 p-4"
        >
          <h3 className="text-sm font-bold text-foreground mb-2">What you can do</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li>• Talk to your doctor about preventive medication timing around your top triggers</li>
            <li>• Set a daily sleep reminder if poor sleep is in your top 3</li>
            <li>• Review our sleep hygiene guide in the Learn section</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default TriggerAnalysis;
