import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X, Shield, ChevronRight } from "lucide-react";

export default function PublicHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      style={{
        ...styles.header,
        backgroundColor: isScrolled
          ? "rgba(255, 255, 255, 0.96)"
          : "#FFFFFF",
        borderBottom: isScrolled
          ? "1px solid #D9E0EA"
          : "1px solid rgba(217, 224, 234, 0.7)",
        boxShadow: isScrolled
          ? "0 4px 20px rgba(16, 24, 40, 0.05)"
          : "none",
      }}
    >
      <div style={styles.container}>
        {/* Brand Logo */}
        <Link to="/" style={styles.brand} aria-label="Intelligent Research home">
          <div style={styles.logoMark}>
            <span style={styles.logoText}>IR</span>
          </div>
          <div style={styles.brandTextGroup}>
            <span style={styles.brandTitle}>Intelligent Research</span>
            <span style={styles.brandSubtitle}>Research & Innovation Intelligence</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={styles.navLinks} aria-label="Main Navigation">
          <a
            href="#platform"
            onClick={(e) => scrollToSection(e, "platform")}
            style={styles.navLink}
          >
            Platform
          </a>
          <a
            href="#solutions"
            onClick={(e) => scrollToSection(e, "solutions")}
            style={styles.navLink}
          >
            Solutions
          </a>
          <a
            href="#intelligence"
            onClick={(e) => scrollToSection(e, "intelligence")}
            style={styles.navLink}
          >
            Intelligence
          </a>
          <a
            href="#data"
            onClick={(e) => scrollToSection(e, "data")}
            style={styles.navLink}
          >
            Data
          </a>
          <a
            href="#resources"
            onClick={(e) => scrollToSection(e, "resources")}
            style={styles.navLink}
          >
            Resources
          </a>
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, "about")}
            style={styles.navLink}
          >
            About
          </a>
        </nav>

        {/* Desktop Actions */}
        <div style={styles.actions}>
          <Link to="/login" style={styles.signInBtn}>
            Sign In
          </Link>
          <Link to="/register" style={styles.getStartedBtn}>
            <span>Get Started</span>
            <ArrowRight size={14} style={{ marginLeft: 4 }} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={styles.mobileToggle}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} color="#101828" /> : <Menu size={22} color="#101828" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={styles.mobileDrawer}>
          <div style={styles.mobileNavLinks}>
            <a
              href="#platform"
              onClick={(e) => scrollToSection(e, "platform")}
              style={styles.mobileNavLink}
            >
              <span>Platform</span>
              <ChevronRight size={16} color="#536273" />
            </a>
            <a
              href="#solutions"
              onClick={(e) => scrollToSection(e, "solutions")}
              style={styles.mobileNavLink}
            >
              <span>Solutions</span>
              <ChevronRight size={16} color="#536273" />
            </a>
            <a
              href="#intelligence"
              onClick={(e) => scrollToSection(e, "intelligence")}
              style={styles.mobileNavLink}
            >
              <span>Intelligence</span>
              <ChevronRight size={16} color="#536273" />
            </a>
            <a
              href="#data"
              onClick={(e) => scrollToSection(e, "data")}
              style={styles.mobileNavLink}
            >
              <span>Data</span>
              <ChevronRight size={16} color="#536273" />
            </a>
            <a
              href="#resources"
              onClick={(e) => scrollToSection(e, "resources")}
              style={styles.mobileNavLink}
            >
              <span>Resources</span>
              <ChevronRight size={16} color="#536273" />
            </a>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, "about")}
              style={styles.mobileNavLink}
            >
              <span>About</span>
              <ChevronRight size={16} color="#536273" />
            </a>
          </div>

          <div style={styles.mobileActionGroup}>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              style={styles.mobileSignInBtn}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              style={styles.mobileGetStartedBtn}
            >
              <span>Get Started</span>
              <ArrowRight size={15} style={{ marginLeft: 6 }} />
            </Link>
          </div>
        </div>
      )}

      {/* Media query styling */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav-hide {
            display: none !important;
          }
          .mobile-menu-show {
            display: flex !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-menu-show {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    width: "100%",
    transition: "all 0.2s ease",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 24px",
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    color: "inherit",
    flexShrink: 0,
  },
  logoMark: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#172554",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(23, 37, 84, 0.2)",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "800",
    letterSpacing: "-0.02em",
  },
  brandTextGroup: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
  },
  brandTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#101828",
    letterSpacing: "-0.02em",
  },
  brandSubtitle: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#536273",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },
  navLink: {
    color: "#536273",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    transition: "color 0.15s ease",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  },
  signInBtn: {
    color: "#101828",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    transition: "background-color 0.15s ease",
  },
  getStartedBtn: {
    backgroundColor: "#2F6FED",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "9px 18px",
    borderRadius: "6px",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(47, 111, 237, 0.25)",
    transition: "background-color 0.15s ease, transform 0.1s ease",
  },
  mobileToggle: {
    display: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
  },
  mobileDrawer: {
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #D9E0EA",
    padding: "20px 24px 28px",
    boxShadow: "0 12px 24px rgba(16, 24, 40, 0.08)",
  },
  mobileNavLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "20px",
  },
  mobileNavLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #F5F7FA",
    color: "#101828",
    fontSize: "15px",
    fontWeight: "500",
    textDecoration: "none",
  },
  mobileActionGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  mobileSignInBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #D9E0EA",
    backgroundColor: "#FFFFFF",
    color: "#101828",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
    textDecoration: "none",
  },
  mobileGetStartedBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    backgroundColor: "#2F6FED",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
