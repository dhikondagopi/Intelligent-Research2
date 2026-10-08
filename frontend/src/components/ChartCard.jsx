import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { useTheme } from "../context/ThemeContext";

const COLORS = ["#4C8DFF", "#35C98A", "#D9A441", "#38bdf8", "#818cf8", "#E05B61"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || "var(--color-primary)", margin: 0, fontSize: "12px" }}>
            {`${entry.name}: ${typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function ChartCard({
  title,
  subtitle,
  type = "bar",
  data = [],
  dataKey = "value",
  nameKey = "name",
  color,
  height = 260
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const activeColor = color || (isLight ? "#2F6FED" : "#4C8DFF");
  const gridColor = isLight ? "#E2E8F0" : "#202A38";
  const axisColor = isLight ? "#64748B" : "#98A4B5";

  return (
    <div style={styles.card}>
      {title && (
        <div style={styles.header}>
          <h4 style={styles.title}>{title}</h4>
          {subtitle && <span style={styles.subtitle}>{subtitle}</span>}
        </div>
      )}

      <div style={{ width: "100%", height }}>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {type === "line" ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey={nameKey} stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey={dataKey} stroke={activeColor} strokeWidth={2} dot={{ r: 3, fill: activeColor }} />
              </LineChart>
            ) : type === "pie" ? (
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={80} fill={activeColor}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey={nameKey} stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={dataKey} fill={activeColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div style={styles.emptyBox}>
            <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>No chart data available</span>
          </div>
        )}
      </div>
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
    gap: "14px",
    boxShadow: "var(--shadow-card)"
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  title: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--color-text)",
    margin: 0
  },
  subtitle: {
    fontSize: "11px",
    color: "var(--color-text-muted)"
  },
  tooltip: {
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    padding: "8px 12px",
    boxShadow: "var(--shadow-dropdown)"
  },
  tooltipLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--color-text)",
    margin: "0 0 4px 0"
  },
  emptyBox: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

export default ChartCard;
