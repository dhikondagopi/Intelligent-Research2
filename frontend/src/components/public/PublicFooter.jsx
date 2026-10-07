import { Link } from "react-router-dom";
import { ShieldCheck, Mail, Globe, MapPin } from "lucide-react";

export default function PublicFooter() {
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer style={styles.footer} aria-label="Global Footer">
      <div style={styles.container}>
        {/* Top Brand & Links Grid */}
        <div style={styles.grid}>
          {/* Brand Column */}
          <div style={styles.brandCol}>
            <Link to="/" style={styles.brand} aria-label="Intelligent Research">
              <div style={styles.logoMark}>
                <span style={styles.logoText}>IR</span>
              </div>
              <span style={styles.brandTitle}>Intelligent Research</span>
            </Link>

            <p style={styles.brandMission}>
              Enterprise research, patent, and innovation intelligence platform. Unifying scientific discovery, funding opportunities, and technology commercialization.
            </p>

            <div style={styles.securityPill}>
              <ShieldCheck size={14} color="#2F6FED" />
              <span>SOC 2 Type II Audited • 256-Bit TLS</span>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div style={styles.linkCol}>
            <span style={styles.colTitle}>Platform</span>
            <ul style={styles.linkList}>
              <li><a href="#platform" onClick={(e) => scrollToSection(e, "platform")} style={styles.link}>Research Intelligence</a></li>
              <li><a href="#platform" onClick={(e) => scrollToSection(e, "platform")} style={styles.link}>Funding Intelligence</a></li>
              <li><a href="#platform" onClick={(e) => scrollToSection(e, "platform")} style={styles.link}>Patent Landscapes</a></li>
              <li><a href="#platform" onClick={(e) => scrollToSection(e, "platform")} style={styles.link}>Technology Maturity (TRL)</a></li>
              <li><a href="#platform" onClick={(e) => scrollToSection(e, "platform")} style={styles.link}>Innovation Scoring</a></li>
              <li><a href="#platform" onClick={(e) => scrollToSection(e, "platform")} style={styles.link}>Commercialization Roadmaps</a></li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div style={styles.linkCol}>
            <span style={styles.colTitle}>Solutions</span>
            <ul style={styles.linkList}>
              <li><a href="#solutions" onClick={(e) => scrollToSection(e, "solutions")} style={styles.link}>For Researchers & Faculty</a></li>
              <li><a href="#solutions" onClick={(e) => scrollToSection(e, "solutions")} style={styles.link}>For Deep Tech Startups</a></li>
              <li><a href="#solutions" onClick={(e) => scrollToSection(e, "solutions")} style={styles.link}>For Innovation Managers</a></li>
              <li><a href="#solutions" onClick={(e) => scrollToSection(e, "solutions")} style={styles.link}>For Universities & TTOs</a></li>
              <li><a href="#solutions" onClick={(e) => scrollToSection(e, "solutions")} style={styles.link}>For Enterprise R&D</a></li>
              <li><a href="#solutions" onClick={(e) => scrollToSection(e, "solutions")} style={styles.link}>For National Laboratories</a></li>
            </ul>
          </div>

          {/* Column 3: Data & Integrations */}
          <div style={styles.linkCol}>
            <span style={styles.colTitle}>Data Sources</span>
            <ul style={styles.linkList}>
              <li><a href="#data" onClick={(e) => scrollToSection(e, "data")} style={styles.link}>USPTO Open Data Portal</a></li>
              <li><a href="#data" onClick={(e) => scrollToSection(e, "data")} style={styles.link}>NIH RePORTER Direct</a></li>
              <li><a href="#data" onClick={(e) => scrollToSection(e, "data")} style={styles.link}>OpenAlex Scholarly Graph</a></li>
              <li><a href="#data" onClick={(e) => scrollToSection(e, "data")} style={styles.link}>Crossref DOI Metadata</a></li>
              <li><a href="#data" onClick={(e) => scrollToSection(e, "data")} style={styles.link}>Semantic Scholar Graph</a></li>
              <li><a href="#data" onClick={(e) => scrollToSection(e, "data")} style={styles.link}>Data Provenance FAQ</a></li>
            </ul>
          </div>

          {/* Column 4: Resources & About */}
          <div style={styles.linkCol}>
            <span style={styles.colTitle}>Company & Legal</span>
            <ul style={styles.linkList}>
              <li><Link to="/login" style={styles.link}>Workspace Sign In</Link></li>
              <li><Link to="/register" style={styles.link}>Create Account</Link></li>
              <li><a href="#about" onClick={(e) => scrollToSection(e, "about")} style={styles.link}>About Intelligent Research</a></li>
              <li>
                <a
                  href="#privacy"
                  onClick={(e) => { e.preventDefault(); alert("Privacy Policy: All institutional IP, patent queries, and bibliometric analyses are protected under encrypted enterprise tenants."); }}
                  style={styles.link}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  onClick={(e) => { e.preventDefault(); alert("Terms of Service: Access to research datasets and patent analytics is granted under institutional service agreements."); }}
                  style={styles.link}
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); alert("Institutional Contact: contact@intelligent-research.io | Washington, D.C. & Cambridge, MA"); }}
                  style={styles.link}
                >
                  Contact & Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={styles.bottomBar}>
          <span style={styles.copyright}>
            © 2026 Intelligent Research Platform. All rights reserved.
          </span>
          <div style={styles.bottomLinks}>
            <span>Global Research Intelligence</span>
            <span style={styles.dot}>•</span>
            <span>Enterprise Multi-Tenant</span>
            <span style={styles.dot}>•</span>
            <span>Version 2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #D9E0EA",
    padding: "64px 24px 36px",
    color: "#536273",
  },
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.5fr repeat(4, 1fr)",
    gap: "40px",
    marginBottom: "56px",
  },
  brandCol: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    color: "inherit",
  },
  logoMark: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    backgroundColor: "#172554",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "800",
  },
  brandTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#101828",
    letterSpacing: "-0.02em",
  },
  brandMission: {
    fontSize: "13.5px",
    color: "#536273",
    lineHeight: 1.55,
    margin: 0,
    maxWidth: "300px",
  },
  securityPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#101828",
    width: "fit-content",
  },
  linkCol: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  colTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#101828",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  linkList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  link: {
    color: "#536273",
    fontSize: "13.5px",
    textDecoration: "none",
    transition: "color 0.15s ease",
    cursor: "pointer",
  },
  bottomBar: {
    paddingTop: "28px",
    borderTop: "1px solid #D9E0EA",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    fontSize: "13px",
    color: "#536273",
  },
  copyright: {
    fontWeight: "500",
  },
  bottomLinks: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  dot: {
    color: "#D9E0EA",
  },
};
