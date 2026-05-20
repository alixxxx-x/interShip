import { useEffect, useState } from "react";
import { 
  GraduationCap, 
  PlusCircle, 
  Search, 
  Loader2, 
  Trash2,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function AdminDepartments() {
  const toast = useToast();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Create State
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-univ/departments/");
      const data = res.data.results || res.data;
      setDepartments(data || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      toast.error("Failed to load university departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, entriesPerPage]);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      toast.error("Department name cannot be empty.");
      return;
    }

    setAdding(true);
    try {
      await api.post("/admin-univ/departments/", { name: newDeptName.trim() });
      toast.success(`Successfully created department: ${newDeptName}`);
      setNewDeptName("");
      setShowAddModal(false);
      fetchDepartments();
    } catch (error) {
      console.error("Failed to add department:", error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const msg = typeof errorData === "string" 
          ? errorData 
          : Object.values(errorData).flat().join(" ");
        toast.error(msg || "Failed to create department.");
      } else {
        toast.error("Server connection error during department creation.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteDepartment = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the department: "${name}"?`)) return;
    try {
      await api.delete(`/admin-univ/departments/${id}/`);
      toast.success(`Successfully deleted department: ${name}`);
      fetchDepartments();
    } catch (error) {
      console.error("Failed to delete department:", error);
      toast.error("Failed to delete department. It may have associated students or administrators.");
    }
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDepartments.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedDepartments = filteredDepartments.slice(startIndex, startIndex + entriesPerPage);

  const universityName = departments[0]?.university_name || "Your University";

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
            Departments Registry
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 select-none">
              {departments.length} Total
            </span>
          </h1>
          <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1 max-w-xl">
            Manage academic departments for {universityName}. These departments define choices available to students and administrators.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
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
            Add Department
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-visible">
        {paginatedDepartments.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 dark:bg-zinc-900/50 rounded-xl">
            <span className="text-gray-400 dark:text-zinc-600">
              <GraduationCap className="w-10 h-10 stroke-[1.5]" />
            </span>
            <span className="text-[13px] font-medium text-gray-500 dark:text-zinc-400">No departments found.</span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500">
              Add a new department to get started.
            </span>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[280px] rounded-tl-xl">Department Name</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[200px]">Institution</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[160px] text-center">Students</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDepartments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/40 dark:hover:bg-zinc-900/35 transition-colors duration-150 group"
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/30 shadow-sm shrink-0">
                          <GraduationCap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[13px] font-bold text-gray-900 dark:text-zinc-100 truncate">{dept.name}</span>
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">ID: {dept.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600 dark:text-zinc-300 truncate">
                        <Building2 className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                        {dept.university_name}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
                          <Users className="w-3.5 h-3.5" />
                          {dept.student_count ?? 0}
                        </div>
                        <button
                          onClick={() => navigate(`/adminunivdashboard/users?role=STUDENT&department=${dept.id}`)}
                          className="ml-1 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-gray-200 dark:border-zinc-700"
                        >
                          View
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 transition-colors border border-transparent"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {paginatedDepartments.length > 0 && (
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
        )}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300" style={{ fontFamily: appleFont }}>
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-2xl" />
            
            <div className="flex items-center gap-3 mt-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-50">Add Department</h3>
                <p className="text-[12px] font-medium text-gray-500 dark:text-zinc-400">
                  Create a new department under {universityName}.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="dept_name" className="text-[12px] font-bold text-gray-700 dark:text-zinc-300">
                  Department Name
                </label>
                <input 
                  id="dept_name"
                  type="text"
                  placeholder="e.g. Informatique, Génie Civil"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[13px] text-gray-900 dark:text-zinc-100 transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    setNewDeptName("");
                  }}
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
                    "Create Department"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
