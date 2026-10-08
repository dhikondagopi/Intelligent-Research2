import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Radar,
  DollarSign,
  FileSearch,
  Activity,
  Award,
  TrendingUp,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const USE_CASES = [
  {
    id: "horizon-scanning",
    title: "Horizon Scanning",
    subtitle: "Early Weak-Signal Detection",
    icon: Radar,
    desc: "Uncover nascent scientific paradigms and technological inflection points before they achieve broad commercial awareness.",
    metrics: "Detects inflection points up to 18 months prior to patent concentration",
    outcome: "Proactive R&D leadership instead of reactive technology catching-up.",
  },
  {
    id: "funding-discovery",
    title: "Funding Discovery",
    subtitle: "Grant Eligibility & Win Probability",
    icon: DollarSign,
    desc: "Match proposed projects against active solicitations across federal agencies and private foundations based on semantic similarity.",
    metrics: "Indexes federal solicitations across NIH, NSF, DOE & DoD",
    outcome: "Higher win probabilities and zero missed solicitation deadlines.",
  },
  {
    id: "patent-landscape",
    title: "Patent Landscape Analysis",
    subtitle: "Claims Defensibility & Prior Art",
    icon: FileSearch,
    desc: "Perform comprehensive freedom-to-operate checks, map competitor claims density, and identify whitespace opportunities in crowded technical fields.",
    metrics: "Full-text claims parsing across 325,000+ USPTO patents",
    outcome: "Defensible IP assets positioned in high-value, uncrowded patent territory.",
  },
  {
    id: "technology-monitoring",
    title: "Technology Monitoring",
    subtitle: "TRL 1–9 Maturity Trajectories",
    icon: Activity,
    desc: "Continuously benchmark emerging technologies along the NASA/DoD Technology Readiness Level continuum from basic principles to flight qualification.",
    metrics: "15 core technology domains monitored with empirical milestone indicators",
    outcome: "Objective maturity staging for institutional stage-gate review boards.",
  },
  {
    id: "innovation-assessment",
    title: "Innovation Assessment",
    subtitle: "Empirical Multi-Criteria Scoring",
    icon: Award,
    desc: "Score technologies using a weighted formula across research novelty (30%), patent strength (20%), maturity (15%), market potential (20%), and funding relevance (15%).",
    metrics: "Algorithmic composite rating calibrated against historical commercial outcomes",
    outcome: "Rigorous evidence for university TTOs and corporate venturing teams.",
  },
  {
    id: "commercialization-planning",
    title: "Commercialization Planning",
    subtitle: "Execution Pathway Modeling",
    icon: TrendingUp,
    desc: "Evaluate commercialization feasibility across direct productization, IP licensing, university spinout formation, and industry partnership models.",
    metrics: "Evidence-backed pathway recommendations based on IP moats and capex barriers",
    outcome: "Optimized time-to-market and minimized capital-at-risk for innovators.",
  },
];

export default function UseCaseSection() {
  const [selectedCase, setSelectedCase] = useState(USE_CASES[0]);

  return (
    <section id="resources" style={styles.section} aria-label="Enterprise Use Cases">
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.categoryBadge}>Mission-Critical Workflows</span>
          <h2 style={styles.title}>Engineered for high-stakes decision makers</h2>
          <p style={styles.subtitle}>
            Explore operational intelligence workflows implemented across university tech transfer offices, venture studios, and corporate R&D divisions.
          </p>
        </div>

        <div style={styles.contentLayout}>
          {/* Left Column: Use Case Nav List */}
          <div style={styles.listCol}>
            {USE_CASES.map((uc) => {
              const isSelected = selectedCase.id === uc.id;
              const Icon = uc.icon;
              return (
                <button
                  key={uc.id}
                  type="button"
                  onClick={() => setSelectedCase(uc)}
                  style={{
                    ...styles.navItem,
                    backgroundColor: isSelected ? "var(--color-surface)" : "transparent",
                    borderColor: isSelected ? "var(--color-primary)" : "transparent",
                    boxShadow: isSelected ? "var(--shadow-card)" : "none",
                  }}
                  aria-pressed={isSelected}
                >
                  <div
                    style={{
                      ...styles.navIconBox,
                      backgroundColor: isSelected ? "var(--color-primary)" : "var(--color-surface)",
                      color: isSelected ? "#FFFFFF" : "var(--color-text-muted)",
                      borderColor: isSelected ? "var(--color-primary)" : "var(--color-border)",
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div style={styles.navTextCol}>
                    <span style={{ ...styles.navTitle, color: isSelected ? "var(--color-text)" : "var(--color-text-muted)" }}>
                      {uc.title}
                    </span>
                    <span style={styles.navSubtitle}>{uc.subtitle}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    color={isSelected ? "var(--color-primary)" : "var(--color-border)"}
                    style={{ marginLeft: "auto" }}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Use Case Showcase */}
          <div style={styles.showcaseCol}>
            <div style={styles.showcaseCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderIcon}>
                  {(() => {
                    const Icon = selectedCase.icon;
                    return <Icon size={24} color="var(--color-primary)" />;
                  })()}
                </div>
                <div>
                  <h3 style={styles.cardTitle}>{selectedCase.title}</h3>
                  <span style={styles.cardSubtitle}>{selectedCase.subtitle}</span>
                </div>
              </div>

              <p style={styles.cardDesc}>{selectedCase.desc}</p>

              <div style={styles.metricsBox}>
                <span style={styles.metricsHeader}>Operational Benchmark:</span>
                <span style={styles.metricsText}>{selectedCase.metrics}</span>
              </div>

              <div style={styles.outcomeBox}>
                <span style={styles.outcomeHeader}>Decision Outcome:</span>
                <span style={styles.outcomeText}>{selectedCase.outcome}</span>
              </div>

              <div style={styles.cardActionRow}>
                <Link to="/register" style={styles.learnMoreBtn}>
                  <span>Deploy {selectedCase.title} Workflow</span>
                  <ArrowRight size={14} style={{ marginLeft: 6 }} />
                </Link>
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
    backgroundColor: "var(--color-bg-secondary)",
    padding: "88px 24px",
    borderBottom: "1px solid var(--color-border)",
  },
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    maxWidth: "760px",
    margin: "0 auto 52px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  categoryBadge: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--color-primary)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  title: {
    fontSize: "clamp(26px, 3.4vw, 38px)",
    fontWeight: "800",
    color: "var(--color-text)",
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
    margin: 0,
  },
  subtitle: {
    fontSize: "16px",
    color: "var(--color-text-muted)",
    lineHeight: 1.55,
    margin: 0,
  },
  contentLayout: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1.3fr",
    gap: "32px",
    alignItems: "start",
  },
  listCol: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
  },
  navIconBox: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    borderWidth: "1px",
    borderStyle: "solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s ease",
  },
  navTextCol: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.25,
  },
  navTitle: {
    fontSize: "14px",
    fontWeight: "700",
  },
  navSubtitle: {
    fontSize: "11.5px",
    color: "var(--color-text-muted)",
  },
  showcaseCol: {
    width: "100%",
  },
  showcaseCard: {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    boxShadow: "var(--shadow-card)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  cardHeaderIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    backgroundColor: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--color-text)",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  cardSubtitle: {
    fontSize: "13px",
    color: "var(--color-primary)",
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: "15px",
    color: "var(--color-text-muted)",
    lineHeight: 1.6,
    margin: 0,
  },
  metricsBox: {
    backgroundColor: "var(--color-bg-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  metricsHeader: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--color-primary)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  metricsText: {
    fontSize: "13.5px",
    color: "var(--color-text)",
    fontWeight: "600",
  },
  outcomeBox: {
    backgroundColor: "rgba(76, 141, 255, 0.08)",
    border: "1px solid rgba(76, 141, 255, 0.25)",
    borderRadius: "8px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  outcomeHeader: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--color-primary)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  outcomeText: {
    fontSize: "13.5px",
    color: "var(--color-text)",
    fontWeight: "500",
  },
  cardActionRow: {
    marginTop: "6px",
  },
  learnMoreBtn: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "var(--color-primary)",
    color: "#FFFFFF",
    padding: "11px 22px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    boxShadow: "0 2px 8px rgba(47, 111, 237, 0.25)",
  },
};
