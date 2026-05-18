import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
import { Stepper } from "@/components/ui/stepper";


export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/applications/");
        setApplications(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load applications:", e);
        setError("Failed to load your applications.");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);



  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading your applications...</span>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 p-6">

    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">
          Track the internships you applied for.
        </p>
      </div>
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
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">You don't have applications yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer</TableHead>
                  <TableHead className="w-[360px]">Status</TableHead>
                  <TableHead className="w-[180px]">Applied Date</TableHead>
                  <TableHead className="w-[130px] text-right">Agreement</TableHead>
                  <TableHead className="w-[130px] text-right">Certificate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => {
                  const offer =
                    application.offer ||
                    application.offer_title ||
                    application.internship_title ||
                    (application.internship ? `Internship #${application.internship}` : "-");

                  const statusRaw = String(application.status || "").trim().toUpperCase();
                  const appliedDate = application.appliedDate || application.application_date || "-";
                  const offerId = application.internship;

                  let currentStep = 1;
                  if (statusRaw === "ACCEPTED") currentStep = 2;
                  if (statusRaw === "VALIDATED") currentStep = 3;
                  if (statusRaw === "COMPLETE") currentStep = 4;
                  if (statusRaw === "REJECTED" || statusRaw === "CANCELLED") currentStep = 2;

                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium pr-6">
                        {offerId ? (
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => navigate(`/internships/${offerId}`)}
                          >
                            {offer}
                          </Button>
                        ) : (
                          offer
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="py-1">
                          <Stepper 
                            steps={[
                              { label: "Applied" },
                              { label: "Accepted" },
                              { label: "Validated" },
                              { label: "Completed" }
                            ]}
                            currentStep={currentStep}
                            status={statusRaw}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{appliedDate}</TableCell>
                      <TableCell className="text-right">
                        {application.is_validated_by_admin && ["ACCEPTED", "VALIDATED", "COMPLETE"].includes(statusRaw) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-8 px-2"
                            onClick={async () => {
                              try {
                                const res = await api.get(`/admin/applications/${application.id}/agreement/`, { 
                                  responseType: 'blob' 
                                });
                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `Agreement_${application.id}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                              } catch (err) {
                                console.error("Failed to download agreement:", err);
                              }
                            }}
                          >
                            PDF
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {statusRaw === "COMPLETE" && application.is_validated_by_admin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-8 px-2"
                            onClick={async () => {
                              try {
                                const res = await api.get(`/admin/applications/${application.id}/certificate/`, {
                                  responseType: "blob",
                                });
                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute("download", `Certificate_${application.id}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                              } catch (err) {
                                console.error("Failed to download certificate:", err);
                              }
                            }}
                          >
                            PDF
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
