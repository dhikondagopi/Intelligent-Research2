import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function CTASection() {
  return (
    <section style={styles.section} aria-label="Call to Action">
      <div style={styles.container}>
        <div style={styles.contentBox}>
          <span style={styles.kicker}>Get Started Today</span>
          <h2 style={styles.headline}>
            Make better research and innovation decisions.
          </h2>
          <p style={styles.supportingText}>
            Discover research. Identify technology. Find funding. Accelerate innovation.
          </p>

          <div style={styles.buttonGroup}>
            <Link to="/register" style={styles.primaryBtn}>
              <span>Get Started</span>
              <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </Link>
            <Link to="/login" style={styles.secondaryBtn}>
              Sign In
            </Link>
          </div>

          <div style={styles.securityNote}>
            <ShieldCheck size={14} color="var(--color-text-muted)" />
            <span>Institutional-grade security • SOC 2 Type II compliant • Multi-tenant RBAC</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    backgroundColor: "var(--color-bg-secondary)",
    padding: "80px 24px",
    borderBottom: "1px solid var(--color-border)",
  },
  container: {
    maxWidth: "1060px",
    margin: "0 auto",
  },
  contentBox: {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "16px",
    padding: "56px 36px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "var(--shadow-card)",
  },
  kicker: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--color-primary)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "12px",
  },
  headline: {
    fontSize: "clamp(28px, 3.8vw, 44px)",
    fontWeight: "800",
    color: "var(--color-text)",
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
    margin: "0 0 16px",
    maxWidth: "780px",
  },
  supportingText: {
    fontSize: "clamp(16px, 1.8vw, 19px)",
    color: "var(--color-text-muted)",
    lineHeight: 1.5,
    margin: "0 0 36px",
    maxWidth: "680px",
  },
  buttonGroup: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    marginBottom: "28px",
  },
  primaryBtn: {
    backgroundColor: "var(--color-primary)",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "600",
    padding: "13px 28px",
    borderRadius: "8px",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 4px 14px rgba(47, 111, 237, 0.25)",
  },
  secondaryBtn: {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text)",
    fontSize: "15px",
    fontWeight: "600",
    padding: "13px 28px",
    borderRadius: "8px",
    textDecoration: "none",
    border: "1px solid var(--color-border)",
  },
  securityNote: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "var(--color-text-muted)",
  },
};
