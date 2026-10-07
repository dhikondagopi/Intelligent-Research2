import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Building2,
  Cpu,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";

import { getRoleDashboard } from "../services/dashboardService";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";

function RoleDashboard() {
  const { role } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getRoleDashboard(role);
      setDashboard(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        return;
      }
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
          <div style={styles.welcomeBadge}>
            <LayoutDashboard size={12} style={{ marginRight: 4 }} />
            Enterprise Intelligence Workspace
          </div>
          <h1 style={styles.welcomeTitle}>
            {formatRole(dashboard.role)} Dashboard
          </h1>
          <p style={styles.welcomeSub}>{dashboard.title}</p>
        </div>

        <button onClick={loadDashboard} style={styles.refreshBtn}>
          <RefreshCw size={14} />
          <span>Refresh Workspace</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          title="Total Patents"
          value={Number(statistics.total_patents || 0).toLocaleString()}
          icon={FileText}
          subtext="USPTO & WIPO database"
          color="#4C8DFF"
        />

        <StatCard
          title="Organizations"
          value={Number(statistics.total_organizations || 0).toLocaleString()}
          icon={Building2}
          subtext="Active research assignees"
          color="#4C8DFF"
        />

        <StatCard
          title="Technology Fields"
          value={Number(statistics.total_technologies || 0).toLocaleString()}
          icon={Cpu}
          subtext="Categorized sectors"
          color="#4C8DFF"
        />

        <StatCard
          title="Inventors"
          value={Number(statistics.total_inventors || 0).toLocaleString()}
          icon={Users}
          subtext="Registered contributors"
          color="#4C8DFF"
        />

        {statistics.total_users !== undefined && (
          <StatCard
            title="Platform Users"
            value={Number(statistics.total_users || 0).toLocaleString()}
            icon={Award}
            subtext="Active platform accounts"
            color="#4C8DFF"
          />
        )}
      </div>

      {/* Main Content Columns */}
      <div style={styles.columns}>
        {/* Left Column: Strategic Focus */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Strategic Focus Areas</h3>
              <p style={styles.cardSub}>Key research and monitoring priorities for your role</p>
            </div>
            <Sparkles size={18} color="#4C8DFF" />
          </div>

          <div style={styles.focusList}>
            {(dashboard.focus || []).map((item, index) => (
              <div key={index} style={styles.focusItem}>
                <div style={styles.focusNum}>{index + 1}</div>
                <div style={styles.focusText}>{item}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recommended Actions */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Quick Workflows</h3>
              <p style={styles.cardSub}>Direct access to intelligence tools</p>
            </div>
            <Award size={18} color="#4C8DFF" />
          </div>

          <div style={styles.actionGrid}>
            {(dashboard.quick_actions || []).map((action, index) => (
              <Link key={index} to={action.link} style={styles.actionItem}>
                <div>
                  <h4 style={styles.actionTitle}>{action.title}</h4>
                  <p style={styles.actionSub}>Launch module analysis</p>
                </div>
                <ArrowRight size={16} color="#98A4B5" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Platform User Distribution Chart if available */}
      {userRolesData.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <ChartCard
            title="Platform Role Distribution"
            subtitle="Registered accounts across research roles"
            type="bar"
            data={userRolesData}
            dataKey="count"
            nameKey="name"
            color="#4C8DFF"
            height={220}
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
    color: "#F2F5F8"
  },

  welcomeBanner: {
    background: "#101620",
    border: "1px solid #202A38",
    borderRadius: "12px",
    padding: "24px 28px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)"
  },

  welcomeBadge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "11px",
    fontWeight: "600",
    color: "#4C8DFF",
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.25)",
    padding: "2px 8px",
    borderRadius: "6px",
    marginBottom: "8px"
  },

  welcomeTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#F2F5F8",
    margin: "0 0 4px 0",
    letterSpacing: "-0.02em"
  },

  welcomeSub: {
    fontSize: "14px",
    color: "#98A4B5",
    margin: 0
  },

  refreshBtn: {
    background: "#0B0F17",
    border: "1px solid #202A38",
    color: "#F2F5F8",
    fontSize: "12px",
    fontWeight: "500",
    padding: "9px 16px",
    borderRadius: "8px",
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
    marginBottom: "24px"
  },

  columns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "20px"
  },

  card: {
    background: "#101620",
    border: "1px solid #202A38",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)"
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },

  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#F2F5F8",
    margin: "0 0 2px 0"
  },

  cardSub: {
    fontSize: "12px",
    color: "#98A4B5",
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
    background: "#0B0F17",
    border: "1px solid #202A38",
    borderRadius: "8px",
    padding: "12px 14px"
  },

  focusNum: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "rgba(76, 141, 255, 0.15)",
    color: "#4C8DFF",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },

  focusText: {
    fontSize: "13px",
    color: "#F2F5F8",
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
    background: "#0B0F17",
    border: "1px solid #202A38",
    borderRadius: "8px",
    padding: "14px 16px",
    textDecoration: "none",
    transition: "all 0.2s ease"
  },

  actionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#F2F5F8",
    margin: "0 0 2px 0"
  },

  actionSub: {
    fontSize: "12px",
    color: "#98A4B5",
    margin: 0
  }
};

export default RoleDashboard;