import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import LessonDetailPage from "@/pages/LessonDetailPage";
import { ChevronRight, ChevronDown, MapPin, Info, GitBranch, Compass } from "lucide-react";
import {
  allLessons as pdLessons,
  stages as pdStages,
  getSubstagesForStage as pdGetSubstages,
  getLessonsBySubstage as pdGetLessonsBySubstage,
  type LessonNode,
  type NodeType
} from "@/data/lessonContent";
import {
  allLessons as migraineLessons,
  stages as migraineStages,
  getSubstagesForStage as migraineGetSubstages,
  getLessonsBySubstage as migraineGetLessonsBySubstage,
} from "@/data/migraineLessonContent";

interface MapsPageProps {
  onNavigate: (tab: "home" | "maps" | "tools" | "profile") => void;
  initialLessonId?: string | null;
  onLessonClose?: () => void;
  diagnosis?: string | null;
}

const getNodeTypeIcon = (nodeType: NodeType) => {
  switch (nodeType) {
    case "entry": return <Compass className="w-4 h-4" />;
    case "choice": return <GitBranch className="w-4 h-4" />;
    case "info": return <Info className="w-4 h-4" />;
    case "subsection": return <ChevronRight className="w-4 h-4" />;
  }
};

const getNodeTypeColor = (nodeType: NodeType) => {
  switch (nodeType) {
    case "entry": return "bg-accent text-accent-foreground";
    case "choice": return "bg-warning text-warning-foreground";
    case "info": return "bg-muted text-muted-foreground";
    case "subsection": return "bg-secondary text-secondary-foreground";
  }
};

const MapsPage = ({ onNavigate, initialLessonId, onLessonClose, diagnosis }: MapsPageProps) => {
  const isMigraine = diagnosis === "migraine";

  // Select the right data source based on diagnosis
  const allLessons = isMigraine ? migraineLessons : pdLessons;
  const stages = isMigraine ? migraineStages : pdStages;
  const getSubstagesForStage = isMigraine ? migraineGetSubstages : pdGetSubstages;
  const getLessonsBySubstage = isMigraine ? migraineGetLessonsBySubstage : pdGetLessonsBySubstage;

  const defaultStage = stages[0];

  const [activeStage, setActiveStage] = useState(defaultStage);
  const [expandedSubstages, setExpandedSubstages] = useState<Set<string>>(new Set(getSubstagesForStage(defaultStage)));
  const [selectedNode, setSelectedNode] = useState<LessonNode | null>(() => {
    if (initialLessonId) {
      return allLessons.find((l) => l.id === initialLessonId) || null;
    }
    return null;
  });
  const [userCurrentNode, setUserCurrentNode] = useState<string | null>(null);

  const substagesForStage = getSubstagesForStage(activeStage);

  const handleStageChange = (stage: string) => {
    setActiveStage(stage);
    setExpandedSubstages(new Set(getSubstagesForStage(stage)));
  };

  const toggleSubstage = (substage: string) => {
    const newExpanded = new Set(expandedSubstages);
    if (newExpanded.has(substage)) {
      newExpanded.delete(substage);
    } else {
      newExpanded.add(substage);
    }
    setExpandedSubstages(newExpanded);
  };

  const handleNodeClick = (node: LessonNode) => {
    setSelectedNode(node);
  };

  const handleBack = () => {
    setSelectedNode(null);
    if (onLessonClose) {
      onLessonClose();
    }
  };

  const handleMarkAsHere = (nodeId: string) => {
    setUserCurrentNode(prev => prev === nodeId ? null : nodeId);
  };

  // Show lesson detail page if a node is selected
  if (selectedNode) {
    return (
      <LessonDetailPage
        node={selectedNode}
        onBack={handleBack}
        isUserHere={userCurrentNode === selectedNode.id}
        onMarkAsHere={() => handleMarkAsHere(selectedNode.id)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-safe-top">
        <Header />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        {/* Title */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-h1-lg text-foreground">
            {isMigraine ? "Migraine Journey 🗺️" : "Your Journey Map 🗺️"}
          </h1>
          <p className="text-body text-muted-foreground">
            {isMigraine
              ? "Learn about migraine at your own pace."
              : "Explore at your own pace. Mark where you are."}
          </p>
        </motion.div>

        {/* Legend */}
        <motion.div
          className="flex flex-wrap gap-2 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <Compass className="w-3 h-3 text-accent-foreground" />
            </div>
            <span>Entry</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-warning flex items-center justify-center">
              <GitBranch className="w-3 h-3 text-warning-foreground" />
            </div>
            <span>Decision</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
              <Info className="w-3 h-3 text-muted-foreground" />
            </div>
            <span>Info</span>
          </div>
          {userCurrentNode && (
            <div className="flex items-center gap-1.5 text-xs text-accent">
              <MapPin className="w-4 h-4" />
              <span>You are here</span>
            </div>
          )}
        </motion.div>

        {/* Stage Tabs */}
        <motion.div
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => handleStageChange(stage)}
              className={`px-4 py-2 rounded-full text-helper-lg font-semibold whitespace-nowrap transition-colors ${
                activeStage === stage
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {stage}
            </button>
          ))}
        </motion.div>

        {/* Substages and Nodes */}
        <div className="space-y-4">
          {substagesForStage.map((substage, substageIndex) => {
            const nodesInSubstage = getLessonsBySubstage(activeStage, substage);
            const isExpanded = expandedSubstages.has(substage);

            return (
              <motion.div
                key={substage}
                className="glass-card p-0 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + substageIndex * 0.05 }}
              >
                {/* Substage Header */}
                <button
                  onClick={() => toggleSubstage(substage)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <span className="text-lg">{substageIndex + 1}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-body-lg font-semibold text-foreground">{substage}</h3>
                      <p className="text-helper text-muted-foreground">{nodesInSubstage.length} topics</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>

                {/* Nodes */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border"
                    >
                      <div className="p-2 space-y-1">
                        {nodesInSubstage.map((node, nodeIndex) => (
                          <motion.button
                            key={node.id}
                            onClick={() => handleNodeClick(node)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left relative"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: nodeIndex * 0.03 }}
                          >
                            {/* Node Type Icon */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getNodeTypeColor(node.nodeType)}`}>
                              {getNodeTypeIcon(node.nodeType)}
                            </div>

                            {/* Node Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-body font-medium text-foreground truncate">{node.title}</h4>
                                {userCurrentNode === node.id && (
                                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                                )}
                              </div>
                              <p className="text-helper text-muted-foreground line-clamp-1">{node.description}</p>
                            </div>

                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav activeTab="maps" onTabChange={onNavigate} />
    </div>
  );
};

export default MapsPage;
