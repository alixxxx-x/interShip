import { useEffect, useState } from "react";
import { 
  GraduationCap, 
  PlusCircle, 
  Search, 
  Mail, 
  ShieldCheck, 
  Loader2, 
  Eye, 
  EyeOff,
  Globe,
  ChevronLeft,
  ChevronRight,
  FolderOpen
} from "lucide-react";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function SuperAdminUniversities() {
  const toast = useToast();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Create Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // View Departments Modal State
  const [showDepartmentsModal, setShowDepartmentsModal] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  
  // New University Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    university_name: "",
    email_domain: "",
    departmentsText: "" // Comma separated departments
  });

  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/?role=ADMIN_UNIV");
      const data = res.data.results || res.data;
      const univList = data.filter(u => u.university_name);
      setUniversities(univList);
    } catch (error) {
      console.error("Failed to fetch universities:", error);
      toast.error("Failed to load university registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, entriesPerPage]);

  const handleCreateUniversity = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.university_name || !formData.email_domain) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setAdding(true);
    try {
      const departments = formData.departmentsText
        ? formData.departmentsText.split(",").map(d => d.trim()).filter(Boolean)
        : ["Informatique", "Mathématiques", "Économie"];

      const payload = {
        email: formData.email,
        password: formData.password,
        role: "ADMIN_UNIV",
        university_name: formData.university_name,
        email_domain: formData.email_domain,
        departments: departments
      };

      await api.post("/auth/register/", payload);
      toast.success(`Successfully added ${formData.university_name}!`);
      
      setFormData({
        email: "",
        password: "",
        university_name: "",
        email_domain: "",
        departmentsText: ""
      });
      setShowAddModal(false);
      fetchUniversities();
    } catch (error) {
      console.error("Failed to add university:", error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const msg = typeof errorData === "string" 
          ? errorData 
          : Object.values(errorData).flat().join(" ");
        toast.error(msg || "Failed to register university.");
      } else {
        toast.error("Server connection error.");
      }
    } finally {
      setAdding(false);
    }
  };

  const filteredUniversities = universities.filter(univ => 
    univ.university_name?.toLowerCase().includes(search.toLowerCase()) ||
    univ.email_domain?.toLowerCase().includes(search.toLowerCase()) ||
    univ.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUniversities.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedUniversities = filteredUniversities.slice(startIndex, startIndex + entriesPerPage);

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
            Universities Registry
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 select-none">
              {universities.length} Total
            </span>
          </h1>
          <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1 max-w-xl">
            Manage whitelisted university domains, administrator credentials, and department configurations.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full sm:w-56 border border-gray-255/80 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-zinc-200 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="flex items-center justify-center w-full sm:w-auto gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add University
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-visible">
        {paginatedUniversities.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 dark:bg-zinc-900/50 rounded-xl">
            <span className="text-gray-400 dark:text-zinc-600">
              <GraduationCap className="w-10 h-10 stroke-[1.5]" />
            </span>
            <span className="text-[13px] font-medium text-gray-500 dark:text-zinc-400">No universities found.</span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500">
              Add a new university to get started.
            </span>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[25%] rounded-tl-xl">Institution</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[18%]">Email Domain</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[22%]">Administrator</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[25%]">Departments</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 pr-6 pl-2 w-[10%] text-right rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUniversities.map((univ) => (
                  <tr
                    key={univ.id}
                    className="border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/40 dark:hover:bg-zinc-900/35 transition-colors duration-150 group"
                  >
                    {/* University Name */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/30 shadow-sm shrink-0">
                          <GraduationCap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[13px] font-bold text-gray-900 dark:text-zinc-100 truncate">{univ.university_name}</span>
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">ID: {univ.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email Domain */}
                    <td className="py-3 px-6">
                      <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800/30">
                        @{univ.email_domain || "univ.dz"}
                      </span>
                    </td>

                    {/* Admin Email */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600 dark:text-zinc-300 truncate">
                        <Mail className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                        {univ.email}
                      </div>
                    </td>

                    {/* Departments */}
                    <td className="py-3 px-6">
                      {univ.departments && univ.departments.length > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedDepartments(univ.departments);
                            setShowDepartmentsModal(true);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold transition-colors border border-blue-100 dark:border-blue-800/30"
                        >
                          <Eye className="w-3 h-3" />
                          View Departments ({univ.departments.length})
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 italic">None configured</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 pr-6 pl-2 text-right">
                      <div className="flex justify-end">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
                          <ShieldCheck className="w-3 h-3" /> Active
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {paginatedUniversities.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-150 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 rounded-b-xl">
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
              <span>per page</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-400 disabled:opacity-30 transition-colors"
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
                        : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-400 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300" style={{ fontFamily: appleFont }}>
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-2xl" />
            
            <div className="flex items-center gap-3 mt-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-50">Add University</h3>
                <p className="text-[12px] font-medium text-gray-500 dark:text-zinc-400">
                  Create admin credentials and whitelist an email domain.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUniversity} className="space-y-4">
              
              {/* University Name */}
              <div className="space-y-1.5">
                <label htmlFor="univ_name" className="text-[12px] font-bold text-gray-700 dark:text-zinc-300">
                  University Name
                </label>
                <input 
                  id="univ_name"
                  type="text"
                  placeholder="e.g. Université des Sciences et de la Technologie"
                  value={formData.university_name}
                  onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[13px] text-gray-900 dark:text-zinc-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Email Domain */}
                <div className="space-y-1.5">
                  <label htmlFor="domain" className="text-[12px] font-bold text-gray-700 dark:text-zinc-300">
                    Domain Whitelist
                  </label>
                  <input 
                    id="domain"
                    type="text"
                    placeholder="e.g. usthb.dz"
                    value={formData.email_domain}
                    onChange={(e) => setFormData({ ...formData, email_domain: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[13px] text-gray-900 dark:text-zinc-100 font-mono transition-all"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">Students must use @domain emails</p>
                </div>

                {/* Admin Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[12px] font-bold text-gray-700 dark:text-zinc-300">
                    Admin Email
                  </label>
                  <input 
                    id="email"
                    type="email"
                    placeholder="e.g. admin@usthb.dz"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[13px] text-gray-900 dark:text-zinc-100 transition-all"
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div className="space-y-1.5">
                <label htmlFor="pass" className="text-[12px] font-bold text-gray-700 dark:text-zinc-300">
                  Admin Password
                </label>
                <div className="relative">
                  <input 
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[13px] text-gray-900 dark:text-zinc-100 pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Departments */}
              <div className="space-y-1.5">
                <label htmlFor="depts" className="text-[12px] font-bold text-gray-700 dark:text-zinc-300">
                  Departments
                </label>
                <input 
                  id="depts"
                  type="text"
                  placeholder="e.g. Informatique, Mathématiques, Économie"
                  value={formData.departmentsText}
                  onChange={(e) => setFormData({ ...formData, departmentsText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[13px] text-gray-900 dark:text-zinc-100 transition-all"
                />
                <p className="text-[10px] text-gray-400 dark:text-zinc-500">Comma-separated. These become options during student registration.</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={adding} 
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...</>
                  ) : (
                    "Create University"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW DEPARTMENTS MODAL */}
      {showDepartmentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300" style={{ fontFamily: appleFont }}>
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-2xl" />
            
            <div className="flex items-center gap-3 mt-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-50">Departments</h3>
                <p className="text-[12px] font-medium text-gray-500 dark:text-zinc-400">
                  {selectedDepartments.length} configured departments.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {selectedDepartments.map((dept, index) => (
                <div key={index} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-[13px] font-medium text-gray-700 dark:text-zinc-300">{dept}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-gray-100 dark:border-zinc-800">
              <button 
                onClick={() => setShowDepartmentsModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold transition-colors shadow-sm shadow-blue-500/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
