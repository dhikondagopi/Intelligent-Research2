import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  triggerAlertGeneration
} from "../services/notificationService";
import {
  Bell,
  CheckCheck,
  DollarSign,
  Building2,
  Cpu,
  FileText,
  Briefcase,
  AlertCircle,
  RefreshCw,
  X,
  ChevronRight,
  Info,
  Sparkles
} from "lucide-react";

const CATEGORIES = [
  { label: "All", value: "ALL" },
  { label: "Funding", value: "FUNDING" },
  { label: "Patents", value: "PATENT" },
  { label: "Technology", value: "TECHNOLOGY" },
  { label: "Research", value: "RESEARCH_TREND" },
  { label: "Commercialization", value: "COMMERCIALIZATION" }
];

function NotificationMenu() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch unread count & initial notification list
  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadNotifications();
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const fetchNotificationsList = async (category = activeCategory) => {
    setLoading(true);
    setError("");

    try {
      const data = await getNotifications(category, 1, 20);
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(data.unread_count !== undefined ? data.unread_count : unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Poll unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotificationsList(activeCategory);
    }
  }, [isOpen, activeCategory]);

  // Outside click listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = async (item) => {
    if (!item.is_read) {
      try {
        await markNotificationAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark read:", err);
      }
    }

    setIsOpen(false);

    // Map link or fallback to module route
    if (item.link) {
      navigate(item.link);
    } else if (item.related_module === "funding") {
      navigate("/funding");
    } else if (item.related_module === "patents") {
      navigate("/patents");
    } else if (item.related_module === "technology") {
      navigate("/technology");
    } else if (item.related_module === "research") {
      navigate("/research");
    } else if (item.related_module === "commercialization") {
      if (item.related_record_id) {
        navigate(`/commercialization/${encodeURIComponent(item.related_record_id)}`);
      } else {
        navigate("/innovation");
      }
    } else {
      navigate("/profile");
    }
  };

  const handleGenerateAlerts = async () => {
    setActionLoading(true);
    try {
      await triggerAlertGeneration();
      await fetchNotificationsList(activeCategory);
    } catch (err) {
      console.error("Failed to generate alerts:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "FUNDING":
        return <DollarSign size={16} style={{ color: "#34d399" }} />;
      case "PATENT":
        return <Building2 size={16} style={{ color: "#60a5fa" }} />;
      case "TECHNOLOGY":
        return <Cpu size={16} style={{ color: "#c084fc" }} />;
      case "RESEARCH_TREND":
        return <FileText size={16} style={{ color: "#f59e0b" }} />;
      case "COMMERCIALIZATION":
        return <Briefcase size={16} style={{ color: "#f43f5e" }} />;
      default:
        return <Info size={16} style={{ color: "#94a3b8" }} />;
    }
  };

  return (
    <div style={styles.container} ref={menuRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.bellButton}
        title="Notifications & Alerts"
      >
        <Bell size={19} color="#cbd5e1" />
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div style={styles.dropdown}>
          {/* Panel Header */}
          <div style={styles.header}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={18} style={{ color: "#60a5fa" }} />
              <h3 style={styles.headerTitle}>Notifications</h3>
              {unreadCount > 0 && (
                <span style={styles.headerUnreadBadge}>{unreadCount} new</span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={handleGenerateAlerts}
                disabled={actionLoading}
                style={styles.headerActionBtn}
                title="Scan for new alerts"
              >
                <Sparkles size={13} />
                <span>Scan</span>
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={actionLoading}
                  style={styles.headerActionBtn}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span>Read All</span>
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                style={styles.closeBtn}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div style={styles.tabsRow}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                style={{
                  ...styles.tabBtn,
                  ...(activeCategory === cat.value ? styles.tabBtnActive : {})
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Notifications List Body */}
          <div style={styles.listBody}>
            {loading ? (
              <div style={styles.centerBox}>
                <RefreshCw size={22} style={styles.spinner} />
                <span style={styles.mutedText}>Loading notifications...</span>
              </div>
            ) : error ? (
              <div style={styles.errorBox}>
                <AlertCircle size={18} />
                <span>{error}</span>
                <button
                  onClick={() => fetchNotificationsList(activeCategory)}
                  style={styles.retryBtn}
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div style={styles.centerBox}>
                <Bell size={32} style={{ color: "#475569", marginBottom: "8px" }} />
                <p style={styles.emptyTitle}>No notifications</p>
                <p style={styles.emptySub}>
                  No alerts found in category "{activeCategory.toLowerCase()}".
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    ...styles.notificationItem,
                    ...(item.is_read ? styles.itemRead : styles.itemUnread)
                  }}
                >
                  <div style={styles.iconCol}>{getTypeIcon(item.notification_type)}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.itemMetaRow}>
                      <span style={styles.typeBadge}>{item.notification_type}</span>
                      {item.priority === "high" && (
                        <span style={styles.highPriorityBadge}>HIGH</span>
                      )}
                      {!item.is_read && <span style={styles.unreadDot} />}
                    </div>

                    <h4 style={styles.itemTitle}>{item.title}</h4>
                    <p style={styles.itemMessage}>{item.message}</p>
                    <span style={styles.timeText}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <ChevronRight size={16} style={{ color: "#475569" }} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    display: "inline-block"
  },

  bellButton: {
    position: "relative",
    background: "#101620",
    border: "1px solid #202A38",
    borderRadius: "8px",
    padding: "8px 11px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  },

  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "#E05B61",
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: "600",
    padding: "2px 6px",
    borderRadius: "10px",
    lineHeight: "1"
  },

  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 10px)",
    width: "420px",
    maxHeight: "540px",
    background: "#101620",
    border: "1px solid #202A38",
    borderRadius: "12px",
    boxShadow: "0 14px 40px rgba(0, 0, 0, 0.6)",
    zIndex: 2000,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },

  header: {
    padding: "16px 18px",
    borderBottom: "1px solid #202A38",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#0B0F17"
  },

  headerTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#F2F5F8",
    margin: 0
  },

  headerUnreadBadge: {
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.25)",
    color: "#4C8DFF",
    fontSize: "11px",
    fontWeight: "500",
    padding: "2px 7px",
    borderRadius: "10px"
  },

  headerActionBtn: {
    background: "transparent",
    border: "1px solid #202A38",
    color: "#98A4B5",
    fontSize: "11px",
    fontWeight: "500",
    padding: "5px 9px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px"
  },

  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#98A4B5",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center"
  },

  tabsRow: {
    display: "flex",
    gap: "4px",
    padding: "8px 12px",
    background: "#101620",
    borderBottom: "1px solid #202A38",
    overflowX: "auto"
  },

  tabBtn: {
    background: "transparent",
    border: "none",
    color: "#98A4B5",
    fontSize: "12px",
    fontWeight: "500",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },

  tabBtnActive: {
    background: "rgba(76, 141, 255, 0.14)",
    color: "#4C8DFF"
  },

  listBody: {
    overflowY: "auto",
    maxHeight: "400px"
  },

  centerBox: {
    padding: "40px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },

  mutedText: {
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "8px"
  },

  spinner: {
    animation: "spin 1s linear infinite",
    color: "#60a5fa"
  },

  emptyTitle: {
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 4px 0"
  },

  emptySub: {
    color: "#64748b",
    fontSize: "12px",
    margin: 0
  },

  errorBox: {
    padding: "16px",
    margin: "12px",
    background: "rgba(127, 29, 29, 0.2)",
    border: "1px solid #7f1d1d",
    borderRadius: "8px",
    color: "#fca5a5",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },

  retryBtn: {
    marginLeft: "auto",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: "11px"
  },

  notificationItem: {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    cursor: "pointer",
    transition: "background 0.15s ease"
  },

  itemUnread: {
    background: "rgba(37, 99, 235, 0.08)",
    borderLeft: "3px solid #2563eb"
  },

  itemRead: {
    background: "transparent",
    opacity: 0.8
  },

  iconCol: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    background: "#1e293b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px"
  },

  itemMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px"
  },

  typeBadge: {
    fontSize: "10px",
    fontWeight: "500",
    color: "#60a5fa",
    letterSpacing: "0.5px"
  },

  highPriorityBadge: {
    fontSize: "9px",
    fontWeight: "600",
    background: "rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    padding: "1px 5px",
    borderRadius: "4px"
  },

  unreadDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#3b82f6",
    marginLeft: "auto"
  },

  itemTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: "0 0 3px 0",
    lineHeight: "1.3"
  },

  itemMessage: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "0 0 6px 0",
    lineHeight: "1.4"
  },

  timeText: {
    fontSize: "10px",
    color: "#64748b"
  }
};

export default NotificationMenu;
