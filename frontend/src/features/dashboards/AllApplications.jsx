import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Pencil } from "lucide-react";

export default function AllApplications() {
  const [applicationsByOffer, setApplicationsByOffer] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllApplications = async () => {
      try {
        // Replace with a real API call to fetch all applications
        const mockApplications = [
            {
                id: 1,
                candidate: "Sarah Johnson",
                offer: "Frontend Developer Intern",
                status: "Rejected",
                appliedDate: "2026-04-15",
                email: "sarah.j@email.com",
                cv: "path/to/cv.pdf"
              },
              {
                id: 2,
                candidate: "Michael Chen",
                offer: "Backend Developer Intern",
                status: "In progress",
                appliedDate: "2026-04-14",
                email: "m.chen@email.com",
                cv: "path/to/cv.pdf"
              },
              {
                id: 3,
                candidate: "Emma Williams",
                offer: "Frontend Developer Intern",
                status: "Accepted",
                appliedDate: "2026-04-14",
                email: "emma.w@email.com",
                cv: "path/to/cv.pdf"
              },
              {
                id: 4,
                candidate: "James Brown",
                offer: "Backend Developer Intern",
                status: "Accepted",
                appliedDate: "2026-04-12",
                email: "james.b@email.com",
                cv: "path/to/cv.pdf"
              },
              {
                id: 5,
                candidate: "Lisa Anderson",
                offer: "Frontend Developer Intern",
                status: "In progress",
                appliedDate: "2026-04-11",
                email: "lisa.a@email.com",
                cv: "path/to/cv.pdf"
              },
              // Add more mock data to simulate "all" applications
              {
                id: 6,
                candidate: "David Lee",
                offer: "Data Science Intern",
                status: "Accepted",
                appliedDate: "2026-04-10",
                email: "david.l@email.com",
                cv: "path/to/cv.pdf"
              },
              {
                id: 7,
                candidate: "Maria Garcia",
                offer: "Data Science Intern",
                status: "Rejected",
                appliedDate: "2026-04-09",
                email: "maria.g@email.com",
                cv: "path/to/cv.pdf"
              },
        ];
        
        const grouped = mockApplications.reduce((acc, app) => {
            const { offer } = app;
            if (!acc[offer]) {
              acc[offer] = [];
            }
            acc[offer].push(app);
            return acc;
          }, {});

        setApplicationsByOffer(grouped);
      } catch (error) {
        console.error("Failed to load applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllApplications();
  }, []);

  const handleStatusChange = (offer, id, newStatus) => {
    // In a real app, you'd make an API call here to update the backend
    setApplicationsByOffer(prev => {
      const updatedApplications = prev[offer].map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      );
      return { ...prev, [offer]: updatedApplications };
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      "In progress": "purple",
      "Accepted": "success",
      "Rejected": "destructive"
    };
    return variants[status] || "outline";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">All Applications</h1>
      {Object.entries(applicationsByOffer).map(([offer, applications]) => (
        <Card key={offer}>
          <CardHeader>
            <CardTitle>{offer}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.candidate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{application.appliedDate}</TableCell>
                    <TableCell>{application.email}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => alert(`Downloading CV for ${application.candidate}`)}>
                        Download
                      </Button>
                    </TableCell>
                    <TableCell>
                      {application.status === "In progress" ? (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="text-green-500" onClick={() => handleStatusChange(offer, application.id, 'Accepted')}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleStatusChange(offer, application.id, 'Rejected')}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleStatusChange(offer, application.id, 'In progress')}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
