import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getRoleDashboard } from "../services/dashboardService";


function RoleDashboard() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (!role) {
        if (isMounted) {
          setError("Dashboard role is missing");
          setLoading(false);
        }

        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError("");
          setDashboard(null);
        }

        const data = await getRoleDashboard(role);

        if (isMounted) {
          setDashboard(data);
        }

      } catch (err) {
        console.error("Dashboard loading error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Unable to load dashboard"
          );
        }

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };

  }, [role]);


  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };


  const handleRetry = () => {
    window.location.reload();
  };


  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>

          <div style={styles.loadingSpinner}></div>

          <h2 style={styles.loadingTitle}>
            Loading Dashboard...
          </h2>

          <p style={styles.loadingText}>
            Fetching your research and innovation insights.
          </p>

        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorContainer}>

          <div style={styles.errorIcon}>
            !
          </div>

          <h2 style={styles.errorTitle}>
            Dashboard Error
          </h2>

          <p style={styles.errorText}>
            {error}
          </p>

          <button
            type="button"
            style={styles.retryButton}
            onClick={handleRetry}
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }


  if (!dashboard) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>

          <h2 style={styles.loadingTitle}>
            No Dashboard Data
          </h2>

          <p style={styles.loadingText}>
            No dashboard information was returned by the server.
          </p>

          <button
            type="button"
            style={styles.retryButton}
            onClick={handleRetry}
          >
            Reload
          </button>

        </div>
      </div>
    );
  }


  const statistics = dashboard.statistics || {};
  const focus = dashboard.focus || [];
  const quickActions = dashboard.quick_actions || [];
  const userRoles = dashboard.user_roles || [];


  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* Header */}

        <div style={styles.header}>

          <div>

            <p style={styles.eyebrow}>
              INTELLIGENT RESEARCH PLATFORM
            </p>

            <h1 style={styles.title}>
              {dashboard.title || "Dashboard"}
            </h1>

            <p style={styles.subtitle}>
              Role:{" "}
              <strong style={styles.roleText}>
                {formatRole(dashboard.role || role)}
              </strong>
            </p>

          </div>


          <button
            type="button"
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>


        {/* Statistics */}

        <div style={styles.statsGrid}>

          <StatCard
            title="Total Patents"
            value={statistics.total_patents ?? 0}
          />

          <StatCard
            title="Organizations"
            value={statistics.total_organizations ?? 0}
          />

          <StatCard
            title="Technologies"
            value={statistics.total_technologies ?? 0}
          />

          <StatCard
            title="Inventors"
            value={statistics.total_inventors ?? 0}
          />

          {statistics.total_users !== undefined && (
            <StatCard
              title="Platform Users"
              value={statistics.total_users}
            />
          )}

        </div>


        {/* Focus Areas */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div>

              <p style={styles.sectionLabel}>
                ROLE INTELLIGENCE
              </p>

              <h2 style={styles.sectionTitle}>
                Your Focus Areas
              </h2>

              <p style={styles.sectionSubtitle}>
                Research and innovation areas relevant to your role.
              </p>

            </div>

          </div>


          {focus.length > 0 ? (

            <div style={styles.focusGrid}>

              {focus.map((item, index) => (

                <div
                  key={`${item}-${index}`}
                  style={styles.focusCard}
                >

                  <div style={styles.icon}>
                    {index + 1}
                  </div>

                  <h3 style={styles.focusTitle}>
                    {item}
                  </h3>

                  <p style={styles.focusDescription}>
                    Explore {String(item).toLowerCase()} insights
                    and platform intelligence.
                  </p>

                </div>

              ))}

            </div>

          ) : (

            <EmptyState
              message="No focus areas are currently available."
            />

          )}

        </section>


        {/* Quick Actions */}

        {quickActions.length > 0 && (

          <section style={styles.section}>

            <div style={styles.sectionHeader}>

              <div>

                <p style={styles.sectionLabel}>
                  PLATFORM MODULES
                </p>

                <h2 style={styles.sectionTitle}>
                  Quick Actions
                </h2>

                <p style={styles.sectionSubtitle}>
                  Jump directly into the platform modules.
                </p>

              </div>

            </div>


            <div style={styles.actionGrid}>

              {quickActions.map((action, index) => (

                <button
                  key={`${action.title}-${index}`}
                  type="button"
                  style={styles.actionButton}
                  onClick={() => {
                    if (action.route) {
                      navigate(action.route);
                    }
                  }}
                >

                  <span style={styles.actionTitle}>
                    {action.title}
                  </span>

                  <span style={styles.arrow}>
                    →
                  </span>

                </button>

              ))}

            </div>

          </section>

        )}


        {/* Admin User Roles */}

        {userRoles.length > 0 && (

          <section style={styles.section}>

            <div style={styles.sectionHeader}>

              <div>

                <p style={styles.sectionLabel}>
                  PLATFORM USERS
                </p>

                <h2 style={styles.sectionTitle}>
                  User Roles
                </h2>

                <p style={styles.sectionSubtitle}>
                  Users grouped according to their platform role.
                </p>

              </div>

            </div>


            <div style={styles.table}>

              <div style={styles.tableHeader}>

                <span>
                  Role
                </span>

                <span>
                  Users
                </span>

              </div>


              {userRoles.map((item, index) => (

                <div
                  key={`${item.role}-${index}`}
                  style={styles.tableRow}
                >

                  <span>
                    {formatRole(item.role)}
                  </span>

                  <strong style={styles.userCount}>
                    {Number(item.count || 0).toLocaleString()}
                  </strong>

                </div>

              ))}

            </div>

          </section>

        )}


        {/* Methodology Notice */}

        <div style={styles.notice}>

          <div style={styles.noticeTitle}>
            Data-driven dashboard
          </div>

          <p style={styles.noticeText}>
            Dashboard statistics are generated from the platform
            database. Technology and patent activity are analytical
            indicators and should not automatically be interpreted
            as commercial market adoption.
          </p>

        </div>

      </div>

    </div>
  );
}


/* -------------------------------- */
/* Statistics Card */
/* -------------------------------- */

function StatCard({ title, value }) {

  return (
    <div style={styles.statCard}>

      <p style={styles.statTitle}>
        {title}
      </p>

      <h2 style={styles.statValue}>
        {Number(value || 0).toLocaleString()}
      </h2>

    </div>
  );
}


/* -------------------------------- */
/* Empty State */
/* -------------------------------- */

function EmptyState({ message }) {

  return (
    <div style={styles.emptyState}>
      {message}
    </div>
  );
}


/* -------------------------------- */
/* Role Formatter */
/* -------------------------------- */

function formatRole(role) {

  if (!role) {
    return "User";
  }

  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}


/* -------------------------------- */
/* Styles */
/* -------------------------------- */

const styles = {

  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "#e2e8f0",
    padding: "40px 20px",
    boxSizing: "border-box",
  },


  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },


  /* Loading */

  loadingContainer: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },


  loadingSpinner: {
    width: "38px",
    height: "38px",
    border: "4px solid #1e293b",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "dashboardSpin 1s linear infinite",
    marginBottom: "20px",
  },


  loadingTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "24px",
  },


  loadingText: {
    marginTop: "10px",
    color: "#64748b",
    fontSize: "14px",
  },


  /* Header */

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "35px",
    paddingBottom: "25px",
    borderBottom: "1px solid #1e293b",
  },


  eyebrow: {
    margin: 0,
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
  },


  title: {
    margin: "8px 0",
    color: "#f8fafc",
    fontSize: "36px",
    lineHeight: "1.2",
  },


  subtitle: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "14px",
  },


  roleText: {
    color: "#60a5fa",
  },


  logoutButton: {
    padding: "10px 18px",
    background: "#7f1d1d",
    border: "1px solid #991b1b",
    borderRadius: "8px",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },


  /* Statistics */

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
    marginBottom: "45px",
  },


  statCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "22px",
    minHeight: "105px",
    boxSizing: "border-box",
  },


  statTitle: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "14px",
  },


  statValue: {
    margin: "10px 0 0",
    color: "#f8fafc",
    fontSize: "30px",
    lineHeight: "1",
  },


  /* Sections */

  section: {
    marginBottom: "40px",
  },


  sectionHeader: {
    marginBottom: "20px",
  },


  sectionLabel: {
    margin: "0 0 6px",
    color: "#60a5fa",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },


  sectionTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "24px",
  },


  sectionSubtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },


  /* Focus */

  focusGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },


  focusCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "22px",
  },


  icon: {
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2563eb",
    borderRadius: "9px",
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: "15px",
  },


  focusTitle: {
    margin: "0 0 8px",
    color: "#f8fafc",
    fontSize: "17px",
  },


  focusDescription: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.6",
  },


  /* Quick Actions */

  actionGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "14px",
  },


  actionButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px",
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#e2e8f0",
    cursor: "pointer",
    fontSize: "15px",
    textAlign: "left",
    transition: "border-color 0.2s ease",
  },


  actionTitle: {
    fontWeight: "600",
  },


  arrow: {
    color: "#60a5fa",
    fontSize: "20px",
  },


  /* User Roles */

  table: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    overflow: "hidden",
  },


  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 120px",
    padding: "15px 20px",
    background: "#111827",
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: "13px",
  },


  tableRow: {
    display: "grid",
    gridTemplateColumns: "1fr 120px",
    padding: "16px 20px",
    borderTop: "1px solid #1e293b",
    color: "#cbd5e1",
  },


  userCount: {
    color: "#60a5fa",
  },


  /* Empty State */

  emptyState: {
    padding: "30px",
    background: "#0f172a",
    border: "1px dashed #334155",
    borderRadius: "12px",
    color: "#64748b",
    textAlign: "center",
    fontSize: "14px",
  },


  /* Methodology */

  notice: {
    padding: "18px",
    background: "#0c4a6e",
    border: "1px solid #075985",
    borderRadius: "12px",
    color: "#e0f2fe",
    marginBottom: "30px",
  },


  noticeTitle: {
    fontWeight: "700",
    marginBottom: "7px",
  },


  noticeText: {
    margin: 0,
    color: "#bae6fd",
    fontSize: "13px",
    lineHeight: "1.6",
  },


  /* Error */

  errorContainer: {
    maxWidth: "500px",
    margin: "100px auto",
    padding: "30px",
    background: "#0f172a",
    border: "1px solid #7f1d1d",
    borderRadius: "14px",
    textAlign: "center",
  },


  errorIcon: {
    width: "46px",
    height: "46px",
    margin: "0 auto 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#7f1d1d",
    borderRadius: "50%",
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "700",
  },


  errorTitle: {
    margin: 0,
    color: "#fca5a5",
  },


  errorText: {
    marginTop: "10px",
    color: "#94a3b8",
    lineHeight: "1.6",
  },


  retryButton: {
    marginTop: "15px",
    padding: "10px 18px",
    background: "#2563eb",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
  },

};


export default RoleDashboard;