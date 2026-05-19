import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, CheckCircle, Clock, XCircle } from "lucide-react";
import api from "@/api/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/custom-toast";

export default function AdminValidations() {
  const toast = useToast();
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);
  const [appToReject, setAppToReject] = useState(null);

  const fetchValidations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applications/");
      const allApps = res.data.results || res.data;
      // Show Accepted applications (waiting for admin) plus validated/completed ones
      const filtered = allApps.filter(app =>
        app.status === 'ACCEPTED' ||
        app.status === 'VALIDATED' ||
        app.status === 'COMPLETE' ||
        app.status === 'REJECTED' // Show rejected applications as well to allow re-validation
      );
      setValidations(filtered);
    } catch (error) {
      console.error("Failed to fetch validations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidations();
  }, []);

  const handleValidate = async (id) => {
    try {
      const response = await api.post(`/admin/applications/${id}/validate/`);
      // Update the application in state immediately with the returned data
      if (response.data.application) {
        setValidations(validations.map(app => 
          app.id === id ? response.data.application : app
        ));
      } else {
        // Fallback to refetching if data not in response
        fetchValidations();
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const confirmReject = (id) => {
    setAppToReject(id);
    setIsConfirmRejectOpen(true);
  };

  const handleReject = async () => {
    if (!appToReject) return;
    try {
      const response = await api.post(`/admin/applications/${appToReject}/reject/`);
      // Update the application in state immediately with the returned data
      if (response.data.application) {
        setValidations(validations.map(app => 
          app.id === appToReject ? response.data.application : app
        ));
      } else {
        // Fallback: just remove it from the list
        fetchValidations();
      }
    } catch (error) {
      console.error("Rejection failed:", error);
    } finally {
      setIsConfirmRejectOpen(false);
      setAppToReject(null);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/admin/applications/${id}/agreement/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `convention_stage_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Agreement not available or internship not yet validated.";
      toast.error(errorMsg);
      console.error("Download failed:", error);
    }
  };

  const canDownloadAgreement = (app) => {
    const statusRaw = String(app.status || "").trim().toUpperCase();
    return app.is_validated_by_admin || statusRaw === "VALIDATED" || statusRaw === "COMPLETE";
  };

  const isWithin48h = (dateStr) => {
    if (!dateStr) return false;
    const rejectionDate = new Date(dateStr);
    const now = new Date();
    const diffHours = (now - rejectionDate) / (1000 * 60 * 60);
    return diffHours <= 48;
  };

  if (loading) return <div className="p-6">Loading validation workflow...</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Internship Validations</h1>
        <p className="text-muted-foreground">Manage "Convention de Stage" approvals and document generation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agreement Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Admin Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validations.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.candidate}</TableCell>
                  <TableCell>{app.company_name}</TableCell>
                  <TableCell>
                    {app.status === 'REJECTED' ? (
                      <Badge variant="destructive" className="gap-1 bg-red-100 text-red-700 border-red-200">
                        <XCircle className="h-3 w-3" /> Rejected by Admin
                      </Badge>
                    ) : app.status === 'VALIDATED' || app.status === 'COMPLETE' || app.is_validated_by_admin ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" /> Validated
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1 text-amber-700 bg-amber-50">
                        <Clock className="h-3 w-3" /> Pending Admin
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {app.status === 'ACCEPTED' && !app.is_validated_by_admin && (
                      <>
                        <Button size="sm" onClick={() => handleValidate(app.id)}>
                          Validate
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => confirmReject(app.id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {app.status === 'REJECTED' && isWithin48h(app.admin_rejection_date) && (
                      <Button size="sm" onClick={() => handleValidate(app.id)}>
                        Validate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={async () => {
                        try {
                          const res = await api.get(`/cv/generate/${app.student}/`, {
                            responseType: 'blob'
                          });
                          const blob = new Blob([res.data], { type: 'application/pdf' });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `${app.candidate.replace(/\s+/g, '_')}_CV.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          if (app.cv) {
                            window.open(app.cv, '_blank');
                          } else {
                            toast.warning('No CV available');
                          }
                        }
                      }}
                    >
                      <FileDown className="h-3 w-3" /> CV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={!canDownloadAgreement(app)}
                      onClick={() => handleDownload(app.id)}
                    >
                      <FileDown className="h-3 w-3" /> Agreement
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Reject Confirmation Dialog */}
      <Dialog open={isConfirmRejectOpen} onOpenChange={setIsConfirmRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this application?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>
              Yes, Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
