import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, X, Heart, ChevronDown, ChevronLeft, ChevronRight, ShieldCheck, Send, Headphones } from 'lucide-react';
import api from '@/api/api';
import { useLanguage } from '@/components/language-provider';
import { useTheme } from '@/components/theme-provider';

const PER_PAGE = 6;
const WILAYAS = ["Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Bejaia", "Biskra", "Bechar", "Blida", "Bouira", "Tamanrasset", "Tebessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Setif", "Saida", "Skikda", "Sidi Bel Abbes", "Annabba", "Guelma", "Constantine", "Medea", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdes", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Ain Defla", "Naama", "Ain Temouchent", "Ghardaia", "Relizane"];
const SKILLS = ["React", "Node.js", "Python", "UI/UX Design", "Marketing", "Data Science", "Java", "C++", "SQL", "Graphic Design", "Project Management", "JavaScript", "TypeScript", "HTML/CSS", "PHP", "Laravel", "Flutter", "AWS", "Docker", "Machine Learning", "Figma"];
const F = "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";


export default function Internships() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dk = theme === "dark";
  const location = useLocation();
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(location.state?.searchQuery || "");
  const [type, setType] = useState("");
  const [loc, setLoc] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [skills, setSkills] = useState([]);
  const [page, setPage] = useState(1);
  const [liked, setLiked] = useState(new Set());
  const [wSearch, setWSearch] = useState("");
  const [wOpen, setWOpen] = useState(false);
  const [minMonths, setMinMonths] = useState(1);
  const [maxMonths, setMaxMonths] = useState(12);
  const [sortBy, setSortBy] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [timeUnit, setTimeUnit] = useState("months"); // "days" | "weeks" | "months"

  const handleUnitChange = (unit) => {
    setTimeUnit(unit);
    if (unit === "months") {
      setMinMonths(1);
      setMaxMonths(12);
    } else if (unit === "weeks") {
      setMinMonths(1);
      setMaxMonths(24);
    } else if (unit === "days") {
      setMinMonths(1);
      setMaxMonths(90);
    }
  };

  const getDurationMonths = (dStr) => {
    if (!dStr) return 3;
    const str = String(dStr).toLowerCase();
    const match = str.match(/\d+/);
    if (!match) return 3;
    let num = parseInt(match[0], 10);
    // Django timedelta serializes as "90 00:00:00" or "90 days". Convert days to months.
    if (str.includes(':') || str.includes('day') || num > 12) {
      num = Math.max(1, Math.round(num / 30));
    }
    return num;
  };
  const getDurationInDays = (dStr) => {
    if (!dStr) return 90; // Default 3 months = 90 days
    const str = String(dStr).toLowerCase();
    const match = str.match(/\d+/);
    if (!match) return 90;
    let num = parseInt(match[0], 10);

    if (str.includes('month')) {
      return num * 30;
    }
    if (str.includes('week')) {
      return num * 7;
    }
    if (str.includes('day')) {
      return num;
    }
    // Handle Django timedelta format e.g. "90 00:00:00" (days)
    if (str.includes(':')) {
      return num;
    }
    // Fallback based on size of number
    if (num <= 12) {
      return num * 30; // Treat as months
    }
    return num; // Treat as days
  };
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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/internships/');
        const raw = res.data.results || res.data;
        setInternships((Array.isArray(raw) ? raw : []).map(item => {
          let sk = []; if (item.internship_skills) { try { sk = JSON.parse(item.internship_skills); if (!Array.isArray(sk)) sk = [sk]; } catch { sk = [item.internship_skills]; } }
          return { ...item, company_name: item.company_name || `Company #${item.company}`, wilaya: item.wilaya || "", required_skills: sk, banner_image: item.internship_image || null, type: item.internship_type || "N/A" };
        }));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  const isTimeFilterActive = () => {
    if (timeUnit === "months") return minMonths > 1 || maxMonths < 12;
    if (timeUnit === "weeks") return minMonths > 1 || maxMonths < 24;
    return minMonths > 1 || maxMonths < 90;
  };

  const filtered = (Array.isArray(internships) ? internships : []).filter(i => {
    const q = search.toLowerCase();

    // Parse duration in days dynamically
    const durationDays = getDurationInDays(i.internship_duration);
    const activeMinDays = minMonths * (timeUnit === "months" ? 30 : timeUnit === "weeks" ? 7 : 1);
    const activeMaxDays = maxMonths * (timeUnit === "months" ? 30 : timeUnit === "weeks" ? 7 : 1);

    // Use only the internship-specific rating (not company-wide fallback)
    const rating = parseFloat(parseFloat(i.rating || 0).toFixed(1));
    const starBucket = Math.floor(rating);
    const isRated = rating > 0;

    return (!q || i.title?.toLowerCase().includes(q) || i.company_name?.toLowerCase().includes(q))
      && (!type || i.internship_type === type) && (!loc || i.internship_location === loc)
      && (!wilaya || i.wilaya === wilaya) && (skills.length === 0 || (i.required_skills && skills.some(s => i.required_skills.includes(s))))
      && (!isTimeFilterActive() || (durationDays >= activeMinDays && durationDays <= activeMaxDays))
      && (selectedRatings.length === 0 || (isRated && selectedRatings.includes(starBucket)));
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "alpha_asc") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "alpha_desc") {
      return (b.title || "").localeCompare(a.title || "");
    }
    if (sortBy === "newest") {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id;
      return dateB - dateA;
    }
    if (sortBy === "oldest") {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id;
      return dateA - dateB;
    }
    return 0; // Default sorting
  });

  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const items = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  useEffect(() => { setPage(1); }, [search, type, loc, wilaya, skills, minMonths, maxMonths, sortBy, selectedRatings, timeUnit]);

  const pills = [];
  if (type) pills.push({ l: type.replace('_', ' '), c: () => setType("") });
  if (loc) pills.push({ l: loc, c: () => setLoc("") });
  if (wilaya) pills.push({ l: wilaya, c: () => setWilaya("") });

  // Custom unit pill
  if (isTimeFilterActive()) {
    const unitLabel = timeUnit === "months" ? "Months" : timeUnit === "weeks" ? "Weeks" : "Days";
    pills.push({
      l: `${minMonths} - ${maxMonths} ${unitLabel}`,
      c: () => {
        if (timeUnit === "months") { setMinMonths(1); setMaxMonths(12); }
        else if (timeUnit === "weeks") { setMinMonths(1); setMaxMonths(24); }
        else { setMinMonths(1); setMaxMonths(90); }
      }
    });
  }

  skills.forEach(s => pills.push({ l: s, c: () => setSkills(p => p.filter(x => x !== s)) }));
  selectedRatings.forEach(r => pills.push({ l: `${r} Star`, c: () => setSelectedRatings(p => p.filter(x => x !== r)) }));
  const clearAll = () => {
    setType("");
    setLoc("");
    setWilaya("");
    setSkills([]);
    setSearch("");
    setTimeUnit("months");
    setMinMonths(1);
    setMaxMonths(12);
    setSelectedRatings([]);
  };

  // Colors
  const bg = dk ? "#161618" : "#fff";
  const txt = dk ? "#fff" : "#111";
  const txt2 = dk ? "rgba(255,255,255,0.5)" : "#888";
  const bdr = dk ? "rgba(255,255,255,0.08)" : "#e8e8e8";
  const pillBg = dk ? "#fff" : "#2a2a2a";
  const pillTxt = dk ? "#111" : "#fff";
  const accent = "#1d4ed8";
  const hoverBg = dk ? "rgba(255,255,255,0.04)" : "#f9f9f9";

  return (
    <>
      <style>{`
      .sidebar-scroll::-webkit-scrollbar { width: 6px; }
      .sidebar-scroll::-webkit-scrollbar-track { background: transparent !important; }
      .sidebar-scroll::-webkit-scrollbar-thumb { background: #86bbff; border-radius: 10px; min-height: 30px; }
      .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #66a8ff; }
      .sidebar-scroll::-webkit-scrollbar-button,
      .sidebar-scroll::-webkit-scrollbar-button:single-button,
      .sidebar-scroll::-webkit-scrollbar-button:start:decrement,
      .sidebar-scroll::-webkit-scrollbar-button:end:increment { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important; }
      
      .range-slider-input {
        position: absolute;
        width: 100%;
        height: 2px;
        top: 0;
        left: 0;
        margin: 0;
        background: none;
        pointer-events: none;
        -webkit-appearance: none;
        appearance: none;
        outline: none;
      }
      .range-slider-input::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #1d4ed8;
        cursor: pointer;
        pointer-events: auto;
        border: none;
        transition: transform 0.1s;
      }
      .range-slider-input::-webkit-slider-thumb:hover {
        transform: scale(1.2);
      }
      .range-slider-input::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #1d4ed8;
        cursor: pointer;
        pointer-events: auto;
        border: none;
        transition: transform 0.1s;
      }
      .range-slider-input::-moz-range-thumb:hover {
        transform: scale(1.2);
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
        background: ${accent} !important;
        color: #fff !important;
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
    `}</style>
      <div style={{ fontFamily: F, background: bg, minHeight: "100vh", color: txt, transition: "background 0.3s" }}>
        {/* HEADER */}
        <div style={{ textAlign: "center", padding: "48px 24px 36px" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>{t("exploreInternships")}</h1>
          <div style={{ fontSize: 13, color: txt2, marginTop: 6 }}>
            <Link to="/" style={{ color: txt2, textDecoration: "none" }}>Home</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: txt, fontWeight: 500 }}>Internships</span>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px 80px" }}>
          {/* TOP BAR — single line */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${bdr}`, paddingBottom: 16, marginBottom: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: txt, whiteSpace: "nowrap" }}>Filter Options</span>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontSize: 13, color: txt2 }}>Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} results</span>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: txt2 }}>
                <span>Sort by :</span>

                <div
                  onClick={() => setSortOpen(!sortOpen)}
                  style={{ padding: "6px 28px 6px 14px", borderRadius: 20, background: dk ? "rgba(255,255,255,0.04)" : "#fff", color: txt, border: `1px solid ${dk ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, cursor: "pointer", fontWeight: 500, fontFamily: F, position: "relative", userSelect: "none" }}
                >
                  {sortBy === "alpha_asc" && "Alphabetical (A-Z)"}
                  {sortBy === "alpha_desc" && "Alphabetical (Z-A)"}
                  {sortBy === "newest" && "Newest First"}
                  {sortBy === "oldest" && "Oldest First"}
                  {sortBy === "default" && "Default Sorting"}
                  <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: txt2 }} />
                </div>

                {sortOpen && (
                  <>
                    <div onClick={() => setSortOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} />
                    <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, width: 180, background: dk ? "#1c1c1e" : "#fff", border: `1px solid ${bdr}`, borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.05)", zIndex: 100, overflow: "hidden", display: "flex", flexDirection: "column", padding: 4 }}>
                      {[
                        { l: "Default Sorting", v: "default" },
                        { l: "Alphabetical (A-Z)", v: "alpha_asc" },
                        { l: "Alphabetical (Z-A)", v: "alpha_desc" },
                        { l: "Newest First", v: "newest" },
                        { l: "Oldest First", v: "oldest" }
                      ].map(o => (
                        <div
                          key={o.v}
                          onClick={() => {
                            setSortBy(o.v);
                            setSortOpen(false);
                          }}
                          style={{
                            padding: "8px 12px",
                            fontSize: 13,
                            fontWeight: 500,
                            color: txt,
                            cursor: "pointer",
                            borderRadius: 8,
                            background: sortBy === o.v ? (dk ? "rgba(255,255,255,0.05)" : "#f1f5f9") : "transparent"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = dk ? "rgba(255,255,255,0.05)" : "#f1f5f9"}
                          onMouseLeave={(e) => e.currentTarget.style.background = sortBy === o.v ? (dk ? "rgba(255,255,255,0.05)" : "#f1f5f9") : "transparent"}
                        >
                          {o.l}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ACTIVE FILTERS ROW */}
          {pills.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: txt2, marginRight: 4 }}>Active Filter</span>
              {pills.map((p, i) => (
                <button key={i} onClick={p.c} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: pillBg, color: pillTxt, border: "none", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.8"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  {p.l} <X size={12} />
                </button>
              ))}
              <button onClick={clearAll} style={{ background: "none", border: "none", color: accent, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: F, textDecoration: "underline", textUnderlineOffset: 3 }}>Clear All</button>
            </div>
          )}

          {/* MAIN TWO-COLUMN LAYOUT */}
          <div style={{ display: "flex", gap: 48, paddingTop: 24 }}>

            {/* LEFT SIDEBAR */}
            <aside style={{ width: 180, flexShrink: 0 }}>
              {/* Search */}
              <div style={{ position: "relative", marginBottom: 28 }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: txt2 }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ width: "100%", padding: "8px 10px 8px 30px", border: `1px solid ${bdr}`, borderRadius: 8, background: "transparent", color: txt, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: F }} />
              </div>

              {/* By Type */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: txt, marginBottom: 12 }}>By Type</h4>
                {[{ l: "All Types", v: "" }, { l: "Full Time", v: "FULL_TIME" }, { l: "Part Time", v: "PART_TIME" }].map(o => (
                  <button key={o.v} onClick={() => setType(o.v)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", background: "none", border: "none", cursor: "pointer", width: "100%" }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${type === o.v ? accent : (dk ? "rgba(255,255,255,0.25)" : "#ccc")}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {type === o.v && <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent }} />}
                    </div>
                    <span style={{ fontSize: 13, color: type === o.v ? txt : txt2 }}>{o.l}</span>
                  </button>
                ))}
              </div>

              {/* By Location */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: txt, marginBottom: 12 }}>By Location</h4>
                {[{ l: "All", v: "" }, { l: "Remote", v: "REMOTE" }, { l: "Onsite", v: "ONSITE" }, { l: "Hybrid", v: "HYBRID" }].map(o => (
                  <button key={o.v} onClick={() => setLoc(o.v)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", background: "none", border: "none", cursor: "pointer", width: "100%" }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${loc === o.v ? accent : (dk ? "rgba(255,255,255,0.25)" : "#ccc")}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {loc === o.v && <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent }} />}
                    </div>
                    <span style={{ fontSize: 13, color: loc === o.v ? txt : txt2 }}>{o.l}</span>
                  </button>
                ))}
              </div>

              {/* By Time Frame */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: txt, marginBottom: 4, fontFamily: F }}>Time Frame</h4>
                <div style={{ fontSize: 13, color: txt2, marginBottom: 12, fontWeight: 400, fontFamily: F }}>
                  {(() => {
                    const unitLabel = timeUnit === "months" ? "Month" : timeUnit === "weeks" ? "Week" : "Day";
                    if (minMonths === maxMonths) {
                      return `${minMonths} ${unitLabel}${minMonths > 1 ? 's' : ''}`;
                    }
                    return `${minMonths} ${unitLabel}${minMonths > 1 ? 's' : ''} - ${maxMonths} ${unitLabel}${maxMonths > 1 ? 's' : ''}`;
                  })()}
                </div>

                {/* Segmented Switcher */}
                <div style={{
                  display: "flex",
                  width: "100%",
                  background: dk ? "rgba(255,255,255,0.04)" : "#f1f5f9",
                  border: `1px solid ${bdr}`,
                  borderRadius: 8,
                  padding: 2,
                  marginBottom: 16,
                  boxSizing: "border-box"
                }}>
                  {[
                    { id: "days", label: "Days" },
                    { id: "weeks", label: "Weeks" },
                    { id: "months", label: "Months" }
                  ].map(tab => {
                    const active = timeUnit === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleUnitChange(tab.id)}
                        style={{
                          flex: 1,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "none",
                          background: active ? (dk ? "rgba(255,255,255,0.08)" : "#fff") : "transparent",
                          boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: active ? 600 : 500,
                          color: active ? txt : txt2,
                          cursor: "pointer",
                          fontFamily: F,
                          transition: "all 0.2s"
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ position: "relative", width: "100%", height: 2, margin: "12px 0 16px" }}>
                  {/* Background track */}
                  <div style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    background: dk ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                    borderRadius: 999
                  }} />

                  {/* Active track segment */}
                  <div style={{
                    position: "absolute",
                    left: `${((minMonths - 1) / ((timeUnit === "months" ? 12 : timeUnit === "weeks" ? 24 : 90) - 1)) * 100}%`,
                    right: `${100 - ((maxMonths - 1) / ((timeUnit === "months" ? 12 : timeUnit === "weeks" ? 24 : 90) - 1)) * 100}%`,
                    top: 0,
                    bottom: 0,
                    background: accent,
                    borderRadius: 999
                  }} />

                  {/* Overlay Inputs */}
                  <input
                    type="range"
                    min="1"
                    max={timeUnit === "months" ? "12" : timeUnit === "weeks" ? "24" : "90"}
                    value={minMonths}
                    onChange={e => {
                      const val = Math.min(parseInt(e.target.value, 10), maxMonths);
                      setMinMonths(val);
                    }}
                    className="range-slider-input"
                  />
                  <input
                    type="range"
                    min="1"
                    max={timeUnit === "months" ? "12" : timeUnit === "weeks" ? "24" : "90"}
                    value={maxMonths}
                    onChange={e => {
                      const val = Math.max(parseInt(e.target.value, 10), minMonths);
                      setMaxMonths(val);
                    }}
                    className="range-slider-input"
                  />
                </div>
              </div>

              {/* Review Filter */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: txt, marginBottom: 12, fontFamily: F }}>Review</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[5, 4, 3, 2, 1].map(starsCount => {
                    const on = selectedRatings.includes(starsCount);
                    return (
                      <button
                        key={starsCount}
                        onClick={() => setSelectedRatings(p => on ? p.filter(x => x !== starsCount) : [...p, starsCount])}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "4px 0",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          width: "100%",
                          textAlign: "left",
                          fontFamily: F
                        }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          border: `1.5px solid ${on ? accent : (dk ? "rgba(255,255,255,0.25)" : "#ccc")}`,
                          background: on ? accent : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s"
                        }}>
                          {on && (
                            <svg width="9" height="9" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>

                        {/* Stars */}
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          {Array(5).fill(0).map((_, idx) => {
                            const isFilled = idx < starsCount;
                            return (
                              <svg
                                key={idx}
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill={isFilled ? "#FFC107" : (dk ? "rgba(255,255,255,0.08)" : "#e2e8f0")}
                                stroke={isFilled ? "#FFC107" : (dk ? "rgba(255,255,255,0.15)" : "#d1d5db")}
                                strokeWidth="1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            );
                          })}
                        </div>

                        {/* Label */}
                        <span style={{ fontSize: 13, color: on ? txt : txt2, marginLeft: 4, transition: "color 0.2s" }}>
                          {starsCount} Star
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* By Wilaya */}
              <div style={{ marginBottom: 28, position: "relative" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: txt, marginBottom: 12 }}>By Wilaya</h4>
                <button onClick={() => setWOpen(!wOpen)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "transparent", border: `1px solid ${bdr}`, borderRadius: 8, color: wilaya ? txt : txt2, fontSize: 13, cursor: "pointer", fontFamily: F }}>
                  {wilaya || "All Wilayas"} <ChevronDown size={13} />
                </button>
                {wOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: dk ? "#1c1c1e" : "#fff", border: `1px solid ${bdr}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50, maxHeight: 220, display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: 6 }}><input value={wSearch} onChange={e => setWSearch(e.target.value)} placeholder="Search..." style={{ width: "100%", padding: "6px 8px", border: `1px solid ${bdr}`, borderRadius: 6, background: "transparent", color: txt, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: F }} /></div>
                    <div className="sidebar-scroll" style={{ overflowY: "auto", maxHeight: 170, padding: "0 4px 4px" }}>
                      <button onClick={() => { setWilaya(""); setWOpen(false); setWSearch(""); }} style={{ width: "100%", textAlign: "left", padding: "6px 8px", background: !wilaya ? hoverBg : "none", border: "none", borderRadius: 6, fontSize: 12, color: txt, cursor: "pointer", fontFamily: F }}>All Wilayas</button>
                      {WILAYAS.filter(w => w.toLowerCase().includes(wSearch.toLowerCase())).map(w => (
                        <button key={w} onClick={() => { setWilaya(w); setWOpen(false); setWSearch(""); }} style={{ width: "100%", textAlign: "left", padding: "6px 8px", background: wilaya === w ? hoverBg : "none", border: "none", borderRadius: 6, fontSize: 12, color: txt, cursor: "pointer", fontFamily: F }}>{w}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* By Skills */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: txt, marginBottom: 12 }}>By Skills</h4>
                <div className="sidebar-scroll" style={{ maxHeight: 220, overflowY: "auto" }}>
                  {SKILLS.map(s => {
                    const on = skills.includes(s); return (
                      <button key={s} onClick={() => setSkills(p => on ? p.filter(x => x !== s) : [...p, s])} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", background: "none", border: "none", cursor: "pointer", width: "100%" }}>
                        <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${on ? accent : (dk ? "rgba(255,255,255,0.25)" : "#ccc")}`, background: on ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {on && <svg width="9" height="9" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span style={{ fontSize: 13, color: on ? txt : txt2 }}>{s}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* RIGHT CONTENT — GRID */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 640 }}>
              <div style={{ flex: 1 }}>
                {loading ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                    {Array(6).fill(0).map((_, i) => <div key={i} style={{ height: 300, borderRadius: 16, background: dk ? "rgba(255,255,255,0.04)" : "#f5f5f5" }} />)}
                  </div>
                ) : items.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                    {items.map(n => {
                      const spotsLeft = Math.max(0, n.number_of_places - (n.accepted_count || 0));
                      const rating = parseFloat(parseFloat(n.rating || 0).toFixed(1));
                      const isRated = rating > 0;
                      return (
                        <div key={n.id} onClick={() => navigate(`/internships/${n.id}`)} style={{ cursor: "pointer", transition: "transform 0.3s", borderRadius: 0 }}
                          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                          {/* Image */}
                          <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 16, overflow: "hidden", background: dk ? "#222" : "#f3f0eb", position: "relative", marginBottom: 12 }}>
                            {n.banner_image ? <img src={n.banner_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.15 }}><Briefcase size={48} /></div>}
                            {(() => {
                              if (n.status === "OPEN_FOR_APPLICATION") {
                                return (
                                  <div style={{ position: "absolute", top: 12, left: 12, background: spotsLeft > 0 ? accent : "#7f8c8d", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                                    {spotsLeft > 0 ? "Open" : "Full"}
                                  </div>
                                );
                              } else if (n.status === "CLOSED_FOR_APPLICATION") {
                                return (
                                  <div style={{ position: "absolute", top: 12, left: 12, background: "#6b7280", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                                    Closed
                                  </div>
                                );
                              } else if (n.status === "ONGOING") {
                                return (
                                  <div style={{ position: "absolute", top: 12, left: 12, background: "#f59e0b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                                    Ongoing
                                  </div>
                                );
                              } else if (n.status === "FINISHED") {
                                return (
                                  <div style={{ position: "absolute", top: 12, left: 12, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                                    Finished
                                  </div>
                                );
                              } else if (n.status === "CANCELLED") {
                                return (
                                  <div style={{ position: "absolute", top: 12, left: 12, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                                    Cancelled
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            <button onClick={e => { e.stopPropagation(); setLiked(p => { const n2 = new Set(p); n2.has(n.id) ? n2.delete(n.id) : n2.add(n.id); return n2; }); }}
                              style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Heart size={14} style={{ color: liked.has(n.id) ? "#e53e3e" : "#666", fill: liked.has(n.id) ? "#e53e3e" : "none" }} />
                            </button>
                          </div>
                          {/* Info */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 12, color: txt2 }}>{n.company_name}</span>
                              <span style={{ fontSize: 8, color: dk ? "rgba(255,255,255,0.2)" : "#d1d5db" }}>•</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill={isRated ? "#FFC107" : (dk ? "rgba(255,255,255,0.2)" : "#d1d5db")} stroke={isRated ? "#FFC107" : (dk ? "rgba(255,255,255,0.2)" : "#d1d5db")} strokeWidth="1">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                <span style={{ fontSize: 11, fontWeight: 600, color: isRated ? txt : txt2 }}>{rating}</span>
                              </div>
                            </div>
                            <span style={{ fontSize: 12, color: txt2 }}>{(n.type || "").replace("_", " ")}</span>
                          </div>
                          <h3 style={{ fontSize: 15, fontWeight: 600, color: txt, margin: "0 0 6px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</h3>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: txt2 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <MapPin size={12} />
                              {n.wilaya ? `${n.wilaya} • ` : ""}
                              {n.internship_location ? (n.internship_location.charAt(0).toUpperCase() + n.internship_location.slice(1).toLowerCase()) : "N/A"}
                            </div>
                            <span style={{ fontWeight: 500, color: spotsLeft > 0 ? (spotsLeft <= 2 ? "#e53e3e" : accent) : "#888" }}>
                              {n.accepted_count || 0}/{n.number_of_places} spots
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "80px 24px", color: txt2 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: dk ? "rgba(255,255,255,0.04)" : "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                      <Briefcase size={28} style={{ opacity: 0.3, color: txt }} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: txt, marginBottom: 8 }}>{t("noInternshipsFound")}</h3>
                    <p style={{ fontSize: 14 }}>{t("couldntFindInternships")}</p>
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              {pages >= 1 && (
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

            </div>
          </div>

          {/* PLATFORM FEATURES */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, marginTop: 72, borderTop: `1px solid ${bdr}`, paddingTop: 48, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: "1 1 250px" }}>
              <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0 }}>
                <div style={{ position: "absolute", bottom: -2, right: -2, width: 32, height: 32, borderRadius: "40% 60% 60% 40% / 40% 40% 60% 60%", background: "rgba(29, 78, 216, 0.12)", zIndex: -1 }} />
                <ShieldCheck size={24} style={{ color: accent }} />
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: txt, margin: "0 0 3px", fontFamily: F }}>Verified Offers</h4>
                <p style={{ fontSize: 12, color: txt2, margin: 0, lineHeight: 1.4, fontFamily: F }}>100% verified listings from registered companies.</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: "1 1 250px" }}>
              <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0 }}>
                <div style={{ position: "absolute", bottom: -2, right: -2, width: 32, height: 32, borderRadius: "30% 70% 70% 30% / 40% 40% 60% 60%", background: "rgba(29, 78, 216, 0.12)", zIndex: -1 }} />
                <Send size={20} style={{ color: accent }} />
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: txt, margin: "0 0 3px", fontFamily: F }}>Direct Application</h4>
                <p style={{ fontSize: 12, color: txt2, margin: 0, lineHeight: 1.4, fontFamily: F }}>Apply directly to top recruiters with your digital CV.</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: "1 1 250px" }}>
              <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0 }}>
                <div style={{ position: "absolute", bottom: -2, right: -2, width: 32, height: 32, borderRadius: "60% 40% 40% 60% / 40% 40% 60% 60%", background: "rgba(29, 78, 216, 0.12)", zIndex: -1 }} />
                <Headphones size={22} style={{ color: accent }} />
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: txt, margin: "0 0 3px", fontFamily: F }}>Dedicated Support</h4>
                <p style={{ fontSize: 12, color: txt2, margin: 0, lineHeight: 1.4, fontFamily: F }}>Our team is here to assist you at every single step.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
