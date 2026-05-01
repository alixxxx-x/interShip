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
import api from "@/api/api";

export default function AllApplications() {
  const [applicationsByOffer, setApplicationsByOffer] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllApplications = async () => {
      try {
        const response = await api.get('/applications/');
        const applications = response.data.results || response.data;

        const grouped = applications.reduce((acc, app) => {
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

  const handleStatusChange = async (offer, id, newStatus) => {
    try {
      await api.patch(`/applications/${id}/update/`, { status: newStatus });
      setApplicationsByOffer(prev => {
        const updatedApplications = prev[offer].map(app =>
          app.id === id ? { ...app, status: newStatus } : app
        );
        return { ...prev, [offer]: updatedApplications };
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      "PENDING": "purple",
      "ACCEPTED": "success",
      "REJECTED": "destructive"
    };
    return variants[status] || "outline";
  };

  const getStatusLabel = (status) => {
    const labels = {
      "PENDING": "In progress",
      "ACCEPTED": "Accepted",
      "REJECTED": "Rejected"
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">All Applications</h1>
      {Object.keys(applicationsByOffer).length === 0 ? (
        <p className="text-gray-500">No applications found.</p>
      ) : (
        Object.entries(applicationsByOffer).map(([offer, applications]) => (
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
                          {getStatusLabel(application.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{application.application_date}</TableCell>
                      <TableCell>{application.email}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => application.cv ? window.open(application.cv, '_blank') : alert('No CV available')}
                          disabled={!application.cv}
                        >
                          Download
                        </Button>
                      </TableCell>
                      <TableCell>
                        {application.status === "PENDING" ? (
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="text-green-500" onClick={() => handleStatusChange(offer, application.id, 'ACCEPTED')}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleStatusChange(offer, application.id, 'REJECTED')}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => handleStatusChange(offer, application.id, 'PENDING')}>
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
        ))
      )}
    </div>
  );
}
