import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Globe,
  Search,
  MoreVertical,
  Archive,
  UserCheck,
  UserX,
  MessageSquare,
  Check,
  X,
  Copy,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import api from "@/api/api";
import ChatModal from "./ChatModal";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function AdminCompanies() {
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [activeRecipient, setActiveRecipient] = useState(null);

  // Super Admin Pending Actions Modal State
  const [showMatriculeModal, setShowMatriculeModal] = useState(false);
  const [acceptedCompany, setAcceptedCompany] = useState({ name: "", matricule: "" });
  const [copied, setCopied] = useState(false);

  // Check if active route is Super Admin
  const isSuperAdmin = window.location.pathname.startsWith("/superadmindashboard");

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      if (isSuperAdmin) {
        // Fetch only pending companies
        const res = await api.get("/admin/companies/pending/");
        setCompanies(res.data.results || res.data);
      } else {
        // Fetch normal active companies
        const res = await api.get("/companies/");
        setCompanies(res.data.results || res.data);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      toast.error("Failed to load company registry records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [isSuperAdmin]);

  // Handle normal Admin Deactivation/Activation
  const handleToggleStatus = async (company) => {
    try {
      const newStatus = !company.is_active;
      // Optimistic update
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: newStatus } : c));

      await api.patch(`/users/${company.id}/`, { is_active: newStatus });
      toast.success(`${company.name} status updated.`);
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Revert if failed
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: company.is_active } : c));
      toast.error("Failed to update company status.");
    }
  };

  // Handle Super Admin Approving a pending company registration
  const handleAcceptCompany = async (company) => {
    try {
      toast.info(`Generating secure matriculation for ${company.name}...`);
      const res = await api.post(`/admin/companies/${company.id}/accept/`);
      const data = res.data;
      
      toast.success(`Activated ${company.name} successfully!`);
      
      // Open success copy-matricule modal
      setAcceptedCompany({
        name: company.name,
        matricule: data.matricule
      });
      setShowMatriculeModal(true);
      
      // Remove from list locally
      setCompanies(prev => prev.filter(c => c.id !== company.id));
    } catch (error) {
      console.error("Failed to accept company:", error);
      toast.error("Failed to approve company registration.");
    }
  };

  // Handle Super Admin Rejecting a pending company registration
  const handleRejectCompany = async (company) => {
    if (!window.confirm(`Are you sure you want to REJECT and permanently delete the registration request from "${company.name}"?`)) return;
    try {
      toast.info(`Rejecting ${company.name}...`);
      await api.post(`/admin/companies/${company.id}/reject/`);
      toast.success(`Registration request deleted.`);
      
      // Remove from list locally
      setCompanies(prev => prev.filter(c => c.id !== company.id));
    } catch (error) {
      console.error("Failed to reject company:", error);
      toast.error("Failed to reject company registration.");
    }
  };

  // Copy generated Matricule number
  const copyToClipboard = () => {
    navigator.clipboard.writeText(acceptedCompany.matricule);
    setCopied(true);
    toast.success("Registration Number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(search.toLowerCase()) ||
    company.location?.toLowerCase().includes(search.toLowerCase()) ||
    company.company_field?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
        <LoadingScreen fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent">
          {isSuperAdmin ? "Pending Companies Registry" : "Verified Corporate Directory"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isSuperAdmin 
            ? "Approve incoming corporate registration requests and assign secure Matricule keys." 
            : "Manage and monitor all active corporate partner organizations registered on the platform."
          }
        </p>
      </div>

      <Card className="border border-border/60 shadow-xl bg-card/40 backdrop-blur-md overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                {isSuperAdmin ? "Registration Validation Pipeline" : "Active Partner Organizations"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isSuperAdmin 
                  ? `There are ${companies.length} registration request(s) awaiting approval.`
                  : `Overview of ${companies.length} verified partner organizations.`
                }
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
              <Input
                placeholder={isSuperAdmin ? "Search pending requests..." : "Search companies..."}
                className="pl-9 bg-background/50 border border-border/80 focus:border-primary rounded-xl text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px] font-bold text-xs uppercase">Organization Details</TableHead>
                  <TableHead className="font-bold text-xs uppercase">Core Sector</TableHead>
                  <TableHead className="font-bold text-xs uppercase">Location</TableHead>
                  <TableHead className="font-bold text-xs uppercase">Integrity Status</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase">Operational Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Building2 className="w-8 h-8 text-muted-foreground/30" />
                        <span className="text-sm font-semibold">No companies found</span>
                        <span className="text-xs text-muted-foreground/60">There are no records matching your current registry selection.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-muted/10 transition-colors group">
                      
                      {/* Logo & Name */}
                      <TableCell className="font-bold py-4">
                        <div className="flex items-center gap-3.5">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="w-10 h-10 rounded-xl object-cover border border-border/80 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                              <Building2 className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-foreground font-bold tracking-tight">{company.name}</span>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono font-semibold">
                              <span>ID: {company.id}</span>
                              {company.website && (
                                <a 
                                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="flex items-center gap-0.5 hover:text-primary transition-colors"
                                >
                                  <Globe className="h-2.5 w-2.5" /> Site
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Sector */}
                      <TableCell className="py-4">
                        <Badge variant="outline" className="px-2.5 py-0.5 rounded-lg font-bold border-indigo-200 text-indigo-600 bg-indigo-50 text-[10px]">
                          {company.company_field || "Technology"}
                        </Badge>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <MapPin className="h-3.5 w-3.5 text-red-400" />
                          {company.location || "Algeria"}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4">
                        {isSuperAdmin ? (
                          <Badge variant="warning" className="px-3 py-0.5 rounded-full font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] flex items-center gap-1 w-fit animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" /> Pending Approval
                          </Badge>
                        ) : (
                          <Badge variant={company.is_active ? "success" : "destructive"} className="px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            {company.is_active ? "Active Partner" : "Inactive"}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Action Decision triggers */}
                      <TableCell className="text-right py-4">
                        {isSuperAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            {/* Direct Chat (pending) */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8.5 w-8.5 rounded-lg hover:bg-muted text-muted-foreground"
                              title="Chat with Applicant"
                              onClick={() => {
                                setActiveRecipient(company);
                                setChatOpen(true);
                              }}
                            >
                              <MessageSquare className="h-4.5 w-4.5 text-blue-500" />
                            </Button>

                            {/* Reject */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-2.5 h-8.5 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-red-500 text-xs font-semibold gap-1"
                              onClick={() => handleRejectCompany(company)}
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </Button>

                            {/* Approve */}
                            <Button
                              size="sm"
                              className="px-3 h-8.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold gap-1 shadow-md shadow-emerald-500/10"
                              onClick={() => handleAcceptCompany(company)}
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted focus-visible:ring-0">
                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-2xl rounded-xl border border-border/80 bg-card/90 backdrop-blur-md">
                              <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Company Controls
                              </div>
                              <DropdownMenuItem
                                className="cursor-pointer gap-2.5 text-sm rounded-lg py-2 focus:bg-destructive/10 focus:text-destructive text-red-500"
                                onClick={() => handleToggleStatus(company)}
                              >
                                {company.is_active ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                )}
                                <span>{company.is_active ? "Deactivate Partner" : "Activate Partner"}</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="my-1 border-border/60" />

                              <DropdownMenuItem
                                className="cursor-pointer gap-2.5 text-sm rounded-lg py-2"
                                onClick={() => {
                                  setActiveRecipient(company);
                                  setChatOpen(true);
                                }}
                              >
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                <span>Direct Chat</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="my-1 border-border/60" />

                              <DropdownMenuItem
                                className="cursor-pointer gap-2.5 text-sm rounded-lg py-2 text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                                onClick={() => handleToggleStatus(company)}
                              >
                                <Archive className="h-4 w-4" />
                                <span>Archive Organization</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Chat Modal */}
      <ChatModal
        open={chatOpen}
        onOpenChange={setChatOpen}
        recipientId={activeRecipient?.id}
        recipientName={activeRecipient?.name}
      />

      {/* REGISTRATION SUCCESS / MATRICULE DISPLAY MODAL */}
      {showMatriculeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Top decorative glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500" />
            
            <div className="flex flex-col items-center text-center gap-4 mt-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-md">
                <ShieldCheck className="w-8 h-8" />
              </div>
              
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                  Company Activated Successfully!
                </h3>
                <p className="text-muted-foreground text-xs mt-1">
                  We've generated a secure, legally-binding registration number (Matricule) for <b>{acceptedCompany.name}</b>.
                </p>
              </div>

              {/* Matricule Number Display Container */}
              <div className="w-full bg-muted/40 border border-border/60 rounded-xl p-4 flex flex-col items-center gap-2 mt-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Registration Number
                </span>
                <span className="text-2xl font-black font-mono tracking-wider text-emerald-500 select-all">
                  {acceptedCompany.matricule}
                </span>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`mt-2 font-semibold text-xs transition-all gap-1.5 h-8.5 rounded-lg ${
                    copied ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : ""
                  }`}
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground/80 italic mt-1 max-w-sm">
                * The partner has been activated and can now log in and post unlimited internship listings immediately.
              </p>

              {/* Close Button */}
              <Button 
                className="w-full mt-4 rounded-xl bg-primary hover:bg-primary/90 font-bold"
                onClick={() => setShowMatriculeModal(false)}
              >
                Close & Finish Approval
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
