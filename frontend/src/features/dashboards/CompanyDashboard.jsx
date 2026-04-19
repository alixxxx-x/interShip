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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CreateOfferModal from "./CreateOfferModal";
import { useSearchParams } from "react-router-dom";


export default function CompanyDashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const isModalOpen = searchParams.get("newOffer") === "true";
  const openModal = () => setSearchParams({ newOffer: "true" });
  const closeModal = () => setSearchParams({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        //Replace with actual Django API calls
        
        //replace with real API responses
        const mockStats = {
          totalInternships: 12,
          activeApplications: 48,
          totalViews: 1234,
          pendingReviews: 5,
        };

        const mockApplications = [
          {
            id: 1,
            candidate: "Sarah Johnson",
            status: "Rejected",
            appliedDate: "2026-04-15",
            email: "sarah.j@email.com"
          },
          {
            id: 2,
            candidate: "Michael Chen",
            status: "In progress",
            appliedDate: "2026-04-14",
            email: "m.chen@email.com"
          },
          {
            id: 3,
            candidate: "Emma Williams",
            status: "Accepted",
            appliedDate: "2026-04-14",
            email: "emma.w@email.com"
          },
          {
            id: 4,
            candidate: "James Brown",
            status: "Accepted",
            appliedDate: "2026-04-12",
            email: "james.b@email.com"
          },
          {
            id: 5,
            candidate: "Lisa Anderson",
            status: "In progress",
            appliedDate: "2026-04-11",
            email: "lisa.a@email.com"
          }
        ];
        setStats(mockStats);
        setApplications(mockApplications);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

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
      value: stats?.activeApplications,
      icon: Users,
      change: stats?.applicationsChange,
      description: "New applications this week"
    },
    {
      title: "Accepted Applications",
      value: stats?.totalViews?.toLocaleString(),
      icon: TrendingUp,
      change: stats?.viewsChange,
      description: "Application accepted this week"
    },
    {
      title: "Total Internships",
      value: stats?.totalInternships,
      icon: Briefcase,
      change: "+2",
      description: "Active positions"
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      "In progress": "purple",
      "Accepted": "success",
      "Rejected": "destructive"
    };
    return variants[status] || "outline";
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
      
      {/* Quick Add Button - now uses openModal */}
      <Button onClick={openModal}>
        <Plus className="mr-2 h-4 w-4" />
        Quick Add
      </Button>
      
      {/* Modal - controlled mode */}
      <CreateOfferModal 
        open={isModalOpen} 
        onOpenChange={closeModal}
        onOfferCreated={() => {
          // Optional: refresh data after creating offer
          // fetchDashboardData(); 
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.candidate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(app.status)}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {app.email}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}