import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

function ErrorState({ message = "Unable to load data. Please try again.", onRetry }) {
  return (
    <div style={styles.container}>
      <div style={styles.leftRow}>
        <AlertTriangle size={20} color="#fca5a5" />
        <span style={styles.message}>{message}</span>
      </div>

      {onRetry && (
        <button onClick={onRetry} style={styles.button}>
          <RefreshCw size={13} style={{ marginRight: 6 }} />
          Retry
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "rgba(127, 29, 29, 0.2)",
    border: "1px solid #7f1d1d",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#fca5a5",
    fontSize: "13px",
    margin: "16px 0"
  },
  leftRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  message: {
    color: "#fca5a5",
    fontWeight: "500"
  },
  button: {
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center"
  }
};

export default ErrorState;
