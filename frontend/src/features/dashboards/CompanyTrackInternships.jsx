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
import { XCircle, Clock, CheckCircle, Download } from "lucide-react";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CompanyTrackInternships() {
  const toast = useToast();
  const [applicationsByOffer, setApplicationsByOffer] = useState({});
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [internshipToStop, setInternshipToStop] = useState(null);

  useEffect(() => {
    const fetchTrackedApplications = async () => {
      try {
        const response = await api.get('/applications/');
        const applications = response.data.results || response.data;

        // Filter for internships in progress, completed, or stopped
        const trackedApplications = applications.filter(app => {
          const status = String(app.status || "").trim().toUpperCase();
          return status === "VALIDATED" || status === "COMPLETE" || status === "CANCELLED" || app.is_validated_by_admin === true;
        });

        const grouped = trackedApplications.reduce((acc, app) => {
          const { offer } = app;
          if (!acc[offer]) {
            acc[offer] = [];
          }
          acc[offer].push(app);
          return acc;
        }, {});

        setApplicationsByOffer(grouped);
      } catch (error) {
        console.error("Failed to load tracked applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackedApplications();
  }, []);

  const confirmStop = (offer, id) => {
    setInternshipToStop({ offer, id });
    setIsConfirmOpen(true);
  };

  const handleStopInternship = async () => {
    if (!internshipToStop) return;
    const { offer, id } = internshipToStop;

    try {
      await api.patch(`/applications/${id}/update/`, { status: 'CANCELLED' });
      setApplicationsByOffer(prev => {
        const updatedApplications = prev[offer].map(app =>
          app.id === id ? { ...app, status: 'CANCELLED' } : app
        );
        return { ...prev, [offer]: updatedApplications };
      });
      toast.success("Internship stopped successfully.");
    } catch (error) {
      console.error("Failed to stop internship:", error);
      toast.error("Failed to stop internship.");
    } finally {
      setIsConfirmOpen(false);
      setInternshipToStop(null);
    }
  };

  const downloadCertificate = async (application) => {
    try {
      const res = await api.get(`/admin/applications/${application.id}/certificate/`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${application.candidate.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download certificate:", err);
      toast.error("Failed to download certificate");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      "VALIDATED": "warning",
      "COMPLETE": "success",
      "CANCELLED": "destructive"
    };
    return variants[status] || "outline";
  };

  if (loading) {
    return <div className="p-6">Loading tracking data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Internship Track</h1>
          <p className="text-muted-foreground">
            Track your ongoing, completed, and stopped internships.
          </p>
        </div>
      </div>

      {Object.keys(applicationsByOffer).length === 0 ? (
        <p className="text-gray-500">No tracked internships found.</p>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Certificate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => {
                    const status = String(application.status || "").trim().toUpperCase();
                    return (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">{application.candidate}</TableCell>
                        <TableCell>
                          {status === "COMPLETE" ? (
                            <Badge variant="success" className="gap-1 bg-green-100 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3" /> Completed
                            </Badge>
                          ) : status === "CANCELLED" ? (
                            <Badge variant="destructive" className="gap-1 bg-red-100 text-red-700 border-red-200">
                              <XCircle className="h-3 w-3" /> Stopped
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="gap-1 text-amber-700 bg-amber-50">
                              <Clock className="h-3 w-3" /> Ongoing
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell>
                          {status === "COMPLETE" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 border-primary/20 text-primary hover:bg-primary/5"
                              onClick={() => downloadCertificate(application)}
                            >
                              <Download className="h-3.5 w-3.5" />
                              Certificate
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {status !== "COMPLETE" && status !== "CANCELLED" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1 bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => confirmStop(offer, application.id)}
                            >
                              Kick
                            </Button>
                          )}
                          {status === "COMPLETE" && (
                            <span className="text-sm text-green-600 font-medium">Finished</span>
                          )}
                          {status === "CANCELLED" && (
                            <span className="text-sm text-red-600 font-medium">Terminated</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}

      {/* Stop Internship Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop Internship</DialogTitle>
            <DialogDescription>
              Are you sure you want to kick this student and terminate their internship? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleStopInternship}>
              Yes, Kick
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
