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

const COLORS = ["#2563eb", "#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#c084fc"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || "#60a5fa", margin: 0, fontSize: "12px" }}>
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
  color = "#3b82f6",
  height = 260
}) {
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey={nameKey} stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 4, fill: color }} />
              </LineChart>
            ) : type === "pie" ? (
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={80} fill={color}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey={nameKey} stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div style={styles.emptyBox}>
            <span style={{ color: "#64748b", fontSize: "12px" }}>No chart data available</span>
          </div>
        )}
      </div>
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
    gap: "14px"
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  title: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0
  },
  subtitle: {
    fontSize: "11px",
    color: "#64748b"
  },
  tooltip: {
    background: "#020617",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "8px 12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
  },
  tooltipLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#f8fafc",
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
