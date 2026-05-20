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
  MapPin, 
  Mail, 
  ShieldCheck, 
  Activity, 
  Loader2, 
  Eye, 
  EyeOff,
  Trash2,
  FolderOpen
} from "lucide-react";
import api from "@/api/api";
import axios from "axios";
import { useToast } from "@/components/ui/custom-toast";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function SuperAdminUniversities() {
  const toast = useToast();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Create Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // New University Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    university_name: "",
    email_domain: "",
    departmentsText: "" // Comma separated departments
  });

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      // Fetch users with role ADMIN_UNIV to get the list of universities
      const res = await api.get("/users/?role=ADMIN_UNIV");
      const data = res.data.results || res.data;
      
      // Filter out any entries that don't have a university_name
      const univList = data.filter(u => u.university_name);
      setUniversities(univList);
    } catch (error) {
      console.error("Failed to fetch universities:", error);
      toast.error("Failed to load secure university register.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleCreateUniversity = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.university_name || !formData.email_domain) {
      toast.error("Please fill in all required registration fields.");
      return;
    }

    setAdding(true);
    try {
      // Parse departments
      const departments = formData.departmentsText
        ? formData.departmentsText.split(",").map(d => d.trim()).filter(Boolean)
        : ["Informatique", "Mathématiques", "Économie"]; // Default fallbacks

      const payload = {
        email: formData.email,
        password: formData.password,
        role: "ADMIN_UNIV",
        university_name: formData.university_name,
        email_domain: formData.email_domain,
        departments: departments
      };

      await api.post("/auth/register/", payload);
      toast.success(`Successfully whitelisted ${formData.university_name}!`);
      
      // Reset form
      setFormData({
        email: "",
        password: "",
        university_name: "",
        email_domain: "",
        departmentsText: ""
      });
      setShowAddModal(false);
      
      // Refresh list
      fetchUniversities();
    } catch (error) {
      console.error("Failed to add university:", error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const msg = typeof errorData === "string" 
          ? errorData 
          : Object.values(errorData).flat().join(" ");
        toast.error(msg || "Failed to register university domain.");
      } else {
        toast.error("Server connection error during university domain creation.");
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

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent">
            University Registry Control
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Configure whitelisted institutional email domains, authorize university-level administrator credentials, and set departments.
          </p>
        </div>
        
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="rounded-xl font-bold bg-primary hover:bg-primary/90 flex items-center gap-2 shadow-md"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Whitelist University</span>
        </Button>
      </div>

      {/* Main card database view */}
      <Card className="border border-border/60 shadow-lg bg-card/45 backdrop-blur-md overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 bg-gradient-to-b from-muted/20 to-transparent border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Whitelisted Academic Domains
              </CardTitle>
              <CardDescription className="text-xs">
                List of registered university domains. Students from these universities must use matching institutional emails.
              </CardDescription>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
              <Input 
                placeholder="Search universities by name or domain..." 
                className="pl-9 bg-background/50 border border-border/80 focus:border-primary rounded-xl text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
              <LoadingScreen fullScreen={false} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold text-xs uppercase">Institution Name</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Secured Email Domain</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Primary Administrator</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Configured Departments</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Integrity Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUniversities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <GraduationCap className="w-9 h-9 text-muted-foreground/30" />
                          <span className="text-sm font-semibold">No whitelisted universities found</span>
                          <span className="text-xs text-muted-foreground/60">Try adjusting your search filters or whitelist a new institution.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUniversities.map((univ) => (
                      <TableRow key={univ.id} className="hover:bg-muted/10 transition-colors">
                        
                        {/* University Name */}
                        <TableCell className="font-bold py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-sm">
                              <GraduationCap className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm text-foreground font-bold tracking-tight">{univ.university_name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">System ID: {univ.id}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Whitelist Domain */}
                        <TableCell className="py-4 font-mono font-bold text-xs">
                          <Badge variant="secondary" className="bg-muted/80 text-foreground border border-border/80 px-2 rounded-lg font-bold">
                            {univ.email_domain || "@univ.dz"}
                          </Badge>
                        </TableCell>

                        {/* Admin Email */}
                        <TableCell className="py-4 text-xs font-semibold text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-primary/70" />
                            {univ.email}
                          </div>
                        </TableCell>

                        {/* Departments */}
                        <TableCell className="py-4 max-w-[280px]">
                          <div className="flex flex-wrap gap-1">
                            {univ.departments && univ.departments.length > 0 ? (
                              univ.departments.map((dept, index) => (
                                <Badge key={index} variant="outline" className="text-[9px] px-1.5 py-0 border-primary/20 text-primary rounded bg-primary/5 font-bold">
                                  {dept}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">None configured</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Integrity Status */}
                        <TableCell className="py-4">
                          <Badge variant="success" className="px-2.5 py-0.5 rounded-full font-bold bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3 h-3" /> Whitelisted
                          </Badge>
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
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Top decorative glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="flex items-center gap-3 mt-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                  Whitelist a New University
                </h3>
                <p className="text-muted-foreground text-xs">
                  Create administrative credentials and bind whitelist email domain suffix constraints.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUniversity} className="space-y-4">
              
              {/* Univ Name */}
              <div className="space-y-1.5">
                <Label htmlFor="univ_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">University Name</Label>
                <Input 
                  id="univ_name"
                  placeholder="e.g. Université des Sciences et de la Technologie d'Alger (USTHB)"
                  value={formData.university_name}
                  onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
                  required
                  className="rounded-xl border border-border/80 bg-background/50 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Email Suffix Whitelist */}
                <div className="space-y-1.5">
                  <Label htmlFor="domain" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Domain Whitelist</Label>
                  <Input 
                    id="domain"
                    placeholder="e.g. usthb.dz"
                    value={formData.email_domain}
                    onChange={(e) => setFormData({ ...formData, email_domain: e.target.value })}
                    required
                    className="rounded-xl border border-border/80 bg-background/50 focus:border-primary font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground italic">Suffix checking: @domain</p>
                </div>

                {/* Admin Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Login Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="e.g. admin@usthb.dz"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-xl border border-border/80 bg-background/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div className="space-y-1.5">
                <Label htmlFor="pass" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Password</Label>
                <div className="relative">
                  <Input 
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="rounded-xl border border-border/80 bg-background/50 focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Departments (Comma separated list) */}
              <div className="space-y-1.5">
                <Label htmlFor="depts" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configured Departments</Label>
                <Input 
                  id="depts"
                  placeholder="e.g. Informatique, Mathématiques, Économie, Génie Civil"
                  value={formData.departmentsText}
                  onChange={(e) => setFormData({ ...formData, departmentsText: e.target.value })}
                  className="rounded-xl border border-border/80 bg-background/50 focus:border-primary text-xs"
                />
                <p className="text-[10px] text-muted-foreground">Separated by comma. These will be added as options during student register.</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="rounded-xl"
                  onClick={() => setShowAddModal(false)}
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
                      <Loader2 className="w-4 h-4 animate-spin" /> Whitelisting...
                    </span>
                  ) : (
                    "Authorize & Deploy"
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
