import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { User, Lock, Palette, Camera, Loader2, CheckCircle2, AlertCircle, Languages, LogOut, Globe, ShieldCheck, HelpCircle } from "lucide-react";
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

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    profile_picture: null
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
          profile_picture: res.data.profile_picture || null
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await api.patch("/auth/profile/", {
        username: profileData.username,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      });
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("settings")}</h1>
        <p className="text-muted-foreground text-lg">{t("settingsDesc")}</p>
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

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                    <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                      <AvatarImage src={profileData.profile_picture} />
                      <AvatarFallback className="text-2xl bg-primary text-white">
                        {profileData.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" type="button" className="gap-2">
                        <Camera className="h-4 w-4" /> {t("changePhoto")}
                      </Button>
                      <p className="text-[11px] text-muted-foreground italic">{t("photoHint")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">{t("username")}</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("emailAddress")}</Label>
                      <Input id="email" value={profileData.email} disabled className="bg-muted/50 cursor-not-allowed" />
                    </div>
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
