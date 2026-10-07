import { Link } from "react-router-dom";
import AuthFooter from "./AuthFooter";

export default function AuthShell({ children, activePage = "login" }) {
  const isLogin = activePage === "login";

  return (
    <div className="auth-page">
      {/* Top Minimal Navigation Bar */}
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
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <Link
              to={isLogin ? "/register" : "/login"}
              className="auth-switch-button"
            >
              {isLogin ? "Create account" : "Sign in"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Authentication Panel Wrapper */}
      <main className="auth-main-wrapper">
        <div className="auth-card-container">
          {children}
        </div>
      </main>

      {/* Small Secure Footer */}
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
          box-sizing: border-box;
        }

        .auth-nav-header {
          width: 100%;
          border-bottom: 1px solid #202A38;
          background-color: rgba(7, 11, 18, 0.95);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .auth-nav-inner {
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
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: linear-gradient(135deg, #151D29 0%, #101620 100%);
          border: 1px solid #202A38;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          flex-shrink: 0;
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
          padding: 6px 14px;
          border-radius: 6px;
          background-color: rgba(76, 141, 255, 0.08);
          border: 1px solid rgba(76, 141, 255, 0.25);
          transition: all 0.18s ease;
          white-space: nowrap;
        }

        .auth-switch-button:hover {
          background-color: rgba(76, 141, 255, 0.16);
          border-color: #4C8DFF;
        }

        .auth-main-wrapper {
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
          max-width: 460px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          box-sizing: border-box;
        }

        @media (max-width: 640px) {
          .auth-nav-inner {
            padding: 12px 16px;
          }

          .auth-switch-label {
            display: none;
          }

          .auth-switch-button {
            padding: 5px 12px;
            font-size: 12px;
          }

          .auth-main-wrapper {
            padding: 24px 12px 36px;
          }
        }
      `}</style>
    </div>
  );
}
