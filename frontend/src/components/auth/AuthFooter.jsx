import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function AuthFooter() {
  return (
    <footer style={styles.footer} aria-label="Security and Compliance Footer">
      <div style={styles.trustBadges}>
        <div style={styles.badgeItem}>
          <ShieldCheck size={14} color="#35C98A" aria-hidden="true" />
          <span>256-Bit TLS Encryption</span>
        </div>
        <div style={styles.dot} aria-hidden="true">•</div>
        <div style={styles.badgeItem}>
          <Lock size={14} color="#4C8DFF" aria-hidden="true" />
          <span>SOC 2 Type II Certified</span>
        </div>
        <div style={styles.dot} aria-hidden="true">•</div>
        <div style={styles.badgeItem}>
          <CheckCircle2 size={14} color="#35C98A" aria-hidden="true" />
          <span>Role-Governed Access</span>
        </div>
      </div>

      <div style={styles.legalRow}>
        <span>© 2026 Intelligent Research Platform. All rights reserved.</span>
        <div style={styles.linksRow}>
          <a
            href="#privacy"
            onClick={(e) => { e.preventDefault(); alert("Enterprise Privacy Policy: All user research queries, patent analytics, and institutional IP are encrypted at rest and in transit. No external training on proprietary research."); }}
            style={styles.legalLink}
          >
            Privacy Policy
          </a>
          <span style={styles.divider}>|</span>
          <a
            href="#terms"
            onClick={(e) => { e.preventDefault(); alert("Terms of Service: Access to research datasets, citation indexes, and patent landscape analytics is granted under institutional software agreements."); }}
            style={styles.legalLink}
          >
            Terms of Service
          </a>
          <span style={styles.divider}>|</span>
          <a
            href="#security"
            onClick={(e) => { e.preventDefault(); alert("Security Assurance: Multi-factor authentication ready, zero unauthenticated admin elevation, encrypted MongoDB clusters."); }}
            style={styles.legalLink}
          >
            Security Assurance
          </a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "24px 20px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    color: "#98A4B5",
    fontSize: "12px",
    borderTop: "1px solid #202A38",
  },
  trustBadges: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#F2F5F8",
  },
  badgeItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  dot: {
    color: "#202A38",
    fontSize: "10px",
  },
  legalRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: "#98A4B5",
    fontSize: "12px",
    textAlign: "center",
  },
  linksRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },
  legalLink: {
    color: "#98A4B5",
    textDecoration: "none",
    transition: "color 0.2s ease",
    cursor: "pointer",
  },
  divider: {
    color: "#202A38",
  },
};
