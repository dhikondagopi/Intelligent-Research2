import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X, ChevronRight } from "lucide-react";
import Logo from "../brand/Logo";
import ThemeToggle from "../ThemeToggle";

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
      className={`public-header ${isScrolled ? "is-scrolled" : ""}`}
      style={styles.header}
    >
      <div style={styles.container}>
        {/* Unified Official Brand Logo */}
        <Link to="/" style={styles.brand} aria-label="Intelligent Research home">
          <Logo variant="full" size={38} showSubtitle={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={styles.navLinks} aria-label="Main Navigation">
          <a
            href="#platform"
            onClick={(e) => scrollToSection(e, "platform")}
            style={styles.navLink}
            className="header-nav-link"
          >
            Platform
          </a>
          <a
            href="#solutions"
            onClick={(e) => scrollToSection(e, "solutions")}
            style={styles.navLink}
            className="header-nav-link"
          >
            Solutions
          </a>
          <a
            href="#intelligence"
            onClick={(e) => scrollToSection(e, "intelligence")}
            style={styles.navLink}
            className="header-nav-link"
          >
            Intelligence
          </a>
          <a
            href="#data"
            onClick={(e) => scrollToSection(e, "data")}
            style={styles.navLink}
            className="header-nav-link"
          >
            Data
          </a>
          <a
            href="#resources"
            onClick={(e) => scrollToSection(e, "resources")}
            style={styles.navLink}
            className="header-nav-link"
          >
            Resources
          </a>
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, "about")}
            style={styles.navLink}
            className="header-nav-link"
          >
            About
          </a>
        </nav>

        {/* Desktop Actions */}
        <div style={styles.actions}>
          {/* Global Light/Dark Theme Toggle */}
          <ThemeToggle />

          <Link to="/login" style={styles.signInBtn} className="header-signin-btn">
            Sign In
          </Link>
          <Link to="/register" style={styles.getStartedBtn} className="header-cta-btn">
            <span>Get Started</span>
            <ArrowRight size={14} style={{ marginLeft: 4 }} />
          </Link>
        </div>

        {/* Mobile Actions and Hamburger Toggle */}
        <div style={styles.mobileRightGroup}>
          <ThemeToggle size="sm" showLabel={false} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={styles.mobileToggle}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X size={24} style={{ color: "var(--color-text)" }} />
            ) : (
              <Menu size={24} style={{ color: "var(--color-text)" }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={styles.mobileDrawer} className="mobile-menu-show">
          <nav style={styles.mobileNavLinks}>
            {[
              { id: "platform", label: "Platform" },
              { id: "solutions", label: "Solutions" },
              { id: "intelligence", label: "Intelligence" },
              { id: "data", label: "Data Architecture" },
              { id: "resources", label: "Methodology" },
              { id: "about", label: "About Mission" },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                style={styles.mobileNavLink}
              >
                <span>{link.label}</span>
                <ChevronRight size={16} style={{ color: "var(--color-text-muted)" }} />
              </a>
            ))}
          </nav>

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

      <style>{`
        .public-header {
          background-color: var(--color-bg);
          border-bottom: 1px solid var(--color-border);
          transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .public-header.is-scrolled {
          box-shadow: var(--shadow-sm);
        }

        .header-nav-link:hover {
          color: var(--color-primary) !important;
        }

        .header-signin-btn:hover {
          background-color: var(--color-primary-subtle) !important;
          color: var(--color-primary) !important;
        }

        .header-cta-btn:hover {
          background-color: var(--color-primary-hover) !important;
          transform: translateY(-1px);
        }

        @media (max-width: 960px) {
          nav[aria-label="Main Navigation"] {
            display: none !important;
          }
          .public-header div[style*="justify-content: space-between"] > div:nth-child(3) {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: flex !important;
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
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 24px",
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxSizing: "border-box",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    color: "inherit",
    flexShrink: 0,
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  navLink: {
    color: "var(--color-text-muted)",
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
    color: "var(--color-text)",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    transition: "all 0.15s ease",
  },
  getStartedBtn: {
    backgroundColor: "var(--color-primary)",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
    transition: "background-color 0.15s ease, transform 0.1s ease",
  },
  mobileRightGroup: {
    display: "none",
    alignItems: "center",
    gap: "10px",
  },
  mobileToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  mobileDrawer: {
    backgroundColor: "var(--color-surface)",
    borderBottom: "1px solid var(--color-border)",
    padding: "20px 24px 28px",
    boxShadow: "var(--shadow-md)",
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
    borderBottom: "1px solid var(--color-border-subtle)",
    color: "var(--color-text)",
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
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid var(--color-border)",
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text)",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
    textDecoration: "none",
    boxSizing: "border-box",
  },
  mobileGetStartedBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    backgroundColor: "var(--color-primary)",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
};
