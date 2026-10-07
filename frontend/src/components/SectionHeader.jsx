import React from "react";

function SectionHeader({ title, subtitle, icon: Icon, badge, children }) {
  return (
    <div style={styles.container}>
      <div style={styles.textCol}>
        <div style={styles.titleRow}>
          {Icon && (
            <div style={styles.iconBox}>
              <Icon size={18} color="#4C8DFF" />
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
    border: "1px solid #202A38",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#F2F5F8",
    letterSpacing: "-0.02em",
    margin: 0
  },
  badge: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#4C8DFF",
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.25)",
    padding: "2px 8px",
    borderRadius: "6px"
  },
  subtitle: {
    fontSize: "13px",
    color: "#98A4B5",
    margin: 0
  },
  actionCol: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }
};

export default SectionHeader;
