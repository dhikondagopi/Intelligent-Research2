import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  DollarSign,
  FileText,
  Cpu,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { getPatentStatistics } from "../../services/patentService";
import { getFundingStatistics } from "../../services/fundingService";

const WORKFLOW_STEPS = [
  {
    step: "01",
    label: "Research",
    desc: "Scholarly literature, velocity & citation index",
    icon: BookOpen,
  },
  {
    step: "02",
    label: "Funding",
    desc: "Multi-agency federal grants & venture capital",
    icon: DollarSign,
  },
  {
    step: "03",
    label: "Patents",
    desc: "USPTO patent landscapes & claims defensibility",
    icon: FileText,
  },
  {
    step: "04",
    label: "Technology",
    desc: "TRL maturity radar & emerging tech clusters",
    icon: Cpu,
  },
  {
    step: "05",
    label: "Innovation",
    desc: "Commercialization pathways & market timing",
    icon: Sparkles,
  },
];

export default function HeroSection() {
  const [metrics, setMetrics] = useState({
    patentsCount: "325,826",
    fundingTotal: "$17.9M+",
    techFields: "15",
    sectors: "6",
  });

  useEffect(() => {
    // Attempt to load live numbers from the verified API endpoints
    Promise.allSettled([getPatentStatistics(), getFundingStatistics()]).then(
      ([patentRes, fundingRes]) => {
        if (patentRes.status === "fulfilled" && patentRes.value?.total_patents) {
          const raw = patentRes.value.total_patents;
          setMetrics((prev) => ({
            ...prev,
            patentsCount: Number(raw).toLocaleString(),
            techFields: String(patentRes.value?.top_technologies?.length || 15),
            sectors: String(patentRes.value?.top_sectors?.length || 6),
          }));
        }

        if (fundingRes.status === "fulfilled" && fundingRes.value?.total_funding) {
          const totalM = (fundingRes.value.total_funding / 1000000).toFixed(1);
          setMetrics((prev) => ({
            ...prev,
            fundingTotal: `$${totalM}M+`,
          }));
        }
      }
    );
  }, []);

  const scrollToPlatform = (e) => {
    e.preventDefault();
    const el = document.getElementById("platform");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section style={styles.heroSection} aria-label="Hero Introduction">
      <div style={styles.container}>
        {/* Top Institutional Badge */}
        <div style={styles.badgeWrapper}>
          <div style={styles.badge}>
            <span style={styles.badgePulse} />
            <span style={styles.badgeText}>Enterprise Research Intelligence Platform</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 style={styles.headline}>
          Research Funding & Innovation Intelligence
        </h1>

        {/* Supporting Message */}
        <p style={styles.supportingText}>
          Connect research, funding, patents and technologies to discover what matters next.
        </p>

        {/* CTAs */}
        <div style={styles.ctaGroup}>
          <a
            href="#platform"
            onClick={scrollToPlatform}
            style={styles.primaryBtn}
          >
            <span>Explore the platform</span>
            <ArrowRight size={16} style={{ marginLeft: 6 }} />
          </a>
          <Link to="/login" style={styles.secondaryBtn}>
            Sign in
          </Link>
        </div>

        {/* Live Platform Metrics Grid */}
        <div style={styles.metricsContainer}>
          <div style={styles.metricItem}>
            <span style={styles.metricValue}>{metrics.patentsCount}</span>
            <span style={styles.metricLabel}>USPTO Patents Indexed</span>
          </div>
          <div style={styles.metricDivider} />
          <div style={styles.metricItem}>
            <span style={styles.metricValue}>{metrics.fundingTotal}</span>
            <span style={styles.metricLabel}>Live Grants Tracked</span>
          </div>
          <div style={styles.metricDivider} />
          <div style={styles.metricItem}>
            <span style={styles.metricValue}>{metrics.techFields}</span>
            <span style={styles.metricLabel}>Technology Domains</span>
          </div>
          <div style={styles.metricDivider} />
          <div style={styles.metricItem}>
            <span style={styles.metricValue}>{metrics.sectors}</span>
            <span style={styles.metricLabel}>Macro Innovation Sectors</span>
          </div>
        </div>

        {/* Connected Intelligence Workflow Visual Representation */}
        <div style={styles.workflowWrapper}>
          <div style={styles.workflowHeader}>
            <span style={styles.workflowTitle}>Connected Intelligence Pipeline</span>
            <span style={styles.workflowSubtitle}>
              Continuous bidirectional intelligence across the innovation lifecycle
            </span>
          </div>

          <div style={styles.workflowGrid}>
            {WORKFLOW_STEPS.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === WORKFLOW_STEPS.length - 1;
              return (
                <div key={item.label} style={styles.workflowStepCard}>
                  <div style={styles.stepTopRow}>
                    <span style={styles.stepNumber}>{item.step}</span>
                    <div style={styles.stepIconBox}>
                      <Icon size={16} color="#2F6FED" />
                    </div>
                  </div>
                  <div style={styles.stepName}>{item.label}</div>
                  <div style={styles.stepDesc}>{item.desc}</div>
                  {!isLast && (
                    <div style={styles.stepArrowIndicator}>
                      <ChevronRight size={14} color="#D9E0EA" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  heroSection: {
    backgroundColor: "#FFFFFF",
    padding: "64px 24px 80px",
    borderBottom: "1px solid #D9E0EA",
  },
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  badgeWrapper: {
    marginBottom: "20px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "9999px",
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#172554",
  },
  badgePulse: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#2F6FED",
  },
  badgeText: {
    letterSpacing: "0.02em",
  },
  headline: {
    fontSize: "clamp(32px, 5.2vw, 54px)",
    fontWeight: "800",
    color: "#101828",
    letterSpacing: "-0.035em",
    lineHeight: 1.15,
    maxWidth: "920px",
    margin: "0 0 20px",
  },
  supportingText: {
    fontSize: "clamp(16px, 2vw, 20px)",
    color: "#536273",
    lineHeight: 1.5,
    maxWidth: "760px",
    margin: "0 0 36px",
    fontWeight: "400",
  },
  ctaGroup: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    marginBottom: "56px",
  },
  primaryBtn: {
    backgroundColor: "#2F6FED",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "600",
    padding: "13px 26px",
    borderRadius: "8px",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 4px 14px rgba(47, 111, 237, 0.28)",
    transition: "background-color 0.15s ease, transform 0.1s ease",
    cursor: "pointer",
  },
  secondaryBtn: {
    backgroundColor: "#FFFFFF",
    color: "#101828",
    fontSize: "15px",
    fontWeight: "600",
    padding: "13px 26px",
    borderRadius: "8px",
    textDecoration: "none",
    border: "1px solid #D9E0EA",
    transition: "border-color 0.15s ease, background-color 0.15s ease",
  },
  metricsContainer: {
    width: "100%",
    maxWidth: "1060px",
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "12px",
    padding: "24px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "52px",
  },
  metricItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    flex: "1 1 180px",
  },
  metricValue: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#172554",
    letterSpacing: "-0.03em",
    fontFamily: "'Inter', sans-serif",
  },
  metricLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#536273",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  metricDivider: {
    width: "1px",
    height: "36px",
    backgroundColor: "#D9E0EA",
    display: "none",
  },
  workflowWrapper: {
    width: "100%",
    maxWidth: "1140px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "14px",
    padding: "32px 28px",
    boxShadow: "0 10px 30px rgba(16, 24, 40, 0.04)",
  },
  workflowHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    marginBottom: "28px",
  },
  workflowTitle: {
    fontSize: "13px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#2F6FED",
  },
  workflowSubtitle: {
    fontSize: "15px",
    color: "#101828",
    fontWeight: "600",
  },
  workflowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    position: "relative",
  },
  workflowStepCard: {
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "10px",
    padding: "18px 16px",
    textAlign: "left",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    transition: "border-color 0.15s ease",
  },
  stepTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  stepNumber: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#536273",
    fontFamily: "monospace",
  },
  stepIconBox: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#101828",
  },
  stepDesc: {
    fontSize: "12px",
    color: "#536273",
    lineHeight: 1.4,
  },
  stepArrowIndicator: {
    position: "absolute",
    right: "-12px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,
    display: "none",
  },
};
