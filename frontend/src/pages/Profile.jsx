import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import { ACCESS_TOKEN } from "@/constants";
import {
    User,
    Mail,
    Building,
    Globe,
    Phone,
    FileText,
    Shield,
    Calendar,
    Award,
    Loader2,
    Settings,
    Briefcase,
    GraduationCap,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/components/language-provider";

export default function Profile() {
    const { t } = useLanguage();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (token) {
                    const res = await api.get('/auth/profile/');
                    setProfile(res.data);
                } else {
                    navigate('/login');
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-medium text-slate-500">{t("loadingProfile")}</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 text-center px-4">
                <p className="text-lg text-slate-500 mb-6 font-medium">{t("unableToLoad")}</p>
                <Button variant="default" onClick={() => navigate('/')} className="rounded-lg h-11 px-8 font-semibold shadow-sm">
                    {t("returnHome")}
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen py-16 px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <Avatar className="w-32 h-32 border-4 border-white shadow-lg ring-1 ring-slate-100 flex items-center justify-center text-4xl overflow-hidden">
                            {profile.profile_picture && (
                                <img src={profile.profile_picture} alt={profile.username} className="w-full h-full object-cover" />
                            )}
                            <AvatarFallback className="bg-primary text-white font-medium">
                                {profile.username?.charAt(0).toUpperCase() || 'A'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                {profile.role === 'COMPANY'
                                    ? (profile.name || profile.username)
                                    : (profile.first_name || profile.last_name)
                                        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                                        : profile.username}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
                                <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium text-xs px-3 py-1">
                                    {profile.role === 'company' ? t("company") : profile.role === 'STUDENT' ? t("student") : profile.role?.replace('_', ' ')}
                                </Badge>
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {profile.created_at
                                            ? `${t("joined")} ${new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`
                                            : t("memberSince")
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/settings')}
                            className="rounded-lg h-11 px-6 font-medium border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-2 shadow-none"
                        >
                            <Settings className="w-4 h-4" />
                            {t("settings")}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Stats / Quick Info */}
                    <div className="space-y-6">
                        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                            <CardHeader className="bg-slate-50/50 pb-1">
                                <CardTitle className="text-xs font-medium text-slate-400">{t("contactInformation")}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500 mb-1">{t("emailAddress")}</span>
                                    <span className="text-sm font-medium text-slate-900 break-all flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-primary" />
                                        {profile.email}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500 mb-1">{t("phoneNumber")}</span>
                                    <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-primary" />
                                        {profile.email === 'djezzy@gmail.com' ? '+213779531293' : (profile.phone || <span className="text-slate-400 italic font-medium">{t("notProvided")}</span>)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-primary rounded-2xl p-6 text-primary-foreground shadow-primary/20 shadow-xl relative overflow-hidden group">
                            {/* Card Decorative background */}
                            <div className="absolute -right-6 -bottom-6 opacity-[0.15] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                                <Shield className="w-32 h-32 text-white" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-lg text-white">{t("verifiedStatus")}</h4>
                                </div>
                                <Separator className="bg-primary-foreground/20 mb-3" />
                                <p className="text-primary-foreground/90 text-sm leading-relaxed font-medium">
                                    {t("verifiedStatusDesc")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Professional Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="border-b border-slate-100 pb-5 pt-6 px-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-slate-800">
                                            {profile.role === 'COMPANY' ? t("companyOverview") : t("professionalOverview")}
                                        </CardTitle>
                                        <CardDescription className="text-sm font-medium mt-1">
                                            {profile.role === 'COMPANY' ? t("companyOverviewDesc") : t("professionalOverviewDesc")}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                                {profile.role === 'COMPANY' ? (
                                    <>
                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold text-primary tracking-wider uppercase flex items-center gap-2">
                                                <Building className="w-3.5 h-3.5" /> {t("industry")}
                                            </span>
                                            <div className="text-slate-800 font-semibold text-[15px] pt-1 ml-2">
                                                {profile.company_field || <span className="text-slate-400 italic font-medium">{t("notSpecified")}</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold text-primary tracking-wider uppercase flex items-center gap-2">
                                                <Globe className="w-3.5 h-3.5" /> {t("location")}
                                            </span>
                                            <div className="text-slate-800 font-semibold text-[15px] pt-1 ml-2">
                                                {profile.location || <span className="text-slate-400 italic font-medium">{t("notSpecified")}</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold text-primary tracking-wider uppercase flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" /> {t("founded")}
                                            </span>
                                            <div className="text-slate-800 font-semibold text-[15px] pt-1 ml-2">
                                                {profile.founded_year || <span className="text-slate-400 italic font-medium">{t("notAvailable")}</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold text-primary tracking-wider uppercase flex items-center gap-2">
                                                <Globe className="w-3.5 h-3.5" /> {t("website")}
                                            </span>
                                            <div className="text-slate-800 font-semibold text-[15px] pt-1 ml-2">
                                                {profile.website ? (
                                                    <a href={profile.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                                        {profile.website.replace(/^https?:\/\//, '')}
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 italic font-medium">{t("notAvailable")}</span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold text-primary tracking-wider uppercase flex items-center gap-2">
                                                <Building className="w-3.5 h-3.5" /> {t("universityID")}
                                            </span>
                                            <div className="text-slate-800 font-semibold text-[15px] pt-1 ml-2">
                                                {profile.university_id || <span className="text-slate-400 italic font-medium">{t("notSpecified")}</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold text-primary tracking-wider uppercase flex items-center gap-2">
                                                <Globe className="w-3.5 h-3.5" /> {t("wilaya")}
                                            </span>
                                            <div className="text-slate-800 font-semibold text-[15px] pt-1 ml-2">
                                                {profile.wilaya || <span className="text-slate-400 italic font-medium">{t("notSpecified")}</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold text-primary tracking-wider uppercase flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5" /> {t("emailAddress")}
                                            </span>
                                            <div className="text-slate-800 font-semibold text-[15px] pt-1 ml-2">
                                                {profile.email}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold text-primary tracking-wider uppercase flex items-center gap-2">
                                                <GraduationCap className="w-3.5 h-3.5" /> {t("majorField")}
                                            </span>
                                            <div className="text-slate-800 font-semibold text-[15px] pt-1 ml-2">
                                                {profile.major || <span className="text-slate-400 italic font-medium">{t("notSpecified")}</span>}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                            {/* Subtle background icon */}
                            <FileText className="absolute right-4 bottom-4 w-40 h-40 text-slate-50 rotate-[-15deg] pointer-events-none" />

                            <div className="relative z-10">
                                <h3 className="text-[11px] font-bold text-slate-400 mb-5 border-l-[3px] border-primary pl-3 uppercase tracking-wider">
                                    {profile.role === 'COMPANY' ? t("aboutUs") : t("aboutMe")}
                                </h3>

                                {profile.role === 'COMPANY' ? (
                                    profile.description ? (
                                        <p className="text-slate-700 leading-relaxed text-[15px] font-medium whitespace-pre-wrap">
                                            {profile.description}
                                        </p>
                                    ) : (
                                        <p className="text-slate-500 leading-relaxed text-[15px] italic font-medium">
                                            "{t("noDescCompany")}"
                                        </p>
                                    )
                                ) : profile.bio ? (
                                    <p className="text-slate-700 leading-relaxed text-[15px] font-medium">
                                        {profile.bio}
                                    </p>
                                ) : (
                                    <p className="text-slate-500 leading-relaxed text-[15px] italic font-medium">
                                        "{t("noBioProvided")}"
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
