import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { User, Lock, Palette, Camera, Loader2, CheckCircle2, AlertCircle, Languages, LogOut, Globe, ShieldCheck, HelpCircle, ArrowLeft } from "lucide-react";
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
    wilaya: "",
    phone: "",
    major: ""
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile/");
        setProfileData({
          username: res.data.username || "",
          email: res.data.email || "",
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          profile_picture: res.data.profile_picture || null,
          role: res.data.role || "STUDENT",
          name: res.data.name || "",
          description: res.data.description || "",
          location: res.data.location || "",
          website: res.data.website || "",
          company_field: res.data.company_field || "",
          founded_year: res.data.founded_year || "",
          university_id: res.data.university_id || "",
          wilaya: res.data.wilaya || "",
          phone: res.data.phone || "",
          major: res.data.major || "",
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
      } else {
        formData.append("first_name", profileData.first_name);
        formData.append("last_name", profileData.last_name);
        formData.append("university_id", profileData.university_id);
        formData.append("wilaya", profileData.wilaya);
        formData.append("phone", profileData.phone);
        formData.append("major", profileData.major);
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
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const currentLangName = langNameMap[language] || "English";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="h-6 w-6 rtl:rotate-180 text-slate-600" />
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("settings")}</h1>
          <p className="text-muted-foreground text-lg">{t("settingsDesc")}</p>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="account" className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <TabsList className="flex flex-row md:flex-col h-auto w-full bg-transparent p-0 gap-1 overflow-x-auto md:overflow-visible">
            <TabsTrigger
              value="account"
              className="w-full justify-start py-3 px-4 gap-3 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800/50 data-[state=active]:border-l-4 data-[state=active]:border-primary transition-all font-bold rounded-r-lg rounded-l-none"
            >
              <User className="h-4 w-4" /> {t("account")}
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="w-full justify-start py-3 px-4 gap-3 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800/50 data-[state=active]:border-l-4 data-[state=active]:border-primary transition-all font-bold rounded-r-lg rounded-l-none"
            >
              <Lock className="h-4 w-4" /> {t("security")}
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="w-full justify-start py-3 px-4 gap-3 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800/50 data-[state=active]:border-l-4 data-[state=active]:border-primary transition-all font-bold rounded-r-lg rounded-l-none"
            >
              <Palette className="h-4 w-4" /> {t("appearance")}
            </TabsTrigger>
            <TabsTrigger
              value="language"
              className="w-full justify-start py-3 px-4 gap-3 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800/50 data-[state=active]:border-l-4 data-[state=active]:border-primary transition-all font-bold rounded-r-lg rounded-l-none"
            >
              <Languages className="h-4 w-4" /> {t("language")}
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="w-full justify-start py-3 px-4 gap-3 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800/50 data-[state=active]:border-l-4 data-[state=active]:border-primary transition-all font-bold rounded-r-lg rounded-l-none"
            >
              <ShieldCheck className="h-4 w-4" /> {t("privacyPolicy")}
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="w-full justify-start py-3 px-4 gap-3 text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800/50 data-[state=active]:border-l-4 data-[state=active]:border-primary transition-all font-bold rounded-r-lg rounded-l-none"
            >
              <HelpCircle className="h-4 w-4" /> {t("supportCenter")}
            </TabsTrigger>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <button
                onClick={() => navigate("/logout")}
                className="w-full flex items-center justify-start py-3 px-4 gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-bold rounded-lg"
              >
                <LogOut className="h-4 w-4" /> {t("logout")}
              </button>
            </div>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}>
              {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <TabsContent value="account" className="mt-0">
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("publicProfile")}</CardTitle>
                <CardDescription>{t("publicProfileDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-8">
                  <div className="flex items-center gap-6 pb-4">
                    <div
                      className="relative group cursor-pointer h-24 w-24 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Avatar className="h-full w-full border-4 border-background shadow-xl">
                        <AvatarImage src={profileData.profile_picture} className="object-cover" />
                        <AvatarFallback className="text-2xl bg-primary text-white">
                          {profileData.username?.charAt(0).toUpperCase() || profileData.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                        <Camera className="h-10 w-10 text-white" />
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
                      <p className="text-sm text-muted-foreground italic max-w-[200px] leading-snug">{t("photoHint")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileData.role === "COMPANY" ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="companyName">{t("companyName") || "Company Name"}</Label>
                          <Input
                            id="companyName"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("emailAddress")}</Label>
                          <Input id="email" value={profileData.email} disabled className="bg-muted/50 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">{t("companyLocation") || "Location"}</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyField">{t("companyField") || "Industry / Field"}</Label>
                          <Input
                            id="companyField"
                            value={profileData.company_field}
                            onChange={(e) => setProfileData({ ...profileData, company_field: e.target.value })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="website">{t("companyWebsite") || "Website"}</Label>
                          <Input
                            id="website"
                            type="url"
                            value={profileData.website}
                            onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="foundedYear">{t("founded") || "Founded Year"}</Label>
                          <select
                            id="foundedYear"
                            value={profileData.founded_year}
                            onChange={(e) => setProfileData({ ...profileData, founded_year: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">{t("selectYear") || "Select Year"}</option>
                            {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="description">{t("companyDescription") || "Description"}</Label>
                          <textarea
                            id="description"
                            rows={3}
                            value={profileData.description}
                            onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t("firstName")}</Label>
                          <Input
                            id="firstName"
                            value={profileData.first_name}
                            onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t("lastName")}</Label>
                          <Input
                            id="lastName"
                            value={profileData.last_name}
                            onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("emailAddress")}</Label>
                          <Input id="email" value={profileData.email} disabled className="bg-muted/50 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t("phoneNumber")}</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="bg-background/50"
                            placeholder="05 / 06 / 07 ..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wilaya">{t("wilaya")}</Label>
                          <Input
                            id="wilaya"
                            value={profileData.wilaya}
                            onChange={(e) => setProfileData({ ...profileData, wilaya: e.target.value })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="universityID">{t("universityID")}</Label>
                          <Input
                            id="universityID"
                            value={profileData.university_id}
                            onChange={(e) => setProfileData({ ...profileData, university_id: e.target.value })}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="major">{t("majorField")}</Label>
                          <Input
                            id="major"
                            value={profileData.major}
                            onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                            className="bg-background/50"
                            placeholder="Computer Science, Finance, etc."
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading} className="px-8 shadow-lg shadow-primary/20">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("updateProfile")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("securitySettings")}</CardTitle>
                <CardDescription>{t("securityDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="oldPass">{t("currentPassword")}</Label>
                    <Input
                      id="oldPass"
                      type="password"
                      value={passwordData.old_password}
                      onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                      className="bg-background/50"
                      required
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="newPass">{t("newPassword")}</Label>
                    <Input
                      id="newPass"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="bg-background/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPass">{t("confirmPassword")}</Label>
                    <Input
                      id="confirmPass"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="bg-background/50"
                      required
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={loading} className="px-8 shadow-lg shadow-primary/20">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("changePassword")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("appearanceSettings")}</CardTitle>
                <CardDescription>{t("appearanceDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${theme === "light" ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="w-full h-32 rounded-xl bg-white border border-slate-200 p-2 space-y-2">
                      <div className="w-full h-4 bg-slate-100 rounded" />
                      <div className="w-2/3 h-4 bg-slate-50 rounded" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-8 bg-purple-100 rounded" />
                        <div className="h-8 bg-slate-50 rounded" />
                      </div>
                    </div>
                    <span className="font-bold text-sm">{t("lightMode")}</span>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${theme === "dark" ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="w-full h-32 rounded-xl bg-slate-900 border border-slate-800 p-2 space-y-2">
                      <div className="w-full h-4 bg-slate-800 rounded" />
                      <div className="w-2/3 h-4 bg-slate-800/50 rounded" />
                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <div className="h-8 bg-purple-900/50 rounded" />
                        <div className="h-8 bg-slate-800 rounded" />
                      </div>
                    </div>
                    <span className="font-bold text-sm">{t("darkMode")}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language" className="mt-0">
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("languageSettings")}</CardTitle>
                <CardDescription>{t("languageDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["English", "Français", "العربية"].map((lang) => {
                    const langCode = { English: "en", Français: "fr", العربية: "ar" }[lang];
                    const isActive = langCode === language;
                    return (
                      <button
                        key={lang}
                        onClick={() => handleLanguageClick(lang)}
                        className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${isActive ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "border-border hover:border-primary/50"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                          <span className="font-bold">{lang}</span>
                        </div>
                        {isActive && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-0">
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("privacyPolicy")}</CardTitle>
                <CardDescription>{t("privacyDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">{t("infoCollect")}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t("infoCollectDesc")}</p>
                  </section>
                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">{t("howWeUse")}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t("howWeUseDesc")}</p>
                  </section>
                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">{t("dataSecurity")}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t("dataSecurityDesc")}</p>
                  </section>
                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">{t("yourRights")}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t("yourRightsDesc")}</p>
                  </section>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-muted-foreground">
                  {t("lastUpdated")}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-0">
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("supportCenter")}</CardTitle>
                <CardDescription>{t("supportDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-bold">{t("contactSupport")}</p>
                        <p className="text-xs text-muted-foreground">{t("contactSupportDesc")}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-bold">{t("helpDocs")}</p>
                        <p className="text-xs text-muted-foreground">{t("helpDocsDesc")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Language Confirmation Dialog */}
      <Dialog open={langDialog.open} onOpenChange={(open) => setLangDialog({ ...langDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("confirmLanguageChange")}</DialogTitle>
            <DialogDescription>
              {t("confirmLanguageMsg")} <strong>{langDialog.target}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLangDialog({ open: false, target: null })}>
              {t("cancel")}
            </Button>
            <Button onClick={confirmLanguageChange}>
              {t("yes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
