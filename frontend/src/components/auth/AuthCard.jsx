export default function AuthCard({ children, style = {} }) {
  return (
    <div className="auth-card" style={{ ...styles.card, ...style }}>
      {children}
      <style>{`
        @media (max-width: 480px) {
          .auth-card {
            padding: 24px 18px !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#101620",
    border: "1px solid #202A38",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.03)",
    width: "100%",
    maxWidth: "460px",
    margin: "0 auto",
    position: "relative",
    boxSizing: "border-box",
  },
};
