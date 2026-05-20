import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, 
  PlusCircle, 
  Search, 
  Loader2, 
  Trash2,
  Building2,
  Award,
  Users
} from "lucide-react";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";
import { useNavigate } from "react-router-dom";

export default function AdminDepartments() {
  const toast = useToast();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Create State
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

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

  const universityName = departments[0]?.university_name || "Your University";

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent">
            Departments Registry
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Manage academic departments for {universityName}. These departments define choices available to students and administrators.
          </p>
        </div>
        
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="rounded-xl font-bold bg-primary hover:bg-primary/90 flex items-center gap-2 shadow-md"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Department</span>
        </Button>
      </div>

      {/* Main card database view */}
      <Card className="border border-border/60 shadow-lg bg-card/45 backdrop-blur-md overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 bg-gradient-to-b from-muted/20 to-transparent border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Active Departments
              </CardTitle>
              <CardDescription className="text-xs">
                List of academic departments configured for students and staff.
              </CardDescription>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
              <Input 
                placeholder="Search departments by name..." 
                className="pl-9 bg-background/50 border border-border/80 focus:border-primary rounded-xl text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground font-medium">Loading departments...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold text-xs uppercase pl-6">Department Name</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Institution</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-center">Students</TableHead>
                    <TableHead className="font-bold text-xs uppercase text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <GraduationCap className="w-9 h-9 text-muted-foreground/30" />
                          <span className="text-sm font-semibold">No departments found</span>
                          <span className="text-xs text-muted-foreground/60">Add a new department to get started.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <TableRow key={dept.id} className="hover:bg-muted/10 transition-colors">
                        
                        {/* Department Name */}
                        <TableCell className="font-bold py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-sm">
                              <GraduationCap className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm text-foreground font-bold tracking-tight">{dept.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">Department ID: {dept.id}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Institution Name */}
                        <TableCell className="py-4 font-semibold text-sm text-muted-foreground">
                          {dept.university_name}
                        </TableCell>

                        {/* Students */}
                        <TableCell className="py-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <span className="text-sm font-bold text-foreground flex items-center gap-1">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              {dept.student_count ?? 0} {dept.student_count === 1 ? 'Student' : 'Students'}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl font-bold text-xs text-primary border-primary/20 hover:bg-primary/5 px-3 h-7 shadow-sm transition-all"
                              onClick={() => navigate(`/adminunivdashboard/users?role=STUDENT&department=${dept.id}`)}
                            >
                              Show
                            </Button>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-4 text-right pr-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-xl font-bold gap-1"
                            onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </TableCell>

                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Top decorative glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="flex items-center gap-3 mt-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                  Add New Department
                </h3>
                <p className="text-muted-foreground text-xs">
                  Create a new department under {universityName}.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4">
              
              {/* Department Name */}
              <div className="space-y-1.5">
                <Label htmlFor="dept_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department Name</Label>
                <Input 
                  id="dept_name"
                  placeholder="e.g. Informatique, Génie des Procédés"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  required
                  className="rounded-xl border border-border/80 bg-background/50 focus:border-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="rounded-xl"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewDeptName("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={adding} 
                  className="rounded-xl bg-primary hover:bg-primary/90 font-bold px-5"
                >
                  {adding ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                    </span>
                  ) : (
                    "Create Department"
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
