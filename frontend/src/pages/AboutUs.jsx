import React from "react";
import {
    Users, Target, Award, Rocket,
    ArrowRight, Heart, Brain, Zap, Briefcase, GraduationCap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/components/language-provider";


const stats = [
    { label: "Active Internships", value: "250+", icon: Briefcase },
    { label: "Verified Students", value: "15k+", icon: GraduationCap },
    { label: "Partner Companies", value: "100+", icon: Rocket },
    { label: "Match Rate", value: "92%", icon: Zap }
];

export default function AboutUs() {
    const { t } = useLanguage();

    const team = [
        {
            name: "Dr. Alix Dev",
            role: t("roleFounder"),
            initials: "AD",
            bio: t("bioFounder"),
            tag: t("tagFounder")
        },
        {
            name: "Karim Belkacemi",
            role: t("roleTech"),
            initials: "KB",
            bio: t("bioTech"),
            tag: t("tagTech")
        },
        {
            name: "Lydia Mensouri",
            role: t("rolePartnerships"),
            initials: "LM",
            bio: t("bioPartnerships"),
            tag: t("tagPartnerships")
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-24 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(124,58,237,0.1),transparent)]" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <Badge variant="outline" className="text-primary border-primary/30 mb-6 px-4 py-1 bg-primary/10">
                        {t("ourStory")}
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                        {t("empoweringNext")} <br />
                        <span className="text-primary italic">{t("professionals")}</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {t("aboutDesc")}
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-primary relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center group">
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-white mb-1 tracking-tighter">{stat.value}</div>
                                <div className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-widest">{t(stat.label === "Active Internships" ? "activeInternships" : stat.label === "Verified Students" ? "verifiedStudents" : stat.label === "Partner Companies" ? "partnerCompanies" : "matchRate")}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <Target className="text-primary" />
                                {t("ourMission")}
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                {t("missionDesc")}
                            </p>
                            <Separator className="bg-slate-200" />
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="h-2 w-12 bg-primary rounded-full" />
                                    <p className="font-black text-slate-900 uppercase text-xs tracking-widest">{t("accessibility")}</p>
                                    <p className="text-sm text-slate-500">{t("accessibilityDesc")}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-12 bg-slate-400 rounded-full" />
                                    <p className="font-black text-slate-900 uppercase text-xs tracking-widest">{t("innovation")}</p>
                                    <p className="text-sm text-slate-500">{t("innovationDesc")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 p-12 flex flex-col justify-center text-white min-h-[400px] shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Rocket size={120} className="text-primary" />
                            </div>
                            <h2 className="text-3xl font-black mb-6 tracking-tight">{t("ourVision")}</h2>
                            <p className="text-lg text-slate-400 mb-8 leading-relaxed italic">
                                {t("visionDesc")}
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center">
                                    <Heart className="text-primary h-5 w-5 fill-primary" />
                                </div>
                                <span className="font-bold text-sm tracking-widest uppercase">{t("drivenByGrowth")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t("makersOf")}</h2>
                            <p className="text-slate-500 text-lg max-w-xl font-medium">
                                {t("makersDesc")}
                            </p>
                        </div>
                        <Button variant="outline" className="rounded-full font-bold px-8 group border-slate-200 shadow-none">
                            {t("joinOurMission")}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member, i) => (
                            <Card key={i} className="border-none shadow-2xl shadow-slate-200/60 hover:-translate-y-2 transition-all duration-300 rounded-[2.5rem] group overflow-hidden bg-white">
                                <CardHeader className="p-8 pb-4">
                                    <Avatar className="h-20 w-20 mb-6 ring-4 ring-offset-4 ring-primary/10">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-slate-900 text-white font-black text-xl tracking-tighter">
                                            {member.initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3 font-bold text-[10px] mb-2 uppercase tracking-widest">
                                            {member.tag}
                                        </Badge>
                                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight">{member.name}</CardTitle>
                                        <CardDescription className="text-primary font-bold text-xs uppercase tracking-widest">
                                            {member.role}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-2">
                                    <p className="text-slate-500 leading-relaxed text-sm italic font-medium">
                                        "{member.bio}"
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="bg-slate-900 rounded-[3.5rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-primary rounded-full blur-[140px]" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10 tracking-tighter">
                        {t("readyToLaunch")}
                    </h2>
                    <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
                        {t("readyToLaunchDesc")}
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 relative z-10">
                        <Link to="/register">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 h-14 rounded-full font-black text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 border-none">
                                {t("getStartedNow")}
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button variant="outline" size="lg" className="border-white/20 bg-transparent text-white hover:bg-white/10 px-10 h-14 rounded-full font-black text-lg transition-all active:scale-95">
                                {t("contactUs")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
