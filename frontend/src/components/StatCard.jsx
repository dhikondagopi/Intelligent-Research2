import React from "react";

function StatCard({
  title,
  value,
  icon,
  trend,
  subtext,
  badge,
  badgeText,
  color = "#4C8DFF"
}) {
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;
  const displayBadge = badge || badgeText;

  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return icon;
    }

    const IconComponent = icon;
    return <IconComponent size={18} color={color} />;
  };

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <span style={styles.title}>{title}</span>
        {icon && (
          <div style={{ ...styles.iconBox, background: `rgba(76, 141, 255, 0.1)`, border: `1px solid var(--color-border)` }}>
            {renderIcon()}
          </div>
        )}
      </div>

      <div style={styles.valueRow}>
        <span style={styles.value}>{displayValue}</span>
        {displayBadge && <span style={styles.badge}>{displayBadge}</span>}
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
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "var(--shadow-card)",
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
    color: "var(--color-text-muted)",
    letterSpacing: "0.1px"
  },
  iconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
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
    color: "var(--color-text)",
    letterSpacing: "-0.02em"
  },
  badge: {
    fontSize: "10px",
    fontWeight: "500",
    color: "var(--color-primary)",
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.25)",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  bottomRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px"
  },
  trend: {
    fontWeight: "600",
    color: "var(--color-success)"
  },
  subtext: {
    color: "var(--color-text-muted)"
  }
};

export default StatCard;
