import { Link } from "react-router-dom";
import Logo from "../brand/Logo";
import ThemeToggle from "../ThemeToggle";
import AuthFooter from "./AuthFooter";

export default function AuthShell({ children }) {
  return (
    <div className="auth-page">
      {/* AUTH HEADER */}
      <header className="auth-header" role="banner">
        <div className="auth-header-inner">
          <Link to="/" className="auth-brand" aria-label="Intelligent Research home">
            <Logo variant="full" size={38} showSubtitle={true} />
          </Link>

          {/* Unified Light/Dark mode toggle in the top-right */}
          <ThemeToggle />
        </div>
      </header>

      {/* Responsive flowable main content area */}
      <main className="auth-main" role="main">
        <div className="auth-card-container">
          {children}
        </div>
      </main>

      {/* Small footer */}
      <AuthFooter />

      {/* Scoped CSS for minimal layout and themes */}
      <style>{`
        .auth-page {
          min-height: 100vh;
          width: 100%;
          background-color: var(--auth-bg);
          color: var(--auth-text);
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          overflow-x: hidden;
          box-sizing: border-box;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .auth-header {
          width: 100%;
          background-color: var(--auth-bg);
          border-bottom: 1px solid var(--auth-border);
          position: sticky;
          top: 0;
          z-index: 50;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .auth-header-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-sizing: border-box;
        }

        .auth-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        }

        .auth-logo-mark {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background-color: var(--auth-logo-bg);
          border: 1px solid var(--auth-border);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .auth-logo-text {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #4C8DFF;
        }

        .auth-brand-info {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .auth-brand-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--auth-text);
          letter-spacing: -0.01em;
        }

        .auth-brand-subtitle {
          font-size: 12px;
          color: var(--auth-muted);
          font-weight: 400;
        }

        .auth-theme-toggle {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 12px;
          border-radius: 7px;
          border: 1px solid var(--auth-border);
          background-color: var(--auth-card);
          color: var(--auth-text);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .auth-theme-toggle:hover {
          border-color: #4C8DFF;
          color: #4C8DFF;
        }

        .auth-theme-icon {
          flex-shrink: 0;
        }

        .auth-theme-text {
          user-select: none;
        }

        .auth-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px 48px;
          width: 100%;
          box-sizing: border-box;
        }

        .auth-card-container {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        @media (max-width: 640px) {
          .auth-header-inner {
            padding: 12px 16px;
          }

          .auth-brand-subtitle {
            font-size: 11px;
          }

          .auth-brand-name {
            font-size: 14px;
          }

          .auth-main {
            padding: 24px 12px 36px;
          }

          .auth-theme-toggle {
            padding: 5px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
