import React from "react";

function LoadingSkeleton({ type = "card", count = 3, height = 120 }) {
  const items = Array.from({ length: count });

  if (type === "kpi") {
    return (
      <div style={styles.grid4}>
        {items.map((_, i) => (
          <div key={i} style={{ ...styles.box, height: 90 }} />
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ ...styles.box, height: 40 }} />
        {items.map((_, i) => (
          <div key={i} style={{ ...styles.box, height: 50 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {items.map((_, i) => (
        <div key={i} style={{ ...styles.box, height }} />
      ))}
    </div>
  );
}

const styles = {
  box: {
    width: "100%",
    borderRadius: "12px",
    animation: "skeletonPulse 1.5s ease-in-out infinite"
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
    width: "100%"
  }
};

export default LoadingSkeleton;
