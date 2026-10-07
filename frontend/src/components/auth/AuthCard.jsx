export default function AuthCard({ children, style = {} }) {
  return (
    <div style={{ ...styles.card, ...style }}>
      {children}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#101620",
    border: "1px solid #202A38",
    borderRadius: "14px",
    padding: "32px",
    boxShadow: "0 16px 40px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.02)",
    width: "100%",
    maxWidth: "520px",
    margin: "0 auto",
    position: "relative",
    backdropFilter: "blur(8px)",
  },
};
