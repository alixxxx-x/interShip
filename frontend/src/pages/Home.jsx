import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle,
    GraduationCap,
    Building2,
    Brain,
    FileText,
    Search,
    BarChart3,
} from "lucide-react";



function Home() {
    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden bg-background">
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="mb-6 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-border bg-background shadow-sm text-sm font-medium text-foreground animate-in fade-in slide-in-from-bottom-3 duration-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse inline-block shrink-0" />
                        New: AI-Powered Matching Now Available
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Connecting Talent with <br />
                        <span className="text-primary italic">Opportunity.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        Inter.Ship is the premier platform for students to find meaningful internships and companies to discover the next generation of industry leaders.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <Link to="/internships">
                            <Button size="lg" className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20">
                                Browse Internships <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/about">
                            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 font-bold bg-background">
                                How it Works
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Background decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            </section>

            {/* Trusted By Section */}
            <section className="py-12 border-t border-border">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <p className="text-sm text-muted-foreground mb-8">
                        Trusted by leading universities and companies
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                        <span className="text-lg font-semibold text-muted-foreground/70 tracking-wide">USTHB</span>
                        <span className="text-lg font-semibold text-muted-foreground/70 tracking-wide">ESI</span>
                        <span className="text-lg font-semibold text-muted-foreground/70 tracking-wide">ENSIA</span>
                        <span className="text-lg font-semibold text-muted-foreground/70 tracking-wide">Sonatrach</span>
                        <span className="text-lg font-semibold text-muted-foreground/70 tracking-wide">Djezzy</span>
                        <span className="text-lg font-semibold text-muted-foreground/70 tracking-wide">Ooredoo</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-muted/30 border-y border-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            A complete platform designed to simplify internship management for
                            all stakeholders.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        <Card className="bg-card hover:ring-primary/50 transition-all duration-500 ease-in-out">
                            <CardContent className="p-7">
                                <div className="w-13 h-13 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <GraduationCap className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    Student Portal
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Complete profile management, CV builder, and internship application tracking all in one place.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card hover:ring-primary/50 transition-all duration-500 ease-in-out">
                            <CardContent className="p-7">
                                <div className="w-13 h-13 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    Company Dashboard
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Post internship offers, review applications, and manage your recruitment pipeline efficiently.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card hover:ring-primary/50 transition-all duration-500 ease-in-out">
                            <CardContent className="p-7">
                                <div className="w-13 h-13 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <Brain className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    Smart Matching
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    AI-powered algorithm that matches students with the most suitable internship opportunities.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card hover:ring-primary/50 transition-all duration-500 ease-in-out">
                            <CardContent className="p-7">
                                <div className="w-13 h-13 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    Document Generation
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Automatically generate internship agreements, certificates, and official documents.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card hover:ring-primary/50 transition-all duration-500 ease-in-out">
                            <CardContent className="p-7">
                                <div className="w-13 h-13 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <Search className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    Advanced Search
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Filter and find opportunities by skills, location, duration, and industry sector.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card hover:ring-primary/50 transition-all duration-500 ease-in-out">
                            <CardContent className="p-7">
                                <div className="w-13 h-13 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <BarChart3 className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    Admin Analytics
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Comprehensive dashboards for universities to track placements and generate reports.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-28">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="bg-primary rounded-[32px] p-8 md:p-16 text-center text-primary-foreground shadow-2xl shadow-primary/30 overflow-hidden relative">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                                Ready to start your <br />
                                professional journey?
                            </h2>
                            <p className="text-primary-foreground/80 mb-10 max-w-xl mx-auto text-lg font-medium">
                                Create an account today and find the internship that will define your career.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link to="/register">
                                    <Button size="lg" variant="secondary" className="rounded-full px-10 h-14 font-black shadow-xl">
                                        Join Inter.Ship
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Decorative background glow */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2" />
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
