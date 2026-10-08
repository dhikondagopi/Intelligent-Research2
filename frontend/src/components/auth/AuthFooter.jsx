import { useState } from "react";

export default function AuthFooter() {
  const [activeModal, setActiveModal] = useState(null);

  const modalData = {
    privacy: {
      title: "Privacy Policy",
      text: "All research queries, patent analytics, and institutional intellectual property are encrypted at rest and in transit. No external AI model training is performed on proprietary research data.",
    },
    terms: {
      title: "Terms of Service",
      text: "Access to intelligence databases, citation graphs, and technology commercialization pipelines is provided under institutional subscription and research governance agreements.",
    },
    security: {
      title: "Secure Authentication",
      text: "Enterprise-grade authentication with JSON Web Tokens (JWT), role-based access control (RBAC), secure credential hashing, and encrypted TLS communication.",
    },
  };

  return (
    <footer className="auth-footer" aria-label="Security and Legal Information">
      <div className="auth-footer-inner">
        <button
          type="button"
          onClick={() => setActiveModal("privacy")}
          className="auth-footer-btn"
        >
          Privacy
        </button>
        <span className="auth-footer-sep" aria-hidden="true">·</span>
        <button
          type="button"
          onClick={() => setActiveModal("terms")}
          className="auth-footer-btn"
        >
          Terms
        </button>
        <span className="auth-footer-sep" aria-hidden="true">·</span>
        <button
          type="button"
          onClick={() => setActiveModal("security")}
          className="auth-footer-btn"
        >
          Secure Authentication
        </button>
      </div>

      {activeModal && (
        <div
          className="auth-footer-overlay"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-footer-modal-title"
        >
          <div
            className="auth-footer-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="auth-footer-modal-title" className="auth-footer-modal-title">
              {modalData[activeModal]?.title}
            </h3>
            <p className="auth-footer-modal-text">
              {modalData[activeModal]?.text}
            </p>
            <button
              type="button"
              className="auth-footer-close-btn"
              onClick={() => setActiveModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        .auth-footer {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          padding: 20px 16px 28px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          border-top: 1px solid var(--auth-border);
          transition: border-color 0.2s ease;
        }

        .auth-footer-inner {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 12px;
          color: var(--auth-muted);
        }

        .auth-footer-btn {
          background: transparent;
          border: none;
          color: var(--auth-muted);
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
          padding: 2px 4px;
          border-radius: 4px;
          transition: color 0.15s ease;
        }

        .auth-footer-btn:hover {
          color: var(--auth-text);
          text-decoration: underline;
        }

        .auth-footer-sep {
          color: var(--auth-muted);
          user-select: none;
        }

        .auth-footer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }

        .auth-footer-dialog {
          background: var(--auth-card);
          border: 1px solid var(--auth-border);
          border-radius: 10px;
          padding: 22px 24px;
          max-width: 420px;
          width: 100%;
          box-shadow: var(--auth-card-shadow);
          box-sizing: border-box;
          animation: authModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes authModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .auth-footer-modal-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--auth-text);
          margin: 0 0 10px 0;
        }

        .auth-footer-modal-text {
          font-size: 13px;
          color: var(--auth-muted);
          line-height: 1.5;
          margin: 0 0 18px 0;
        }

        .auth-footer-close-btn {
          background-color: var(--auth-primary);
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: background-color 0.15s ease;
        }

        .auth-footer-close-btn:hover {
          background-color: #3b7be6;
        }
      `}</style>
    </footer>
  );
}
