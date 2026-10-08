export default function AuthCard({ children, style = {} }) {
  return (
    <div className="auth-card" style={style}>
      {children}
      <style>{`
        .auth-card {
          background-color: var(--auth-card);
          border: 1px solid var(--auth-border);
          border-radius: 12px;
          padding: 32px;
          box-shadow: var(--auth-card-shadow);
          width: 100%;
          box-sizing: border-box;
          transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 24px 18px;
          }
        }
      `}</style>
    </div>
  );
}
