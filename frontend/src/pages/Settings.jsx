import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Palette, Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/api/api";
import { useTheme } from "@/components/theme-provider";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  
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
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post("/auth/change-password/", {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.old_password?.[0] || "Failed to change password." });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your account settings and set e-mail preferences.</p>
      </div>

      <Separator />

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="account" className="rounded-lg gap-2">
            <User className="h-4 w-4" /> Account
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg gap-2">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
        </TabsList>

        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <TabsContent value="account">
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>Update your personal information visible to others.</CardDescription>
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
                      <Camera className="h-4 w-4" /> Change Photo
                    </Button>
                    <p className="text-[11px] text-muted-foreground italic">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={profileData.email} disabled className="bg-muted/50 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="px-8 shadow-lg shadow-primary/20">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Secure your account with a strong password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="oldPass">Current Password</Label>
                  <Input 
                    id="oldPass" 
                    type="password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                    className="bg-background/50"
                    required
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="newPass">New Password</Label>
                  <Input 
                    id="newPass" 
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="bg-background/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPass">Confirm New Password</Label>
                  <Input 
                    id="confirmPass" 
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    className="bg-background/50"
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={loading} className="px-8 shadow-lg shadow-primary/20">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the platform looks for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setTheme("light")}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${
                    theme === "light" ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-primary/50"
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
                  <span className="font-bold text-sm">Light Mode</span>
                </button>

                <button 
                  onClick={() => setTheme("dark")}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${
                    theme === "dark" ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="w-full h-32 rounded-xl bg-slate-900 border border-slate-800 p-2 space-y-2">
                    <div className="w-full h-4 bg-slate-800 rounded" />
                    <div className="w-2/3 h-4 bg-slate-800/50 rounded" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 bg-purple-900/50 rounded" />
                      <div className="h-8 bg-slate-800 rounded" />
                    </div>
                  </div>
                  <span className="font-bold text-sm">Dark Mode</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

