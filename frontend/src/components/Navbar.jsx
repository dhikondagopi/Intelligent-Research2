import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationMenu from "./NotificationMenu";
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
  Menu,
  X
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard/researcher", label: "Dashboard", icon: LayoutDashboard },
  { to: "/research", label: "Research", icon: BookOpen },
  { to: "/funding", label: "Funding", icon: DollarSign },
  { to: "/patents", label: "Patents", icon: Building2 },
  { to: "/technology", label: "Technology", icon: Cpu },
  { to: "/innovation", label: "Innovation", icon: Sparkles },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/profile", label: "Profile", icon: User }
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatRole = (role) => {
    if (!role) return "User";
    return role.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navInner}>
        {/* Brand Logo */}
        <Link to="/dashboard/researcher" style={styles.brand}>
          <div style={styles.logo}>IR</div>
          <div style={styles.brandTextCol}>
            <span style={styles.brandTitle}>Intelligent Research</span>
            <span style={styles.brandSubtitle}>Research & Innovation Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={styles.desktopNav}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(`${item.to}/`));

            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {})
                }}
              >
                <Icon size={15} style={{ color: isActive ? "#60a5fa" : "#64748b" }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Section & Notification Bell */}
        <div style={styles.userSection}>
          <NotificationMenu />

          {user && (
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div style={styles.userTextCol}>
                <span style={styles.userName}>{user.name || "User"}</span>
                <span style={styles.userRole}>{formatRole(user.role)}</span>
              </div>
            </div>
          )}

          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out">
            <LogOut size={15} />
            <span style={styles.logoutText}>Logout</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={styles.mobileToggleBtn}
            title="Toggle Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileOpen && (
        <div style={styles.mobileMenu}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(`${item.to}/`));

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  ...styles.mobileNavLink,
                  ...(isActive ? styles.mobileNavLinkActive : {})
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "rgba(2, 6, 23, 0.92)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    width: "100%"
  },

  navInner: {
    maxWidth: "1440px",
    margin: "0 auto",
    height: "68px",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px"
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    textDecoration: "none",
    flexShrink: 0
  },

  logo: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.3)"
  },

  brandTextCol: {
    display: "flex",
    flexDirection: "column"
  },

  brandTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#f8fafc",
    lineHeight: "1.2"
  },

  brandSubtitle: {
    fontSize: "10px",
    color: "#64748b"
  },

  desktopNav: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flex: 1,
    justifyContent: "center"
  },

  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 12px",
    borderRadius: "8px",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap"
  },

  navLinkActive: {
    color: "#ffffff",
    background: "rgba(37, 99, 235, 0.16)",
    boxShadow: "inset 0 0 0 1px rgba(59, 130, 246, 0.25)"
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexShrink: 0
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "9px"
  },

  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1e293b, #334155)",
    border: "1px solid #334155",
    color: "#60a5fa",
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  userTextCol: {
    display: "flex",
    flexDirection: "column",
    gap: "1px"
  },

  userName: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#f8fafc"
  },

  userRole: {
    fontSize: "10px",
    color: "#64748b"
  },

  logoutBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#cbd5e1",
    padding: "7px 11px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease"
  },

  logoutText: {
    display: "inline-block"
  },

  mobileToggleBtn: {
    display: "none",
    background: "transparent",
    border: "none",
    color: "#cbd5e1",
    cursor: "pointer",
    padding: "6px"
  },

  mobileMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "12px 20px 20px 20px",
    background: "#0f172a",
    borderBottom: "1px solid #1e293b"
  },

  mobileNavLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "8px",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none"
  },

  mobileNavLinkActive: {
    color: "#ffffff",
    background: "rgba(37, 99, 235, 0.2)"
  }
};

export default Navbar;
