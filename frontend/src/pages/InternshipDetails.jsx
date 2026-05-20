import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  Clock,
  ChevronLeft,
  ChevronDown,
  Share2,
  Heart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Star,
  Send,
  Sparkles,
  BookOpen
} from 'lucide-react';
import api from '@/api/api';
import { ACCESS_TOKEN } from '@/constants';
import { useLanguage } from '@/components/language-provider';
import { useToast } from "@/components/ui/custom-toast";
import { useTheme } from '@/components/theme-provider';

export default function InternshipDetails() {
  const { t } = useLanguage();
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isAdminValidated, setIsAdminValidated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [hasCV, setHasCV] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [likedIds, setLikedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("likedInternships") || "[]");
    } catch (e) {
      return [];
    }
  });

  const toggleLike = (targetId) => {
    setLikedIds(prev => {
      const next = prev.includes(targetId) ? prev.filter(id => id !== targetId) : [...prev, targetId];
      localStorage.setItem("likedInternships", JSON.stringify(next));
      return next;
    });
  };

  // Scanned UI States
  const [activeImage, setActiveImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [reviewsSort, setReviewsSort] = useState("newest");
  const [reviewsSortOpen, setReviewsSortOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [showWriteReviewForm, setShowWriteReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewText, setNewReviewText] = useState("");

  const { theme } = useTheme();

  // Premium Theme Constants
  const F = "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const accent = "#1d4ed8";
  const dk = theme === "dark";

  const bg = "transparent";
  const cardBg = dk ? "#1c1c1e" : "#ffffff";
  const txt = dk ? "#ffffff" : "#1a1a1a";
  const txt2 = dk ? "#a1a1aa" : "#666666";
  const bdr = dk ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const pillBg = dk ? "rgba(255,255,255,0.04)" : "#f3f0eb";

  // Mock Thumbnails / Context Gallery
  const [thumbnails, setThumbnails] = useState([]);

  const mockSuggestions = [
    {
      id: 101,
      title: "Senior Product Designer",
      company_name: "Apple",
      wilaya: "Algiers",
      internship_location: "Onsite",
      banner_image: null,
      type: "FULL_TIME",
      status: "OPEN_FOR_APPLICATION",
      accepted_count: 0,
      number_of_places: 3
    },
    {
      id: 102,
      title: "Frontend Engineer",
      company_name: "Vercel",
      wilaya: "",
      internship_location: "Remote",
      banner_image: null,
      type: "PART_TIME",
      status: "OPEN_FOR_APPLICATION",
      accepted_count: 1,
      number_of_places: 2
    },
    {
      id: 103,
      title: "Marketing Lead",
      company_name: "Stripe",
      wilaya: "Oran",
      internship_location: "Hybrid",
      banner_image: null,
      type: "FULL_TIME",
      status: "CLOSED",
      accepted_count: 1,
      number_of_places: 1
    }
  ];

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/internships/${id}/reviews/?sort_by=${reviewsSort}`);
      const raw = res.data.results || res.data;
      setReviews(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error("Error fetching reviews:", e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id, reviewsSort]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      await api.post(`/internships/${id}/reviews/`, {
        rating: newReviewRating,
        title: newReviewTitle,
        text: newReviewText
      });
      toast.success("Review submitted successfully!");
      setNewReviewTitle("");
      setNewReviewText("");
      setNewReviewRating(5);
      setShowWriteReviewForm(false);
      fetchReviews();
    } catch (err) {
      console.error("Error submitting review:", err);
      const data = err.response?.data;
      let msg = "Failed to submit review.";
      if (typeof data === 'string') {
        msg = data;
      } else if (data) {
        msg = data.error || data.detail || data.non_field_errors?.[0] || Object.values(data)[0] || msg;
      }
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const reviewsToDisplay = reviews;
  const displayTotalReviews = reviews.length;
  const displayRating = reviews.length > 0
    ? parseFloat((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1))
    : 0.0;

  const breakdownPct = [5, 4, 3, 2, 1].map(stars => {
    if (reviews.length > 0) {
      const count = reviews.filter(r => Math.round(r.rating) === stars).length;
      return Math.round((count / reviews.length) * 100);
    }
    return 0;
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/internships/${id}/`);

        const item = res.data;
        let skills = [];
        if (item.internship_skills) {
          try {
            skills = JSON.parse(item.internship_skills);
            if (!Array.isArray(skills)) skills = [skills];
          } catch (e) {
            skills = [item.internship_skills];
          }
        }

        const formatDuration = (durationStr) => {
          if (!durationStr) return "Flexible";
          const parts = durationStr.split(' ');
          if (parts.length > 1) {
            const days = parts[0];
            return `${days} ${parseInt(days) === 1 ? 'day' : 'days'}`;
          }
          const timeParts = durationStr.split(':');
          if (timeParts.length >= 2) {
            const hours = parseInt(timeParts[0]);
            if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
            return `${parseInt(timeParts[1])} mins`;
          }
          return durationStr;
        };

        const formatted = {
          ...item,
          company_name: item.company_name || `Company #${item.company}`,
          wilaya: item.wilaya || "",
          required_skills: skills,
          banner_image: item.internship_image || null,
          internship_duration: formatDuration(item.internship_duration),
        };

        setInternship(formatted);

        // Prepopulate image gallery context
        const featured = formatted.banner_image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80";
        setActiveImage(featured);

        setThumbnails([
          featured,
          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=600&q=80"
        ]);

        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
          try {
            const profileRes = await api.get('/auth/profile/');
            const role = profileRes.data.role;
            setUserRole(role);
            setHasCV(profileRes.data.has_cv);

            if (role === 'STUDENT') {
              const appRes = await api.get('/applications/');
              const applications = appRes.data.results || appRes.data;
              const myApp = applications.find(app => app.internship === parseInt(id));
              if (myApp) {
                setApplied(true);
                setApplicationStatus(myApp.status);
                setIsAdminValidated(myApp.is_validated_by_admin);
              }
            }
          } catch (e) {
            console.error("Error fetching profile/apps:", e);
          }
        }

        // Fetch similar/recommended internships
        try {
          const sugRes = await api.get(`/internships/${id}/similar/`);
          const sugRaw = sugRes.data.results || sugRes.data;
          const parsedSuggestions = (Array.isArray(sugRaw) ? sugRaw : []).map(n => {
            let sk = [];
            if (n.internship_skills) {
              try {
                sk = JSON.parse(n.internship_skills);
                if (!Array.isArray(sk)) sk = [sk];
              } catch {
                sk = [n.internship_skills];
              }
            }
            return {
              ...n,
              company_name: n.company_name || `Company #${n.company}`,
              wilaya: n.wilaya || "",
              required_skills: sk,
              banner_image: n.internship_image || null,
              type: n.internship_type || "N/A"
            };
          });
          setSuggestions(parsedSuggestions);
        } catch (e) {
          console.error("Error fetching similar internships:", e);
        }

      } catch (err) {
        console.error("Error fetching details:", err);
        setError(t("couldNotFindInternship"));
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleApply = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setIsApplying(true);
      await api.post(`/applications/apply/${id}/`);

      setApplied(true);
      setApplicationStatus('PENDING');
      toast.success("Applied successfully!");
    } catch (err) {
      console.error("Error applying:", err);

      const data = err.response?.data;
      let msg = "Failed to submit application.";

      if (typeof data === 'string') {
        msg = data;
      } else if (data) {
        msg = data[0] || data.detail || data.non_field_errors?.[0] || msg;
      }

      if (msg.toLowerCase().includes("already applied")) {
        setApplied(true);
        setApplicationStatus('PENDING');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your application?")) return;
    try {
      setIsApplying(true);
      await api.delete(`/applications/cancel/${id}/`);
      setApplied(false);
      setApplicationStatus(null);
      toast.success("Application cancelled.");
    } catch (err) {
      console.error("Error cancelling:", err);
      toast.error("Failed to cancel.");
    } finally {
      setIsApplying(false);
      setIsCancelDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: bg, fontFamily: F }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${bdr}`, borderTopColor: accent, animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 24, fontSize: 16, fontWeight: 600, color: txt, animatePulse: "true" }}>{t("gatheringInfo")}</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: bg, fontFamily: F, padding: 24, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <AlertCircle size={32} style={{ color: "#ef4444" }} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: txt, marginBottom: 8 }}>Opportunity Not Found</h2>
        <p style={{ fontSize: 15, color: txt2, marginBottom: 32, maxWidth: 400 }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ padding: "10px 24px", background: accent, color: "#fff", border: "none", borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <ChevronLeft size={16} /> {t("goBack")}
        </button>
      </div>
    );
  }

  const spotsLeft = Math.max(0, internship.number_of_places - (internship.accepted_count || 0));

  return (
    <>
      <style>{`
      .detail-btn {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .detail-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(29, 78, 216, 0.08);
        opacity: 0.95;
      }
      .detail-btn:active {
        transform: translateY(0);
      }
      .secondary-btn {
        transition: all 0.2s ease;
      }
      .secondary-btn:hover {
        background: ${dk ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.03)"} !important;
        border-color: ${accent} !important;
      }
      .thumb-card {
        transition: all 0.2s ease;
      }
      .thumb-card:hover {
        transform: translateY(-2px);
        border-color: ${accent} !important;
      }
      .social-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid ${bdr};
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${txt2};
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .social-icon:hover {
        color: ${accent};
        border-color: ${accent};
        background: rgba(29, 78, 216, 0.05);
      }
      .tab-btn {
        background: none;
        border: none;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        position: relative;
        padding: 8px 16px 16px;
        font-family: ${F};
        color: ${txt2};
        transition: color 0.2s;
      }
      .tab-btn.active {
        color: ${dk ? "#fff" : "#1f2937"};
        font-weight: 600;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>

      <div style={{ minHeight: "100vh", background: bg, color: txt, fontFamily: F, paddingBottom: 64, paddingTop: 32 }}>
        {/* Centered Main Container */}
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>

          {/* SEAMLESS BREADCRUMB / ACTION ROW */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: txt2, cursor: "pointer", transition: "color 0.2s", fontFamily: F }} onMouseEnter={e => e.currentTarget.style.color = txt} onMouseLeave={e => e.currentTarget.style.color = txt2}>
              <ChevronLeft size={16} /> {t("goBack")}
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              {(() => {
                const mainIsLiked = likedIds.includes(parseInt(id));
                return (
                  <button onClick={() => toggleLike(parseInt(id))} style={{ width: 36, height: 36, borderRadius: "50%", background: dk ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: mainIsLiked ? "#e53e3e" : txt2, transition: "all 0.2s" }}>
                    <Heart size={16} fill={mainIsLiked ? "#e53e3e" : "none"} />
                  </button>
                );
              })()}
              <button style={{ width: 36, height: 36, borderRadius: "50%", background: dk ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: txt2 }}>
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* TOP COLUMNS BLOCK */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48 }}>

            {/* LEFT: GALLERY SHOWCASE */}
            <div>
              {/* Featured Image */}
              <div style={{ width: "100%", aspectRatio: "1.2/1", borderRadius: 24, overflow: "hidden", border: `1px solid ${bdr}`, background: dk ? "rgba(255,255,255,0.02)" : "#f8f9fa", position: "relative", marginBottom: 16 }}>
                <img src={activeImage} alt="Featured" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {spotsLeft > 0 ? (
                  <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                    Open for Application
                  </div>
                ) : (
                  <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(127, 140, 141, 0.1)", color: "#7f8c8d", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(127, 140, 141, 0.2)" }}>
                    Full
                  </div>
                )}
              </div>

              {/* Thumbnails list removed */}
            </div>

            {/* RIGHT: JOB OFFERS HIGHLIGHTS */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                {/* Category label */}
                <span style={{ fontSize: 12, fontWeight: 600, color: accent, textTransform: "uppercase", trackingLetter: "0.05em" }}>
                  {internship.internship_type ? internship.internship_type.replace('_', ' ') : "Opportunity"}
                </span>

                {/* Title & Badge */}
                <h1 style={{ fontSize: 32, fontWeight: 700, color: txt, margin: "8px 0 12px", lineHeight: 1.2 }}>
                  {internship.title}
                </h1>

                {/* Company & Reviews Stars */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 600, color: txt }}>
                    <Building2 size={16} style={{ color: accent }} />
                    {internship.company_name}
                  </div>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: dk ? "rgba(255,255,255,0.2)" : "#d1d5db" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          fill={i < Math.round(displayRating) ? "#fbbf24" : "none"}
                          color={i < Math.round(displayRating) ? "#fbbf24" : (dk ? "rgba(255,255,255,0.2)" : "#d1d5db")}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: txt }}>{displayRating}</span>
                    <span style={{ fontSize: 13, color: txt2 }}>({displayTotalReviews} Review{displayTotalReviews !== 1 ? 's' : ''})</span>
                  </div>
                </div>

                {/* Salary / Stipend Price Removed */}

                {/* Description summary */}
                <p style={{ fontSize: 14, color: txt2, lineHeight: 1.6, margin: "0 0 24px" }}>
                  {internship.description.slice(0, 180)}...
                </p>

                {/* Modality / Type Picker pills */}
                <div style={{ marginBottom: 28 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: txt, textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.02em" }}>Offer Modality & Structure</h4>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ padding: "8px 16px", borderRadius: 20, background: pillBg, fontSize: 13, fontWeight: 600, color: txt }}>
                      {internship.internship_location ? (internship.internship_location.charAt(0).toUpperCase() + internship.internship_location.slice(1).toLowerCase()) : "Onsite"}
                    </div>
                    <div style={{ padding: "8px 16px", borderRadius: 20, background: pillBg, fontSize: 13, fontWeight: 600, color: txt }}>
                      {internship.wilaya || "Algeria"}
                    </div>
                    <div style={{ padding: "8px 16px", borderRadius: 20, background: pillBg, fontSize: 13, fontWeight: 600, color: txt }}>
                      {internship.internship_structure ? internship.internship_structure.replace('_', ' ') : "For Credit"}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION ROWS */}
              <div style={{ borderTop: `1px solid ${bdr}`, paddingTop: 24, marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  {/* Quantity pill (Capacity indicator) */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${bdr}`, borderRadius: 24, padding: "8px 16px", background: dk ? "rgba(255,255,255,0.03)" : "#f8f9fa", fontFamily: F, fontSize: 13, color: txt, fontWeight: 600 }}>
                    <Users size={14} style={{ color: accent }} />
                    <span>{internship.accepted_count || 0}/{internship.number_of_places} spots filled</span>
                  </div>

                  {/* Main Action buttons */}
                  <div style={{ flex: 1, display: "flex", gap: 12, minWidth: 200 }}>
                    {userRole === 'COMPANY' || userRole === 'ADMIN' ? (
                      <div style={{ padding: "12px 24px", borderRadius: 24, background: pillBg, color: txt2, fontSize: 14, fontWeight: 600, textAlign: "center", width: "100%" }}>
                        Recruiter Mode Active
                      </div>
                    ) : applied ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(29, 78, 216, 0.08)", color: accent, padding: "12px 24px", borderRadius: 24, fontSize: 14, fontWeight: 700 }}>
                          <CheckCircle2 size={16} /> Application Status: {applicationStatus}
                        </div>
                        {applicationStatus === 'PENDING' && (
                          <button onClick={handleCancel} className="secondary-btn" style={{ background: "none", border: `1.5px solid #ef4444`, color: "#ef4444", padding: "12px 24px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%" }}>
                            Cancel Application
                          </button>
                        )}
                      </div>
                    ) : internship.status !== 'OPEN_FOR_APPLICATION' || new Date(internship.offer_end_date) < new Date() ? (
                      <button disabled style={{ background: dk ? "rgba(255,255,255,0.04)" : "#e5e7eb", color: txt2, border: "none", padding: "12px 24px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "not-allowed", width: "100%" }}>
                        Offer Closed
                      </button>
                    ) : userRole === 'STUDENT' && !hasCV ? (
                      <div style={{ width: "100%" }}>
                        <button disabled style={{ background: dk ? "rgba(255,255,255,0.04)" : "#e5e7eb", color: txt2, border: "none", padding: "12px 24px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "not-allowed", width: "100%", marginBottom: 12 }}>
                          Apply Now
                        </button>
                        <div style={{ background: "rgba(29,78,216,0.05)", border: `1px solid rgba(29,78,216,0.1)`, borderRadius: 16, padding: 16 }}>
                          <div style={{ display: "flex", gap: 12 }}>
                            <AlertCircle size={18} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <h5 style={{ fontSize: 13, fontWeight: 700, color: txt, margin: "0 0 4px" }}>CV Upload Required</h5>
                              <p style={{ fontSize: 11, color: txt2, margin: "0 0 10px", lineHeight: 1.4 }}>Please upload your CV in student dashboard to unlock applications.</p>
                              <button onClick={() => navigate('/studentdashboard/cv')} style={{ background: "none", border: "none", padding: 0, color: accent, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                                Go to CV Manager <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button onClick={handleApply} disabled={isApplying} className="detail-btn" style={{ flex: 1, background: accent, color: "#fff", border: "none", padding: "14px 28px", borderRadius: 24, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        {isApplying ? "Submitting..." : "Apply Now"} <ArrowRight size={16} />
                      </button>
                    )}
                  </div>

                </div>

                {/* Detailed Specs & Parameters */}
                <div style={{ borderTop: `1px solid ${bdr}`, marginTop: 24, paddingTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px 24px", fontSize: 13, fontFamily: F }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: txt2, textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.02em" }}>
                      <Briefcase size={12} /> Offer ID
                    </div>
                    <div style={{ fontWeight: 600, color: txt }}>INT-{internship.id}</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: txt2, textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.02em" }}>
                      <Sparkles size={12} /> Required Skills
                    </div>
                    <div style={{ fontWeight: 600, color: txt, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{internship.required_skills.join(", ") || "General Skills"}</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: txt2, textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.02em" }}>
                      <Calendar size={12} /> Timeline
                    </div>
                    <div style={{ fontWeight: 600, color: txt }}>{internship.offer_start_date} → {internship.offer_end_date}</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: txt2, textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.02em" }}>
                      <Clock size={12} /> Duration
                    </div>
                    <div style={{ fontWeight: 600, color: txt }}>{internship.internship_duration}</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: txt2, textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.02em" }}>
                      <Send size={12} /> Apply Within
                    </div>
                    <div style={{ fontWeight: 600, color: txt }}>
                      {(() => {
                        const now = new Date();
                        const end = new Date(internship.offer_end_date);
                        const diff = end - now;
                        if (diff <= 0) return "Offer Closed";
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        if (days > 0) return `${days} Days`;
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        if (hours > 0) return `${hours} Hours`;
                        return "< 1 Hour";
                      })()}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* LOWER NAVIGATION TABS */}
        <div style={{ maxWidth: 1000, margin: "48px auto 0", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 64, borderBottom: `1px solid ${dk ? "rgba(255,255,255,0.08)" : "#f1f5f9"}`, marginBottom: 32, paddingBottom: 0 }}>
            {["description", "reviews", "suggestions"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}>
                {tab === "reviews" ? "Review" : tab === "suggestions" ? "Similar Offers" : "Description"}
                {activeTab === tab && (
                  <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2, background: accent, borderRadius: 0 }} />
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS */}
          <div>
            {/* TAB 1: DESCRIPTION */}
            {activeTab === "description" && (
              <div style={{ background: cardBg, border: `1px solid ${bdr}`, borderRadius: 24, padding: "36px 40px", lineHeight: 1.7, fontSize: 15, color: txt2, fontFamily: F }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <BookOpen size={20} style={{ color: accent }} />
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: txt, margin: 0, letterSpacing: "-0.01em" }}>Opportunity Overview</h3>
                </div>
                <div style={{ marginBottom: 32 }}>
                  {internship.description ? internship.description.split('\n').map((para, i) => (
                    <p key={i} style={{ marginBottom: 12 }}>{para}</p>
                  )) : (
                    <p style={{ fontStyle: "italic", opacity: 0.7 }}>No description provided.</p>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 40, marginBottom: 16 }}>
                  <CheckCircle2 size={20} style={{ color: accent }} />
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: txt, margin: 0, letterSpacing: "-0.01em" }}>Required Skills</h3>
                </div>
                {internship.required_skills && internship.required_skills.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {internship.required_skills.map(s => (
                      <span key={s} style={{ background: dk ? "rgba(255,255,255,0.06)" : "#f1f5f9", color: txt, padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: `1px solid ${dk ? "rgba(255,255,255,0.05)" : "transparent"}` }}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontStyle: "italic", opacity: 0.7, fontSize: 14, margin: 0 }}>No specific skills listed.</p>
                )}
              </div>
            )}

            {/* TAB 2: ADDITIONAL INFO REMOVED */}

            {/* TAB 3: REVIEWS — IMPLEMENTED MATCHING THE SCANNED DESIGN 100% */}
            {activeTab === "reviews" && (
              <div>
                {/* Star Rating summary breakdown */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 64, marginBottom: 48, flexWrap: "wrap" }}>
                  {/* Left score card */}
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 140 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 36, fontWeight: 500, color: txt, fontFamily: F }}>{displayRating}</span>
                      <span style={{ fontSize: 13, color: txt2, fontWeight: 500 }}>out of 5</span>
                    </div>
                    <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < Math.round(displayRating) ? "#fbbf24" : "none"}
                          color={i < Math.round(displayRating) ? "#fbbf24" : (dk ? "rgba(255,255,255,0.2)" : "#d1d5db")}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: txt2 }}>({displayTotalReviews} Review{displayTotalReviews !== 1 ? 's' : ''})</span>
                  </div>

                  {/* Right score bars */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, maxWidth: 400 }}>
                    {[
                      { stars: 5, pct: breakdownPct[0] },
                      { stars: 4, pct: breakdownPct[1] },
                      { stars: 3, pct: breakdownPct[2] },
                      { stars: 2, pct: breakdownPct[3] },
                      { stars: 1, pct: breakdownPct[4] }
                    ].map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: txt2, fontFamily: F }}>
                        <span style={{ width: 44, textAlign: "left", fontWeight: 500, fontSize: 11 }}>{r.stars} Star</span>
                        <div style={{ flex: 1, height: 4, background: dk ? "rgba(255,255,255,0.06)" : "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${r.pct}%`, height: "100%", background: "#fbbf24", borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Write review toggle column */}
                  {userRole === 'STUDENT' && (
                    <div style={{ display: "flex", flex: 1, justifyContent: "flex-end", minWidth: 150, alignSelf: "center" }}>
                      <button
                        onClick={() => setShowWriteReviewForm(!showWriteReviewForm)}
                        className="secondary-btn"
                        style={{
                          background: dk ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
                          color: showWriteReviewForm ? "#ef4444" : txt,
                          border: `1px solid ${showWriteReviewForm ? (dk ? "rgba(239, 68, 68, 0.3)" : "#fca5a5") : bdr}`,
                          padding: "8px 16px",
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontFamily: F,
                          transition: "all 0.2s ease"
                        }}
                      >
                        <MessageSquare size={14} style={{ color: showWriteReviewForm ? "#ef4444" : txt2 }} />
                        {showWriteReviewForm ? "Cancel Review" : "Write a Review"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Write Review Form Block */}
                {showWriteReviewForm && userRole === 'STUDENT' && (
                  <form
                    onSubmit={handleReviewSubmit}
                    style={{
                      background: dk ? "rgba(255, 255, 255, 0.02)" : "#fafafa",
                      border: `1px solid ${bdr}`,
                      borderRadius: 24,
                      padding: "32px 36px",
                      marginBottom: 40,
                      animation: "fadeIn 0.3s ease-out",
                      fontFamily: F,
                      boxSizing: "border-box"
                    }}
                  >
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: txt, margin: "0 0 6px" }}>Write a Review</h3>
                    <p style={{ fontSize: "0.875rem", color: txt2, margin: "0 0 24px" }}>Share your experience with this internship offer to help other students.</p>

                    {/* Star selection */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: txt }}>Your Rating:</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            fill={star <= newReviewRating ? "#fbbf24" : "none"}
                            color={star <= newReviewRating ? "#fbbf24" : (dk ? "rgba(255,255,255,0.2)" : "#d1d5db")}
                            strokeWidth={1.5}
                            style={{ cursor: "pointer", transition: "transform 0.1s" }}
                            onClick={() => setNewReviewRating(star)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: txt, marginLeft: 8 }}>{parseFloat(newReviewRating).toFixed(1)} Star</span>
                    </div>

                    {/* Review Title input */}
                    <div style={{ marginBottom: 24 }}>
                      <label htmlFor="review-title-input" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: txt, marginBottom: 8 }}>Review Title</label>
                      <input
                        id="review-title-input"
                        type="text"
                        required
                        placeholder="e.g. Absolutely love this internship!"
                        value={newReviewTitle}
                        onChange={(e) => setNewReviewTitle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "14px 20px",
                          borderRadius: 16,
                          background: dk ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
                          border: `1.5px solid ${bdr}`,
                          color: txt,
                          fontSize: 14,
                          fontFamily: F,
                          outline: "none",
                          boxSizing: "border-box",
                          transition: "border-color 0.2s"
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = accent}
                        onBlur={(e) => e.currentTarget.style.borderColor = bdr}
                      />
                    </div>

                    {/* Review Comments textarea */}
                    <div style={{ marginBottom: 32 }}>
                      <label htmlFor="review-text-input" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: txt, marginBottom: 8 }}>Review Comments</label>
                      <textarea
                        id="review-text-input"
                        required
                        rows={4}
                        placeholder="Share details of your experience, work environment, or what you learned..."
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "16px 20px",
                          borderRadius: 16,
                          background: dk ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
                          border: `1.5px solid ${bdr}`,
                          color: txt,
                          fontSize: 14,
                          fontFamily: F,
                          outline: "none",
                          boxSizing: "border-box",
                          resize: "vertical",
                          transition: "border-color 0.2s"
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = accent}
                        onBlur={(e) => e.currentTarget.style.borderColor = bdr}
                      />
                    </div>

                    {/* Submit Review Button */}
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="detail-btn"
                      style={{
                        background: accent,
                        color: "#ffffff",
                        border: "none",
                        padding: "14px 28px",
                        borderRadius: 24,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: "0 4px 12px rgba(29, 78, 216, 0.15)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                      <Send size={14} />
                    </button>
                  </form>
                )}

                {/* Review list heading */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: txt, margin: "0 0 8px" }}>Review List</h4>
                    <span style={{ fontSize: 12, color: txt2 }}>
                      Showing {reviewsToDisplay.length > 0 ? `1-${reviewsToDisplay.length}` : "0"} of {displayTotalReviews} results
                    </span>
                  </div>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: txt2 }}>
                    <span>Sort by :</span>

                    <div
                      onClick={() => setReviewsSortOpen(!reviewsSortOpen)}
                      style={{ padding: "6px 28px 6px 14px", borderRadius: 20, background: dk ? "rgba(255,255,255,0.04)" : "#fff", color: txt, border: `1px solid ${dk ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, cursor: "pointer", fontWeight: 500, fontFamily: F, position: "relative", userSelect: "none" }}
                    >
                      {reviewsSort === 'newest' ? 'Newest' : 'Highest'}
                      <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: txt2 }} />
                    </div>

                    {reviewsSortOpen && (
                      <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, width: 140, background: cardBg, border: `1px solid ${bdr}`, borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.05)", zIndex: 50, overflow: "hidden", display: "flex", flexDirection: "column", padding: 4 }}>
                        <div
                          onClick={() => { setReviewsSort('newest'); setReviewsSortOpen(false); }}
                          style={{ padding: "8px 12px", fontSize: 13, fontWeight: 500, color: txt, cursor: "pointer", borderRadius: 8, background: reviewsSort === 'newest' ? (dk ? "rgba(255,255,255,0.05)" : "#f1f5f9") : "transparent" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = dk ? "rgba(255,255,255,0.05)" : "#f1f5f9"}
                          onMouseLeave={(e) => e.currentTarget.style.background = reviewsSort === 'newest' ? (dk ? "rgba(255,255,255,0.05)" : "#f1f5f9") : "transparent"}
                        >
                          Newest
                        </div>
                        <div
                          onClick={() => { setReviewsSort('highest'); setReviewsSortOpen(false); }}
                          style={{ padding: "8px 12px", fontSize: 13, fontWeight: 500, color: txt, cursor: "pointer", borderRadius: 8, background: reviewsSort === 'highest' ? (dk ? "rgba(255,255,255,0.05)" : "#f1f5f9") : "transparent" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = dk ? "rgba(255,255,255,0.05)" : "#f1f5f9"}
                          onMouseLeave={(e) => e.currentTarget.style.background = reviewsSort === 'highest' ? (dk ? "rgba(255,255,255,0.05)" : "#f1f5f9") : "transparent"}
                        >
                          Highest
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review cards list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {reviewsToDisplay.length > 0 ? (
                    reviewsToDisplay.map(r => {
                      const isVerified = r.is_verified || r.verified;
                      return (
                        <div key={r.id} style={{ display: "flex", flexDirection: "column", gap: 16, borderBottom: `1px solid ${dk ? "rgba(255,255,255,0.06)" : "#f1f5f9"}`, paddingBottom: 32 }}>

                          {/* User profile row */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              {/* Avatar */}
                              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#f1f5f9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {r.avatar ? <img src={r.avatar} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 14, fontWeight: 600, color: txt2 }}>{r.name ? r.name[0] : "?"}</span>}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <h5 style={{ fontSize: 14, fontWeight: 500, color: txt, margin: "0 0 2px" }}>{r.name}</h5>
                                {isVerified && (
                                  <span style={{ fontSize: 12, color: txt2 }}>
                                    (Verified)
                                  </span>
                                )}
                              </div>
                            </div>
                            <span style={{ fontSize: 13, color: txt2 }}>{r.time}</span>
                          </div>

                          {/* Review text */}
                          {r.title || r.text ? (
                            <div>
                              {r.title && <h6 style={{ fontSize: 15, fontWeight: 600, color: txt, margin: "0 0 8px" }}>{r.title}</h6>}
                              {r.text && <p style={{ fontSize: 14, color: txt2, lineHeight: 1.6, margin: "0 0 16px" }}>{r.text}</p>}

                              {/* Rating stars */}
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ display: "flex", gap: 2 }}>
                                  {Array(5).fill(0).map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      fill={i < Math.floor(r.rating) ? "#fbbf24" : "none"}
                                      color={i < Math.floor(r.rating) ? "#fbbf24" : (dk ? "rgba(255,255,255,0.2)" : "#e2e8f0")}
                                      strokeWidth={1.5}
                                    />
                                  ))}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 500, color: txt }}>{parseFloat(r.rating).toFixed(1)}</span>
                              </div>
                            </div>
                          ) : null}

                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: "40px 20px", textAlign: "center", background: dk ? "rgba(255,255,255,0.02)" : "#fafafa", borderRadius: 24, border: `1px dashed ${bdr}` }}>
                      <p style={{ margin: 0, fontStyle: "italic", color: txt2, fontSize: 15 }}>No reviews yet for this internship offer.</p>
                    </div>
                  )}
                </div>


              </div>
            )}

{/* TAB 4: SUGGESTIONS */}
            {activeTab === "suggestions" && (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: txt, marginBottom: 24 }}>You might also like</h3>
                {suggestions.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                    {suggestions.map(n => {
                      const spotsLeft = Math.max(0, n.number_of_places - (n.accepted_count || 0));
                      const rawRating = n.rating || n.company_rating || 0.0;
                      const rating = parseFloat(parseFloat(rawRating).toFixed(1));
                    return (
                      <div key={n.id} onClick={() => navigate(`/internships/${n.id}`)} style={{ cursor: "pointer", transition: "transform 0.3s", borderRadius: 0 }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                        {/* Image */}
                        <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 16, overflow: "hidden", background: dk ? "#222" : "#f3f0eb", position: "relative", marginBottom: 12 }}>
                          {n.banner_image ? <img src={n.banner_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.15 }}><Briefcase size={48} /></div>}
                          {n.status === "OPEN_FOR_APPLICATION" && (
                            <div style={{ position: "absolute", top: 12, left: 12, background: spotsLeft > 0 ? accent : "#7f8c8d", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                              {spotsLeft > 0 ? "Open" : "Full"}
                            </div>
                          )}
                          {(() => {
                            const suggIsLiked = likedIds.includes(n.id);
                            return (
                              <button onClick={e => { e.stopPropagation(); toggleLike(n.id); }}
                                style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <Heart size={14} style={{ color: suggIsLiked ? "#e53e3e" : "#666", fill: suggIsLiked ? "#e53e3e" : "none" }} />
                              </button>
                            );
                          })()}
                        </div>
                        {/* Info */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, color: txt2 }}>{n.company_name}</span>
                            <span style={{ fontSize: 8, color: dk ? "rgba(255,255,255,0.2)" : "#d1d5db" }}>•</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth="1">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              <span style={{ fontSize: 11, fontWeight: 600, color: txt }}>{rating}</span>
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
                  <div style={{ padding: "40px", textAlign: "center", background: dk ? "rgba(255,255,255,0.02)" : "#fafafa", borderRadius: 24, border: `1px dashed ${bdr}` }}>
                    <p style={{ margin: 0, fontStyle: "italic", color: txt2, fontSize: 15 }}>No similar internship offers found at the moment.</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </>
  );
}
