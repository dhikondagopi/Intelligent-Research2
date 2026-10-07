import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  DollarSign,
  FileText,
  Cpu,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
} from "lucide-react";

const TABS = [
  { id: "research", label: "Research Intelligence", icon: BookOpen },
  { id: "funding", label: "Funding Intelligence", icon: DollarSign },
  { id: "patents", label: "Patent Intelligence", icon: FileText },
  { id: "technology", label: "Technology Intelligence", icon: Cpu },
  { id: "innovation", label: "Innovation Dashboard", icon: Sparkles },
];

export default function ProductPreview() {
  const [activeTab, setActiveTab] = useState("research");

  return (
    <section style={styles.section} aria-label="Product Interface Preview">
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.categoryBadge}>Platform Interface</span>
          <h2 style={styles.title}>Experience the platform in action</h2>
          <p style={styles.subtitle}>
            A unified analytical workspace designed for complex scientific, intellectual property, and grant inquiries.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={styles.tabBar}>
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabButton,
                  borderBottomColor: isSelected ? "#2F6FED" : "transparent",
                  color: isSelected ? "#2F6FED" : "#536273",
                  fontWeight: isSelected ? "700" : "500",
                }}
                aria-selected={isSelected}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div style={styles.previewWindow}>
          {/* Top Browser / App chrome bar */}
          <div style={styles.windowChrome}>
            <div style={styles.chromeDots}>
              <span style={{ ...styles.chromeDot, backgroundColor: "#E05B61" }} />
              <span style={{ ...styles.chromeDot, backgroundColor: "#D9A441" }} />
              <span style={{ ...styles.chromeDot, backgroundColor: "#35C98A" }} />
            </div>
            <div style={styles.chromeUrl}>
              intelligent-research.internal/workspace/
              {activeTab}
            </div>
            <Link to="/login" style={styles.chromeAction}>
              Launch Live App
              <ExternalLink size={12} style={{ marginLeft: 4 }} />
            </Link>
          </div>

          <div style={styles.windowContent}>
            {/* TAB 1: Research Intelligence */}
            {activeTab === "research" && (
              <div style={styles.tabPanel}>
                <div style={styles.searchBarSim}>
                  <Search size={16} color="#536273" />
                  <span style={styles.searchPlaceholder}>
                    Query: "perovskite tandem solar cell degradation mechanisms"
                  </span>
                  <span style={styles.filterPill}>142 Results Found</span>
                </div>

                <div style={styles.gridTwo}>
                  <div style={styles.panelCard}>
                    <span style={styles.panelCardKicker}>High Impact Paper</span>
                    <h4 style={styles.panelCardTitle}>
                      Accelerated Operational Stability Testing of All-Perovskite Multijunction Cells
                    </h4>
                    <p style={styles.panelCardDesc}>
                      Comprehensive 1,000-hour continuous illumination assessment under international ISOS-L-2 protocols.
                    </p>
                    <div style={styles.metricsPillRow}>
                      <span style={styles.metricPill}>Citations: 312</span>
                      <span style={styles.metricPill}>FWCI: 4.18</span>
                      <span style={styles.metricPill}>Journal: Joule</span>
                    </div>
                  </div>

                  <div style={styles.panelCard}>
                    <span style={styles.panelCardKicker}>Emerging Cluster Detection</span>
                    <h4 style={styles.panelCardTitle}>
                      Chemical Passivation of Buried Interfaces via 2D Heterostructures
                    </h4>
                    <p style={styles.panelCardDesc}>
                      Detected as a top 5% acceleration cluster across global literature indexes.
                    </p>
                    <div style={styles.metricsPillRow}>
                      <span style={styles.metricPill}>Growth: +68% YoY</span>
                      <span style={styles.metricPill}>Velocity: Tier 1 Hotspot</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Funding Intelligence */}
            {activeTab === "funding" && (
              <div style={styles.tabPanel}>
                <div style={styles.searchBarSim}>
                  <Search size={16} color="#536273" />
                  <span style={styles.searchPlaceholder}>
                    Query: "advanced battery storage materials NSF / DOE"
                  </span>
                  <span style={styles.filterPill}>38 Solicitations</span>
                </div>

                <div style={styles.gridTwo}>
                  <div style={styles.panelCard}>
                    <div style={styles.cardHeaderFlex}>
                      <span style={styles.panelCardKicker}>National Science Foundation (NSF)</span>
                      <span style={styles.matchBadgeGreen}>96% Alignment</span>
                    </div>
                    <h4 style={styles.panelCardTitle}>
                      Fundamental Transport Phenomena in Solid-State Electrolytes (EHR-25)
                    </h4>
                    <div style={styles.detailRow}>
                      <span>Award Ceiling: <strong>$650,000</strong></span>
                      <span>Deadline: <strong>Nov 15, 2026</strong></span>
                    </div>
                  </div>

                  <div style={styles.panelCard}>
                    <div style={styles.cardHeaderFlex}>
                      <span style={styles.panelCardKicker}>Department of Energy (DOE - ARPA-E)</span>
                      <span style={styles.matchBadgeGreen}>91% Alignment</span>
                    </div>
                    <h4 style={styles.panelCardTitle}>
                      Scalable Next-Generation Cathodes for High-Capacity Grid Storage
                    </h4>
                    <div style={styles.detailRow}>
                      <span>Award Ceiling: <strong>$2,400,000</strong></span>
                      <span>Stage: <strong>Full Solicitation</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Patent Intelligence */}
            {activeTab === "patents" && (
              <div style={styles.tabPanel}>
                <div style={styles.searchBarSim}>
                  <Search size={16} color="#536273" />
                  <span style={styles.searchPlaceholder}>
                    USPTO Direct Search: "CRISPR-Cas9 epigenetic gene repression"
                  </span>
                  <span style={styles.filterPill}>325,826 DB Indexed</span>
                </div>

                <div style={styles.gridTwo}>
                  <div style={styles.panelCard}>
                    <span style={styles.panelCardKicker}>US Patent 11,845,920 B2</span>
                    <h4 style={styles.panelCardTitle}>
                      Engineered Cas Nucleases with Reduced Off-Target Cleavage Efficiency
                    </h4>
                    <p style={styles.panelCardDesc}>
                      Assignee: The Broad Institute of MIT and Harvard • IPC: C12N 15/113
                    </p>
                    <div style={styles.metricsPillRow}>
                      <span style={styles.metricPill}>24 Independent Claims</span>
                      <span style={styles.metricPill}>High Defensibility</span>
                    </div>
                  </div>

                  <div style={styles.panelCard}>
                    <span style={styles.panelCardKicker}>Technology Field Distribution</span>
                    <h4 style={styles.panelCardTitle}>
                      WIPO Sector: Biotechnology & Medical Sciences
                    </h4>
                    <p style={styles.panelCardDesc}>
                      Highest assignee concentration in Cambridge, MA and San Francisco Bay Area.
                    </p>
                    <div style={styles.metricsPillRow}>
                      <span style={styles.metricPill}>Top Assignee: 128 Patents</span>
                      <span style={styles.metricPill}>Prior Art Density: Moderate</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Technology Intelligence */}
            {activeTab === "technology" && (
              <div style={styles.tabPanel}>
                <div style={styles.gridTwo}>
                  <div style={styles.panelCard}>
                    <span style={styles.panelCardKicker}>Technology Domain Evaluation</span>
                    <h4 style={styles.panelCardTitle}>Quantum Sensing & Magnetometry</h4>
                    <div style={styles.trlProgressBlock}>
                      <div style={styles.trlHeader}>
                        <span>Maturity Benchmark</span>
                        <strong style={{ color: "#2F6FED" }}>TRL 4 (Lab Validation)</strong>
                      </div>
                      <div style={styles.trlBarTrack}>
                        <div style={{ ...styles.trlBarFill, width: "45%" }} />
                      </div>
                    </div>
                    <p style={styles.panelCardDesc}>
                      Transitioning from cryogenic laboratory feasibility to room-temperature diamond NV-center prototypes.
                    </p>
                  </div>

                  <div style={styles.panelCard}>
                    <span style={styles.panelCardKicker}>Competitive Radar Signals</span>
                    <h4 style={styles.panelCardTitle}>Solid-State Lithium Sulfur</h4>
                    <div style={styles.trlProgressBlock}>
                      <div style={styles.trlHeader}>
                        <span>Maturity Benchmark</span>
                        <strong style={{ color: "#2F6FED" }}>TRL 6 (Pilot Prototype)</strong>
                      </div>
                      <div style={styles.trlBarTrack}>
                        <div style={{ ...styles.trlBarFill, width: "66%" }} />
                      </div>
                    </div>
                    <p style={styles.panelCardDesc}>
                      Active scale-up pilot lines observed in automotive tier-1 supply chains.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Innovation Dashboard */}
            {activeTab === "innovation" && (
              <div style={styles.tabPanel}>
                <div style={styles.innovationScoreSummaryCard}>
                  <div style={styles.summaryTop}>
                    <div>
                      <span style={styles.panelCardKicker}>Composite Assessment</span>
                      <h4 style={styles.summaryTitle}>Synthetic Biology Enzymatic Recycling</h4>
                    </div>
                    <div style={styles.summaryPill}>Index: 88.4 / 100</div>
                  </div>

                  <div style={styles.metricQuadGrid}>
                    <div style={styles.quadItem}>
                      <span style={styles.quadLabel}>Novelty (30%)</span>
                      <strong style={styles.quadVal}>92%</strong>
                    </div>
                    <div style={styles.quadItem}>
                      <span style={styles.quadLabel}>Patent Strength (20%)</span>
                      <strong style={styles.quadVal}>84%</strong>
                    </div>
                    <div style={styles.quadItem}>
                      <span style={styles.quadLabel}>TRL Maturity (15%)</span>
                      <strong style={styles.quadVal}>78%</strong>
                    </div>
                    <div style={styles.quadItem}>
                      <span style={styles.quadLabel}>Market Potential (20%)</span>
                      <strong style={styles.quadVal}>90%</strong>
                    </div>
                  </div>

                  <div style={styles.summaryRec}>
                    <strong>Strategic Verdict: </strong>
                    <span>Recommended for University Spinout Venture Studio formation with targeted SBIR Phase I submission.</span>
                  </div>
                </div>
              </div>
            )}
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
    maxWidth: "760px",
    margin: "0 auto 40px",
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
  tabBar: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "8px",
    borderBottom: "1px solid #D9E0EA",
    marginBottom: "24px",
  },
  tabButton: {
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    padding: "12px 18px",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.15s ease",
  },
  previewWindow: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "12px",
    boxShadow: "0 12px 36px rgba(16, 24, 40, 0.08)",
    overflow: "hidden",
  },
  windowChrome: {
    backgroundColor: "#F5F7FA",
    borderBottom: "1px solid #D9E0EA",
    padding: "10px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
  },
  chromeDots: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  chromeDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    display: "inline-block",
  },
  chromeUrl: {
    fontSize: "12px",
    color: "#536273",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "4px",
    padding: "4px 14px",
    fontFamily: "monospace",
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
  },
  chromeAction: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#2F6FED",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },
  windowContent: {
    padding: "28px",
    backgroundColor: "#FFFFFF",
  },
  tabPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  searchBarSim: {
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "8px",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  searchPlaceholder: {
    fontSize: "13.5px",
    color: "#101828",
    fontWeight: "500",
    flex: 1,
  },
  filterPill: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#172554",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  panelCard: {
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  panelCardKicker: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#2F6FED",
    textTransform: "uppercase",
  },
  panelCardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#101828",
    lineHeight: 1.35,
    margin: 0,
  },
  panelCardDesc: {
    fontSize: "13px",
    color: "#536273",
    lineHeight: 1.45,
    margin: 0,
  },
  metricsPillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  metricPill: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#101828",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    padding: "2px 7px",
    borderRadius: "4px",
  },
  cardHeaderFlex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  matchBadgeGreen: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#35C98A",
    backgroundColor: "rgba(53, 201, 138, 0.1)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#536273",
    marginTop: "8px",
    paddingTop: "10px",
    borderTop: "1px solid #D9E0EA",
  },
  trlProgressBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    margin: "6px 0",
  },
  trlHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    fontWeight: "600",
  },
  trlBarTrack: {
    width: "100%",
    height: "6px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "3px",
    overflow: "hidden",
  },
  trlBarFill: {
    height: "100%",
    backgroundColor: "#2F6FED",
    borderRadius: "3px",
  },
  innovationScoreSummaryCard: {
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "8px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  summaryTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  summaryTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#101828",
    margin: "4px 0 0",
  },
  summaryPill: {
    backgroundColor: "#2F6FED",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  metricQuadGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "12px",
  },
  quadItem: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "6px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
  },
  quadLabel: {
    fontSize: "11px",
    color: "#536273",
  },
  quadVal: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#172554",
  },
  summaryRec: {
    fontSize: "13px",
    color: "#101828",
    lineHeight: 1.45,
    backgroundColor: "#FFFFFF",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #D9E0EA",
  },
};
