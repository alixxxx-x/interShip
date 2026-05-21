import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Globe,
  Search,
  MoreHorizontal,
  Archive,
  UserCheck,
  UserX,
  MessageSquare,
  Check,
  X,
  Copy,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/api";
import ChatModal from "./ChatModal";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function AdminCompanies() {
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Generate Matricule Modal State
  const [isMatriculeModalOpen, setIsMatriculeModalOpen] = useState(false);
  const [matriculeCompanyName, setMatriculeCompanyName] = useState("");
  const [generatedMatricule, setGeneratedMatricule] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const isSuperAdmin = window.location.pathname.startsWith("/superadmindashboard");

  const handleGenerateMatricule = async () => {
    if (!matriculeCompanyName.trim()) return;
    try {
      setIsGenerating(true);
      const res = await api.post("/admin/matricules/generate/", { company_name: matriculeCompanyName });
      setGeneratedMatricule(res.data.matricule);
      toast.success("Matricule generated successfully!");
    } catch (error) {
      console.error("Failed to generate matricule:", error);
      toast.error(error.response?.data?.error || "Failed to generate matricule.");
    } finally {
      setIsGenerating(false);
    }
  };

  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".menu-container")) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      if (isSuperAdmin) {
        const res = await api.get("/admin/companies/pending/");
        setCompanies(res.data.results || res.data);
      } else {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, entriesPerPage]);

  const handleToggleStatus = async (company) => {
    try {
      const newStatus = !company.is_active;
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: newStatus } : c));
      await api.patch(`/users/${company.id}/`, { is_active: newStatus });
      toast.success(`${company.name} status updated.`);
    } catch (error) {
      console.error("Failed to toggle status:", error);
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: company.is_active } : c));
      toast.error("Failed to update company status.");
    }
  };

  const handleAcceptCompany = async (company) => {
    try {
      toast.info(`Activating ${company.name}...`);
      await api.post(`/admin/companies/${company.id}/accept/`);
      toast.success(`Activated ${company.name} successfully!`);
      setCompanies(prev => prev.filter(c => c.id !== company.id));
    } catch (error) {
      console.error("Failed to accept company:", error);
      toast.error("Failed to approve company registration.");
    }
  };

  const handleRejectCompany = async (company) => {
    if (!window.confirm(`Are you sure you want to REJECT and permanently delete the registration request from "${company.name}"?`)) return;
    try {
      toast.info(`Rejecting ${company.name}...`);
      await api.post(`/admin/companies/${company.id}/reject/`);
      toast.success(`Registration request deleted.`);
      setCompanies(prev => prev.filter(c => c.id !== company.id));
    } catch (error) {
      console.error("Failed to reject company:", error);
      toast.error("Failed to reject company registration.");
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(search.toLowerCase()) ||
    company.location?.toLowerCase().includes(search.toLowerCase()) ||
    company.company_field?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCompanies.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + entriesPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
        <LoadingScreen fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background h-full animate-in fade-in duration-500" style={{ fontFamily: appleFont }}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
            {isSuperAdmin ? "Pending Companies Registry" : "Corporate Directory"}
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 select-none">
              {companies.length} {isSuperAdmin ? "Pending" : "Active"}
            </span>
          </h1>
          <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1">
            {isSuperAdmin
              ? "Approve incoming corporate registration requests."
              : "Manage and monitor all active corporate partner organizations registered on the platform."}
          </p>
        </div>

        {/* Actions & Search */}
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Button 
              onClick={() => setIsMatriculeModalOpen(true)}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              Generate Matricule
            </Button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder={isSuperAdmin ? "Search pending requests..." : "Search companies..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-255/80 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 w-60 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-zinc-200 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-visible">
        {paginatedCompanies.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 dark:bg-zinc-900/50">
            <span className="text-gray-400 dark:text-zinc-600">
              <Building2 className="w-10 h-10 stroke-[1.5]" />
            </span>
            <span className="text-[13px] font-medium text-gray-500 dark:text-zinc-400">No companies found.</span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500">
              {isSuperAdmin ? "No pending registration requests at this time." : "Try adjusting your search filters."}
            </span>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[280px] rounded-tl-xl">Organization</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[160px]">Sector</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[160px]">Location</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[140px]">Status</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/40 dark:hover:bg-zinc-900/35 transition-colors duration-150 group"
                  >
                    {/* Logo & Name */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-9 h-9 rounded-xl object-cover border border-gray-200 dark:border-zinc-700 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-zinc-800 flex items-center justify-center border border-blue-100 dark:border-zinc-700 shadow-sm shrink-0">
                            <Building2 className="w-4 h-4 text-blue-500 dark:text-zinc-400" />
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[13px] font-bold text-gray-900 dark:text-zinc-100 truncate">{company.name}</span>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                            <span>ID: {company.id}</span>
                            {company.website && (
                              <a
                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-0.5 hover:text-blue-500 transition-colors"
                              >
                                <Globe className="h-2.5 w-2.5" /> Site
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="py-3 px-6">
                      <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-900/30">
                        {company.company_field || "Technology"}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600 dark:text-zinc-300 truncate">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                        {company.location || "Algeria"}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-6">
                      {isSuperAdmin ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/25 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] animate-pulse" />
                          Pending Approval
                        </div>
                      ) : (
                        company.is_active ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                            Active Partner
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 border border-rose-100/60 dark:border-rose-900/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                            Inactive
                          </div>
                        )
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-6 text-right">
                      {isSuperAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setActiveRecipient(company); setChatOpen(true); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors border border-gray-200 dark:border-zinc-700"
                            title="Chat with Applicant"
                          >
                            <MessageSquare className="w-3 h-3" /> Chat
                          </button>
                          <button
                            onClick={() => handleRejectCompany(company)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            onClick={() => handleAcceptCompany(company)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                        </div>
                      ) : (
                        <div className="relative menu-container flex items-center justify-end">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === company.id ? null : company.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenuId === company.id && (
                            <div className="absolute right-0 top-8 z-50 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700/80 rounded-xl shadow-lg overflow-hidden min-w-[160px] py-1">
                              <div className="px-3 py-1.5 text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                                Company Controls
                              </div>
                              <button
                                onClick={() => { handleToggleStatus(company); setOpenMenuId(null); }}
                                className={`flex items-center gap-2 w-full px-3 py-2 text-[11px] font-semibold transition-colors ${
                                  company.is_active
                                    ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                    : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                }`}
                              >
                                {company.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                {company.is_active ? "Deactivate Partner" : "Activate Partner"}
                              </button>
                              <div className="my-1 border-t border-gray-100 dark:border-zinc-800" />
                              <button
                                onClick={() => { setActiveRecipient(company); setChatOpen(true); setOpenMenuId(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                                Direct Chat
                              </button>
                              <div className="my-1 border-t border-gray-100 dark:border-zinc-800" />
                              <button
                                onClick={() => { handleToggleStatus(company); setOpenMenuId(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                              >
                                <Archive className="w-3.5 h-3.5" />
                                Archive Organization
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-150 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select 
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="border border-gray-255/80 dark:border-zinc-800 rounded px-1.5 py-0.5 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>Companies per page</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-855 rounded text-gray-400 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-6 h-6 flex items-center justify-center rounded-md font-semibold text-xs transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-sm"
                      : "hover:bg-gray-100 dark:hover:bg-zinc-855 text-gray-600 dark:text-zinc-400"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-855 rounded text-gray-400 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Chat Modal */}
      {chatOpen && activeRecipient && (
        <ChatModal recipient={activeRecipient} onClose={() => setChatOpen(false)} />
      )}

      {/* Generate Matricule Modal */}
      {isMatriculeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-[400px] rounded-xl shadow-xl border border-gray-150 dark:border-zinc-800 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-150 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-50">Generate Matricule Key</h2>
              <button 
                onClick={() => {
                  setIsMatriculeModalOpen(false);
                  setMatriculeCompanyName("");
                  setGeneratedMatricule(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={matriculeCompanyName}
                  onChange={(e) => setMatriculeCompanyName(e.target.value)}
                  placeholder="e.g. Ooredoo"
                  className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 dark:text-zinc-200"
                  disabled={isGenerating || generatedMatricule}
                />
              </div>

              {generatedMatricule && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-3 rounded-lg flex flex-col items-center gap-2">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Generated Matricule</span>
                  <div className="flex items-center gap-2 w-full">
                    <code className="flex-1 bg-white dark:bg-zinc-950 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1.5 rounded text-center text-sm font-mono text-gray-900 dark:text-zinc-100 select-all">
                      {generatedMatricule}
                    </code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedMatricule);
                        toast.success("Copied to clipboard!");
                      }}
                      className="p-1.5 bg-white dark:bg-zinc-950 border border-emerald-200 dark:border-emerald-800/80 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-150 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsMatriculeModalOpen(false);
                  setMatriculeCompanyName("");
                  setGeneratedMatricule(null);
                }}
                className="h-8 text-xs bg-white dark:bg-zinc-950"
              >
                Close
              </Button>
              {!generatedMatricule && (
                <Button 
                  onClick={handleGenerateMatricule}
                  disabled={isGenerating || !matriculeCompanyName.trim()}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Generate
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
