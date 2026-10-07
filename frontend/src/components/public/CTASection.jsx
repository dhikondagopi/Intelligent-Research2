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
            <ShieldCheck size={14} color="#536273" />
            <span>Institutional-grade security • SOC 2 Type II compliant • Multi-tenant RBAC</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    backgroundColor: "#F5F7FA",
    padding: "80px 24px",
    borderBottom: "1px solid #D9E0EA",
  },
  container: {
    maxWidth: "1060px",
    margin: "0 auto",
  },
  contentBox: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "16px",
    padding: "56px 36px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 12px 32px rgba(16, 24, 40, 0.04)",
  },
  kicker: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2F6FED",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "12px",
  },
  headline: {
    fontSize: "clamp(28px, 3.8vw, 44px)",
    fontWeight: "800",
    color: "#101828",
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
    margin: "0 0 16px",
    maxWidth: "780px",
  },
  supportingText: {
    fontSize: "clamp(16px, 1.8vw, 19px)",
    color: "#536273",
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
    backgroundColor: "#2F6FED",
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
    backgroundColor: "#FFFFFF",
    color: "#101828",
    fontSize: "15px",
    fontWeight: "600",
    padding: "13px 28px",
    borderRadius: "8px",
    textDecoration: "none",
    border: "1px solid #D9E0EA",
  },
  securityNote: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#536273",
  },
};
