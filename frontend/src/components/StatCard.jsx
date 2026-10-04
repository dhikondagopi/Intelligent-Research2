import React from "react";

function StatCard({ title, value, icon: Icon, trend, subtext, badge, color = "#3b82f6" }) {
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <span style={styles.title}>{title}</span>
        {Icon && (
          <div style={{ ...styles.iconBox, background: `${color}18`, border: `1px solid ${color}30` }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>

      <div style={styles.valueRow}>
        <span style={styles.value}>{displayValue}</span>
        {badge && <span style={styles.badge}>{badge}</span>}
      </div>

      {(trend || subtext) && (
        <div style={styles.bottomRow}>
          {trend && <span style={styles.trend}>{trend}</span>}
          {subtext && <span style={styles.subtext}>{subtext}</span>}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
    transition: "all 0.2s ease"
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#94a3b8",
    letterSpacing: "0.1px"
  },
  iconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  valueRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px"
  },
  value: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f8fafc",
    letterSpacing: "-0.02em"
  },
  badge: {
    fontSize: "10px",
    fontWeight: "500",
    color: "#60a5fa",
    background: "rgba(37, 99, 235, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    padding: "2px 6px",
    borderRadius: "6px"
  },
  bottomRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px"
  },
  trend: {
    fontWeight: "600",
    color: "#34d399"
  },
  subtext: {
    color: "#64748b"
  }
};

export default StatCard;
