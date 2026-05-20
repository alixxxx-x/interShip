import React, { useEffect, useState } from "react";
import { 
  FileDown, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  Check, 
  X,
  FileText,
  User,
  Building2
} from "lucide-react";
import api from "@/api/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function AdminValidations() {
  const toast = useToast();
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);
  const [appToReject, setAppToReject] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const fetchValidations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applications/");
      const allApps = res.data.results || res.data;
      const filtered = allApps.filter(app =>
        app.status === 'ACCEPTED' ||
        app.status === 'VALIDATED' ||
        app.status === 'COMPLETE' ||
        app.status === 'REJECTED'
      );
      setValidations(filtered);
    } catch (error) {
      console.error("Failed to fetch validations:", error);
      toast.error("Failed to load validation queue.");
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
      if (response.data.application) {
        setValidations(validations.map(app => 
          app.id === id ? response.data.application : app
        ));
      } else {
        fetchValidations();
      }
      toast.success("Application validated successfully.");
    } catch (error) {
      console.error("Validation failed:", error);
      toast.error("Validation failed. Please try again.");
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
      if (response.data.application) {
        setValidations(validations.map(app => 
          app.id === appToReject ? response.data.application : app
        ));
      } else {
        fetchValidations();
      }
      toast.success("Application rejected.");
    } catch (error) {
      console.error("Rejection failed:", error);
      toast.error("Failed to reject application.");
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

  const filteredValidations = validations.filter(app => {
    if (!app) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      (app.candidate || "").toLowerCase().includes(searchLower) ||
      (app.company_name || "").toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (app) => {
    if (app.status === 'REJECTED') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 border border-rose-100/60 dark:border-rose-900/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
          Rejected by Admin
        </div>
      );
    }
    if (app.status === 'VALIDATED' || app.status === 'COMPLETE' || app.is_validated_by_admin) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          Validated
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/25 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
        Pending Admin
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
        <LoadingScreen fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background h-full" style={{ fontFamily: appleFont }}>
      
      {/* Header and Toolbar Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
            Validation Queue
            {validations.length > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 select-none">
                {validations.length} Pending
              </span>
            )}
          </h1>
          <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1">
            Manage "Convention de Stage" approvals and document generation.
          </p>
        </div>

        {/* Search Toolbar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidate, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-255/80 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 w-56 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-zinc-200 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        <div className="overflow-x-auto">
          {filteredValidations.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 dark:bg-zinc-900/50">
              <span className="text-gray-400 dark:text-zinc-600">
                <CheckCircle className="w-10 h-10 stroke-[1.5]" />
              </span>
              <span className="text-[13px] font-medium text-gray-500 dark:text-zinc-400">
                No validations found matching your search.
              </span>
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[220px]">Candidate</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-left w-[220px]">Company</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-left w-40">Admin Status</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredValidations.map((app) => (
                  <tr 
                    key={app.id} 
                    className="transition-colors duration-150 border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/40 dark:hover:bg-zinc-900/35 group"
                  >
                    <td className="py-3 px-6 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-zinc-800 flex items-center justify-center border border-blue-200 dark:border-zinc-700 shadow-sm shrink-0">
                          <User className="w-3.5 h-3.5 text-blue-500 dark:text-zinc-400" />
                        </div>
                        <span className="text-[13px] font-semibold text-gray-900 dark:text-zinc-100 truncate">
                          {app.candidate}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-3 px-6 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700 shadow-sm shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                        </div>
                        <span className="text-[13px] font-medium text-gray-700 dark:text-zinc-300 truncate">
                          {app.company_name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-6 text-left">
                      {getStatusBadge(app)}
                    </td>

                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status Actions */}
                        {app.status === 'ACCEPTED' && !app.is_validated_by_admin && (
                          <>
                            <button 
                              onClick={() => handleValidate(app.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" /> Validate
                            </button>
                            <button
                              onClick={() => confirmReject(app.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {app.status === 'REJECTED' && isWithin48h(app.admin_rejection_date) && (
                          <button 
                            onClick={() => handleValidate(app.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Validate
                          </button>
                        )}
                        
                        <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

                        {/* Document Actions */}
                        <button
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
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
                          <FileText className="w-3 h-3" /> CV
                        </button>
                        <button
                          disabled={!canDownloadAgreement(app)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          onClick={() => handleDownload(app.id)}
                        >
                          <FileDown className="w-3 h-3" /> Agreement
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Reject Confirmation Dialog */}
      <Dialog open={isConfirmRejectOpen} onOpenChange={setIsConfirmRejectOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-950" style={{ fontFamily: appleFont }}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">Reject Application</DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-500 dark:text-zinc-400">
              Are you sure you want to reject this application? This action will notify the candidate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" className="rounded-lg text-xs font-semibold" onClick={() => setIsConfirmRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white" onClick={handleReject}>
              Yes, Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
