import { useEffect, useState } from "react";
import { Bell, BellOff, CheckCheck, User, Briefcase, Trash2 } from "lucide-react";
import api from "@/api/api";
import { useTheme } from "@/components/theme-provider";

export default function Notifications({ isNavbarModal, isDarkNavbar }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { theme } = useTheme();
  const isDark = isNavbarModal ? isDarkNavbar : theme === "dark";

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/notifications/");
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Sync unreadCount with Sidebar via custom event
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('notificationsUpdated', { 
      detail: { unreadCount } 
    }));
  }, [unreadCount]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all/");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete("/notifications/clear-all/");
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "NEW_APPLICATION":
        return <User className="h-5 w-5 text-blue-500" />;
      case "APPLICATION_ACCEPTED":
        return <CheckCheck className="h-5 w-5 text-emerald-500" />;
      case "APPLICATION_REJECTED":
        return <BellOff className="h-5 w-5 text-rose-500" />;
      default:
        return <Bell className="h-5 w-5 text-zinc-400" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "NEW_APPLICATION":
        return "New Application";
      case "APPLICATION_ACCEPTED":
        return "Accepted";
      case "APPLICATION_REJECTED":
        return "Rejected";
      default:
        return "Notification";
    }
  };

  const badgeStyles = (type) => {
    switch (type) {
      case "NEW_APPLICATION":
        return {
          background: isDark ? "rgba(147, 51, 234, 0.15)" : "rgba(147, 51, 234, 0.08)",
          color: isDark ? "#c084fc" : "#7e22ce"
        };
      case "APPLICATION_ACCEPTED":
        return {
          background: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.08)",
          color: isDark ? "#34d399" : "#047857"
        };
      case "APPLICATION_REJECTED":
        return {
          background: isDark ? "rgba(244, 63, 94, 0.15)" : "rgba(244, 63, 94, 0.08)",
          color: isDark ? "#fb7185" : "#be123c"
        };
      default:
        return {
          background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
          color: isDark ? "#a1a1aa" : "#71717a"
        };
    }
  };

  if (loading) {
    return (
      <div 
        className="p-8 space-y-4 h-full flex flex-col justify-start"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
          background: isDark ? "#161618" : "#fff"
        }}
      >
        <div className={`h-8 w-48 rounded animate-pulse ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`} />
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-20 rounded-xl animate-pulse ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-100/50'}`} />
        ))}
      </div>
    );
  }

  const containerBg = isDark ? "#161618" : "#fff";
  const textColor = isDark ? "#ffffff" : "#111111";
  const descColor = isDark ? "#a1a1aa" : "#666666";
  const borderCol = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
  const listBg = isDark ? "rgba(255, 255, 255, 0.02)" : "#ffffff";

  return (
    <div 
      className="flex flex-col flex-1 p-8 h-full overflow-y-auto"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
        background: containerBg,
        color: textColor,
        transition: "all 0.3s ease"
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight flex items-center gap-3" style={{ color: textColor }}>
            <Bell className={`h-7 w-7 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            Notifications
          </h1>
          <p className="text-[14px] mt-1" style={{ color: descColor }}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-semibold cursor-pointer transition-all"
              style={{
                borderColor: isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.2)",
                background: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.04)",
                color: isDark ? "#60a5fa" : "#2563eb",
              }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.04)"}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-semibold cursor-pointer transition-all"
              style={{
                borderColor: isDark ? "rgba(239, 68, 68, 0.4)" : "rgba(239, 68, 68, 0.2)",
                background: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.04)",
                color: isDark ? "#f87171" : "#dc2626",
              }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.04)"}
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Notifications List Container */}
      <div 
        className="flex-1 flex flex-col rounded-2xl border overflow-hidden"
        style={{
          background: listBg,
          borderColor: borderCol
        }}
      >
        {/* All Notifications Title bar */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: borderCol }}
        >
          <span className="text-[16px] font-bold" style={{ color: textColor }}>
            All Notifications
          </span>
          {unreadCount > 0 && (
            <span 
              className="px-2 py-0.5 rounded-full text-[11px] font-bold ml-2"
              style={{
                background: "rgba(147, 51, 234, 0.15)",
                color: isDark ? "#c084fc" : "#7e22ce"
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>

        {/* Content body */}
        <div className="flex-1 flex flex-col">
          {error ? (
            <div className="p-8 text-center text-sm text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                <Bell className="h-10 w-10" style={{ color: descColor }} />
              </div>
              <p className="text-lg font-bold mb-1" style={{ color: textColor }}>
                No notifications yet
              </p>
              <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: descColor }}>
                When students apply to your internships, you'll see all your notifications and updates right here.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: borderCol }}>
              {notifications.map((notification) => {
                const bStyle = badgeStyles(notification.type);
                const isUnread = !notification.isRead;
                
                return (
                  <div
                    key={notification.id}
                    className="flex items-start gap-4 p-4 sm:px-6 transition-all duration-150 cursor-pointer"
                    style={{
                      borderLeft: isUnread ? (isDark ? "3px solid #60a5fa" : "3px solid #2563eb") : "none",
                      background: isUnread 
                        ? (isDark ? "rgba(96, 165, 250, 0.04)" : "rgba(37, 99, 235, 0.02)")
                        : "transparent",
                      borderBottom: `1px solid ${borderCol}`
                    }}
                    onClick={() => {
                      if (isUnread) markAsRead(notification.id);
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isUnread 
                      ? (isDark ? "rgba(96, 165, 250, 0.08)" : "rgba(37, 99, 235, 0.04)")
                      : (isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.015)")}
                    onMouseLeave={e => e.currentTarget.style.background = isUnread 
                      ? (isDark ? "rgba(96, 165, 250, 0.04)" : "rgba(37, 99, 235, 0.02)")
                      : "transparent"}
                  >
                    {/* Icon */}
                    <div
                      className="mt-0.5 shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                      style={{
                        background: isUnread 
                          ? (isDark ? "rgba(96, 165, 250, 0.12)" : "rgba(37, 99, 235, 0.08)")
                          : (isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)")
                      }}
                    >
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={bStyle}
                        >
                          {getTypeLabel(notification.type)}
                        </span>
                        {isUnread && (
                          <span 
                            className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" 
                          />
                        )}
                      </div>
                      <p
                        className="text-sm leading-snug"
                        style={{
                          fontWeight: isUnread ? "600" : "400",
                          color: isUnread ? textColor : descColor
                        }}
                      >
                        {notification.message}
                      </p>
                      <p className="text-[11px] mt-1" style={{ color: descColor }}>
                        {notification.createdAt}
                      </p>
                    </div>

                    {/* Mark as read button */}
                    {isUnread && (
                      <button
                        className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center border-none cursor-pointer transition-all"
                        style={{
                          background: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
                          color: isDark ? "#60a5fa" : "#2563eb"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = isDark ? "rgba(96, 165, 250, 0.2)" : "rgba(37, 99, 235, 0.1)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)";
                        }}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
