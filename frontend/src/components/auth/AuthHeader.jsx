import { Link } from "react-router-dom";

export default function AuthHeader({
  heading,
  subtitle,
}) {
  return (
    <div style={styles.header}>
      {/* Intelligent Research Logo & Brand Name */}
      <Link to="/" style={styles.brandLink} aria-label="Intelligent Research home">
        <div style={styles.logoMark}>
          <span style={styles.logoText}>IR</span>
        </div>
        <span style={styles.brandName}>Intelligent Research</span>
      </Link>

      <h1 style={styles.heading}>{heading}</h1>
      {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    marginBottom: "24px",
    width: "100%",
  },
  brandLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    color: "inherit",
    marginBottom: "16px",
    transition: "opacity 0.15s ease",
  },
  logoMark: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #151D29 0%, #101620 100%)",
    border: "1px solid #202A38",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "-0.03em",
    color: "#4C8DFF",
  },
  brandName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#F2F5F8",
    letterSpacing: "-0.02em",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#F2F5F8",
    letterSpacing: "-0.02em",
    lineHeight: 1.25,
    margin: 0,
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#98A4B5",
    lineHeight: 1.45,
    margin: 0,
    maxWidth: "380px",
  },
};

