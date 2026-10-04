import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  DollarSign,
  Building2,
  Cpu,
  Sparkles,
  FileText,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Bell,
  Shield
} from "lucide-react";
import NotificationMenu from "./NotificationMenu";

function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = user?.role ? user.role : "researcher";
  const dashboardPath = `/dashboard/${userRole}`;

  const formatRole = (role) => {
    if (!role) return "User";
    return role.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const SECTIONS = [
    {
      title: "OVERVIEW",
      items: [
        { to: dashboardPath, baseRoute: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
      ]
    },
    {
      title: "INTELLIGENCE",
      items: [
        { to: "/research", baseRoute: "/research", label: "Research", icon: BookOpen },
        { to: "/funding", baseRoute: "/funding", label: "Funding", icon: DollarSign },
        { to: "/patents", baseRoute: "/patents", label: "Patents", icon: Building2 },
        { to: "/technology", baseRoute: "/technology", label: "Technology", icon: Cpu },
        { to: "/innovation", baseRoute: "/innovation", label: "Innovation", icon: Sparkles }
      ]
    },
    {
      title: "OUTPUT",
      items: [
        { to: "/reports", baseRoute: "/reports", label: "Reports", icon: FileText }
      ]
    }
  ];

  const isItemActive = (item) => {
    if (item.baseRoute === "/dashboard") {
      return location.pathname.startsWith("/dashboard");
    }
    if (item.baseRoute === "/innovation") {
      return location.pathname.startsWith("/innovation") || location.pathname.startsWith("/commercialization");
    }
    return location.pathname.startsWith(item.baseRoute);
  };

  const isProfileActive = location.pathname.startsWith("/profile");

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={styles.mobileOverlay}
          aria-label="Close Mobile Navigation"
        />
      )}

      {/* Sidebar Main Container */}
      <aside
        style={{
          ...styles.sidebar,
          width: collapsed ? "72px" : "256px",
          ...(mobileOpen ? styles.sidebarMobileOpen : {})
        }}
        className={`app-sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}
      >
        {/* SIDEBAR HEADER */}
        <div style={styles.header}>
          <Link
            to={dashboardPath}
            style={styles.brand}
            onClick={() => setMobileOpen(false)}
          >
            <div style={styles.logo}>IR</div>
            {!collapsed && (
              <div style={styles.brandTextCol}>
                <span style={styles.brandTitle}>Intelligent Research</span>
                <span style={styles.brandSubtitle}>Research & Innovation Platform</span>
              </div>
            )}
          </Link>

          {/* Collapse/Expand Toggle Button on Desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={styles.collapseBtn}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="hidden-mobile"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Close Button on Mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            style={styles.mobileCloseBtn}
            title="Close Menu"
            aria-label="Close Navigation Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION CONTENT AREA */}
        <div style={styles.navScrollArea}>
          {SECTIONS.map((section, idx) => (
            <div key={idx} style={styles.sectionBlock}>
              {!collapsed && (
                <div style={styles.sectionHeader}>
                  <span>{section.title}</span>
                </div>
              )}
              {collapsed && idx > 0 && <div style={styles.sectionDivider} />}

              <div style={styles.itemsList}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      style={{
                        ...styles.navItem,
                        ...(collapsed ? styles.navItemCollapsed : {}),
                        ...(active ? styles.navItemActive : {})
                      }}
                    >
                      {active && <div style={styles.activeIndicator} />}
                      <Icon
                        size={18}
                        style={{
                          color: active ? "#60a5fa" : "#64748b",
                          flexShrink: 0
                        }}
                      />
                      {!collapsed && (
                        <span style={active ? styles.itemTextActive : styles.itemText}>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM USER & NOTIFICATION SECTION */}
        <div style={styles.bottomSection}>
          {/* Profile Shortcut Item */}
          <Link
            to="/profile"
            onClick={() => setMobileOpen(false)}
            title={collapsed ? "Researcher Profile" : undefined}
            style={{
              ...styles.navItem,
              ...(collapsed ? styles.navItemCollapsed : {}),
              ...(isProfileActive ? styles.navItemActive : {}),
              marginBottom: "8px"
            }}
          >
            {isProfileActive && <div style={styles.activeIndicator} />}
            <User
              size={18}
              style={{
                color: isProfileActive ? "#60a5fa" : "#64748b",
                flexShrink: 0
              }}
            />
            {!collapsed && (
              <span style={isProfileActive ? styles.itemTextActive : styles.itemText}>
                Profile
              </span>
            )}
          </Link>

          {/* User Info Box */}
          <div style={{ ...styles.userInfoCard, ...(collapsed ? styles.userInfoCardCollapsed : {}) }}>
            <div style={styles.userAvatar}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            {!collapsed && (
              <div style={styles.userDetails}>
                <span style={styles.userName}>{user?.name || "Researcher"}</span>
                <span style={styles.userRole}>
                  <Shield size={10} style={{ marginRight: 3, display: "inline" }} />
                  {formatRole(user?.role)}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              style={styles.logoutBtn}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} color="#94a3b8" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

const styles = {
  mobileOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.75)",
    backdropFilter: "blur(4px)",
    zIndex: 999
  },

  sidebar: {
    position: "sticky",
    top: 0,
    height: "100vh",
    background: "#080c16",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    zIndex: 1000,
    overflow: "hidden"
  },

  sidebarMobileOpen: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: "256px !important",
    zIndex: 1000,
    boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
  },

  header: {
    height: "64px",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    flexShrink: 0
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    overflow: "hidden"
  },

  logo: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
    flexShrink: 0
  },

  brandTextCol: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0
  },

  brandTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#f8fafc",
    lineHeight: "1.2",
    letterSpacing: "-0.015em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },

  brandSubtitle: {
    fontSize: "9px",
    fontWeight: "400",
    color: "#64748b",
    whiteSpace: "nowrap"
  },

  collapseBtn: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#94a3b8",
    borderRadius: "6px",
    padding: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  },

  mobileCloseBtn: {
    display: "none",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "6px"
  },

  navScrollArea: {
    flex: 1,
    padding: "16px 10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },

  sectionBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },

  sectionHeader: {
    fontSize: "10px",
    fontWeight: "500",
    letterSpacing: "0.5px",
    color: "#475569",
    padding: "4px 10px 6px 10px",
    textTransform: "uppercase"
  },

  sectionDivider: {
    height: "1px",
    background: "rgba(255, 255, 255, 0.06)",
    margin: "6px 0"
  },

  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "3px"
  },

  navItem: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "9px 12px",
    borderRadius: "8px",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
    transition: "all 0.15s ease",
    cursor: "pointer"
  },

  navItemCollapsed: {
    justifyContent: "center",
    padding: "10px 0"
  },

  navItemActive: {
    color: "#ffffff",
    background: "rgba(37, 99, 235, 0.16)",
    boxShadow: "inset 0 0 0 1px rgba(59, 130, 246, 0.25)"
  },

  activeIndicator: {
    position: "absolute",
    left: 0,
    top: "6px",
    bottom: "6px",
    width: "3px",
    borderRadius: "0 3px 3px 0",
    background: "#3b82f6",
    boxShadow: "0 0 8px #3b82f6"
  },

  itemText: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#94a3b8",
    whiteSpace: "nowrap"
  },

  itemTextActive: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#f8fafc",
    whiteSpace: "nowrap"
  },

  bottomSection: {
    padding: "12px 10px 16px 10px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    flexShrink: 0
  },

  userInfoCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "10px"
  },

  userInfoCardCollapsed: {
    justifyContent: "center",
    padding: "8px 0"
  },

  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1e293b, #334155)",
    border: "1px solid #334155",
    color: "#60a5fa",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },

  userDetails: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0
  },

  userName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#f8fafc",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },

  userRole: {
    fontSize: "10px",
    color: "#64748b",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center"
  },

  logoutBtn: {
    background: "transparent",
    border: "none",
    padding: "6px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s ease"
  }
};

export default Sidebar;
