import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, CheckCircle, Clock } from "lucide-react";
import api from "@/api/api";

export default function AdminValidations() {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchValidations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applications/"); 
      const allApps = res.data.results || res.data;
      const filtered = allApps.filter(app => app.status === 'ACCEPTED');
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
      await api.post(`/admin/applications/${id}/validate/`);
      fetchValidations();
    } catch (error) {
      console.error("Validation failed:", error);
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
    } catch (error) {
      alert("Agreement not available or internship not yet validated.");
    }
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
                    {app.is_validated_by_admin ? (
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
                    {!app.is_validated_by_admin && (
                      <Button size="sm" onClick={() => handleValidate(app.id)}>
                        Validate
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      disabled={!app.is_validated_by_admin}
                      onClick={() => handleDownload(app.id)}
                    >
                      <FileDown className="h-3 w-3" /> Convention PDF
                    </Button>
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

