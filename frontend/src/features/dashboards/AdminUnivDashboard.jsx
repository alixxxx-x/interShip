import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  FileText,
  AlertCircle,
  MapPin,
  Briefcase,
  ExternalLink,
  GraduationCap
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function AdminUnivDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalDepartments: 0
  });
  const [partnerCompanies, setPartnerCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-univ/dashboard/");
      setStats(res.data.stats);
      setPartnerCompanies(res.data.companies || []);
    } catch (error) {
      console.error("Failed to load admin univ dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
        <LoadingScreen fullScreen={false} />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Departments",
      value: stats.totalDepartments,
      icon: GraduationCap,
      description: "Academic departments registered",
      link: "/adminunivdashboard/departments"
    },
    {
      title: "Total Companies",
      value: stats.totalCompanies,
      icon: Building2,
      description: "Partner companies",
      link: "/adminunivdashboard/companies"
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      description: "Registered students on platform",
      link: "/adminunivdashboard/users?role=STUDENT"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">University Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor overall platform statistics and manage active partnerships.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <FileText className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title}
              onClick={() => stat.link && navigate(stat.link)}
              className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold group-hover:text-primary transition-colors">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Partner Companies Directory */}
      <Card className="border border-border/60 shadow-xl bg-card/45 backdrop-blur-md overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                Active Partner Companies
              </CardTitle>
              <CardDescription className="text-xs">
                List of registered corporate partners offering active internships to your university
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl text-xs font-bold border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
              onClick={() => navigate('/adminunivdashboard/companies')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase pl-6">Company</TableHead>
                <TableHead className="font-bold text-xs uppercase">Sector / Field</TableHead>
                <TableHead className="font-bold text-xs uppercase">Location</TableHead>
                <TableHead className="font-bold text-xs uppercase">Organization Size</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="w-9 h-9 text-muted-foreground/30" />
                      <span className="text-sm font-semibold">No partner companies found</span>
                      <span className="text-xs text-muted-foreground/60">Registered companies will appear here when active.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                partnerCompanies.map((company) => (
                  <TableRow key={company.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="font-bold py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-sm">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm text-foreground font-bold tracking-tight">{company.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{company.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-semibold text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-muted-foreground/70" />
                        {company.field}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 font-semibold text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-muted-foreground/70" />
                        {company.location}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 font-semibold text-xs text-muted-foreground">
                      {company.size}
                    </TableCell>
                    <TableCell className="py-4 text-right pr-6">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigate('/adminunivdashboard/companies')}
                        className="rounded-xl font-bold text-xs text-primary hover:bg-primary/10 gap-1"
                      >
                        Manage
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
