import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sigma, 
  CheckCheck, 
  ClockFading, 
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
import CreateCvModal from "./CreateCvModal";
import { useSearchParams } from "react-router-dom";


export default function StudentDashboard() {
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
          pendingAplications: 4,
          acceptedApplications: 2,
          totalApplications: 10,
        };

        const mockApplications = [
          {
            id: 1,
            offer: "Developer Intern at TechCorp",
            status: "Rejected",
            appliedDate: "2026-04-15",
          },
          {
            id: 2,
            offer: "Software Engineer at InnovateX",
            status: "In progress",
            appliedDate: "2026-04-14",
          },
          {
            id: 3,
            offer: "Data Analyst at DataWorks",
            status: "Accepted",
            appliedDate: "2026-04-14",
          },
          {
            id: 4,
            offer: "Marketing Intern at BrandBoost",
            status: "In progress",
            appliedDate: "2026-04-11",
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
      title: "Pending Aplications",
      value: stats?.pendingAplications,
      icon: ClockFading,
      change: stats?.applicationsChange,
      description: "Applications in progress"
    },
    {
      title: "Accepted Applications",
      value: stats?.acceptedApplications?.toLocaleString(),
      icon: CheckCheck,
      change: stats?.viewsChange,
      description: "Application accepted this week"
    },
    {
      title: "Total Applications",
      value: stats?.totalApplications,
      icon: Sigma,
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
          Welcome back! Here's what's happening with your applications.
        </p>
      </div>
      
      {/* Create cv button */}
      <Button onClick={openModal}>
        <Plus className="mr-2 h-4 w-4" />
        Create CV
      </Button>
      
      {/* Create CV Modal */}
      <CreateCvModal 
        open={isModalOpen} 
        onOpenChange={closeModal}
        //refresh data after creating CV
        onCvCreated={() => {
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
                You latest applications you applied for
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
                <TableHead>Offer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                    {/* 1st column */}
                  <TableCell className="font-medium">{application.offer}</TableCell>
                  
                  <TableCell>
                    <Badge variant={getStatusBadge(application.status)}>
                      {application.status}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>{application.appliedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}