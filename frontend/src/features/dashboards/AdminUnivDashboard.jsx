import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Clock, 
  FileText,
  AlertCircle
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

export default function AdminUnivDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    pendingValidations: 0,
    validatedInternships: 0
  });
  const [pendingValidations, setPendingValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-univ/dashboard/");
      setStats(res.data.stats);
      setPendingValidations(res.data.applications || []);
    } catch (error) {
      console.error("Failed to load admin univ dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleValidate = async (id) => {
    if (!window.confirm("Are you sure you want to validate this internship agreement?")) return;
    try {
      await api.post(`/admin/applications/${id}/validate/`);
      toast.success("Application validated successfully!");
      fetchDashboardData();
    } catch (error) {
      console.error("Validation failed:", error);
      toast.error("Failed to validate application.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      description: "Registered students on platform"
    },
    {
      title: "Total Companies",
      value: stats.totalCompanies,
      icon: Building2,
      description: "Partner companies"
    },
    {
      title: "Pending Validations",
      value: stats.pendingValidations,
      icon: Clock,
      description: "Internships awaiting validation"
    },
    {
      title: "Validated Internships",
      value: stats.validatedInternships,
      icon: TrendingUp,
      description: "Successfully validated placements"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">University Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor overall platform statistics and validate internship agreements.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <FileText className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Validations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Global Validation Queue</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and validate accepted internship applications from all departments
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Internship</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingValidations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground italic">
                    No applications waiting for validation.
                  </TableCell>
                </TableRow>
              ) : (
                pendingValidations.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium text-sm">
                      {app.candidate}
                    </TableCell>
                    <TableCell className="text-sm">{app.companyName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{app.internshipTitle}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        onClick={() => handleValidate(app.id)}
                        className="shadow-sm hover:shadow-md transition-shadow"
                      >
                        Validate
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
