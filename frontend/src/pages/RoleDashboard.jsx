import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Users,
  Building2,
  Cpu,
  Lightbulb,
  FileText,
  RefreshCw,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2
} from "lucide-react";

import { getRoleDashboard } from "../services/dashboardService";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import SectionHeader from "../components/SectionHeader";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";

function RoleDashboard() {
  const { role } = useParams();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getRoleDashboard(role);
      setDashboard(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role) {
      loadDashboard();
    }
  }, [role]);

  const formatRole = (value) => {
    if (!value) return "";
    return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <LoadingSkeleton type="kpi" count={4} />
        <div style={{ marginTop: "20px" }}>
          <LoadingSkeleton type="card" count={2} height={200} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <ErrorState message={error} onRetry={loadDashboard} />
      </div>
    );
  }

  if (!dashboard) return null;

  const statistics = dashboard.statistics || {};
  const userRolesData = (dashboard.user_roles || []).map((item) => ({
    name: formatRole(item.role),
    count: item.count
  }));

  return (
    <div style={styles.container}>
      {/* Welcome Banner Header */}
      <div style={styles.welcomeBanner}>
        <div>
          <div style={styles.greetingBadge}>
            <Sparkles size={13} style={{ marginRight: 6 }} />
            {formatRole(dashboard.role)} Dashboard
          </div>
          <h1 style={styles.welcomeTitle}>
            Good day, {user.name || "Researcher"}
          </h1>
          <p style={styles.welcomeSub}>{dashboard.title}</p>
        </div>

        <button onClick={loadDashboard} style={styles.refreshBtn}>
          <RefreshCw size={15} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          title="Total Patents"
          value={Number(statistics.total_patents || 0).toLocaleString()}
          icon={FileText}
          subtext="USPTO & WIPO database"
          color="#3b82f6"
        />

        <StatCard
          title="Organizations"
          value={Number(statistics.total_organizations || 0).toLocaleString()}
          icon={Building2}
          subtext="Active research assignees"
          color="#7c3aed"
        />

        <StatCard
          title="Technology Fields"
          value={Number(statistics.total_technologies || 0).toLocaleString()}
          icon={Cpu}
          subtext="Categorized sectors"
          color="#c084fc"
        />

        <StatCard
          title="Inventors"
          value={Number(statistics.total_inventors || 0).toLocaleString()}
          icon={Users}
          subtext="Registered contributors"
          color="#10b981"
        />

        {statistics.total_users !== undefined && (
          <StatCard
            title="Platform Users"
            value={Number(statistics.total_users || 0).toLocaleString()}
            icon={Award}
            subtext="Active platform accounts"
            color="#f59e0b"
          />
        )}
      </div>

      {/* Columns: Focus Areas & Quick Actions */}
      <div style={styles.columns}>
        {/* Focus Areas Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Focus Areas</h3>
              <p style={styles.cardSub}>Strategic priorities for your role</p>
            </div>
            <Lightbulb size={20} color="#f59e0b" />
          </div>

          <div style={styles.focusList}>
            {(dashboard.focus || []).map((item, index) => (
              <div key={index} style={styles.focusItem}>
                <div style={styles.focusNum}>{index + 1}</div>
                <span style={styles.focusText}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Quick Actions</h3>
              <p style={styles.cardSub}>Direct navigation to platform modules</p>
            </div>
            <ArrowRight size={20} color="#60a5fa" />
          </div>

          <div style={styles.actionGrid}>
            {(dashboard.quick_actions || []).map((action, index) => (
              <Link key={index} to={action.route} style={styles.actionItem}>
                <div>
                  <h4 style={styles.actionTitle}>{action.title}</h4>
                  <span style={styles.actionSub}>Open module & analytics</span>
                </div>
                <ArrowRight size={16} color="#60a5fa" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Role Distribution Chart if available */}
      {userRolesData.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <ChartCard
            title="User Role Distribution"
            subtitle="Platform registered users grouped by institutional role"
            type="bar"
            data={userRolesData}
            dataKey="count"
            nameKey="name"
            color="#2563eb"
            height={240}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "28px 36px",
    maxWidth: "1440px",
    margin: "0 auto",
    color: "#f8fafc"
  },

  welcomeBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px"
  },

  greetingBadge: {
    background: "rgba(37, 99, 235, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: "500",
    padding: "4px 12px",
    borderRadius: "20px",
    display: "inline-flex",
    alignItems: "center",
    marginBottom: "8px"
  },

  welcomeTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 4px 0",
    letterSpacing: "-0.02em"
  },

  welcomeSub: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0
  },

  refreshBtn: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: "500",
    padding: "9px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "28px"
  },

  columns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "20px"
  },

  card: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },

  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: "0 0 2px 0"
  },

  cardSub: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0
  },

  focusList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  focusItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "12px 14px"
  },

  focusNum: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "rgba(37, 99, 235, 0.2)",
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },

  focusText: {
    fontSize: "13px",
    color: "#cbd5e1",
    lineHeight: "1.4"
  },

  actionGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  actionItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "14px 16px",
    textDecoration: "none",
    transition: "all 0.2s ease"
  },

  actionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: "0 0 2px 0"
  },

  actionSub: {
    fontSize: "11px",
    color: "#64748b"
  }
};

export default RoleDashboard;