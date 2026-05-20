import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Heart,
  Mail,
  MapPin,
  Share2,
  Users,
  Loader2,
  Star,
  MessageSquare,
  FileText,
  Download,
  Clock,
  ArrowUpRight,
  CheckCircle,
  Plus,
  Check
} from 'lucide-react';
import api from '@/api/api';
import { useLanguage } from '@/components/language-provider';
import { useTheme } from '@/components/theme-provider';
import ChatModal from '@/features/dashboards/ChatModal';

export default function CompaniesDetails() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const dk = theme === "dark";

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(() => {
    try {
      const saved = localStorage.getItem(`followed_company_${id}`);
      return saved === "true";
    } catch {
      return false;
    }
  });

  const [isLiked, setIsLiked] = useState(() => {
    try {
      const saved = localStorage.getItem(`liked_company_${id}`);
      return saved === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/companies/`);
        const companies = res.data.results || res.data;
        const foundCompany = companies.find(u => u.id === parseInt(id));

        if (foundCompany) {
          setCompany(foundCompany);
        } else {
          setError("Company not found.");
        }
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to load company details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id]);

  const toggleFollow = () => {
    setIsFollowing(p => {
      const next = !p;
      try {
        localStorage.setItem(`followed_company_${id}`, String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const toggleLike = () => {
    setIsLiked(p => {
      const next = !p;
      try {
        localStorage.setItem(`liked_company_${id}`, String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Premium Typography & Theme Constants
  const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  const cardBg = dk ? "#121214" : "#ffffff";
  const txt = dk ? "#ffffff" : "#1a1a1a";
  const txt2 = dk ? "#a1a1aa" : "#555555";
  const bdr = dk ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const pillBg = dk ? "rgba(255,255,255,0.04)" : "#f3f4f6";
  const hoverBg = dk ? "rgba(255,255,255,0.03)" : "#f9fafb";
  const accentColor = "#2563eb"; // Premium slate blue
  // Real backend values
  const companyRating = company?.company_rating ?? 0.0;
  const reviewCount = company?.review_count ?? 0;
  const companyAge = company?.founded_year ? (new Date().getFullYear() - company.founded_year) : 5 + (parseInt(id || "1") % 10);
  const avatarColors = ["#2563eb", "#8b5cf6", "#10b981", "#ca8a04", "#ec4899"];
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  };

  const getCompanyCover = (field, idVal) => {
    const f = (field || "").toLowerCase();
    if (f.includes("tech") || f.includes("software") || f.includes("develop") || f.includes("informatique")) {
      return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=cover";
    }
    if (f.includes("design") || f.includes("art") || f.includes("creative") || f.includes("media")) {
      return "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=cover";
    }
    if (f.includes("market") || f.includes("sale") || f.includes("pub") || f.includes("commerce")) {
      return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=cover";
    }
    if (f.includes("finance") || f.includes("bank") || f.includes("invest") || f.includes("assur")) {
      return "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=cover";
    }
    if (f.includes("educ") || f.includes("school") || f.includes("univers")) {
      return "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=cover";
    }
    const defaultBanners = [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=cover",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=cover",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200&auto=format&fit=cover"
    ];
    return defaultBanners[idVal % defaultBanners.length];
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: 16, fontFamily: F }}>
        <Loader2 size={36} className="animate-spin" style={{ color: txt }} />
        <p style={{ fontSize: 16, color: txt2, fontWeight: 500 }}>{t("loadingCompanyDetails")}</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: 24, textAlign: "center", fontFamily: F }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: dk ? "rgba(255,255,255,0.02)" : "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: `1px solid ${bdr}` }}>
          <AlertCircle size={32} style={{ color: "#ef4444" }} />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: txt, margin: "0 0 8px" }}>Not Found</h2>
        <p style={{ fontSize: 15, color: txt2, margin: "0 0 32px", maxWidth: 400 }}>{t("companyNotFound")}</p>
        <button
          onClick={() => navigate('/companies', { state: location.state })}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "10px 24px",
            background: txt,
            color: dk ? "#1c1c1e" : "#ffffff",
            border: "none",
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: F
          }}
        >
          <ChevronLeft size={16} style={{ marginRight: 6 }} /> {t("backToCompanies")}
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .company-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media(min-width: 1024px) {
          .company-layout-grid {
            grid-template-columns: 8.2fr 3.8fr;
          }
        }
        .premium-card {
          background: ${cardBg};
          border: 1px solid ${bdr};
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,${dk ? "0.15" : "0.02"});
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card {
          background: ${cardBg};
          border: 1px solid ${bdr};
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 200px;
          box-shadow: 0 2px 12px rgba(0,0,0,${dk ? "0.1" : "0.01"});
        }
        .avatar-outline {
          border: 4px solid ${cardBg};
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .hero-profile-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          margin-top: -50px;
          margin-bottom: 20px;
          position: relative;
          z-index: 5;
          width: 100%;
        }
        @media(min-width: 640px) {
          .hero-profile-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-end;
          }
        }
        .btn-premium-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 38px;
          padding: 0 22px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: ${dk ? "#1e2130" : "#1e2130"};
          color: #e2e8f0;
          font-family: ${F};
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .btn-premium-primary:hover {
          background: #252b3b;
          transform: translateY(-1px);
        }
        .btn-premium-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 38px;
          padding: 0 22px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: ${dk ? "#1e2130" : "#1e2130"};
          color: #e2e8f0;
          font-family: ${F};
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .btn-premium-outline:hover {
          background: #252b3b;
          transform: translateY(-1px);
        }
        .intern-feedback-row {
          padding: 18px;
          border-radius: 16px;
          background: ${dk ? "rgba(255,255,255,0.02)" : "#f9fafb"};
          border: 1px solid ${bdr};
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .download-resource-card {
          border: 1px solid ${bdr};
          border-radius: 16px;
          padding: 16px;
          background: ${dk ? "rgba(255,255,255,0.01)" : "#fafafa"};
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          transition: border-color 0.2s;
        }
        .download-resource-card:hover {
          border-color: ${dk ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"};
        }
        .internship-row-premium {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 16px;
          background: ${dk ? "rgba(255,255,255,0.01)" : "#ffffff"};
          border: 1px solid ${bdr};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .internship-row-premium:hover {
          transform: translateY(-1.5px);
          border-color: ${dk ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"};
          box-shadow: 0 6px 18px rgba(0,0,0,${dk ? "0.2" : "0.03"});
        }
        .card-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 16px 16px;
          opacity: 0.8;
          pointer-events: none;
          z-index: 1;
        }
        .card-glow-overlay {
          position: absolute;
          top: -20%;
          right: -20%;
          width: 70%;
          height: 70%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "transparent", color: txt, fontFamily: F, paddingBottom: 80, paddingTop: 20 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px" }}>

          {/* Breadcrumb Back Navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <button
              onClick={() => navigate('/companies', { state: location.state })}
              style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: txt2, cursor: "pointer", transition: "color 0.2s", fontFamily: F }}
              onMouseEnter={e => e.currentTarget.style.color = txt}
              onMouseLeave={e => e.currentTarget.style.color = txt2}
            >
              <ChevronLeft size={16} /> {t("backToCompanies")}
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={toggleLike}
                style={{ width: 36, height: 36, borderRadius: "50%", background: dk ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: isLiked ? "#e53e3e" : txt2, transition: "all 0.2s" }}
              >
                <Heart size={16} style={{ fill: isLiked ? "#e53e3e" : "none" }} />
              </button>
              <button style={{ width: 36, height: 36, borderRadius: "50%", background: dk ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: txt2 }}>
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* 1. HERO HEADER PROFILE PANEL */}
          <div className="premium-card" style={{ padding: 0, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: 220, width: "100%", position: "relative", overflow: "hidden", background: dk ? "#222" : "#f5f5f7" }}>
              <img
                src={getCompanyCover(company.company_field, company.id)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))" }} />
            </div>
            <div style={{ padding: "0 28px 28px", position: "relative" }}>
              <div className="hero-profile-header">
                <div className="avatar-outline" style={{
                  width: 100,
                  height: 100,
                  borderRadius: 22,
                  padding: 8,
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}>
                  {company.logo ? (
                    <img src={company.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <Building2 size={44} style={{ color: "#1a1a1a" }} />
                  )}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="btn-premium-primary"
                    style={{ gap: 8 }}
                  >
                    <MessageSquare size={16} />
                    Get in Touch
                  </button>

                  <a
                    href={company.website ? (company.website.startsWith('http') ? company.website : `https://${company.website}`) : "https://internia.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium-primary"
                    style={{ gap: 8, textDecoration: "none" }}
                  >
                    <Globe size={16} />
                    Visit Website
                  </a>
                  <button
                    onClick={toggleFollow}
                    className="btn-premium-outline"
                    style={{
                      background: isFollowing
                        ? (dk ? "rgba(16, 185, 129, 0.12)" : "#ecfdf5")
                        : (dk ? "rgba(37, 99, 235, 0.12)" : "#eff6ff"),
                      color: isFollowing
                        ? (dk ? "#34d399" : "#047857")
                        : (dk ? "#60a5fa" : "#2563eb"),
                      borderColor: isFollowing
                        ? (dk ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.2)")
                        : (dk ? "rgba(37, 99, 235, 0.3)" : "rgba(37, 99, 235, 0.2)"),
                      gap: 6
                    }}
                  >
                    {isFollowing ? <Check size={14} /> : <Plus size={14} />}
                    {isFollowing ? t("following") : t("followCompany")}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: txt, letterSpacing: "-0.02em" }}>
                  {company.name}
                </h1>
                <p style={{ fontSize: 15, fontWeight: 500, color: txt2, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{company.company_field || t("corporatePartner")}</span>
                  <span>•</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={14} /> {company.location || "Algeria"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 2. DYNAMIC HORIZONTAL STATS BAR */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
            <div className="stat-card">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: dk ? "rgba(234,179,8,0.15)" : "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", color: "#ca8a04" }}>
                <Star size={20} style={{ fill: "#ca8a04" }} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: txt2, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 2px" }}>Rating</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: txt, margin: 0 }}>
                  {companyRating} <span style={{ fontSize: 12, fontWeight: 500, color: txt2 }}>/ 5.0</span>
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: dk ? "rgba(37,99,235,0.15)" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", color: accentColor }}>
                <Briefcase size={20} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: txt2, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 2px" }}>Open Roles</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: txt, margin: 0 }}>
                  {company.total_internships_count || 0} <span style={{ fontSize: 12, fontWeight: 500, color: txt2 }}>Active</span>
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: dk ? "rgba(16,185,129,0.15)" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: txt2, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 2px" }}>Reviews</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: txt, margin: 0 }}>
                  {reviewCount} <span style={{ fontSize: 12, fontWeight: 500, color: txt2 }}>Feedback</span>
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: dk ? "rgba(139,92,246,0.15)" : "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
                <Clock size={20} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: txt2, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 2px" }}>Hiring History</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: txt, margin: 0 }}>
                  {companyAge} <span style={{ fontSize: 12, fontWeight: 500, color: txt2 }}>Years Active</span>
                </p>
              </div>
            </div>
          </div>

          {/* 3. TWO COLUMN GRID LAYOUT */}
          <div className="company-layout-grid">

            {/* LEFT COLUMN - MAIN DETAILS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

              {/* Card A: About Company */}
              <div className="premium-card">
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10, color: txt, letterSpacing: "-0.01em" }}>
                  <Building2 size={20} style={{ color: txt2 }} />
                  {t("aboutUs")}
                </h2>
                <div style={{ fontSize: 14.5, color: txt2, lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 16 }}>
                  {company.description ? company.description.split('\n').map((para, i) => (
                    <p key={i} style={{ margin: 0 }}>{para}</p>
                  )) : (
                    <p style={{ margin: 0 }}>{t("noDescCompany")}</p>
                  )}
                </div>
              </div>

              {/* Card B: Recruitment Timeline & Progress Bar */}
              <div className="premium-card">
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 10, color: txt, letterSpacing: "-0.01em" }}>
                  <Clock size={20} style={{ color: txt2 }} />
                  Hiring & Recruitment Cycle
                </h2>
                <p style={{ fontSize: 13, color: txt2, margin: "0 0 24px" }}>
                  Deadline: <span style={{ fontWeight: 600, color: txt }}>Start: March 15, 2026 | End: May 30, 2026</span>
                </p>

                <div style={{ position: "relative", marginBottom: 12 }}>
                  {/* Colorful Multi-segment Progress Bar */}
                  <div style={{ height: 8, width: "100%", borderRadius: 4, background: bdr, display: "flex", overflow: "hidden" }}>
                    <div style={{ width: "40%", background: "#10b981" }} /> {/* Applications Open (Green) */}
                    <div style={{ width: "35%", background: "#f59e0b" }} /> {/* Screening & Interviews (Yellow) */}
                    <div style={{ width: "15%", background: "#ef4444" }} /> {/* Offer Extensions (Red) */}
                    <div style={{ width: "10%", background: bdr }} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, fontSize: 12, fontWeight: 600, color: txt2 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />Applications (Open)</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />Interviews (Active)</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />Final Selection</span>
                </div>
              </div>

              {/* Card C: Document Downloads */}
              <div className="premium-card">
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10, color: txt, letterSpacing: "-0.01em" }}>
                  <FileText size={20} style={{ color: txt2 }} />
                  Program Resources & Downloads
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="download-resource-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: dk ? "rgba(255,255,255,0.03)" : "#f3f4f6", display: "flex", alignItems: "center", justifySelf: "center", justifyContent: "center", color: accentColor }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: txt, margin: "0 0 2px" }}>Internship Guidelines handbook</h4>
                        <p style={{ fontSize: 11, color: txt2, margin: 0 }}>PDF (2.4 MB) • Updated 2 weeks ago</p>
                      </div>
                    </div>
                    <button className="btn-premium-outline" style={{ height: 36, padding: "0 14px", display: "flex", gap: 6, borderRadius: 12 }}>
                      <Download size={14} />
                      Download
                    </button>
                  </div>

                  <div className="download-resource-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: dk ? "rgba(255,255,255,0.03)" : "#f3f4f6", display: "flex", alignItems: "center", justifySelf: "center", justifyContent: "center", color: accentColor }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: txt, margin: "0 0 2px" }}>Standard Internship Agreement Template</h4>
                        <p style={{ fontSize: 11, color: txt2, margin: 0 }}>PDF (1.1 MB) • Official template</p>
                      </div>
                    </div>
                    <button className="btn-premium-outline" style={{ height: 36, padding: "0 14px", display: "flex", gap: 6, borderRadius: 12 }}>
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                </div>
              </div>

              {/* Card D: Focus Categories & Perks */}
              <div className="premium-card">
                <div style={{ display: "grid", gridTemplateColumns: "1fr", mdGridTemplateColumns: "1fr 1fr", gap: 28 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px", color: txt, display: "flex", alignItems: "center", gap: 8 }}>
                      <Award size={18} style={{ color: txt2 }} />
                      Focus Categories
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {["Technical Design", "Software Engineering", "Data Infrastructure", "Quality Assurance"].map((cat) => (
                        <span key={cat} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 10, background: pillBg, color: txt2, border: `1px solid ${bdr}` }}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${bdr}`, paddingTop: 20, mdBorderTop: "none", mdPaddingTop: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px", color: txt, display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle size={18} style={{ color: txt2 }} />
                      {t("benefitsPerks")}
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {(company.benefits || ["Health Insurance", "Flexible Hours", "Professional Development"]).map((benefit, index) => (
                        <span key={index} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 10, background: pillBg, color: txt, border: `1px solid ${bdr}` }}>
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card E: Intern Feedback / Testimonials */}
              <div className="premium-card">
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10, color: txt, letterSpacing: "-0.01em" }}>
                  <MessageSquare size={20} style={{ color: txt2 }} />
                  Testimonials from Past Interns
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {company.reviews && company.reviews.length > 0 ? (
                    company.reviews.map((rev, idx) => (
                      <div key={rev.id || idx} className="intern-feedback-row">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {rev.avatar ? (
                              <img src={rev.avatar} alt={rev.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarColors[idx % avatarColors.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                                {getInitials(rev.name)}
                              </div>
                            )}
                            <div>
                              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: txt, margin: 0 }}>{rev.name}</h4>
                              <p style={{ fontSize: 11, color: txt2, margin: 0 }}>{rev.internship_title || "Intern"} • {rev.internship_year || 2025}</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#eab308", fontSize: 12, fontWeight: 700 }}>
                            <Star size={13} style={{ fill: "#eab308" }} />
                            {parseFloat(rev.rating).toFixed(1)}
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: txt2, lineHeight: 1.6, margin: 0 }}>
                          "{rev.text}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "24px 12px", color: txt2, fontSize: 13.5, border: `1px dashed ${bdr}`, borderRadius: 16 }}>
                      No testimonials yet from past interns.
                    </div>
                  )}
                </div>
              </div>

              {/* Card F: Active Internships */}
              <div id="internships-section" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 10, color: txt, letterSpacing: "-0.01em" }}>
                    <Briefcase size={20} style={{ color: txt2 }} />
                    Available Opportunities
                  </h2>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 12, background: pillBg, border: `1px solid ${bdr}`, color: txt }}>
                    {company.total_internships_count || 0} Openings
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {company.internships && company.internships.length > 0 ? (
                    company.internships.slice(0, 3).map((internship) => (
                      <div
                        key={internship.id}
                        onClick={() => navigate(`/internships/${internship.id}`)}
                        className="internship-row-premium"
                      >
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "#ffffff",
                          border: `1.5px solid ${bdr}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          {internship.image ? (
                            <img src={internship.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <Briefcase size={18} style={{ color: txt2 }} />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                          <h4 style={{ fontSize: 14.5, fontWeight: 700, color: txt, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {internship.title}
                          </h4>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: txt2 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <MapPin size={11} /> {internship.location}
                            </span>
                            <span>•</span>
                            <span style={{ fontWeight: 600 }}>
                              {(internship.type || "").replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{
                            fontSize: 9.5,
                            fontWeight: 700,
                            padding: "4px 8px",
                            borderRadius: 6,
                            textTransform: "uppercase",
                            background: internship.status === 'OPEN_FOR_APPLICATION' ? (dk ? "rgba(16,185,129,0.12)" : "#ecfdf5") : pillBg,
                            color: internship.status === 'OPEN_FOR_APPLICATION' ? (dk ? "#34d399" : "#047857") : txt2
                          }}>
                            {internship.status === 'OPEN_FOR_APPLICATION' ? t('open') || 'Open' : t('closed') || 'Closed'}
                          </span>
                          <ChevronRight size={16} style={{ color: txt2 }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 13, fontStyle: "italic", color: txt2, textAlign: "center", margin: "16px 0 8px" }}>
                      {t("noInternshipsFound") || "No internships posted yet."}
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN - SIDEBAR */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

              {/* Card 1: GPS Map & Location */}
              <div className="premium-card">
                <h3 style={{ fontSize: 16, fontWeight: 800, color: txt, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={18} style={{ color: txt2 }} />
                  Company Location
                </h3>

                {/* Embed GPS Google Map iframe */}
                <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${bdr}`, marginBottom: 16, height: 200, background: dk ? "#18181b" : "#f4f4f5" }}>
                  <iframe
                    title="Company Location Map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(company.name + " " + (company.location || "Algeria"))}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, display: "block" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 13, color: txt, margin: 0, fontWeight: 600 }}>
                    {company.location || "Algeria"}
                  </p>
                  <p style={{ fontSize: 12, color: txt2, margin: "0 0 16px", lineHeight: 1.4 }}>
                    Official headquarters and primary development center coordinates.
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.name + " " + (company.location || "Algeria"))}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <button className="btn-premium-outline" style={{ width: "100%", height: 38, display: "flex", gap: 6, justifyContent: "center", fontSize: 12, borderRadius: 12 }}>
                      Open in Google Maps
                      <ArrowUpRight size={14} />
                    </button>
                  </a>
                </div>
              </div>

              {/* Card 2: Company Snapshot details */}
              <div className="premium-card">
                <h3 style={{ fontSize: 16, fontWeight: 800, color: txt, margin: "0 0 20px" }}>
                  {t("companySnapshot")}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <SidebarItem icon={Calendar} label={t("founded")} value={company.founded_year?.toString() || t("notAvailable")} txt={txt} txt2={txt2} bdr={bdr} />
                  <SidebarItem icon={Briefcase} label={t("field")} value={company.company_field || t("notAvailable")} txt={txt} txt2={txt2} bdr={bdr} />
                  <SidebarItem icon={Users} label={t("companySize")} value={company.size || "10-50 Employees"} txt={txt} txt2={txt2} bdr={bdr} />
                  <SidebarItem icon={Building2} label={t("headquarters")} value={company.location || t("notAvailable")} txt={txt} txt2={txt2} bdr={bdr} />
                </div>

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${bdr}`, display: "flex", flexDirection: "column", gap: 12 }}>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <button className="btn-premium-outline" style={{ width: "100%", height: 40, display: "flex", gap: 6, justifyContent: "center", fontSize: 13, borderRadius: 14 }}>
                        {t("visitWebsite")}
                        <ExternalLink size={14} />
                      </button>
                    </a>
                  )}
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="btn-premium-primary"
                    style={{ width: "100%", height: 40, display: "flex", gap: 6, justifyContent: "center", fontSize: 13, borderRadius: 14 }}
                  >
                    <Mail size={14} />
                    {t("contactUs")}
                  </button>
                </div>
              </div>

              {/* Card 3: Hiring callout banner */}
              <div style={{
                position: "relative",
                background: dk ? "#18181b" : "#0f172a",
                borderRadius: 20,
                padding: "24px 22px",
                color: "#ffffff",
                overflow: "hidden",
                border: dk ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.2)"
              }}>

                {/* Actively Hiring Pulse Tag */}
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: (company.total_internships_count || 0) > 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.08)",
                  border: `1px solid ${(company.total_internships_count || 0) > 0 ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.15)"}`,
                  fontSize: 10,
                  fontWeight: 700,
                  color: (company.total_internships_count || 0) > 0 ? "#34d399" : "#a1a1aa",
                  marginBottom: 14,
                  position: "relative",
                  zIndex: 2
                }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: (company.total_internships_count || 0) > 0 ? "#10b981" : "#a1a1aa",
                    display: "inline-block",
                    boxShadow: (company.total_internships_count || 0) > 0 ? "0 0 8px #10b981" : "none"
                  }} />
                  {(company.total_internships_count || 0) > 0 ? "ACTIVELY HIRING" : "NEXT CYCLE SOON"}
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", position: "relative", zIndex: 2, letterSpacing: "-0.01em" }}>{t("weAreHiring")}</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: "0 0 20px", lineHeight: 1.4, position: "relative", zIndex: 2 }}>{t("joinOurTeam")}</p>

                {/* Side-by-Side Modern Metrics Panel */}
                <div style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 20,
                  position: "relative",
                  zIndex: 2
                }}>
                  <div style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.5)" }}>
                      <Briefcase size={11} />
                      <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        Open Roles
                      </span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#ffffff" }}>
                      {(company.total_internships_count || 0) > 0 ? company.total_internships_count : 0}
                    </span>
                  </div>

                  <div style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.5)" }}>
                      <Users size={11} />
                      <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        Hired Interns
                      </span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#ffffff" }}>
                      {company.hired_interns_count || 0}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const el = document.getElementById('internships-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    width: "100%",
                    height: 38,
                    background: "#ffffff",
                    color: "#0b0f19",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.2s ease",
                    position: "relative",
                    zIndex: 2
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-1.5px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span>{t("viewOpportunities")}</span>
                  <ArrowUpRight size={13} strokeWidth={2.5} />
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Floating Chat Modal */}
      <ChatModal
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        recipientId={company.id}
        recipientName={company.name}
      />
    </>
  );
}

function SidebarItem({ icon: Icon, label, value, txt, txt2, bdr }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "transparent",
        border: `1.5px solid ${bdr}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: txt2,
        flexShrink: 0
      }}>
        <Icon size={15} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 9.5, textTransform: "uppercase", fontWeight: 700, color: txt2, letterSpacing: "0.06em", margin: "0 0 2px" }}>
          {label}
        </p>
        <p style={{ fontSize: 13, fontWeight: 700, color: txt, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value}
        </p>
      </div>
    </div>
  );
}
