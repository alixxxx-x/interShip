import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "@/api/api";
import { ACCESS_TOKEN } from "@/constants";
import {
    ArrowRight, Check, GraduationCap, Building2,
    Brain, FileText, Search, BarChart3, Star, Award, TrendingUp, Target,
    Sun, Moon, Menu, X, Bell, LayoutDashboard, User, Settings, LogOut, ChevronLeft, ChevronRight,
    ArrowUpRight
} from "lucide-react";
import heroImage from "@/assets/bunly-hort-o9olH5LziVg-unsplash.jpg";
import featureBg from "@/assets/ant-rozetsky-HXOllTSwrpM-unsplash.jpg";
import logoPng from "@/assets/internia-logo.png";
import centerpieceImage from "@/assets/intern_in_ui.jpg";
import intern2 from "@/assets/intern2.jpg";
import intern3 from "@/assets/intern3.jpg";
import intern4 from "@/assets/intern_4.jpg";
import interns5 from "@/assets/interns5.jpg";
import uiux_intern from "@/assets/uiux internn.jpg";
import cvImage from "@/assets/cv.jpg";
import googleInternshipImage from "@/assets/google_internship.jpg";
import microsoftInternshipImage from "@/assets/microsoft_internship.png";
import nvidiaInternshipImage from "@/assets/nvidia_internship.png";
import nasaInternshipImage from "@/assets/nasa_internship.png";
import ooredooInternshipImage from "@/assets/ooredoo_internship.png";
import adminAgreementImage from "@/assets/imageofadminagreement.jpg";
import employmentHistoryImage from "@/assets/imageofimploymenthistory.jpg";
import { useLanguage } from "@/components/language-provider";
import { useTheme } from "@/components/theme-provider";


export function HowItWorksSection() {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const steps = [
        { number: "01", title: t("howStep1"), description: t("howStep1Desc") },
        { number: "02", title: t("howStep2"), description: t("howStep2Desc") },
        { number: "03", title: t("howStep3"), description: t("howStep3Desc") },
        { number: "04", title: t("howStep4"), description: t("howStep4Desc") },
    ];

    const cardStyle = {
        background: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.04)",
        borderRadius: "32px",
        padding: "40px 36px",
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.15)" : "0 8px 32px rgba(0,0,0,0.02)",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column"
    };

    const handleMouseEnter = e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.75)";
        e.currentTarget.style.boxShadow = isDark ? "0 8px 30px rgba(0,0,0,0.2)" : "0 12px 36px rgba(0,0,0,0.03)";
    };

    const handleMouseLeave = e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.7)";
        e.currentTarget.style.boxShadow = isDark ? "0 4px 24px rgba(0,0,0,0.15)" : "0 8px 32px rgba(0,0,0,0.02)";
    };

    return (
        <section id="how-it-works" style={{
            padding: "20px 0",
            transition: "all 0.3s"
        }}>
            <div>
                {/* Responsive grid styles injected dynamically */}
                <style>{`
                    .how-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 40px;
                        padding: 0 6vw;
                    }
                    .how-col-left {
                        display: flex;
                        flex-direction: column;
                        gap: 40px;
                    }
                    .how-col-right {
                        display: flex;
                        flex-direction: column;
                        gap: 40px;
                    }
                    .how-image { 
                        height: 350px; 
                        width: 100%; 
                        max-width: 380px; 
                        border-radius: 32px; 
                        overflow: hidden; 
                        position: relative;
                        box-shadow: 0 24px 48px rgba(0,0,0,0.12);
                        margin: 0 auto;
                    }

                    @media (min-width: 768px) and (max-width: 1023px) {
                        .how-grid {
                            grid-template-columns: 1fr 300px;
                            gap: 40px;
                            align-items: center;
                        }
                        .how-col-left { grid-column: 1; grid-row: 1; }
                        .how-col-right { grid-column: 1; grid-row: 2; }
                        .how-image { 
                            grid-column: 2; 
                            grid-row: 1 / span 2; 
                            height: 100%; 
                            min-height: 520px; 
                            margin: 0;
                        }
                    }

                    @media (min-width: 1024px) {
                        .how-grid {
                            grid-template-columns: 1fr 380px 1fr;
                            gap: 48px;
                            align-items: center;
                        }
                        .how-col-left { 
                            grid-column: 1; 
                        }
                        .how-col-right { 
                            grid-column: 3; 
                            margin-top: 180px; 
                        }
                        .how-image { 
                            grid-column: 2; 
                            height: 620px; 
                            margin-top: 30px;
                        }
                        .how-step-stagger-up {
                            margin-top: -20px;
                        }
                        .how-step-stagger-down {
                            margin-top: 20px;
                        }
                    }
                `}</style>

                {/* Header Row */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "40px",
                    marginBottom: "64px",
                    padding: "0 6vw"
                }}>
                    <div style={{ width: "100%", maxWidth: "350px" }}>
                        <div style={{ fontSize: 14, color: isDark ? "#888" : "#666", marginBottom: 8, transition: "color 0.3s" }}>(03)</div>
                        <h2 style={{ fontSize: 24, fontWeight: 600, color: isDark ? "#fff" : "#111", transition: "color 0.3s" }}>{t("howTitle") || "How It Works"}</h2>
                    </div>
                    <div style={{ width: "100%", maxWidth: "700px" }}>
                        <p style={{
                            fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)",
                            fontWeight: 500,
                            color: isDark ? "#fff" : "#111",
                            lineHeight: 1.4,
                            margin: 0,
                            transition: "color 0.3s"
                        }}>
                            {t("howDesc") || "Our streamlined, step-by-step process connects talented candidates with leading global opportunities effortlessly."}
                        </p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="how-grid">

                    {/* Left Column (Steps 1 & 2) */}
                    <div className="how-col-left">
                        {/* Step 1 */}
                        <div
                            className="how-step-stagger-up"
                            style={cardStyle}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div style={{ fontSize: "14px", fontStyle: "italic", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)", marginBottom: "16px" }}>
                                {steps[0].number}
                            </div>
                            <h3 style={{ fontSize: "20px", fontWeight: 600, color: isDark ? "#fff" : "#111", margin: "0 0 14px 0", letterSpacing: "-0.02em", transition: "color 0.3s" }}>{steps[0].title}</h3>
                            <p style={{ fontSize: "14px", color: isDark ? "#b4b4b8" : "#555", lineHeight: "1.65", margin: 0, transition: "color 0.3s" }}>{steps[0].description}</p>
                        </div>

                        {/* Step 2 */}
                        <div
                            className="how-step-stagger-down"
                            style={cardStyle}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div style={{ fontSize: "14px", fontStyle: "italic", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)", marginBottom: "16px" }}>
                                {steps[1].number}
                            </div>
                            <h3 style={{ fontSize: "20px", fontWeight: 600, color: isDark ? "#fff" : "#111", margin: "0 0 14px 0", letterSpacing: "-0.02em", transition: "color 0.3s" }}>{steps[1].title}</h3>
                            <p style={{ fontSize: "14px", color: isDark ? "#b4b4b8" : "#555", lineHeight: "1.65", margin: 0, transition: "color 0.3s" }}>{steps[1].description}</p>
                        </div>
                    </div>

                    {/* Middle Column (Tall Image Card) */}
                    <div
                        className="how-image"
                        style={{
                            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                        }}
                    >
                        <img
                            src={centerpieceImage}
                            alt="Process illustration"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.05)" }} />
                    </div>

                    {/* Right Column (Steps 3 & 4) */}
                    <div className="how-col-right">
                        {/* Step 3 */}
                        <div
                            className="how-step-stagger-up"
                            style={cardStyle}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div style={{ fontSize: "14px", fontStyle: "italic", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)", marginBottom: "16px" }}>
                                {steps[2].number}
                            </div>
                            <h3 style={{ fontSize: "20px", fontWeight: 600, color: isDark ? "#fff" : "#111", margin: "0 0 14px 0", letterSpacing: "-0.02em", transition: "color 0.3s" }}>{steps[2].title}</h3>
                            <p style={{ fontSize: "14px", color: isDark ? "#b4b4b8" : "#555", lineHeight: "1.65", margin: 0, transition: "color 0.3s" }}>{steps[2].description}</p>
                        </div>

                        {/* Step 4 */}
                        <div
                            className="how-step-stagger-down"
                            style={cardStyle}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div style={{ fontSize: "14px", fontStyle: "italic", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)", marginBottom: "16px" }}>
                                {steps[3].number}
                            </div>
                            <h3 style={{ fontSize: "20px", fontWeight: 600, color: isDark ? "#fff" : "#111", margin: "0 0 14px 0", letterSpacing: "-0.02em", transition: "color 0.3s" }}>{steps[3].title}</h3>
                            <p style={{ fontSize: "14px", color: isDark ? "#b4b4b8" : "#555", lineHeight: "1.65", margin: 0, transition: "color 0.3s" }}>{steps[3].description}</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export function DigitizationSection() {
    const { language } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const isFr = language === "fr";

    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = windowWidth < 1024;
    const isTablet = windowWidth < 768;

    const cardBg = isDark ? "#1c1c1e" : "#f5f5f7";
    const secondaryTextColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)";

    const s = {
        section: {
            padding: "100px 0",
            transition: "all 0.3s",
        },
        badgeContainer: {
            display: "flex",
            justifyContent: "center",
            marginBottom: 16
        },
        badge: {
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "6px 16px",
            borderRadius: "9999px",
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
            color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
        },
        title: {
            fontSize: "clamp(2.2rem, 3.5vw, 3rem)",
            fontWeight: 600,
            color: isDark ? "#fff" : "#111",
            letterSpacing: "-0.03em",
            textAlign: "center",
            marginBottom: 16,
            lineHeight: 1.15,
            transition: "color 0.3s"
        },
        subtitle: {
            fontSize: "clamp(1.05rem, 1.3vw, 1.2rem)",
            color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)",
            textAlign: "center",
            maxWidth: "700px",
            margin: "0 auto 64px",
            lineHeight: 1.5,
            padding: "0 24px",
            transition: "color 0.3s"
        },
        grid: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1.62fr",
            gap: "24px",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 6vw",
            boxSizing: "border-box"
        },
        // Card 1: Left Tall Card
        card1: {
            height: isMobile ? "auto" : "640px",
            background: cardBg,
            borderRadius: "32px",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "32px",
            boxSizing: "border-box",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            overflow: "hidden"
        },
        imageContainer1: {
            background: isDark ? "#2c2c2e" : "#ffffff",
            borderRadius: "24px",
            padding: "36px",
            height: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            overflow: "hidden",
            position: "relative"
        },
        // Right side layout
        rightCol: {
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            height: isMobile ? "auto" : "640px"
        },
        row1: {
            display: "grid",
            gridTemplateColumns: isTablet ? "1fr" : "1.2fr 0.8fr",
            gap: "24px",
            flex: 1
        },
        // Card 2: Top Left Inset Card
        card2: {
            background: cardBg,
            borderRadius: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            overflow: "hidden"
        },
        image2: {
            width: "100%",
            height: "160px",
            objectFit: "cover",
            borderRadius: "32px 32px 0 0",
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
        },
        textBlock2: {
            padding: "24px 32px 32px 32px",
            boxSizing: "border-box"
        },
        // Card 3: Top Right Stat Card
        card3: {
            background: cardBg,
            borderRadius: "32px",
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        },
        // Card 4: Bottom Wide Card
        card4: {
            background: cardBg,
            borderRadius: "32px",
            flex: 1,
            display: "grid",
            gridTemplateColumns: isTablet ? "1fr" : "1.2fr 1fr",
            gap: "0px",
            boxSizing: "border-box",
            overflow: "hidden",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        },
        textBlock4: {
            padding: "40px",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box"
        },
        image4: {
            width: "100%",
            height: isTablet ? "200px" : "100%",
            objectFit: "cover",
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            borderRadius: isTablet ? "0 0 32px 32px" : "0 32px 32px 0",
        }
    };

    const handleMouseEnterCard = (e) => {
        const img = e.currentTarget.querySelector(".flush-image");
        if (img) {
            img.style.transform = "scale(1.015)";
        }
    };

    const handleMouseLeaveCard = (e) => {
        const img = e.currentTarget.querySelector(".flush-image");
        if (img) {
            img.style.transform = "scale(1)";
        }
    };

    // Text translations
    const badgeText = "INNOVATION";
    const titleText = isFr ? "Pourquoi les leaders choisissent Internia" : "Why modern teams choose Internia";
    const subtitleText = isFr
        ? "Une vitesse exceptionnelle et une automatisation de pointe qui établissent la norme pour la gestion des stages."
        : "Exceptional speed and unparalleled automation that set the standard for digital internship ecosystems.";

    // Card 1
    const card1Title = isFr
        ? "Technologie OCR intelligente pour numériser instantanément les CV et dossiers des étudiants."
        : "Intelligent OCR technology to instantly digitize student CVs and academic files.";
    const card1Btn = isFr ? "Essayer le scanner" : "Explore OCR Scanner";

    // Card 2
    const card2TitleMain = isFr ? "Automatisez les conventions" : "Automate administrative agreements";
    const card2TitleSub = isFr ? " en toute sécurité et en temps réel." : " securely and in real-time.";

    // Card 3
    const card3Stat = "10x";
    const card3Desc = isFr
        ? "Validation et traitement des stages dix fois plus rapides."
        : "Faster internship validation and processing speeds.";

    // Card 4
    const card4TitleMain = isFr ? "Plusieurs tableaux de bord" : "Multiple dedicated dashboards";
    const card4TitleSub = isFr
        ? " pour les étudiants, entreprises et universités afin de suivre la progression."
        : " for students, companies, and universities to track progress seamlessly.";

    return (
        <section style={s.section}>
            {/* Split Asymmetrical Header (Consistent with the rest of the page) */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "40px",
                marginBottom: "64px",
                padding: "0 6vw",
                maxWidth: "1400px",
                margin: "0 auto 64px auto",
                boxSizing: "border-box"
            }}>
                <div style={{ width: "100%", maxWidth: "350px" }}>
                    <div style={{ fontSize: 14, color: isDark ? "#888" : "#666", marginBottom: 8, transition: "color 0.3s" }}>(04)</div>
                    <h2 style={{ fontSize: 24, fontWeight: 600, color: isDark ? "#fff" : "#111", transition: "color 0.3s" }}>
                        {isFr ? "Innovation" : "Innovation"}
                    </h2>
                </div>
                <div style={{ width: "100%", maxWidth: "700px" }}>
                    <p style={{
                        fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)",
                        fontWeight: 500,
                        color: isDark ? "#fff" : "#111",
                        lineHeight: 1.4,
                        margin: 0,
                        transition: "color 0.3s"
                    }}>
                        {subtitleText}
                    </p>
                </div>
            </div>

            <div style={s.grid}>
                {/* Card 1 (Left Tall Card) */}
                <div
                    style={s.card1}
                    onMouseEnter={handleMouseEnterCard}
                    onMouseLeave={handleMouseLeaveCard}
                >
                    <div style={s.imageContainer1}>
                        <img
                            className="flush-image"
                            src={cvImage}
                            alt="Student CV Digitization"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                filter: isDark ? "brightness(0.9) invert(0.05)" : "none",
                                transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <h3 style={{
                            fontSize: "clamp(1.35rem, 1.8vw, 1.6rem)",
                            fontWeight: 600,
                            color: isDark ? "#fff" : "#111",
                            lineHeight: 1.25,
                            margin: 0,
                            letterSpacing: "-0.03em"
                        }}>
                            {card1Title}
                        </h3>

                        <Link to="/register" style={{ textDecoration: "none" }}>
                            <button
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: isDark ? "#fff" : "#111",
                                    color: isDark ? "#111" : "#fff",
                                    border: "none",
                                    borderRadius: "9999px",
                                    padding: "6px 6px 6px 24px",
                                    width: "100%",
                                    maxWidth: "250px",
                                    cursor: "pointer",
                                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.opacity = "0.9";
                                    const arrow = e.currentTarget.querySelector(".arrow-circle");
                                    if (arrow) arrow.style.transform = "scale(1.06)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.opacity = "1";
                                    const arrow = e.currentTarget.querySelector(".arrow-circle");
                                    if (arrow) arrow.style.transform = "scale(1)";
                                }}
                            >
                                <span style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
                                }}>
                                    {card1Btn}
                                </span>
                                <div
                                    className="arrow-circle"
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: "50%",
                                        background: isDark ? "#111" : "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                                    }}
                                >
                                    <ArrowRight
                                        size={16}
                                        style={{
                                            transform: "rotate(-45deg)",
                                            color: isDark ? "#fff" : "#111",
                                            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                                        }}
                                    />
                                </div>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Right Column Grid */}
                <div style={s.rightCol}>
                    {/* Row 1 (Card 2 & Card 3) */}
                    <div style={s.row1}>
                        {/* Card 2: Admin Agreements (Flush top, left, right) */}
                        <div
                            style={s.card2}
                            onMouseEnter={handleMouseEnterCard}
                            onMouseLeave={handleMouseLeaveCard}
                        >
                            <img
                                className="flush-image"
                                src={adminAgreementImage}
                                alt="Admin Agreements automation"
                                style={s.image2}
                            />
                            <div style={s.textBlock2}>
                                <h3 style={{
                                    fontSize: "clamp(1.2rem, 1.6vw, 1.45rem)",
                                    fontWeight: 600,
                                    color: isDark ? "#fff" : "#111",
                                    lineHeight: 1.25,
                                    margin: 0,
                                    letterSpacing: "-0.03em"
                                }}>
                                    {card2TitleMain}
                                    <span style={{ color: secondaryTextColor, fontWeight: 500 }}>
                                        {card2TitleSub}
                                    </span>
                                </h3>
                            </div>
                        </div>

                        {/* Card 3: 10x Speed Stat Card (Flush speed dial bottom right) */}
                        <div
                            style={s.card3}
                            onMouseEnter={e => {
                                const dial = e.currentTarget.querySelector(".speed-dial");
                                if (dial) dial.style.transform = "scale(1.02) rotate(2deg)";
                            }}
                            onMouseLeave={e => {
                                const dial = e.currentTarget.querySelector(".speed-dial");
                                if (dial) dial.style.transform = "scale(1) rotate(0)";
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <span style={{
                                    fontSize: "clamp(3.8rem, 5.5vw, 4.8rem)",
                                    fontWeight: 600,
                                    color: isDark ? "#fff" : "#111",
                                    letterSpacing: "-0.05em",
                                    lineHeight: 1
                                }}>
                                    {card3Stat}
                                </span>
                            </div>

                            {/* Absolute speed speedometer dial (flush bottom-right corner) */}
                            <div
                                className="speed-dial"
                                style={{
                                    position: "absolute",
                                    bottom: "-15px",
                                    right: "-15px",
                                    width: "150px",
                                    height: "150px",
                                    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                                    pointerEvents: "none"
                                }}
                            >
                                <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="50" r="40" stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"} strokeWidth="6" />
                                    <path d="M20 70 A 35 35 0 1 1 80 70" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"} strokeWidth="6" strokeLinecap="round" />
                                    <path d="M20 70 A 35 35 0 1 1 72 40" stroke={isDark ? "url(#speedGrad3Dark)" : "url(#speedGrad3Light)"} strokeWidth="6" strokeLinecap="round" />
                                    <circle cx="50" cy="50" r="4" fill="#e53e3e" />
                                    <line x1="50" y1="50" x2="68" y2="32" stroke="#e53e3e" strokeWidth="3" strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="speedGrad3Dark" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="#e53e3e" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#ff4d4d" />
                                        </linearGradient>
                                        <linearGradient id="speedGrad3Light" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="#e53e3e" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#ff2a2a" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            <p style={{
                                fontSize: 13,
                                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                                lineHeight: 1.45,
                                margin: 0,
                                fontWeight: 500,
                                maxWidth: "180px",
                                marginTop: "auto"
                            }}>
                                {card3Desc}
                            </p>
                        </div>
                    </div>

                    {/* Row 2 (Card 4 Wide Card - Flush right, top, bottom) */}
                    <div
                        style={s.card4}
                        onMouseEnter={handleMouseEnterCard}
                        onMouseLeave={handleMouseLeaveCard}
                    >
                        <div style={s.textBlock4}>
                            <h3 style={{
                                fontSize: "clamp(1.25rem, 1.8vw, 1.5rem)",
                                fontWeight: 600,
                                color: isDark ? "#fff" : "#111",
                                lineHeight: 1.3,
                                margin: 0,
                                letterSpacing: "-0.03em"
                            }}>
                                {card4TitleMain}
                                <span style={{ color: secondaryTextColor, fontWeight: 500 }}>
                                    {card4TitleSub}
                                </span>
                            </h3>
                        </div>

                        <img
                            className="flush-image"
                            src={employmentHistoryImage}
                            alt="Multiple Dashboards for users"
                            style={s.image4}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function TestimonialsSection() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth < 1024;
    const FONT = "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

    const testimonials = [
        {
            quote: "Internia completely transformed our workflow! The AI recommendations are spot-on, and I've discovered features I never would have found otherwise.",
            name: "Emma Rodriguez",
            role: "University Coordinator"
        },
        {
            quote: "Finally, a platform that truly understands our ecosystem. The personalized tracking saves me hours of processing and always delivers amazing results.",
            name: "Sarah Chen",
            role: "HR Director"
        },
        {
            quote: "The quality of automation is incredible. Every internship I've managed through Internia has become a seamless staple in my daily routine.",
            name: "Maria Santos",
            role: "Academic Advisor"
        },
        {
            quote: "Internia's platform knows my needs better than I do! It's like having a personal assistant who's always available and never misses the mark.",
            name: "Jessica Park",
            role: "Student Intern"
        }
    ];

    const avatarImages = [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop"
    ];

    return (
        <section style={{ padding: "120px 0 160px 0", fontFamily: FONT }}>
            <div style={{ textAlign: "center", marginBottom: "72px", padding: "0 6vw" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
                    <span style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "8px 24px",
                        borderRadius: "9999px",
                        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                        color: isDark ? "rgba(255,255,255,0.6)" : "#777",
                    }}>
                        TESTIMONIALS
                    </span>
                </div>
                <h2 style={{
                    fontSize: "clamp(2.4rem, 4vw, 3.2rem)",
                    fontWeight: 500,
                    color: isDark ? "#fff" : "#222",
                    letterSpacing: "-0.03em",
                    marginBottom: "20px"
                }}>
                    What our clients say
                </h2>
                <p style={{
                    fontSize: "16px",
                    color: isDark ? "rgba(255,255,255,0.6)" : "#666",
                    maxWidth: "600px",
                    margin: "0 auto",
                    lineHeight: 1.6
                }}>
                    Hear from industry leaders who trust Internia for their most important moments
                </p>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gap: "24px",
                padding: "0 6vw",
                maxWidth: "1400px",
                margin: "0 auto"
            }}>
                {testimonials.map((t, idx) => (
                    <div key={idx} style={{
                        background: isDark ? "#1c1c1e" : "#EFEFEF",
                        borderRadius: "24px",
                        padding: "48px 32px 32px 32px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: "360px",
                    }}>
                        <p style={{
                            fontSize: "15px",
                            lineHeight: "1.7",
                            color: isDark ? "rgba(255,255,255,0.7)" : "#555",
                            fontWeight: 400,
                            margin: 0
                        }}>
                            "{t.quote}"
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "40px" }}>
                            <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                background: "#ddd",
                                flexShrink: 0
                            }}>
                                <img src={avatarImages[idx]} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: 700, color: isDark ? "#fff" : "#111", margin: "0 0 2px 0" }}>{t.name}</div>
                                <div style={{ fontSize: "13px", color: isDark ? "rgba(255,255,255,0.5)" : "#777", margin: 0 }}>{t.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation buttons below */}
            <div style={{ display: "flex", gap: "16px", padding: "0 6vw", maxWidth: "1400px", margin: "64px auto 0 auto" }}>
                <button style={{
                    width: "44px", height: "44px", borderRadius: "50%",
                    border: "none", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                    color: isDark ? "#fff" : "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s"
                }} onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.09)"} onMouseLeave={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}>
                    <ChevronLeft size={18} />
                </button>
                <button style={{
                    width: "44px", height: "44px", borderRadius: "50%",
                    border: "none", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                    color: isDark ? "#fff" : "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s"
                }} onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.09)"} onMouseLeave={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}>
                    <ChevronRight size={18} />
                </button>
            </div>
        </section>
    );
}

function Home() {
    const location = useLocation();
    const [userInfo, setUserInfo] = useState(null);
    const [activeFeature, setActiveFeature] = useState(0);
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    const { t } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

    const heroSlides = [
        googleInternshipImage,
        microsoftInternshipImage,
        nvidiaInternshipImage,
        nasaInternshipImage,
        ooredooInternshipImage
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroSlide(prev => (prev + 1) % heroSlides.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [heroSlides.length]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const isMobile = windowWidth <= 992;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (token) { const res = await api.get('/auth/profile/'); setUserInfo(res.data); }
            } catch (e) { console.error(e); }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const id = location.hash?.replace('#', '');
        if (!id) return;
        setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }, [location]);

    return (
        <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", background: isDark ? "#161618" : "#f8f9fa", color: isDark ? "#fff" : "#111", minHeight: "100vh", transition: "background 0.3s, color 0.3s" }}>

            {/* ── HERO ── */}
            <div style={{ padding: "16px", height: "100vh", boxSizing: "border-box" }}>
                <div style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: "32px",
                    overflow: "hidden",
                    background: "#222"
                }}>
                    {/* Background Image */}
                    <img
                        src={heroImage}
                        alt="Background"
                        style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
                    />

                    {/* Dark Overlay Gradient (Always Dark) */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                        background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.4) 100%)"
                    }} />


                    {/* Hero Content Grid */}
                    <div style={{
                        position: "absolute", bottom: "10%", left: "4vw", right: "4vw",
                        display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "40px"
                    }}>

                        {/* Left Title & Tags */}
                        <div style={{ maxWidth: 650 }}>
                            <h1 style={{
                                color: "#fff",
                                fontSize: "clamp(3rem, 5vw, 4.5rem)",
                                fontWeight: 600,
                                lineHeight: 1.1,
                                marginBottom: 16,
                                letterSpacing: "-0.02em"
                            }}>
                                {t("heroTitle1") || "Your haven"}<br />{t("heroTitle2") || "away from the bustle"}
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 40, maxWidth: 450 }}>
                                {t("heroDesc") || "Find internships that match your ambitions."}
                            </p>

                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                {[
                                    "Top Companies",
                                    "Global Reach",
                                    "Career Growth",
                                    "Innovation"
                                ].map(tag => (
                                    <div key={tag} style={{
                                        background: "rgba(255,255,255,0.15)",
                                        backdropFilter: "blur(12px)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        padding: "10px 20px",
                                        borderRadius: 9999,
                                        color: "#fff",
                                        fontSize: 14,
                                        fontWeight: 500,
                                        transition: "all 0.3s ease"
                                    }}>
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side Info (Slider & Glass Card) */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 340 }}>

                            {/* Functional Slider */}
                            <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#fff", fontSize: 12, fontWeight: 600 }}>
                                <span>{String(currentHeroSlide + 1).padStart(2, '0')}</span>
                                <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.2)", position: "relative" }}>
                                    <div style={{
                                        position: "absolute", left: 0, top: 0, height: "100%",
                                        width: `${((currentHeroSlide + 1) / heroSlides.length) * 100}%`,
                                        background: "#fff", borderRadius: 99,
                                        transition: "width 0.5s ease-in-out"
                                    }} />
                                </div>
                                <span>{String(heroSlides.length).padStart(2, '0')}</span>
                            </div>

                            {/* Glass Card */}
                            <div style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)",
                                backdropFilter: "saturate(200%) blur(32px)",
                                WebkitBackdropFilter: "saturate(200%) blur(32px)",
                                border: "1px solid rgba(255,255,255,0.3)",
                                boxShadow: "0 32px 64px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.6), inset -1px -1px 2px rgba(0,0,0,0.1)",
                                padding: "8px",
                                borderRadius: "24px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                                transition: "all 0.3s ease"
                            }}>
                                <img src={heroSlides[currentHeroSlide]} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: "16px", transition: "opacity 0.3s" }} />
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 8px 8px" }}>
                                    <div style={{ color: "#fff" }}>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>Browse Internships</div>
                                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>For ambitious students</div>
                                    </div>
                                    <Link to="/internships">
                                        <button style={{
                                            width: 44, height: 44, borderRadius: "50%",
                                            background: "#fff", color: "#111",
                                            border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                                            cursor: "pointer",
                                            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                                        }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.opacity = "0.9";
                                                const icon = e.currentTarget.querySelector("svg");
                                                if (icon) icon.style.transform = "rotate(-45deg) scale(1.1)";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.opacity = "1";
                                                const icon = e.currentTarget.querySelector("svg");
                                                if (icon) icon.style.transform = "rotate(-45deg) scale(1)";
                                            }}
                                        >
                                            <ArrowRight size={20} style={{ transform: "rotate(-45deg)", transition: "transform 0.3s ease" }} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Content Container matching Dark/Light Theme */}
            <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gap: "120px", padding: "80px 0" }}>

                {/* ── ABOUT / MISSION SECTION (New based on image) ── */}
                <section className="px-6 md:px-12 lg:px-[6vw]" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "40px" }}>
                    <div style={{ width: "100%", maxWidth: "350px" }}>
                        <div style={{ fontSize: 14, color: isDark ? "#888" : "#666", marginBottom: 8, transition: "color 0.3s" }}>(01)</div>
                        <h2 style={{ fontSize: 24, fontWeight: 600, color: isDark ? "#fff" : "#111", transition: "color 0.3s" }}>{t("navAbout") || "About us"}</h2>

                        <div style={{ marginTop: 120, maxWidth: 400 }}>
                            <p style={{ fontSize: 14, color: isDark ? "#fff" : "#111", fontWeight: 600, marginBottom: 12, transition: "color 0.3s" }}>Welcome to Internia!</p>
                            <p style={{ fontSize: 14, color: isDark ? "#aaa" : "#555", lineHeight: 1.7, transition: "color 0.3s" }}>
                                We provide a unique opportunity to find the perfect internship. Our platform connects students with top companies, offering ideal conditions for those seeking growth and professional development.
                            </p>
                        </div>
                    </div>
                    <div style={{ width: "100%", maxWidth: "700px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <p style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", fontWeight: 500, color: isDark ? "#fff" : "#111", lineHeight: 1.3, maxWidth: 700, transition: "color 0.3s" }}>
                            Our mission is to create the ideal conditions for internships, where every student can enjoy growth, clean code, and picturesque career landscapes.
                        </p>
                        <div style={{ display: "flex", alignItems: "center", marginTop: 60 }}>
                            <Link to="/about" style={{ textDecoration: "none" }}>
                                <button style={{
                                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                                    backdropFilter: "blur(12px)",
                                    border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.08)",
                                    color: isDark ? "#fff" : "#111",
                                    borderRadius: 9999,
                                    padding: "6px 6px 6px 28px",
                                    fontSize: 15,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 20,
                                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                    boxSizing: "border-box"
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
                                        const icon = e.currentTarget.querySelector(".about-arrow-circle");
                                        if (icon) icon.style.transform = "scale(1.05)";
                                        const svg = e.currentTarget.querySelector("svg");
                                        if (svg) svg.style.transform = "rotate(-45deg) scale(1.1)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
                                        const icon = e.currentTarget.querySelector(".about-arrow-circle");
                                        if (icon) icon.style.transform = "scale(1)";
                                        const svg = e.currentTarget.querySelector("svg");
                                        if (svg) svg.style.transform = "rotate(-45deg) scale(1)";
                                    }}
                                >
                                    <span>{t("learnMore") || "Learn more"}</span>
                                    <div
                                        className="about-arrow-circle"
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "50%",
                                            background: isDark ? "#fff" : "#111",
                                            color: isDark ? "#111" : "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                                        }}
                                    >
                                        <ArrowRight size={16} style={{ transform: "rotate(-45deg)", transition: "transform 0.3s ease" }} />
                                    </div>
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── HIGHLIGHTS SECTION (Based on user image) ── */}
                <section className="px-6 md:px-12 lg:px-[6vw]">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>

                        {/* Left Card - Features/Awards list */}
                        <div style={{
                            background: "#D4E4FC",
                            borderRadius: "40px",
                            padding: "64px 48px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            border: "none",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
                            transition: "all 0.3s ease"
                        }}>
                            <h2 style={{ fontSize: "clamp(1.8rem, 2.5vw, 2.2rem)", fontWeight: 600, color: "#111", lineHeight: 1.2, marginBottom: "48px", maxWidth: "80%" }}>
                                {t("featuresTitle") || "Everything you need to succeed in one place."}
                            </h2>

                            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                                {[
                                    { icon: Award, title: "Smart Matching", desc: "We made an advanced AI that helps students find tailored internships perfectly suited for them." },
                                    { icon: TrendingUp, title: "Document Generation", desc: "No more paperwork corvée! Instantly generate, sign, and manage all your internship agreements." },
                                    { icon: Target, title: "User Dashboards", desc: "We designed dedicated, personalized dashboards for everyone: students, universities, and companies." }
                                ].map((item, i) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <div key={i} style={{ display: "flex", gap: "20px" }}>
                                            <div style={{ color: "#111", marginTop: "4px" }}>
                                                <IconComponent size={20} strokeWidth={2} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111", marginBottom: "8px" }}>{item.title}</h3>
                                                <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.6 }}>{item.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Card - Image */}
                        <div style={{
                            borderRadius: "40px",
                            overflow: "hidden",
                            minHeight: "500px",
                            position: "relative"
                        }}>
                            <img
                                src={featureBg}
                                alt="Feature highlight"
                                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>

                    </div>
                </section>

                {/* ── SECONDARY TEXT SECTION (02) ── */}
                <section id="internships" className="px-6 md:px-12 lg:px-[6vw]" style={{ transition: "all 0.3s", marginBottom: "80px" }}>

                    {/* Header Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "40px", marginBottom: "48px" }}>
                        <div style={{ width: "100%", maxWidth: "350px" }}>
                            <div style={{ fontSize: 14, color: isDark ? "#888" : "#666", marginBottom: 8, transition: "color 0.3s" }}>(02)</div>
                            <h2 style={{ fontSize: 24, fontWeight: 600, color: isDark ? "#fff" : "#111", transition: "color 0.3s" }}>{t("navInternships") || "Internships"}</h2>

                            <p style={{
                                fontSize: "14px",
                                color: isDark ? "#888" : "#666",
                                lineHeight: "1.6",
                                marginTop: "24px",
                                transition: "color 0.3s",
                                maxWidth: "320px"
                            }}>
                                {t("internshipDescShort") || "Explore our premium, curated tracks. From cutting-edge artificial intelligence to life-saving clinical research, our platform offers tailored matching, expert guidance, and unified digital tracking to guarantee a successful career launch."}
                            </p>
                        </div>
                        <div style={{ width: "100%", maxWidth: "700px" }}>
                            <p style={{ fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)", fontWeight: 500, color: isDark ? "#fff" : "#111", lineHeight: 1.4, transition: "color 0.3s", margin: 0 }}>
                                Every morning you will wake up to the sound of new opportunities and enjoy the view of perfectly matched internships and picturesque career landscapes.
                            </p>
                        </div>
                    </div>

                    {/* Visual Grid Layout */}
                    {(() => {
                        const internshipTracks = [
                            {
                                id: 1,
                                title: t("trackTechTitle") || "Software & Tech",
                                pillText: t("trackTechPill") || "100+ Opportunities",
                                image: intern4,
                                icon: Brain,
                                isTall: true
                            },
                            {
                                id: 2,
                                title: t("trackDesignTitle") || "UI/UX & Product",
                                pillText: t("trackDesignPill") || "40+ Opportunities",
                                image: uiux_intern,
                                icon: Star,
                                isTall: false
                            },
                            {
                                id: 3,
                                title: t("trackMedicalTitle") || "Healthcare & Biotech",
                                pillText: t("trackMedicalPill") || "25+ Opportunities",
                                image: interns5,
                                icon: GraduationCap,
                                isTall: false
                            },
                            {
                                id: 4,
                                title: t("trackScienceTitle") || "Research & Lab",
                                pillText: t("trackSciencePill") || "30+ Opportunities",
                                image: intern3,
                                icon: Brain,
                                isTall: false
                            },
                            {
                                id: 5,
                                title: t("trackBusinessTitle") || "Management & Finance",
                                pillText: t("trackBusinessPill") || "50+ Opportunities",
                                image: intern2,
                                icon: BarChart3,
                                isTall: false
                            }
                        ];

                        const renderTrackCard = (track) => {
                            const IconComponent = track.icon;
                            return (
                                <div
                                    key={track.id}
                                    style={{
                                        position: "relative",
                                        borderRadius: "32px",
                                        overflow: "hidden",
                                        height: isMobile ? "280px" : (track.isTall ? "560px" : "268px"),
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={e => {
                                        const img = e.currentTarget.querySelector("img");
                                        if (img) img.style.transform = "scale(1.03)";
                                    }}
                                    onMouseLeave={e => {
                                        const img = e.currentTarget.querySelector("img");
                                        if (img) img.style.transform = "scale(1)";
                                    }}
                                >
                                    {/* Background Image */}
                                    <img
                                        src={track.image}
                                        alt={track.title}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                                            transform: "scale(1)"
                                        }}
                                    />

                                    {/* Dark Vignette Overlay */}
                                    <div style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.65) 100%)",
                                    }} />

                                    {/* Top Pill (Left-aligned) */}
                                    <div style={{
                                        position: "absolute",
                                        top: "20px",
                                        left: "20px",
                                        background: isDark ? "rgba(0, 0, 0, 0.65)" : "rgba(255, 255, 255, 0.85)",
                                        backdropFilter: "blur(12px)",
                                        border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.05)",
                                        color: isDark ? "#fff" : "#111",
                                        padding: "6px 14px",
                                        borderRadius: "999px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        transition: "background 0.3s, color 0.3s"
                                    }}>
                                        <IconComponent size={13} style={{ opacity: 0.8 }} />
                                        <span>{track.pillText}</span>
                                    </div>

                                    {/* Bottom Capsule Button */}
                                    <div style={{
                                        position: "absolute",
                                        bottom: "20px",
                                        left: "20px",
                                        right: "20px",
                                        background: "rgba(255, 255, 255, 0.15)",
                                        backdropFilter: "blur(20px)",
                                        border: "1px solid rgba(255, 255, 255, 0.2)",
                                        borderRadius: "999px",
                                        padding: "6px 6px 6px 16px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        color: "#fff",
                                        boxSizing: "border-box"
                                    }}>
                                        <span style={{ fontSize: "13px", fontWeight: "600", letterSpacing: "-0.01em" }}>{track.title}</span>
                                        <div style={{
                                            background: "#fff",
                                            color: "#111",
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "transform 0.3s"
                                        }}>
                                            <ArrowRight size={14} style={{ transform: "rotate(-45deg)" }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        };

                        if (isMobile) {
                            return (
                                <div style={{
                                    marginTop: "48px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "20px",
                                    width: "100%"
                                }}>
                                    {internshipTracks.map(track => renderTrackCard(track))}
                                </div>
                            );
                        }

                        return (
                            <div style={{
                                marginTop: "64px",
                                display: "grid",
                                gridTemplateColumns: "1.1fr 1.9fr",
                                gap: "24px",
                                width: "100%",
                                boxSizing: "border-box"
                            }}>
                                {/* Column 1 (Left Tall Card) */}
                                {renderTrackCard(internshipTracks[0])}

                                {/* Column 2 (Right Stacked Cards Grid) */}
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "24px"
                                }}>
                                    {/* Sub-column 1: Card 2 & Card 4 */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                        {renderTrackCard(internshipTracks[1])}
                                        {renderTrackCard(internshipTracks[3])}
                                    </div>

                                    {/* Sub-column 2: Card 3 & Card 5 */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                        {renderTrackCard(internshipTracks[2])}
                                        {renderTrackCard(internshipTracks[4])}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </section>


                {/* ── HOW IT WORKS ── */}
                <HowItWorksSection />

                {/* ── DIGITIZATION & OCR SECTION ── */}
                <DigitizationSection />

                {/* ── TESTIMONIALS SECTION ── */}
                <TestimonialsSection />

                {/* ── FINAL CTA ── */}
                <section className="px-6 md:px-12 lg:px-[6vw]">
                    <div style={{
                        background: isDark ? "#e1e1e6" : "#111",
                        borderRadius: 32,
                        padding: "72px 56px",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 32,
                        border: "none",
                        boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.15)" : "none",
                        transition: "all 0.3s ease"
                    }}>
                        <div style={{ maxWidth: 500 }}>
                            <h2 style={{ fontSize: "clamp(2rem,3vw,2.5rem)", fontWeight: 600, color: isDark ? "#111" : "#fff", letterSpacing: "-0.03em", marginBottom: 16, transition: "color 0.3s" }}>{t("ctaTitle")}</h2>
                            <p style={{ fontSize: 16, color: isDark ? "#444" : "#aaa", lineHeight: 1.7, transition: "color 0.3s" }}>{t("ctaDesc")}</p>
                        </div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            <Link to={userInfo ? "#" : "/register"} style={{ textDecoration: "none" }} onClick={e => userInfo && e.preventDefault()}>
                                <button style={{
                                    display: "inline-flex", alignItems: "center", gap: 12,
                                    background: isDark ? "#111" : "#fff", color: isDark ? "#fff" : "#111",
                                    border: "none", borderRadius: 9999,
                                    padding: "16px 32px", fontSize: 15, fontWeight: 600, cursor: userInfo ? "not-allowed" : "pointer",
                                    opacity: userInfo ? 0.4 : 1,
                                    transition: "opacity 0.2s",
                                }}
                                    onMouseEnter={e => {
                                        if (userInfo) return;
                                        e.currentTarget.style.opacity = "0.9";
                                    }}
                                    onMouseLeave={e => {
                                        if (userInfo) return;
                                        e.currentTarget.style.opacity = "1";
                                    }}
                                >
                                    {userInfo ? t("accountActive") : t("createAccount")} <ArrowRight size={18} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── EMBEDDED FOOTER ── */}
                <footer style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    background: "transparent",
                    color: isDark ? "#fff" : "#111",
                    padding: "80px 6vw 40px",
                    marginTop: "60px"
                }}>
                    <div style={{ maxWidth: 1400, margin: "0 auto" }}>

                        {/* Top Section */}
                        <div style={{
                            display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "40px", marginBottom: "64px"
                        }}>
                            <div>
                                <div style={{ fontSize: "14px", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", marginBottom: "12px" }}>(06)</div>
                                <div style={{ fontSize: "18px", fontWeight: 500 }}>Platform Resources</div>

                                <p style={{ fontSize: "14px", color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", lineHeight: 1.6, maxWidth: "400px", marginTop: "24px" }}>
                                    Empower your career with top-tier internships.<br />
                                    Our matching process is simple and transparent.<br />
                                    Find the perfect opportunity in minutes.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: "clamp(1.4rem, 2vw, 2rem)", fontWeight: 500, lineHeight: 1.4, maxWidth: "600px", color: isDark ? "#fff" : "#111" }}>
                                    Give your career the ultimate boost<br />
                                    with tailored opportunities in an<br />
                                    environment of growth and innovation.
                                </h3>
                            </div>
                        </div>

                        {/* Cards Section */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "80px"
                        }}>
                            {/* Card 1 */}
                            <div style={{
                                background: "#E8F0FE", borderRadius: "24px", padding: "32px", color: "#111", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "260px", position: "relative", overflow: "hidden"
                            }}>
                                <div>
                                    <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>01</div>
                                    <h4 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "24px", letterSpacing: "-0.02em" }}>Student Reviews</h4>
                                    <div style={{ display: "flex", alignItems: "center", gap: "-8px", marginTop: "16px" }}>
                                        {[
                                            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
                                            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
                                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop"
                                        ].map((src, i) => (
                                            <img key={i} src={src} style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #E8F0FE", marginLeft: i > 0 ? -12 : 0, objectFit: "cover", zIndex: 10 - i }} />
                                        ))}
                                    </div>
                                </div>
                                <p style={{ fontSize: "14px", color: "rgba(0,0,0,0.5)", marginTop: "32px", maxWidth: "160px", lineHeight: 1.4, fontWeight: 500 }}>
                                    Over 10,000+ satisfied interns placed.
                                </p>
                                <button style={{ position: "absolute", bottom: "32px", right: "32px", width: "44px", height: "44px", background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#111", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                                    <ArrowUpRight size={20} />
                                </button>
                            </div>

                            {/* Card 2 */}
                            <div style={{
                                background: "#D4E4FC", borderRadius: "24px", padding: "32px", color: "#111", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "260px", position: "relative", overflow: "hidden"
                            }}>
                                <div style={{ position: "relative", zIndex: 2 }}>
                                    <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>02</div>
                                    <h4 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "24px", letterSpacing: "-0.02em" }}>Corporate Partners</h4>
                                </div>
                                <p style={{ position: "relative", zIndex: 2, fontSize: "14px", color: "rgba(0,0,0,0.5)", marginTop: "auto", maxWidth: "200px", fontWeight: 500 }}>
                                    Join the ranks of Google, Microsoft, and Nvidia.
                                </p>
                                <button style={{ position: "absolute", bottom: "32px", right: "32px", width: "44px", height: "44px", background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#111", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", zIndex: 5, transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                                    <ArrowUpRight size={20} />
                                </button>
                                {/* Background texture simulation */}
                                <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "250px", height: "250px", background: "radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
                            </div>

                            {/* Card 3 */}
                            <div style={{
                                background: "#E8F0FE", borderRadius: "24px", padding: "32px", color: "#111", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "260px", position: "relative", overflow: "hidden"
                            }}>
                                <div>
                                    <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>03</div>
                                    <h4 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "24px", letterSpacing: "-0.02em" }}>Platform Features</h4>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "24px" }}>
                                        {["Smart Match AI", "Automated Agreements", "Live Tracking", "Dashboard Analytics"].map((item, i) => (
                                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "14px" }}>
                                                <span style={{ fontSize: "15px", fontWeight: 500, color: "rgba(0,0,0,0.7)" }}>{item}</span>
                                                <ArrowUpRight size={16} color="rgba(0,0,0,0.4)" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "40px", paddingTop: "60px", borderTop: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)"
                        }}>
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                                <h2 style={{ fontSize: "clamp(3.5rem, 7vw, 6rem)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: isDark ? "#fff" : "#111", margin: 0 }}>Internia</h2>
                                <div style={{ fontSize: "14px", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", marginTop: "40px" }}>
                                    © 2024 Internia. All rights reserved.
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "24px" }}>
                                <div style={{
                                    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: "24px", padding: "32px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 64px"
                                }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <Link to="/about" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = isDark ? "#fff" : "#111"} onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}>About us</Link>
                                        <Link to="/internships" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = isDark ? "#fff" : "#111"} onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}>Browse</Link>
                                        <Link to="/companies" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = isDark ? "#fff" : "#111"} onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}>Companies</Link>
                                        <Link to="/faq" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = isDark ? "#fff" : "#111"} onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}>FAQ</Link>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <Link to="/reviews" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = isDark ? "#fff" : "#111"} onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}>Reviews</Link>
                                        <Link to="/privacy" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = isDark ? "#fff" : "#111"} onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}>Privacy Policy</Link>
                                        <Link to="/terms" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = isDark ? "#fff" : "#111"} onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}>Terms</Link>
                                        <Link to="/contact" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = isDark ? "#fff" : "#111"} onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}>Contact</Link>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "16px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", padding: "16px 24px", borderRadius: "99px", fontSize: "14px", color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                                    <span style={{ marginRight: "16px", fontWeight: 500 }}>Follow us</span>
                                    <a href="#" style={{ color: isDark ? "#fff" : "#111", textDecoration: "none", fontWeight: 600, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>IG</a>
                                    <a href="#" style={{ color: isDark ? "#fff" : "#111", textDecoration: "none", fontWeight: 600, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>X</a>
                                    <a href="#" style={{ color: isDark ? "#fff" : "#111", textDecoration: "none", fontWeight: 600, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>IN</a>
                                </div>
                            </div>
                        </div>

                    </div>
                </footer>

            </div>
        </div>
    );
}

export default Home;
