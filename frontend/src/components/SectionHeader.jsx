import React from "react";

function SectionHeader({ title, subtitle, icon: Icon, badge, children }) {
  return (
    <div style={styles.container}>
      <div style={styles.textCol}>
        <div style={styles.titleRow}>
          {Icon && (
            <div style={styles.iconBox}>
              <Icon size={18} color="var(--color-primary)" />
            </div>
          )}
          <h1 style={styles.title}>{title}</h1>
          {badge && <span style={styles.badge}>{badge}</span>}
        </div>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>

      {children && <div style={styles.actionCol}>{children}</div>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px"
  },
  textCol: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  iconBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(76, 141, 255, 0.1)",
    border: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "var(--color-text)",
    letterSpacing: "-0.02em",
    margin: 0
  },
  badge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "var(--color-primary)",
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid var(--color-border)",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--color-text-muted)",
    margin: 0
  },
  actionCol: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }
};

export default SectionHeader;
