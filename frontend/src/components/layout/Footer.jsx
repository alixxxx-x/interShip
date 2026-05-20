import { Link } from "react-router-dom";
import logoPng from "@/assets/internia-logo.png";
import { useEffect, useState } from "react";
import api from "@/api/api";
import { ACCESS_TOKEN } from "@/constants";
import { useLanguage } from "@/components/language-provider";
import { useTheme } from "@/components/theme-provider";


export default function Footer() {
    const [userInfo, setUserInfo] = useState(null);
    const { t } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (token) {
                    const res = await api.get("/auth/profile/");
                    setUserInfo(res.data);
                }
            } catch { }
        };
        fetchProfile();
    }, []);

    const s = {
        footer: {
            fontFamily: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: isDark ? "linear-gradient(135deg, #c8dcff 0%, #6fa8ff 100%)" : "#0f172a",
            padding: "80px 48px 48px",
            margin: "48px 24px 24px",
            borderRadius: 32,
            transition: "all 0.3s ease",
            overflow: "hidden"
        },
        inner: { maxWidth: 1400, margin: "0 auto" },
        grid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 48,
            marginBottom: 64,
        },
        logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 16 },
        logoText: {
            fontSize: 20,
            fontWeight: 500,
            color: isDark ? "#1b2a47" : "#ffffff",
            letterSpacing: "-0.03em",
            transition: "color 0.3s ease"
        },
        logoAccent: { color: isDark ? "#1b2a47" : "#ffffff" },
        desc: {
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: isDark ? "rgba(27, 42, 71, 0.7)" : "rgba(255,255,255,0.55)",
            lineHeight: 1.6,
            maxWidth: 260,
            transition: "color 0.3s ease"
        },
        colTitle: {
            fontSize: 15,
            fontWeight: 500,
            color: isDark ? "#1b2a47" : "#ffffff",
            marginBottom: 20,
            letterSpacing: "-0.01em",
            transition: "color 0.3s ease"
        },
        colLinks: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 },
        colLink: {
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: isDark ? "rgba(27, 42, 71, 0.7)" : "rgba(255,255,255,0.5)",
            textDecoration: "none",
            transition: "color 0.2s ease",
        },
        bottom: {
            borderTop: isDark ? "1px solid rgba(27, 42, 71, 0.12)" : "1px solid rgba(255,255,255,0.08)",
            paddingTop: 32,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
        },
        copy: {
            fontSize: 12,
            color: isDark ? "rgba(27, 42, 71, 0.6)" : "rgba(255,255,255,0.35)",
        },
    };

    const linkHover = (e) => e.currentTarget.style.color = isDark ? "#1b2a47" : "#ffffff";
    const linkLeave = (e) => e.currentTarget.style.color = isDark ? "rgba(27, 42, 71, 0.7)" : "rgba(255,255,255,0.5)";

    return (
        <footer style={s.footer}>
            <style>{`
                .footer-social-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: ${isDark ? "rgba(27, 42, 71, 0.08)" : "rgba(255, 255, 255, 0.06)"};
                    border: 1px solid ${isDark ? "rgba(27, 42, 71, 0.12)" : "rgba(255, 255, 255, 0.08)"};
                    color: ${isDark ? "rgba(27, 42, 71, 0.8)" : "rgba(255, 255, 255, 0.6)"};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .footer-social-btn:hover {
                    background: ${isDark ? "rgba(27, 42, 71, 0.15)" : "rgba(255, 255, 255, 0.12)"};
                    color: ${isDark ? "#1b2a47" : "#ffffff"};
                    transform: translateY(-2px);
                }
                .footer-social-btn.active {
                    background: ${isDark ? "#1b2a47" : "#ffffff"};
                    color: ${isDark ? "#ffffff" : "#111111"};
                }
            `}</style>
            
            <div style={s.inner}>
                <div style={s.grid}>
                    {/* Brand Column */}
                    <div>
                        <Link to="/" style={s.logo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                            <img
                                src={logoPng}
                                alt="Internia"
                                style={{
                                    height: 26,
                                    width: "auto",
                                    filter: isDark ? "brightness(0) opacity(0.85)" : "brightness(0) invert(1)",
                                    transition: "filter 0.3s ease"
                                }}
                            />
                            <span style={s.logoText}>Internia<span style={s.logoAccent}>.</span></span>
                        </Link>
                        <p style={s.desc}>{t("footerDesc")}</p>
                    </div>

                    {/* Explore Column */}
                    <div>
                        <p style={s.colTitle}>{t("footerExplore", "Explore")}</p>
                        <ul style={s.colLinks}>
                            <li><Link to="/internships" style={s.colLink} onMouseEnter={linkHover} onMouseLeave={linkLeave}>{t("footerBrowse", "Browse Internships")}</Link></li>
                            <li><Link to="/companies" style={s.colLink} onMouseEnter={linkHover} onMouseLeave={linkLeave}>{t("footerCompanies", "Companies")}</Link></li>
                            <li>
                                <Link to="/#how-it-works" style={s.colLink} onMouseEnter={linkHover} onMouseLeave={linkLeave}
                                    onClick={(e) => {
                                        if (window.location.pathname === "/") {
                                            e.preventDefault();
                                            document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                                        }
                                    }}
                                >{t("footerHowItWorks", "How it Works")}</Link>
                            </li>
                            <li>
                                <Link
                                    to={userInfo ? "#" : "/register"}
                                    onClick={(e) => userInfo && e.preventDefault()}
                                    style={{
                                        ...s.colLink,
                                        color: userInfo
                                            ? isDark ? "rgba(27, 42, 71, 0.3)" : "rgba(255,255,255,0.25)"
                                            : isDark ? "rgba(27, 42, 71, 0.7)" : "rgba(255,255,255,0.5)",
                                        cursor: userInfo ? "not-allowed" : "pointer"
                                    }}
                                    onMouseEnter={e => !userInfo && linkHover(e)}
                                    onMouseLeave={e => !userInfo && linkLeave(e)}
                                >{t("footerJoinNow", "Join Now")}</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <p style={s.colTitle}>{t("footerResources", "Resources")}</p>
                        <ul style={s.colLinks}>
                            <li><Link to="/guidelines" style={s.colLink} onMouseEnter={linkHover} onMouseLeave={linkLeave}>{t("footerGuidelines", "Student Guidelines")}</Link></li>
                            <li><Link to="/faq" style={s.colLink} onMouseEnter={linkHover} onMouseLeave={linkLeave}>{t("footerFAQs", "FAQs")}</Link></li>
                            <li><Link to="/terms" style={s.colLink} onMouseEnter={linkHover} onMouseLeave={linkLeave}>{t("footerTerms", "Terms of Service")}</Link></li>
                            <li><Link to="/privacy" style={s.colLink} onMouseEnter={linkHover} onMouseLeave={linkLeave}>{t("footerPrivacy", "Privacy Policy")}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div id="contact-us">
                        <p style={s.colTitle}>{t("footerContact", "Contact Us")}</p>
                        <ul style={s.colLinks}>
                            <li style={{ fontSize: 13, color: isDark ? "rgba(27, 42, 71, 0.7)" : "rgba(255,255,255,0.5)", transition: "color 0.3s ease" }}>
                                Email: <a href="mailto:support@internia.com" style={{ color: isDark ? "#1b2a47" : "#ffffff", textDecoration: "none", fontWeight: 500 }}>support@internia.com</a>
                            </li>
                            <li style={{ fontSize: 13, color: isDark ? "rgba(27, 42, 71, 0.7)" : "rgba(255,255,255,0.5)", transition: "color 0.3s ease" }}>Phone: +213 123 456 789</li>
                            <li style={{ fontSize: 13, color: isDark ? "rgba(27, 42, 71, 0.7)" : "rgba(255,255,255,0.5)", transition: "color 0.3s ease" }}>Algiers, Algeria</li>
                        </ul>
                    </div>

                    {/* Follow Us Column (mockup matching circular buttons!) */}
                    <div>
                        <p style={s.colTitle}>{t("followUs", "Social Media")}</p>
                        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
                            <div className="footer-social-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                </svg>
                            </div>
                            <div className="footer-social-btn active">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                                </svg>
                            </div>
                            <div className="footer-social-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                    <rect x="2" y="9" width="4" height="12"/>
                                    <circle cx="4" cy="4" r="2"/>
                                </svg>
                            </div>
                            <div className="footer-social-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={s.bottom}>
                    <p style={s.copy}>{t("footerRights")}</p>
                    <div style={{ display: "flex", gap: 20 }}>
                        <Link to="/privacy" style={{ fontSize: 12, color: isDark ? "rgba(27, 42, 71, 0.6)" : "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s ease" }}
                            onMouseEnter={e => e.currentTarget.style.color = isDark ? "#1b2a47" : "#ffffff"}
                            onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(27, 42, 71, 0.6)" : "rgba(255,255,255,0.35)"}
                        >Privacy</Link>
                        <Link to="/faq" style={{ fontSize: 12, color: isDark ? "rgba(27, 42, 71, 0.6)" : "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s ease" }}
                            onMouseEnter={e => e.currentTarget.style.color = isDark ? "#1b2a47" : "#ffffff"}
                            onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(27, 42, 71, 0.6)" : "rgba(255,255,255,0.35)"}
                        >FAQ</Link>
                        <Link to="/contact" style={{ fontSize: 12, color: isDark ? "rgba(27, 42, 71, 0.6)" : "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s ease" }}
                            onMouseEnter={e => e.currentTarget.style.color = isDark ? "#1b2a47" : "#ffffff"}
                            onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(27, 42, 71, 0.6)" : "rgba(255,255,255,0.35)"}
                        >Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
