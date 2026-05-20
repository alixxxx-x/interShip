import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Plus,
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
import CreateOfferModal from "./CreateOfferModal";
import { useSearchParams } from "react-router-dom";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";

export default function CompanyDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const isModalOpen = searchParams.get("newOffer") === "true";
  const openModal = () => setSearchParams({ newOffer: "true" });
  const closeModal = () => setSearchParams({});

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/company/dashboard/");
      const nextStats = res?.data?.stats ?? null;
      const nextApps = Array.isArray(res?.data?.applications) ? res.data.applications : [];

      setStats(nextStats);
      setApplications(nextApps);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setError("Failed to load dashboard data.");
      setStats(null);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Pending Applications",
      value: stats?.pendingApplications ?? 0,
      icon: Users,
      description: "Applications awaiting review"
    },
    {
      title: "Accepted Applications",
      value: stats?.acceptedApplications ?? 0,
      icon: TrendingUp,
      description: "Applications accepted"
    },
    {
      title: "Total Internships",
      value: stats?.totalInternships ?? 0,
      icon: Briefcase,
      description: "Active positions"
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      "Pending": "purple",
      "Accepted": "success",
      "Validated": "info",
      "Completed": "success",
      "Rejected": "destructive",
      "Cancelled": "destructive"
    };
    return variants[status] || "outline";
  };

  const handleDownloadCV = async (application) => {
    try {
      // First try to dynamically generate the PDF from database info
      const res = await api.get(`/cv/generate/${application.studentId}/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${application.candidate.replace(/\s+/g, '_')}_CV.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      // Fallback: If no digital CV data exists, check if they uploaded a raw file
      if (application.cvUrl) {
        window.open(application.cvUrl, "_blank");
      } else {
        toast.warning(`No Digital CV or uploaded file available for ${application.candidate}`);
      }
    }
  };

  return (
    <div className="space-y-6 p-6">

    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your internships.
        </p>
      </div>
      
      {/* Create Offer button */}
      <Button onClick={openModal}>
        <Plus className="mr-2 h-4 w-4" />
        Create Offer
      </Button>
      
      {/* Modal - controlled mode */}
      <CreateOfferModal 
        open={isModalOpen} 
        onOpenChange={closeModal}
        //refresh data after creating offer
        onOfferCreated={() => {
          fetchDashboardData(); 
        }} 
      />
    </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
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


      {/* Recent Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest candidates who applied to your internships
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/companydashboard/applications")}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.candidate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{application.appliedDate}</TableCell>
                    <TableCell>{application.email}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadCV(application)}>
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
