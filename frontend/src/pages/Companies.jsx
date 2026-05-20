import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Building2,
  ArrowRight,
  Globe,
  ArrowUpRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/api/api';
import { useLanguage } from '@/components/language-provider';
import { useTheme } from '@/components/theme-provider';

const PER_PAGE = 6;

export default function Companies() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dk = theme === "dark";

  const getTranslation = (key, fallback) => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchField, setSearchField] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // Premium Theme Constants
  const F = "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const accent = "#1d4ed8";
  
  const cardBg = dk ? "#1c1c1e" : "#ffffff";
  const txt = dk ? "#ffffff" : "#1a1a1a";
  const txt2 = dk ? "#a1a1aa" : "#666666";
  const bdr = dk ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const pillBg = dk ? "rgba(255,255,255,0.04)" : "#f1f5f9";
  const hoverBg = dk ? "rgba(255,255,255,0.04)" : "#f9f9f9";

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await api.get('/companies/');
        const data = response.data.results || response.data;
        setCompanies(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Failed to load companies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, searchLocation, searchField]);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = !searchTerm ||
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.company_field?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = !searchLocation ||
      company.location?.toLowerCase().includes(searchLocation.toLowerCase());

    const matchesField = !searchField ||
      company.company_field?.toLowerCase().includes(searchField.toLowerCase());

    return matchesSearch && matchesLocation && matchesField;
  });

  const pages = Math.max(1, Math.ceil(filteredCompanies.length / PER_PAGE));
  const paginatedCompanies = filteredCompanies.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const getPageNumbers = () => {
    const range = [];
    const maxVisible = 5;
    if (pages <= maxVisible) {
      for (let i = 1; i <= pages; i++) range.push(i);
    } else {
      if (page <= 3) {
        range.push(1, 2, 3, '...', pages);
      } else if (page >= pages - 2) {
        range.push(1, '...', pages - 2, pages - 1, pages);
      } else {
        range.push(1, '...', page, '...', pages);
      }
    }
    return range;
  };

  const getCompanyCover = (field, id) => {
    const f = (field || "").toLowerCase();
    if (f.includes("tech") || f.includes("software") || f.includes("develop") || f.includes("informatique")) {
      return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=cover";
    }
    if (f.includes("design") || f.includes("art") || f.includes("creative") || f.includes("media")) {
      return "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600&auto=format&fit=cover";
    }
    if (f.includes("market") || f.includes("sale") || f.includes("pub") || f.includes("commerce")) {
      return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=cover";
    }
    if (f.includes("finance") || f.includes("bank") || f.includes("invest") || f.includes("assur")) {
      return "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=cover";
    }
    if (f.includes("educ") || f.includes("school") || f.includes("univers")) {
      return "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=cover";
    }
    const defaultBanners = [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=cover",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=cover",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=600&auto=format&fit=cover"
    ];
    return defaultBanners[id % defaultBanners.length];
  };

  return (
    <>
      <style>{`
        .company-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .company-card:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, ${dk ? "0.2" : "0.03"});
          border-color: ${dk ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} !important;
        }
        .company-card:hover .arrow-circle {
          transform: scale(1.1) rotate(45deg);
          background: #ffffff !important;
          color: #1a1a1a !important;
        }
        .search-input {
          transition: all 0.2s ease;
        }
        .search-input:focus {
          border-color: ${txt} !important;
          box-shadow: 0 0 0 3px ${dk ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.05)"};
        }
        .pag-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: none;
          color: ${txt2};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: ${F};
          transition: all 0.2s;
        }
        .pag-btn:hover:not(:disabled):not(.active) {
          color: ${txt};
        }
        .pag-btn.active {
          background: ${dk ? "#ffffff" : "#1e2a45"} !important;
          color: ${dk ? "#1c1c1e" : "#ffffff"} !important;
          font-weight: 600;
          cursor: default;
        }
        .pag-btn:disabled {
          color: ${dk ? "rgba(255,255,255,0.15)" : "#ccc"} !important;
          cursor: default;
        }
        .pag-ellipsis {
          color: ${txt2};
          font-size: 14px;
          padding: 0 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: ${F};
        }

        .inspired-tab {
          font-family: ${F};
          font-size: 13px;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 50px;
          border: 1.5px solid ${bdr};
          background: transparent;
          color: ${txt2};
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .inspired-tab:hover {
          color: ${txt};
          border-color: ${dk ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"};
        }
        .inspired-tab.active {
          background: ${dk ? "#6fa8ff" : "#0f172a"};
          color: ${dk ? "#0a1628" : "#ffffff"};
          border-color: ${dk ? "#6fa8ff" : "#0f172a"};
        }

        .inspired-search-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          width: 100%;
        }
        .inspired-input-capsule {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 28px;
          border-radius: 50px;
          border: 1.5px solid ${bdr};
          background: ${dk ? "rgba(255,255,255,0.02)" : "#ffffff"};
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          flex: 1;
          min-width: 220px;
        }
        .inspired-input-capsule:focus-within {
          border-color: ${dk ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"};
          background: ${dk ? "rgba(255,255,255,0.04)" : "#ffffff"};
          box-shadow: 0 4px 15px rgba(0,0,0,${dk ? "0.15" : "0.03"});
        }
        .inspired-label {
          font-size: 11px;
          font-weight: 500;
          color: ${txt2};
          font-family: ${F};
        }
        .inspired-input {
          border: none;
          background: transparent;
          font-size: 13.5px;
          font-weight: 500;
          color: ${txt};
          font-family: ${F};
          outline: none;
          padding: 0;
          width: 100%;
        }
        .inspired-input::placeholder {
          color: ${dk ? "rgba(255,255,255,0.35)" : "#9ca3af"};
        }
        .inspired-select {
          border: none;
          background: transparent;
          font-size: 13.5px;
          font-weight: 500;
          color: ${txt};
          font-family: ${F};
          outline: none;
          padding: 0;
          width: 100%;
          cursor: pointer;
        }
        .inspired-btn {
          height: 52px;
          border-radius: 50px;
          background: ${dk ? "#6fa8ff" : "#0f172a"};
          color: ${dk ? "#0a1628" : "#ffffff"};
          border: none;
          font-family: ${F};
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 32px;
          flex-shrink: 0;
        }
        .inspired-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .inspired-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "transparent", color: txt, fontFamily: F, padding: "48px 24px", transition: "background-color 0.3s, color 0.3s" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>

          {/* Inspired Header Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 40, borderBottom: `1px solid ${bdr}`, paddingBottom: 48 }}>
            
            {/* Top row: Tags on left, Switcher pills on right */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  color: txt2,
                }}>
                  {getTranslation("partnerDirectory", "Partner Directory").toUpperCase()}
                </span>
                <h1 style={{
                  fontSize: "clamp(34px, 4.5vw, 44px)",
                  fontWeight: 500, // Medium/Light elegant weight!
                  lineHeight: 1.15,
                  letterSpacing: "-0.03em",
                  color: txt,
                  margin: 0,
                }}>
                  Explore New Horizons,<br />One Company at a Time.
                </h1>
              </div>

              {/* Inspired switcher tabs row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <button className="inspired-tab active">
                  <Building2 size={13} style={{ opacity: 0.9 }} />
                  <span style={{ textTransform: "capitalize" }}>{getTranslation("navCompanies", "Companies")}</span>
                </button>
                <button className="inspired-tab" onClick={() => navigate("/internships")}>
                  <Briefcase size={13} style={{ opacity: 0.9 }} />
                  <span style={{ textTransform: "capitalize" }}>{getTranslation("navInternships", "Internships")}</span>
                </button>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: `1.5px solid ${bdr}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: txt2,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }} onClick={() => navigate("/internships")}>
                  <ChevronRight size={15} />
                </div>
              </div>
            </div>

            {/* Bottom row: Multi-field Search Capsules Form */}
            <div className="inspired-search-container">
              {/* Capsule 1: Search Name/Keyword */}
              <div className="inspired-input-capsule">
                <span className="inspired-label">{getTranslation("search", "Search")}</span>
                <input
                  type="text"
                  placeholder={getTranslation("searchCompanies", "Search companies by name or industry...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="inspired-input"
                />
              </div>

              {/* Capsule 2: Location */}
              <div className="inspired-input-capsule">
                <span className="inspired-label">{getTranslation("companyLocation", "Location")}</span>
                <input
                  type="text"
                  placeholder={getTranslation("anywhere", "Anywhere")}
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="inspired-input"
                />
              </div>

              {/* Capsule 3: Industry / Field */}
              <div className="inspired-input-capsule">
                <span className="inspired-label">{getTranslation("companyField", "Industry")}</span>
                <input
                  type="text"
                  placeholder={getTranslation("allIndustries", "All Industries")}
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  className="inspired-input"
                />
              </div>

              {/* Action Button: Search Now */}
              <button 
                className="inspired-btn"
                onClick={() => {
                  // Filter states update reactively
                }}
              >
                <Search size={15} strokeWidth={2.5} />
                <span>{getTranslation("searchNow", "Search Now")}</span>
              </button>
            </div>

          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", itemsCenter: "center", justifyContent: "center", padding: "120px 0", gap: 16, textAlign: "center", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: accent }} />
              </div>
              <p style={{ fontSize: 15, color: txt2, fontWeight: 500, margin: 0 }}>{t("loadingCompanies")}</p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: "center",
              padding: "56px 32px",
              background: cardBg,
              borderRadius: 24,
              border: `1px solid ${bdr}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              maxWidth: 500,
              margin: "40px auto",
              boxShadow: `0 8px 30px rgba(0, 0, 0, ${dk ? "0.2" : "0.02"})`,
              backdropFilter: "blur(20px)",
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: dk ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)",
                border: `1px solid ${dk ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ef4444",
                marginBottom: 8
              }}>
                <Search size={22} style={{ opacity: 0.8 }} />
              </div>
              
              <h3 style={{
                fontSize: 17,
                fontWeight: 600,
                color: txt,
                margin: 0,
                letterSpacing: "-0.01em"
              }}>
                Connection Error
              </h3>
              
              <p style={{
                color: txt2,
                fontSize: 13.5,
                lineHeight: 1.5,
                margin: 0,
                maxWidth: 320
              }}>
                {error}
              </p>

              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: 8,
                  background: txt,
                  color: dk ? "#1c1c1e" : "#ffffff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: 50,
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = `0 6px 15px rgba(0, 0, 0, ${dk ? "0.25" : "0.15"})`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {t("tryAgain", "Try Again")}
              </button>
            </div>
          ) : filteredCompanies.length > 0 ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 32 }}>
                {paginatedCompanies.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => navigate(`/companies/${company.id}`)}
                    className="company-card"
                    style={{
                      background: cardBg,
                      borderRadius: 24,
                      border: `1px solid ${bdr}`,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      height: "100%",
                      cursor: "pointer"
                    }}
                  >
                    {/* Top Landscape Banner Image */}
                    <div style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1.5 / 1",
                      borderRadius: 18,
                      overflow: "hidden",
                      background: dk ? "#222" : "#f5f5f7"
                    }}>
                      <img
                        src={getCompanyCover(company.company_field, company.id)}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />

                      {/* Open Positions Count Pill (Top Left overlay) */}
                      <div style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        background: "rgba(0, 0, 0, 0.6)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#ffffff",
                        padding: "4px 10px",
                        borderRadius: 30,
                        fontSize: 10,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        zIndex: 10
                      }}>
                        {company.open_positions_count} {company.open_positions_count === 1 ? t("openPosition") : t("openPositions")}
                      </div>

                      {/* Company Logo Badge Overlay (Top Right) */}
                      <div style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "#ffffff",
                        border: "2px solid #ffffff",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        zIndex: 10
                      }}>
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Building2 size={16} style={{ color: "#1a1a1a" }} />
                        )}
                      </div>

                      {/* Category Pill Overlay (inspired by user mockup) */}
                      <div style={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        right: 12,
                        background: "rgba(30, 30, 30, 0.65)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: 30,
                        padding: "5px 5px 5px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                        zIndex: 10
                      }}>
                        <span style={{
                          color: "#ffffff",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: "-0.01em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {company.company_field || "Software & Tech"}
                        </span>
                        <div className="arrow-circle" style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#1a1a1a",
                          transition: "all 0.25s ease",
                          flexShrink: 0
                        }}>
                          <ArrowUpRight size={12} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>

                    {/* Information Display Details Area */}
                    <div style={{ padding: "0 8px 4px", display: "flex", flexDirection: "column", gap: 8 }}>
                      <h3 style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: txt,
                        margin: "4px 0 0",
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {company.name}
                      </h3>

                      {/* Location with MapPin */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: txt2 }}>
                        <MapPin size={13} style={{ color: txt2, flexShrink: 0 }} />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {company.location || "Algeria"}
                        </span>
                      </div>

                      {/* Row: Est. Year & Website link next to each other */}
                      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: txt2, marginTop: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                          <Building2 size={13} style={{ color: txt2, flexShrink: 0 }} />
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {company.founded_year ? `Est. ${company.founded_year}` : "Established"}
                          </span>
                        </div>

                        {company.website ? (
                          <a
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 6, 
                              minWidth: 0,
                              color: txt2,
                              textDecoration: "none",
                              transition: "color 0.2s ease"
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = dk ? "#6fa8ff" : "#2563eb"}
                            onMouseLeave={e => e.currentTarget.style.color = txt2}
                          >
                            <Globe size={13} style={{ flexShrink: 0 }} />
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {company.website.replace("https://", "").replace("http://", "").replace("www.", "")}
                            </span>
                          </a>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                            <Globe size={13} style={{ color: txt2, flexShrink: 0 }} />
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              internia.com
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 48 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="pag-btn">
                    <ChevronLeft size={16} />
                  </button>
                  
                  {getPageNumbers().map((p, idx) => {
                    if (p === '...') {
                      return <span key={`ell-${idx}`} className="pag-ellipsis">...</span>;
                    }
                    return (
                      <button key={p} onClick={() => setPage(p)} className={`pag-btn ${page === p ? 'active' : ''}`}>
                        {p}
                      </button>
                    );
                  })}

                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="pag-btn">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 24px", background: cardBg, borderRadius: 24, border: `1px solid ${bdr}` }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: dk ? "rgba(255,255,255,0.02)" : "#f8f9fa", marginBottom: 20 }}>
                <Search size={28} style={{ color: txt2 }} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: txt, margin: "0 0 8px" }}>{t("noCompaniesFound")}</h3>
              <p style={{ fontSize: 14, color: txt2, margin: "0 0 24px" }}>{t("noCompaniesMatch")}</p>
              <button
                onClick={() => setSearchTerm("")}
                style={{ background: "none", border: "none", color: accent, fontSize: 14, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}
              >
                {t("clearSearch")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}