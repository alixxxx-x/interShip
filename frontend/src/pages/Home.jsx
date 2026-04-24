import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
    ArrowRight,
    CheckCircle,
    Check,
    GraduationCap,
    Building2,
    Brain,
    FileText,
    Search,
    BarChart3,
} from "lucide-react";
import heroImage from "@/assets/hero-background.jpg";


export function HowItWorksSection() {
    const steps = [
        {
            number: "01",
            title: "Create Your Profile",
            description:
                "Students and companies register and complete their profiles with relevant information and requirements.",
        },
        {
            number: "02",
            title: "Browse & Match",
            description:
                "Our AI analyzes profiles and suggests the best matches. Students can also search and apply directly.",
        },
        {
            number: "03",
            title: "Apply & Review",
            description:
                "Students submit applications, companies review candidates and schedule interviews through the platform.",
        },
        {
            number: "04",
            title: "Get Your Agreement",
            description:
                "Once matched, the system automatically generates the internship agreement for all parties to sign.",
        },
    ];

    return (
        <section id="how-it-works" className="py-20 bg-secondary/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Get started in four simple steps and find your perfect internship
                        match.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-border" />
                            )}
                            <div className="text-5xl font-bold text-primary/40 mb-4">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                {step.title}
                            </h3>
                            <p className="text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Home() {
    const location = useLocation();

    useEffect(() => {
        if (location.hash === '#how-it-works') {
            // for scroll how it work kima ykoun fi footer
            setTimeout(() => {
                const el = document.getElementById('how-it-works');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }, [location]);

    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            {/* background pic */}
            <section
                className="relative py-20 lg:py-32 overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImage})` }}
            >
                {/* Styling of bg pic */}
                <div className="absolute inset-0 bg-black/68 z-0"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="mb-6 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-border bg-background shadow-sm text-sm font-medium text-foreground animate-in fade-in slide-in-from-bottom-3 duration-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse inline-block shrink-0" />
                        New: AI-Powered Matching Now Available
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-200 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Connecting Talent with <br />
                        <span className="text-primary">Opportunity.</span>
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
                        <a href="#how-it-works" onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                        }}>
                            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 font-bold bg-background">
                                How it Works
                            </Button>
                        </a>
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

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Built For Everyone Section */}
            <section className="py-20 lg:py-28 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-[40px] font-bold text-foreground mb-4">
                            Built For Everyone
                        </h2>
                        <p className="text-[17px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Whether you are a student looking for opportunities or a company seeking talent,
                            Inter.Ship has you covered.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* For Students Card */}
                        <div className="bg-card border border-border/60 p-8 sm:p-10 rounded-[20px] shadow-sm flex flex-col hover:border-border transition-colors">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-foreground mb-3">
                                    For Students
                                </h3>
                                <p className="text-[15px] text-muted-foreground leading-relaxed">
                                    Launch your career with the perfect internship opportunity
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-grow">
                                {[
                                    "Build a professional profile and CV",
                                    "Get matched with relevant opportunities",
                                    "Track all your applications in one place",
                                    "Receive notifications for new matches",
                                    "Download your internship agreement",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-700/10 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-green-700 stroke-[3]" />
                                        </div>
                                        <span className="text-[15px] text-foreground">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <Link to="/register" className="block w-full">
                                    <Button size="lg" className="w-full h-12 rounded-xl text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/80">
                                        Join as Student
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* For Companies Card */}
                        <div className="bg-card border border-border/60 p-8 sm:p-10 rounded-[20px] shadow-sm flex flex-col hover:border-border transition-colors">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-foreground mb-3">
                                    For Companies
                                </h3>
                                <p className="text-[15px] text-muted-foreground leading-relaxed">
                                    Find talented interns who match your requirements
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-grow">
                                {[
                                    "Post unlimited internship offers",
                                    "Access a pool of qualified candidates",
                                    "AI-powered candidate recommendations",
                                    "Streamlined interview scheduling",
                                    "Digital agreement management",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-700/10 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-green-700 stroke-[3]" />
                                        </div>
                                        <span className="text-[15px] text-foreground">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <Link to="/register?type=company" className="block w-full">
                                    <Button size="lg" className="w-full h-12 rounded-xl text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/80">
                                        Partner With Us
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 bg-purple-50/80 dark:bg-purple-950/20">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-[40px] font-bold text-foreground mb-5">
                        Ready to Get Started?
                    </h2>
                    <p className="text-[17px] text-muted-foreground mb-10 leading-relaxed">
                        Join thousands of students and companies already using Inter.Ship to streamline their internship process.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register">
                            <Button size="lg" className="w-full sm:w-auto rounded-lg px-6 h-12 text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                                Create an Account <ArrowRight className="w-4 h-4 ml-2 max-h-4 max-w-4" />
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-lg px-6 h-12 text-[15px] font-semibold bg-white text-black hover:bg-gray-50 border border-gray-200 dark:bg-transparent dark:text-foreground dark:border-border dark:hover:bg-accent shadow-sm">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
