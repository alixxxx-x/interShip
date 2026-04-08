import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Rocket, Users, Briefcase } from "lucide-react";

function Home() {
    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden bg-background">
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <Badge variant="outline" className="mb-4 py-1 px-4 text-primary border-primary/20 bg-primary/5 rounded-full animate-in fade-in slide-in-from-bottom-3 duration-500">
                        Version 1.0 is now live
                    </Badge>
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

            {/* Features Section */}
            <section className="py-20 bg-muted/30 border-y border-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                            Platform Features
                        </h2>
                        <p className="text-muted-foreground">
                            Tailored tools for students, universities, and companies.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="border-none shadow-xl shadow-foreground/5 bg-background hover:-translate-y-1 transition-transform">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                    <Rocket className="text-primary h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl">Fast Matching</CardTitle>
                                <CardDescription>Smart algorithms to connect your skills with the right role.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-muted-foreground text-sm">
                                Apply to multiple internships with a single click and track your application status in real-time.
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl shadow-foreground/5 bg-background hover:-translate-y-1 transition-transform">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-2">
                                    <Users className="text-blue-500 h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl">Student Network</CardTitle>
                                <CardDescription>Join a community of ambitious peers.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-muted-foreground text-sm">
                                Get feedback on your CV and connect with former interns to learn about their experiences.
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl shadow-foreground/5 bg-background hover:-translate-y-1 transition-transform">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-2">
                                    <Briefcase className="text-green-500 h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl">Company Space</CardTitle>
                                <CardDescription>Managing candidates made simple.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-muted-foreground text-sm">
                                Review profiles, schedule interviews, and manage internship contracts all in one place.
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
