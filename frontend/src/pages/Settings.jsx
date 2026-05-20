import { useState, useEffect, useRef } from "react";
import { User, Lock, Palette, Camera, Loader2, CheckCircle2, AlertCircle, Languages, LogOut, Globe, ShieldCheck, HelpCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/components/language-provider";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, changeLanguage, t, langNameMap } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [langDialog, setLangDialog] = useState({ open: false, target: null });
  const [activeTab, setActiveTab] = useState("account");

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    profile_picture: null,
    role: "STUDENT",
    name: "",
    description: "",
    location: "",
    website: "",
    company_field: "",
    founded_year: "",
    university_id: "",
    university_name: "",
    wilaya: "",
    phone: "",
    department: "",
    status_required: "",
    message: "",
    size: ""
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile/");
        setProfileData({
          username: res.data.username || "",
          email: res.data.email || "",
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          profile_picture: res.data.role === "COMPANY" ? (res.data.logo || res.data.profile_picture || null) : (res.data.profile_picture || null),
          role: res.data.role || "STUDENT",
          name: res.data.name || "",
          description: res.data.description || "",
          location: res.data.location || "",
          website: res.data.website || "",
          company_field: res.data.company_field || "",
          founded_year: res.data.founded_year || "",
          university_id: res.data.university_id || "",
          university_name: res.data.university_name || "",
          wilaya: res.data.wilaya || "",
          phone: res.data.phone || "",
          department: res.data.department || "",
          status_required: res.data.status_required || "",
          message: res.data.message || "",
          size: res.data.size || ""
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfileData({ ...profileData, profile_picture: previewUrl });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const formData = new FormData();

      if (profileData.role === "COMPANY") {
        formData.append("name", profileData.name);
        formData.append("description", profileData.description);
        formData.append("location", profileData.location);
        formData.append("website", profileData.website);
        formData.append("company_field", profileData.company_field);
        formData.append("founded_year", profileData.founded_year);
        formData.append("phone", profileData.phone);
        formData.append("status_required", profileData.status_required);
        formData.append("message", profileData.message);
        formData.append("size", profileData.size);
      } else {
        formData.append("first_name", profileData.first_name);
        formData.append("last_name", profileData.last_name);
        formData.append("university_id", profileData.university_id);
        formData.append("wilaya", profileData.wilaya);
        formData.append("phone", profileData.phone);
        formData.append("department", profileData.department);
      }

      if (selectedFile) {
        formData.append("profile_picture", selectedFile);
      }

      await api.patch("/auth/profile/", formData);
      setMessage({ type: "success", text: t("profileUpdated") });
    } catch (error) {
      setMessage({ type: "error", text: t("profileError") });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: "error", text: t("passwordMismatch") });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post("/auth/change-password/", {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      setMessage({ type: "success", text: t("passwordChanged") });
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.old_password?.[0] || t("passwordError") });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageClick = (lang) => {
    const langCode = { English: "en", Français: "fr", العربية: "ar" }[lang];
    if (langCode === language) return;
    setLangDialog({ open: true, target: lang });
  };

  const confirmLanguageChange = () => {
    changeLanguage(langDialog.target);
    setLangDialog({ open: false, target: null });
  };

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-white dark:bg-background transition-colors duration-300">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const currentLangName = langNameMap[language] || "English";

  const getTabClass = (tabName) => {
    const isActive = activeTab === tabName;
    return `w-full flex items-center justify-start py-3 px-4 gap-3 font-bold transition-all ${isActive
      ? "text-[#1a3a6b] bg-[#f0f4fa] dark:bg-[rgba(255,255,255,0.08)] dark:text-[#f8fafc] border-l-4 border-[#1a3a6b] dark:border-[#93c5fd] rounded-r-lg"
      : "text-[#5f6c80] hover:bg-[#f0f4fa]/50 hover:text-[#1a3a6b] dark:text-slate-400 dark:hover:text-[#f8fafc] dark:hover:bg-[rgba(255,255,255,0.03)] rounded-lg"
      }`;
  };

  return (
    <div className="bg-white dark:bg-background text-foreground min-h-screen py-8 px-4 md:px-6 transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .settings-container {
            font-family: 'Inter', -apple-system, sans-serif;
        }
        
        .settings-card {
            background-color: #f0f4fa;
            border: 1px solid rgba(26, 58, 107, 0.05);
            border-radius: 28px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
            padding: 32px;
        }
        
        .dark .settings-card {
            background-color: #132237;
            border: 1px solid rgba(59, 130, 246, 0.15);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
        }

        .settings-input {
            width: 100%;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            background-color: #ffffff;
            padding: 10px 16px;
            font-size: 14px;
            color: #111111;
            transition: all 0.2s;
        }
        
        .dark .settings-input {
            background-color: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #f8fafc;
        }
        
        .settings-input:focus {
            outline: none;
            border-color: #1a3a6b;
            box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
        }
        
        .dark .settings-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        .settings-label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            color: #334155;
            margin-bottom: 6px;
            letter-spacing: -0.01em;
        }
        
        .dark .settings-label {
            color: #94a3b8;
        }

        .settings-btn-primary {
            background-color: #1a3a6b;
            color: white;
            font-size: 14px;
            font-weight: 600;
            padding: 10px 24px;
            border-radius: 12px;
            transition: opacity 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .dark .settings-btn-primary {
            background-color: #3b82f6;
            color: #ffffff;
        }

        .settings-btn-primary:hover {
            opacity: 0.9;
        }
        
        .settings-btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .avatar-box {
            background-color: #ffffff;
            border: 4px solid #ffffff;
            color: #1a3a6b;
        }
        .dark .avatar-box {
            background-color: rgba(255, 255, 255, 0.05);
            border: 4px solid #132237;
            color: #93c5fd;
        }
        
        .glass-btn {
            background-color: #ffffff;
            border-color: #e2e8f0;
        }
        .dark .glass-btn {
            background-color: rgba(255, 255, 255, 0.03);
            border-color: rgba(255, 255, 255, 0.1);
        }
        .dark .glass-btn:hover {
            background-color: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <div className="max-w-5xl mx-auto settings-container space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button onClick={() => navigate(-1)} className="mt-1 p-2 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c2e4a] transition-colors">
            <ArrowLeft className="h-6 w-6 rtl:rotate-180 text-slate-600 dark:text-[#93c5fd]" />
          </button>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#111111] dark:text-white">{t("settings")}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t("settingsDesc")}</p>
          </div>
        </div>

        <div className="h-[1px] bg-slate-100 dark:bg-slate-800/50 w-full" />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
              <button onClick={() => setActiveTab('account')} className={getTabClass('account')}>
                <User className="h-4 w-4" /> {t("account")}
              </button>
              <button onClick={() => setActiveTab('security')} className={getTabClass('security')}>
                <Lock className="h-4 w-4" /> {t("security")}
              </button>
              <button onClick={() => setActiveTab('appearance')} className={getTabClass('appearance')}>
                <Palette className="h-4 w-4" /> {t("appearance")}
              </button>
              <button onClick={() => setActiveTab('language')} className={getTabClass('language')}>
                <Languages className="h-4 w-4" /> {t("language")}
              </button>
              <button onClick={() => setActiveTab('privacy')} className={getTabClass('privacy')}>
                <ShieldCheck className="h-4 w-4" /> {t("privacyPolicy")}
              </button>
              <button onClick={() => setActiveTab('support')} className={getTabClass('support')}>
                <HelpCircle className="h-4 w-4" /> {t("supportCenter")}
              </button>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  onClick={() => navigate("/logout")}
                  className="w-full flex items-center justify-start py-3 px-4 gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-bold rounded-lg"
                >
                  <LogOut className="h-4 w-4" /> {t("logout")}
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-6">
            {message.text && (
              <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"}`}>
                {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="settings-card">
                <div className="mb-6">
                  <h2 className="text-[18px] font-bold text-[#111111] dark:text-white tracking-tight">{t("publicProfile")}</h2>
                  <p className="text-[13px] text-[#334155] dark:text-[#94a3b8] font-medium mt-1">{t("publicProfileDesc")}</p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-8">
                  <div className="flex items-center gap-6 pb-4">
                    <div
                      className="relative group cursor-pointer h-24 w-24 rounded-full flex-shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="h-full w-full rounded-full overflow-hidden avatar-box shadow-md flex items-center justify-center text-2xl font-bold">
                        {profileData.profile_picture ? (
                          <img src={profileData.profile_picture} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          profileData.username?.charAt(0).toUpperCase() || profileData.name?.charAt(0).toUpperCase() || "U"
                        )}
                      </div>

                      <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <p className="text-sm text-[#334155] dark:text-[#94a3b8] font-medium italic max-w-[200px] leading-snug">{t("photoHint")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileData.role === "COMPANY" ? (
                      <>
                        <div>
                          <label className="settings-label" htmlFor="companyName">Organization Name</label>
                          <input
                            id="companyName"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="settings-input"
                          />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="email">Email</label>
                          <input id="email" value={profileData.email} disabled className="settings-input opacity-70 cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="location">Address</label>
                          <input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            className="settings-input"
                          />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="companyField">Type Of Organization</label>
                          <input
                            id="companyField"
                            value={profileData.company_field}
                            onChange={(e) => setProfileData({ ...profileData, company_field: e.target.value })}
                            className="settings-input"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="settings-label" htmlFor="website">Website</label>
                          <input
                            id="website"
                            type="url"
                            value={profileData.website}
                            onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                            className="settings-input"
                          />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="foundedYear">Founded Year</label>
                          <select
                            id="foundedYear"
                            value={profileData.founded_year}
                            onChange={(e) => setProfileData({ ...profileData, founded_year: e.target.value })}
                            className="settings-input"
                          >
                            <option value="">Select Year</option>
                            {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="phone">Phone Number</label>
                          <input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="settings-input"
                            placeholder="05 / 06 / 07 ..."
                          />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="statusRequired">Status Required</label>
                          <input
                            id="statusRequired"
                            value={profileData.status_required}
                            onChange={(e) => setProfileData({ ...profileData, status_required: e.target.value })}
                            className="settings-input"
                            placeholder="e.g. Corporate Verification"
                          />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="message">Message</label>
                          <input
                            id="message"
                            value={profileData.message}
                            onChange={(e) => setProfileData({ ...profileData, message: e.target.value })}
                            className="settings-input"
                            placeholder="e.g. Active partner organization"
                          />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="companySize">Company Size</label>
                          <select
                            id="companySize"
                            value={profileData.size}
                            onChange={(e) => setProfileData({ ...profileData, size: e.target.value })}
                            className="settings-input"
                          >
                            <option value="">Select Company Size</option>
                            <option value="1-9 Employees">1-9 Employees</option>
                            <option value="10-50 Employees">10-50 Employees</option>
                            <option value="51-200 Employees">51-200 Employees</option>
                            <option value="201-500 Employees">201-500 Employees</option>
                            <option value="501-1000 Employees">501-1000 Employees</option>
                            <option value="1001-5000 Employees">1001-5000 Employees</option>
                            <option value="5000+ Employees">5000+ Employees</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="settings-label" htmlFor="description">Corporate Statement</label>
                          <textarea
                            id="description"
                            rows={3}
                            value={profileData.description}
                            onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                            className="settings-input min-h-[80px]"
                            placeholder="Write your corporate statement here..."
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="settings-label" htmlFor="firstName">{t("firstName")}</label>
                          <input
                            id="firstName"
                            value={profileData.first_name}
                            onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                            className="settings-input"
                          />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="lastName">{t("lastName")}</label>
                          <input
                            id="lastName"
                            value={profileData.last_name}
                            onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                            className="settings-input"
                          />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="email">{t("emailAddress")}</label>
                          <input id="email" value={profileData.email} disabled className="settings-input opacity-70 cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="phone">{t("phoneNumber")}</label>
                          <input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="settings-input"
                            placeholder="05 / 06 / 07 ..."
                          />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="wilaya">{t("wilaya")}</label>
                          <input
                            id="wilaya"
                            value={profileData.wilaya}
                            onChange={(e) => setProfileData({ ...profileData, wilaya: e.target.value })}
                            className="settings-input"
                          />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="universityID">{t("universityID")}</label>
                          <input
                            id="universityID"
                            value={profileData.university_id}
                            onChange={(e) => setProfileData({ ...profileData, university_id: e.target.value })}
                            className="settings-input"
                          />
                        </div>
                        <div>
                          <label className="settings-label" htmlFor="major">{t("majorField")}</label>
                          <input
                            id="major"
                            value={profileData.major}
                            onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                            className="settings-input"
                            placeholder="Computer Science, Finance, etc."
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={loading} className="settings-btn-primary shadow-lg shadow-[#1a3a6b]/20 dark:shadow-none">
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {t("updateProfile")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="settings-card">
                <div className="mb-6">
                  <h2 className="text-[18px] font-bold text-[#111111] dark:text-white tracking-tight">{t("securitySettings")}</h2>
                  <p className="text-[13px] text-[#334155] dark:text-[#94a3b8] font-medium mt-1">{t("securityDesc")}</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                  <div>
                    <label className="settings-label" htmlFor="oldPass">{t("currentPassword")}</label>
                    <div className="relative">
                      <input
                        id="oldPass"
                        type={showOldPassword ? "text" : "password"}
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        className="settings-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#334155] dark:text-slate-400 hover:text-[#1a3a6b] dark:hover:text-white transition-colors focus:outline-none"
                      >
                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[rgba(26,58,107,0.08)] dark:bg-[rgba(255,255,255,0.1)] w-full my-4" />

                  <div>
                    <label className="settings-label" htmlFor="newPass">{t("newPassword")}</label>
                    <div className="relative">
                      <input
                        id="newPass"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="settings-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#334155] dark:text-slate-400 hover:text-[#1a3a6b] dark:hover:text-white transition-colors focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="settings-label" htmlFor="confirmPass">{t("confirmPassword")}</label>
                    <div className="relative">
                      <input
                        id="confirmPass"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        className="settings-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#334155] dark:text-slate-400 hover:text-[#1a3a6b] dark:hover:text-white transition-colors focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-start">
                    <button type="submit" disabled={loading} className="settings-btn-primary shadow-lg shadow-[#1a3a6b]/20 dark:shadow-none">
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {t("changePassword")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="settings-card">
                <div className="mb-6">
                  <h2 className="text-[18px] font-bold text-[#111111] dark:text-white tracking-tight">{t("appearanceSettings")}</h2>
                  <p className="text-[13px] text-[#334155] dark:text-[#94a3b8] font-medium mt-1">{t("appearanceDesc")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 glass-btn ${theme === "light" ? "border-[#1a3a6b] dark:border-[#3b82f6] ring-4 ring-[#1a3a6b]/10 dark:ring-[#3b82f6]/20" : ""
                      }`}
                  >
                    <div className="w-full h-32 rounded-xl bg-white border border-[#e2e8f0] p-2 space-y-2 shadow-sm">
                      <div className="w-full h-4 bg-[#f0f4fa] rounded" />
                      <div className="w-2/3 h-4 bg-slate-50 rounded" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-8 bg-[#f0f4fa] rounded" />
                        <div className="h-8 bg-slate-50 rounded" />
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#111111] dark:text-white">{t("lightMode")}</span>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 glass-btn ${theme === "dark" ? "border-[#1a3a6b] dark:border-[#3b82f6] ring-4 ring-[#1a3a6b]/10 dark:ring-[#3b82f6]/20" : ""
                      }`}
                  >
                    <div className="w-full h-32 rounded-xl bg-[#132237] border border-[rgba(59,130,246,0.15)] p-2 space-y-2 shadow-sm">
                      <div className="w-full h-4 bg-slate-800 rounded" />
                      <div className="w-2/3 h-4 bg-slate-800/50 rounded" />
                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <div className="h-8 bg-white/10 rounded" />
                        <div className="h-8 bg-slate-800 rounded" />
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#111111] dark:text-white">{t("darkMode")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === 'language' && (
              <div className="settings-card">
                <div className="mb-6">
                  <h2 className="text-[18px] font-bold text-[#111111] dark:text-white tracking-tight">{t("languageSettings")}</h2>
                  <p className="text-[13px] text-[#334155] dark:text-[#94a3b8] font-medium mt-1">{t("languageDesc")}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["English", "Français", "العربية"].map((lang) => {
                    const langCode = { English: "en", Français: "fr", العربية: "ar" }[lang];
                    const isActive = langCode === language;
                    return (
                      <button
                        key={lang}
                        onClick={() => handleLanguageClick(lang)}
                        className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all glass-btn ${isActive ? "border-[#1a3a6b] dark:border-[#3b82f6] ring-2 ring-[#1a3a6b]/10 dark:ring-[#3b82f6]/20" : ""
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-[#334155] dark:text-[#94a3b8]" />
                          <span className={`font-bold ${isActive ? "text-[#1a3a6b] dark:text-[#3b82f6]" : "text-[#111111] dark:text-white"}`}>{lang}</span>
                        </div>
                        {isActive && <CheckCircle2 className="h-5 w-5 text-[#1a3a6b] dark:text-[#3b82f6]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="settings-card">
                <div className="mb-6">
                  <h2 className="text-[18px] font-bold text-[#111111] dark:text-white tracking-tight">{t("privacyPolicy")}</h2>
                  <p className="text-[13px] text-[#334155] dark:text-[#94a3b8] font-medium mt-1">{t("privacyDesc")}</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] dark:text-white">{t("infoCollect")}</h4>
                      <p className="text-[13.5px] text-[#334155] dark:text-[#94a3b8] font-medium leading-relaxed">{t("infoCollectDesc")}</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] dark:text-white">{t("howWeUse")}</h4>
                      <p className="text-[13.5px] text-[#334155] dark:text-[#94a3b8] font-medium leading-relaxed">{t("howWeUseDesc")}</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] dark:text-white">{t("dataSecurity")}</h4>
                      <p className="text-[13.5px] text-[#334155] dark:text-[#94a3b8] font-medium leading-relaxed">{t("dataSecurityDesc")}</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] dark:text-white">{t("yourRights")}</h4>
                      <p className="text-[13.5px] text-[#334155] dark:text-[#94a3b8] font-medium leading-relaxed">{t("yourRightsDesc")}</p>
                    </section>
                  </div>
                  <div className="pt-4 border-t border-[rgba(26,58,107,0.08)] dark:border-white/10 text-xs text-[#5f6c80] dark:text-slate-500">
                    {t("lastUpdated")}
                  </div>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="settings-card">
                <div className="mb-6">
                  <h2 className="text-[18px] font-bold text-[#111111] dark:text-white tracking-tight">{t("supportCenter")}</h2>
                  <p className="text-[13px] text-[#334155] dark:text-[#94a3b8] font-medium mt-1">{t("supportDesc")}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-xl border transition-all cursor-pointer shadow-sm glass-btn flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-[#1a3a6b] dark:text-[#3b82f6]" />
                      <div>
                        <p className="font-bold text-[#111111] dark:text-white">{t("contactSupport")}</p>
                        <p className="text-[13px] font-medium text-[#334155] dark:text-[#94a3b8]">{t("contactSupportDesc")}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border transition-all cursor-pointer shadow-sm glass-btn flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-[#1a3a6b] dark:text-[#3b82f6]" />
                      <div>
                        <p className="font-bold text-[#111111] dark:text-white">{t("helpDocs")}</p>
                        <p className="text-[13px] font-medium text-[#334155] dark:text-[#94a3b8]">{t("helpDocsDesc")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Language Confirmation Dialog */}
        {langDialog.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#f0f4fa] dark:bg-[#132237] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-[rgba(26,58,107,0.05)] dark:border-[rgba(59,130,246,0.15)]">
              <div className="p-6 space-y-4 bg-[#f0f4fa] dark:bg-[#132237]">
                <h3 className="text-xl font-bold text-[#111111] dark:text-white">{t("confirmLanguageChange")}</h3>
                <p className="text-[#334155] dark:text-[#94a3b8] font-medium">
                  {t("confirmLanguageMsg")} <strong className="text-[#111111] dark:text-white">{langDialog.target}</strong>?
                </p>
              </div>
              <div className="px-6 py-4 bg-[#ffffff] dark:bg-[rgba(0,0,0,0.2)] flex justify-end gap-3 border-t border-[rgba(26,58,107,0.08)] dark:border-[rgba(59,130,246,0.15)]">
                <button
                  onClick={() => setLangDialog({ open: false, target: null })}
                  className="px-4 py-2 rounded-xl text-[#334155] dark:text-[#94a3b8] font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={confirmLanguageChange}
                  className="settings-btn-primary"
                >
                  {t("yes")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
