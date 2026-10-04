import React from "react";
import { FolderOpen } from "lucide-react";

function EmptyState({
  icon: Icon = FolderOpen,
  title = "No data available",
  message = "No matching records found for the applied parameters.",
  actionLabel,
  onAction
}) {
  return (
    <div style={styles.container}>
      <div style={styles.iconBox}>
        <Icon size={28} color="#64748b" />
      </div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.message}>{message}</p>

      {actionLabel && onAction && (
        <button onClick={onAction} style={styles.button}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "48px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  iconBox: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    background: "#1e293b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px"
  },
  title: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#cbd5e1",
    margin: "0 0 6px 0"
  },
  message: {
    fontSize: "13px",
    color: "#64748b",
    maxWidth: "400px",
    margin: "0 0 16px 0",
    lineHeight: "1.4"
  },
  button: {
    background: "rgba(37, 99, 235, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: "600",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default EmptyState;
