import { Link } from "react-router-dom";
import {
  BookOpen,
  DollarSign,
  FileText,
  Cpu,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AuthFooter from "./AuthFooter";

const CAPABILITIES = [
  {
    title: "Research Intelligence",
    description: "Literature velocity, citation trends & scientific impact metrics.",
    icon: BookOpen,
  },
  {
    title: "Funding Intelligence",
    description: "Multi-agency grants, venture funding & proposal matching.",
    icon: DollarSign,
  },
  {
    title: "Patent Intelligence",
    description: "USPTO patent landscapes, claims analysis & defensibility scoring.",
    icon: FileText,
  },
  {
    title: "Technology Intelligence",
    description: "TRL maturity tracking, emerging tech clusters & radar signals.",
    icon: Cpu,
  },
  {
    title: "Innovation & Commercialization",
    description: "Composite viability scoring, licensing pathways & market timing.",
    icon: TrendingUp,
  },
];

export default function AuthShell({ children, activePage = "login" }) {
  const isLogin = activePage === "login";

  return (
    <div className="auth-page">
      {/* Top Navigation Bar */}
      <header className="auth-nav-header">
        <div className="auth-nav-inner">
          <Link to="/" className="auth-brand" aria-label="Intelligent Research home">
            <div className="auth-logo-mark">
              <span className="auth-logo-text">IR</span>
            </div>
            <div className="auth-brand-info">
              <span className="auth-brand-name">Intelligent Research</span>
              <span className="auth-brand-badge">Enterprise Platform</span>
            </div>
          </Link>

          <div className="auth-switch-cta">
            <span className="auth-switch-label">
              {isLogin ? "New to Intelligent Research?" : "Already have an account?"}
            </span>
            <Link
              to={isLogin ? "/register" : "/login"}
              className="auth-switch-button"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="auth-main-wrapper">
        <div className="auth-layout-grid">
          {/* Left Column: Product Introduction & Compact Capability List */}
          <section className="auth-left-col" aria-label="Platform Overview">
            <div className="auth-intro-block">
              <div className="auth-pill-badge">
                <Sparkles size={13} color="#4C8DFF" aria-hidden="true" />
                <span>Next-Generation Innovation Stack</span>
              </div>

              <h1 className="auth-hero-title">
                Research intelligence for modern innovation teams.
              </h1>

              <p className="auth-hero-desc">
                Unify scholarly research, live federal grants, USPTO patent analytics, and commercialization readiness in one high-integrity workspace.
              </p>
            </div>

            {/* Compact Capability List */}
            <div className="auth-capabilities-card">
              <div className="auth-capabilities-header">
                <span className="auth-capabilities-title">Integrated Intelligence Modules</span>
                <span className="auth-capabilities-count">5 Core Engines</span>
              </div>

              <div className="auth-capability-list">
                {CAPABILITIES.map((cap) => {
                  const Icon = cap.icon;
                  return (
                    <div key={cap.title} className="auth-capability-item">
                      <div className="auth-capability-icon">
                        <Icon size={15} color="#4C8DFF" aria-hidden="true" />
                      </div>
                      <div className="auth-capability-text">
                        <span className="auth-capability-name">{cap.title}</span>
                        <span className="auth-capability-desc">{cap.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subtle Security / Trust Note */}
            <div className="auth-trust-note">
              <ShieldCheck size={16} color="#35C98A" aria-hidden="true" />
              <span>
                Engineered for university research offices, deep tech spinouts, and enterprise R&D directors.
              </span>
            </div>
          </section>

          {/* Right Column: Main Authentication Panel */}
          <section className="auth-right-col" aria-label="Authentication Panel">
            {children}
          </section>
        </div>
      </main>

      {/* Security and Trust Footer */}
      <AuthFooter />

      {/* Embedded Scoped Responsive CSS */}
      <style>{`
        .auth-page {
          min-height: 100vh;
          width: 100%;
          background-color: #070B12;
          color: #F2F5F8;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow-x: hidden;
        }

        .auth-nav-header {
          width: 100%;
          border-bottom: 1px solid #202A38;
          background-color: rgba(7, 11, 18, 0.85);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .auth-nav-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        }

        .auth-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: linear-gradient(135deg, #151D29 0%, #101620 100%);
          border: 1px solid #202A38;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .auth-logo-text {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #4C8DFF;
        }

        .auth-brand-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .auth-brand-name {
          font-size: 15px;
          font-weight: 700;
          color: #F2F5F8;
          letter-spacing: -0.02em;
        }

        .auth-brand-badge {
          font-size: 11px;
          color: #98A4B5;
          font-weight: 400;
        }

        .auth-switch-cta {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .auth-switch-label {
          font-size: 13px;
          color: #98A4B5;
        }

        .auth-switch-button {
          font-size: 13px;
          font-weight: 600;
          color: #4C8DFF;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 6px;
          background-color: rgba(76, 141, 255, 0.08);
          border: 1px solid rgba(76, 141, 255, 0.25);
          transition: all 0.18s ease;
        }

        .auth-switch-button:hover {
          background-color: rgba(76, 141, 255, 0.15);
          border-color: #4C8DFF;
        }

        .auth-main-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px 20px 48px;
        }

        .auth-layout-grid {
          width: 100%;
          max-width: 1160px;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 48px;
          align-items: start;
        }

        .auth-left-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-top: 12px;
        }

        .auth-intro-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .auth-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background-color: rgba(76, 141, 255, 0.08);
          border: 1px solid rgba(76, 141, 255, 0.2);
          border-radius: 9999px;
          color: #4C8DFF;
          font-size: 11px;
          font-weight: 600;
          width: fit-content;
        }

        .auth-hero-title {
          font-size: 28px;
          font-weight: 700;
          color: #F2F5F8;
          letter-spacing: -0.025em;
          line-height: 1.25;
          margin: 0;
        }

        .auth-hero-desc {
          font-size: 14px;
          color: #98A4B5;
          line-height: 1.55;
          margin: 0;
        }

        .auth-capabilities-card {
          background-color: #101620;
          border: 1px solid #202A38;
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .auth-capabilities-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid #202A38;
        }

        .auth-capabilities-title {
          font-size: 12px;
          font-weight: 600;
          color: #F2F5F8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .auth-capabilities-count {
          font-size: 11px;
          color: #98A4B5;
          background-color: #151D29;
          padding: 2px 7px;
          border-radius: 4px;
          font-weight: 500;
        }

        .auth-capability-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .auth-capability-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .auth-capability-icon {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background-color: #151D29;
          border: 1px solid #202A38;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .auth-capability-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .auth-capability-name {
          font-size: 13px;
          font-weight: 600;
          color: #F2F5F8;
          line-height: 1.25;
        }

        .auth-capability-desc {
          font-size: 11.5px;
          color: #98A4B5;
          line-height: 1.35;
        }

        .auth-trust-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #98A4B5;
          line-height: 1.4;
          padding: 10px 14px;
          background-color: rgba(53, 201, 138, 0.05);
          border: 1px solid rgba(53, 201, 138, 0.15);
          border-radius: 8px;
        }

        .auth-right-col {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .auth-layout-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .auth-left-col {
            padding-top: 0;
            order: 2;
          }

          .auth-right-col {
            order: 1;
          }

          .auth-hero-title {
            font-size: 24px;
          }

          .auth-switch-label {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .auth-nav-inner {
            padding: 12px 16px;
          }

          .auth-main-wrapper {
            padding: 20px 14px 36px;
          }

          .auth-left-col {
            display: none;
          }

          .auth-switch-button {
            padding: 5px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
