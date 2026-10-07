import { useState } from "react";
import {
  BookOpen,
  DollarSign,
  FileText,
  Cpu,
  Sparkles,
  TrendingUp,
  ArrowRight,
  GitBranch,
  Layers,
  Database,
  Network,
} from "lucide-react";

const NODES = [
  {
    id: "research",
    title: "Research",
    label: "Scholarly Evidence",
    icon: BookOpen,
    desc: "100M+ publications and citations indexed from OpenAlex, Crossref, and Semantic Scholar.",
    linksTo: ["funding", "patents"],
    highlight: "Identifies early-stage scientific momentum and foundational discoveries before IP filings.",
  },
  {
    id: "funding",
    title: "Funding",
    label: "Capital Allocation",
    icon: DollarSign,
    desc: "Live federal awards and active grant solicitations from NIH, NSF, DOE, and DoD repositories.",
    linksTo: ["research", "technology"],
    highlight: "Traces federal R&D investments, principal investigators, and forward commercialization trajectories.",
  },
  {
    id: "patents",
    title: "Patents",
    label: "Defensible IP",
    icon: FileText,
    desc: "325,000+ USPTO full-text patents, claims structures, and assignee corporate networks.",
    linksTo: ["research", "technology", "innovation"],
    highlight: "Measures claims novelty, prior-art density, and competitive patent fences.",
  },
  {
    id: "technology",
    title: "Technology",
    label: "TRL Maturity",
    icon: Cpu,
    desc: "15 core technology domains monitored across Technology Readiness Levels (TRL 1–9).",
    linksTo: ["patents", "innovation"],
    highlight: "Tracks maturation from lab validation to operational prototype readiness.",
  },
  {
    id: "innovation",
    title: "Innovation",
    label: "Viability Scoring",
    icon: Sparkles,
    desc: "Composite algorithmic scoring combining novelty, patent strength, and market timing.",
    linksTo: ["technology", "commercialization"],
    highlight: "Synthesizes multi-source evidence into quantified, defensible readiness metrics.",
  },
  {
    id: "commercialization",
    title: "Commercialization",
    label: "Market Pathways",
    icon: TrendingUp,
    desc: "Four strategic execution models: productization, licensing, spinout creation, and partnerships.",
    linksTo: ["innovation"],
    highlight: "Translates academic breakthroughs into real-world industrial and economic impact.",
  },
];

export default function IntelligenceSection() {
  const [activeNode, setActiveNode] = useState(NODES[0]);

  return (
    <section id="intelligence" style={styles.section} aria-label="Connected Intelligence">
      <div style={styles.container}>
        {/* Section Header */}
        <div style={styles.header}>
          <span style={styles.categoryBadge}>Cross-Domain Synergy</span>
          <h2 style={styles.title}>One platform. Connected intelligence.</h2>
          <p style={styles.subtitle}>
            Isolated databases create blind spots. Intelligent Research establishes bidirectional relational links across the entire innovation life cycle.
          </p>
        </div>

        {/* Interactive Visual Relationship Architecture */}
        <div style={styles.architectureBox}>
          {/* Top Controls / Nodes Stepper */}
          <div style={styles.nodesBar}>
            {NODES.map((node) => {
              const isSelected = activeNode.id === node.id;
              const Icon = node.icon;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setActiveNode(node)}
                  style={{
                    ...styles.nodeButton,
                    backgroundColor: isSelected ? "#FFFFFF" : "#F5F7FA",
                    borderColor: isSelected ? "#2F6FED" : "#D9E0EA",
                    boxShadow: isSelected ? "0 4px 12px rgba(47, 111, 237, 0.12)" : "none",
                  }}
                  aria-pressed={isSelected}
                >
                  <div
                    style={{
                      ...styles.nodeIconBox,
                      backgroundColor: isSelected ? "#2F6FED" : "#FFFFFF",
                      color: isSelected ? "#FFFFFF" : "#536273",
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div style={styles.nodeTextCol}>
                    <span
                      style={{
                        ...styles.nodeTitle,
                        color: isSelected ? "#101828" : "#536273",
                      }}
                    >
                      {node.title}
                    </span>
                    <span style={styles.nodeLabel}>{node.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Relationship Detailed View */}
          <div style={styles.activeDetailCard}>
            <div style={styles.detailLeft}>
              <div style={styles.detailBadgeRow}>
                <span style={styles.detailNodeBadge}>Focus Domain</span>
                <span style={styles.detailNodeName}>{activeNode.title} Intelligence</span>
              </div>
              <h3 style={styles.detailHeading}>{activeNode.highlight}</h3>
              <p style={styles.detailDesc}>{activeNode.desc}</p>
            </div>

            <div style={styles.detailRight}>
              <div style={styles.connectionsHeader}>
                <Network size={16} color="#2F6FED" />
                <span>Bidirectional Relationships</span>
              </div>
              <div style={styles.connectionList}>
                {activeNode.linksTo.map((targetId) => {
                  const targetNode = NODES.find((n) => n.id === targetId);
                  if (!targetNode) return null;
                  const TargetIcon = targetNode.icon;
                  return (
                    <div key={targetId} style={styles.connectionItem}>
                      <div style={styles.connectionIcon}>
                        <TargetIcon size={14} color="#2F6FED" />
                      </div>
                      <div style={styles.connectionText}>
                        <span style={styles.connectionTarget}>{targetNode.title}</span>
                        <span style={styles.connectionMeta}>
                          Synchronized semantic cross-referencing
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    backgroundColor: "#FFFFFF",
    padding: "88px 24px",
    borderBottom: "1px solid #D9E0EA",
  },
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    maxWidth: "780px",
    margin: "0 auto 48px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  categoryBadge: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2F6FED",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  title: {
    fontSize: "clamp(26px, 3.4vw, 38px)",
    fontWeight: "800",
    color: "#101828",
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
    margin: 0,
  },
  subtitle: {
    fontSize: "16px",
    color: "#536273",
    lineHeight: 1.55,
    margin: 0,
  },
  architectureBox: {
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "14px",
    padding: "24px",
  },
  nodesBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "10px",
    marginBottom: "24px",
  },
  nodeButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
  },
  nodeIconBox: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s ease",
  },
  nodeTextCol: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.25,
  },
  nodeTitle: {
    fontSize: "13px",
    fontWeight: "700",
  },
  nodeLabel: {
    fontSize: "11px",
    color: "#536273",
  },
  activeDetailCard: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "10px",
    padding: "28px 32px",
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "36px",
    alignItems: "center",
  },
  detailLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  detailBadgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  detailNodeBadge: {
    fontSize: "10.5px",
    fontWeight: "700",
    color: "#2F6FED",
    backgroundColor: "rgba(47, 111, 237, 0.08)",
    padding: "2px 7px",
    borderRadius: "4px",
    textTransform: "uppercase",
  },
  detailNodeName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#101828",
  },
  detailHeading: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#101828",
    lineHeight: 1.35,
    margin: 0,
  },
  detailDesc: {
    fontSize: "14px",
    color: "#536273",
    lineHeight: 1.55,
    margin: 0,
  },
  detailRight: {
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  connectionsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#172554",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  connectionList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  connectionItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "6px",
    padding: "10px 12px",
  },
  connectionIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "4px",
    backgroundColor: "rgba(47, 111, 237, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  connectionText: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.25,
  },
  connectionTarget: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#101828",
  },
  connectionMeta: {
    fontSize: "11px",
    color: "#536273",
  },
};
