export default function AuthHeader({ heading, subtitle }) {
  return (
    <div className="auth-card-header">
      <h1 className="auth-card-title">{heading}</h1>
      {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
      <style>{`
        .auth-card-header {
          margin-bottom: 22px;
          text-align: left;
        }
        .auth-card-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--auth-text);
          letter-spacing: -0.02em;
          line-height: 1.25;
          margin: 0 0 6px 0;
        }
        .auth-card-subtitle {
          font-size: 13.5px;
          color: var(--auth-muted);
          line-height: 1.45;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
