import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoPng from "@/assets/internia-logo.png";
import { Sun, Moon, Bell, LayoutDashboard, User, Settings, LogOut } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/components/language-provider";
import api from "@/api/api";
import { ACCESS_TOKEN } from "@/constants";
import Notifications from "@/features/dashboards/Notifications";

export default function Navbar({ children }) {
    const [userInfo, setUserInfo] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const { t } = useLanguage();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const onOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setDropdownOpen(false);
        };
        document.addEventListener("mousedown", onOutside);
        return () => document.removeEventListener("mousedown", onOutside);
    }, []);

    useEffect(() => {
        const run = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (token) {
                    const [profile, notif] = await Promise.all([
                        api.get("/auth/profile/"),
                        api.get("/notifications/"),
                    ]);
                    setUserInfo(profile.data);
                    setUnreadCount(notif.data.unreadCount || 0);
                } else setUserInfo(null);
            } catch { setUserInfo(null); }
        };
        run();
    }, [location.pathname]);

    useEffect(() => {
        const h = (e) => { if (typeof e.detail?.unreadCount === "number") setUnreadCount(e.detail.unreadCount); };
        window.addEventListener("notificationsUpdated", h);
        return () => window.removeEventListener("notificationsUpdated", h);
    }, []);

    const handleLogout = () => { localStorage.clear(); setUserInfo(null); navigate("/login"); };

    const displayName = userInfo
        ? userInfo.role === "COMPANY"
            ? userInfo.name || userInfo.username
            : (userInfo.first_name || userInfo.last_name)
                ? `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim()
                : userInfo.username
        : "";

    const avatarSrc = userInfo
        ? userInfo.role === "COMPANY" ? (userInfo.logo || userInfo.profile_picture) : userInfo.profile_picture
        : null;

    const avatarInitial = displayName?.charAt(0)?.toUpperCase() || "A";

    // Determine colors based on route/scroll/theme
    const isHome = location.pathname === "/";
    const isDarkTheme = isHome && !scrolled ? true : theme === "dark";

    const textColor = isDarkTheme ? "#fff" : "#111";
    const textHoverBg = isDarkTheme ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

    const ls = (active) => ({
        fontSize: 14, fontWeight: 500, color: textColor, textDecoration: "none", whiteSpace: "nowrap",
        transition: "background 0.2s, color 0.2s",
        padding: "8px 20px",
        borderRadius: 9999,
        background: active ? (isDarkTheme ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)") : "transparent"
    });

    const ib = { background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: "50%", display: "flex", alignItems: "center", color: textColor, transition: "background 0.2s" };


    const liquidGlassStyle = isDarkTheme ? {
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(255,255,255,0.3)",
        borderLeft: "1px solid rgba(255,255,255,0.2)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
    } : {
        background: "rgba(255,255,255,0.5)",
        backdropFilter: "saturate(200%) blur(28px)",
        WebkitBackdropFilter: "saturate(200%) blur(28px)",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)"
    };

    const dropdownGlassStyle = isDarkTheme ? {
        background: "rgba(22, 22, 24, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.15)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)"
    } : {
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "saturate(200%) blur(30px)",
        WebkitBackdropFilter: "saturate(200%) blur(30px)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08)"
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}>

            {showNotifications && (
                <div
                    style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.32)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setShowNotifications(false)}
                >
                    <div
                        style={{ 
                            background: theme === "dark" ? "#161618" : "#fff", 
                            border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
                            borderRadius: 18, 
                            width: "min(900px,95vw)", 
                            height: "85vh", 
                            overflow: "hidden", 
                            boxShadow: theme === "dark" ? "0 24px 64px rgba(0,0,0,0.4)" : "0 24px 64px rgba(0,0,0,0.16)" 
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <Notifications isNavbarModal={true} isDarkNavbar={theme === "dark"} />
                    </div>
                </div>
            )}

            {/* Floating Navbar */}
            <nav style={{
                position: "fixed", top: scrolled ? "12px" : "24px", left: "50%", transform: "translateX(-50%)",
                width: scrolled ? "calc(100% - 24px)" : "calc(100% - 80px)", maxWidth: "1400px",
                padding: "12px 24px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", zIndex: 100,
                borderRadius: "9999px",
                background: scrolled ? (isDarkTheme ? "rgba(22, 22, 24, 0.85)" : "rgba(255, 255, 255, 0.85)") : "transparent",
                backdropFilter: scrolled ? "blur(24px)" : "none",
                WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
                border: scrolled ? (isDarkTheme ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)") : "1px solid transparent",
                boxShadow: scrolled ? (isDarkTheme ? "0 16px 40px rgba(0,0,0,0.2)" : "0 16px 40px rgba(0,0,0,0.08)") : "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
                {/* LEFT Logo */}
                <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                    <img src={logoPng} alt="Internia" style={{ height: 26, width: "auto", filter: isDarkTheme ? "brightness(0) invert(1)" : "none", transition: "filter 0.3s" }} />
                    <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", color: textColor, transition: "color 0.3s" }}>Internia<span style={{ color: "#e53e3e" }}>.</span></span>
                </Link>

                {/* CENTER Pill Links */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    ...liquidGlassStyle,
                    padding: "6px", borderRadius: 9999,
                    transition: "all 0.3s ease"
                }}>
                    {[
                        { name: t("navHome"), path: "/" },
                        { name: t("navInternships"), path: "/internships" },
                        { name: t("navCompanies"), path: "/companies" },
                        { name: t("navAbout"), path: "/about" },
                    ].map(l => (
                        <Link key={l.path} to={l.path} style={ls(location.pathname === l.path)}
                            onMouseEnter={e => !(location.pathname === l.path) && (e.currentTarget.style.background = textHoverBg)}
                            onMouseLeave={e => !(location.pathname === l.path) && (e.currentTarget.style.background = "transparent")}
                        >{l.name}</Link>
                    ))}
                </div>

                {/* RIGHT Controls */}
                <div style={{ display: "flex", alignItems: "center", justifySelf: "end", gap: 16 }}>
                    <button style={ib} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        onMouseEnter={e => e.currentTarget.style.background = textHoverBg} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {userInfo ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <button style={{ ...ib, position: "relative" }} onClick={() => setShowNotifications(true)}
                                onMouseEnter={e => e.currentTarget.style.background = textHoverBg} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span style={{ position: "absolute", top: 5, right: 5, width: 8, height: 8, background: "#e53e3e", borderRadius: "50%", border: `1.5px solid ${isDarkTheme ? "#222" : "#fff"}` }} />
                                )}
                            </button>
                            <div style={{ position: "relative" }} ref={dropdownRef}>
                                <button onClick={() => setDropdownOpen(o => !o)}
                                    style={{ display: "flex", alignItems: "center", gap: 8, ...liquidGlassStyle, cursor: "pointer", padding: "4px 16px 4px 4px", borderRadius: 9999, transition: "all 0.3s ease" }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatarSrc ? "transparent" : (isDarkTheme ? "#fff" : "#1a3a6b"), display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 13, fontWeight: 700, color: isDarkTheme ? "#111" : "#fff" }}>
                                        {avatarSrc ? <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : avatarInitial}
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 500, color: textColor, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</span>
                                </button>
                                {dropdownOpen && (
                                     <div 
                                         className="absolute top-[calc(100%+10px)] right-0 min-w-[220px] p-1.5 z-[200] rounded-[16px]"
                                         style={dropdownGlassStyle}
                                     >
                                         <div className="px-3.5 pt-2.5 pb-2">
                                             <div style={{ fontSize: 14, fontWeight: 700, color: isDarkTheme ? "#fff" : "#111" }}>{displayName}</div>
                                             <div style={{ fontSize: 12, color: isDarkTheme ? "rgba(255,255,255,0.6)" : "#666", marginTop: 2 }}>{userInfo.email}</div>
                                         </div>
                                         <div style={{ height: 1, background: isDarkTheme ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", margin: "4px 0" }} />
                                         {[
                                             { icon: <LayoutDashboard size={15} />, label: t("navDashboard"), action: () => navigate("/dashboard") },
                                             { icon: <User size={15} />, label: t("navProfile"), action: () => navigate("/profile") },
                                             { icon: <Settings size={15} />, label: t("navSettings"), action: () => navigate("/settings") },
                                         ].map((item, i) => (
                                             <button
                                                 key={i}
                                                 onClick={() => { setDropdownOpen(false); item.action(); }}
                                                 className="flex items-center gap-2.5 w-full px-3.5 py-2.5 bg-transparent border-none cursor-pointer text-[14px] font-semibold text-left rounded-[9px] transition-colors duration-150"
                                                 style={{ color: isDarkTheme ? "#e2e8f0" : "#333" }}
                                                 onMouseEnter={e => e.currentTarget.style.background = isDarkTheme ? "rgba(255,255,255,0.06)" : "#f4f4f5"}
                                                 onMouseLeave={e => e.currentTarget.style.background = "none"}
                                             >
                                                 <span style={{ display: "flex", alignItems: "center", color: isDarkTheme ? "#93c5fd" : "#1a3a6b" }}>{item.icon}</span> {item.label}
                                             </button>
                                         ))}
                                         <div style={{ height: 1, background: isDarkTheme ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", margin: "4px 0" }} />
                                         <button
                                             onClick={handleLogout}
                                             className="flex items-center gap-2.5 w-full px-3.5 py-2.5 bg-transparent border-none cursor-pointer text-[14px] font-semibold text-left rounded-[9px] transition-colors duration-150"
                                             style={{ color: isDarkTheme ? "#f87171" : "#dc2626" }}
                                             onMouseEnter={e => e.currentTarget.style.background = isDarkTheme ? "rgba(239,68,68,0.12)" : "#fef2f2"}
                                             onMouseLeave={e => e.currentTarget.style.background = "none"}
                                         >
                                             <LogOut size={15} /> {t("logout")}
                                         </button>
                                     </div>
                                 )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <Link to="/login" style={{ textDecoration: "none", color: textColor, fontSize: 14, fontWeight: 500, padding: "8px 16px", transition: "opacity 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                            >{t("navLogin")}</Link>
                            <Link to="/register" style={{ textDecoration: "none" }}>
                                <button style={{
                                    fontSize: 14, fontWeight: 600, background: isDarkTheme ? "#fff" : "#111", color: isDarkTheme ? "#111" : "#fff",
                                    border: "none", borderRadius: 9999, padding: "10px 24px", cursor: "pointer",
                                    transition: "opacity 0.2s",
                                }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                                >{t("navRegister")}</button>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Spacer for fixed nav on non-home pages */}
            {!isHome && <div style={{ height: 100 }} />}

            {children}
        </div>
    );
}

