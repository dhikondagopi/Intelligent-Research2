import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, Shield, ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar";
import NotificationMenu from "./NotificationMenu";

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Derive dynamic page title & section breadcrumb from current route
  const getPageInfo = (path) => {
    if (path.startsWith("/dashboard")) {
      const role = user?.role ? user.role.replaceAll("_", " ") : "Researcher";
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
      return { section: "Overview", title: `${formattedRole} Dashboard` };
    }
    if (path === "/research") {
      return { section: "Intelligence", title: "Research Intelligence" };
    }
    if (path === "/funding") {
      return { section: "Intelligence", title: "Funding Intelligence" };
    }
    if (path === "/patents") {
      return { section: "Intelligence", title: "Patent Intelligence" };
    }
    if (path === "/technology") {
      return { section: "Intelligence", title: "Technology Intelligence" };
    }
    if (path === "/technology/emerging") {
      return { section: "Intelligence / Technology", title: "Emerging Technologies" };
    }
    if (path.startsWith("/technology/")) {
      const techName = decodeURIComponent(path.replace("/technology/", ""));
      return { section: "Intelligence / Technology", title: `${techName} Analytics` };
    }
    if (path === "/innovation") {
      return { section: "Intelligence", title: "Innovation Scoring" };
    }
    if (path.startsWith("/innovation/")) {
      const techName = decodeURIComponent(path.replace("/innovation/", ""));
      return { section: "Intelligence / Innovation", title: `${techName} Assessment` };
    }
    if (path.startsWith("/commercialization/")) {
      const techName = decodeURIComponent(path.replace("/commercialization/", ""));
      return { section: "Intelligence / Commercialization", title: `${techName} Roadmap` };
    }
    if (path.startsWith("/reports")) {
      return { section: "Output", title: "Intelligence Reports" };
    }
    if (path.startsWith("/profile")) {
      return { section: "User Account", title: "Researcher Profile" };
    }
    return { section: "Platform", title: "Intelligent Research" };
  };

  const pageInfo = getPageInfo(location.pathname);

  return (
    <div style={styles.layoutWrapper}>
      {/* LEFT SIDEBAR NAVIGATION */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN CONTENT WRAPPER */}
      <div style={styles.mainWrapper}>
        {/* COMPACT TOP HEADER */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={styles.mobileMenuBtn}
              title="Open Navigation"
              aria-label="Open Navigation Drawer"
            >
              <Menu size={20} />
            </button>

            {/* Page Breadcrumb & Title */}
            <div style={styles.breadcrumbCol}>
              <div style={styles.breadcrumbRow}>
                <span style={styles.sectionBadge}>{pageInfo.section}</span>
                <ChevronRight size={12} style={{ color: "#475569" }} />
                <span style={styles.pathText}>{location.pathname}</span>
              </div>
              <h2 style={styles.pageTitle}>{pageInfo.title}</h2>
            </div>
          </div>

          {/* Header Right Actions */}
          <div style={styles.headerRight}>
            <NotificationMenu />

            {user && (
              <Link to="/profile" style={styles.userBadge} title="View Profile">
                <div style={styles.avatarMini}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div style={styles.userBadgeCol} className="hidden-mobile">
                  <span style={styles.badgeName}>{user.name || "User"}</span>
                  <span style={styles.badgeRole}>
                    <Shield size={10} style={{ marginRight: 2, display: "inline" }} />
                    {user.role ? user.role.replaceAll("_", " ") : "Researcher"}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </header>

        {/* MAIN PAGE CONTAINER */}
        <main style={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  layoutWrapper: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
    background: "#020617",
    color: "#f8fafc",
    overflow: "hidden"
  },

  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    height: "100vh",
    overflow: "hidden"
  },

  header: {
    height: "64px",
    padding: "0 28px",
    background: "rgba(8, 12, 22, 0.95)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexShrink: 0,
    zIndex: 10
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    minWidth: 0
  },

  mobileMenuBtn: {
    display: "none",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#cbd5e1",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center"
  },

  breadcrumbCol: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0
  },

  breadcrumbRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },

  sectionBadge: {
    fontSize: "10px",
    fontWeight: "500",
    color: "#60a5fa",
    letterSpacing: "0.5px",
    textTransform: "uppercase"
  },

  pathText: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "400"
  },

  pageTitle: {
    fontSize: "16px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "#f8fafc",
    margin: 0,
    lineHeight: "1.2",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexShrink: 0
  },

  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "4px 10px 4px 4px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    textDecoration: "none",
    transition: "background 0.2s ease"
  },

  avatarMini: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },

  userBadgeCol: {
    display: "flex",
    flexDirection: "column"
  },

  badgeName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#f8fafc",
    lineHeight: "1.2"
  },

  badgeRole: {
    fontSize: "9px",
    color: "#64748b",
    textTransform: "capitalize"
  },

  mainContent: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden"
  }
};

export default AppLayout;
