import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  Clock,
  GraduationCap,
  ChevronLeft,
  Share2,
  Heart,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/api/api';
import { ACCESS_TOKEN } from '@/constants';

export default function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/internships/${id}/`);

        const item = res.data;
        let skills = [];
        if (item.internship_skills) {
          try {
            skills = JSON.parse(item.internship_skills);
            if (!Array.isArray(skills)) skills = [skills];
          } catch (e) {
            skills = [item.internship_skills];
          }
        }

        const formatDuration = (durationStr) => {
          if (!durationStr) return "Flexible";
          // Handle Django timedelta format "D HH:MM:SS" or "HH:MM:SS"
          const parts = durationStr.split(' ');
          if (parts.length > 1) {
            const days = parts[0];
            return `${days} ${parseInt(days) === 1 ? 'day' : 'days'}`;
          }
          const timeParts = durationStr.split(':');
          if (timeParts.length >= 2) {
            const hours = parseInt(timeParts[0]);
            if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
            return `${parseInt(timeParts[1])} mins`;
          }
          return durationStr;
        };

        setInternship({
          ...item,
          company_name: item.company_name || `Company #${item.company}`,
          wilaya: item.wilaya || item.internship_location,
          required_skills: skills,
          banner_image: item.internship_image || null,
          internship_duration: formatDuration(item.internship_duration),
        });

        // Check if the student already applied to this internship
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
          try {
            const profileRes = await api.get('/auth/profile/');
            const role = profileRes.data.role;
            setUserRole(role);

            if (role === 'STUDENT') {
              const appsRes = await api.get("/applications/");
              const apps = appsRes.data?.results || appsRes.data || [];
              const alreadyApplied = apps.some(
                (app) => app.internship === parseInt(id)
              );
              if (alreadyApplied) setApplied(true);
            }
          } catch (e) {
            // Silently ignore — user might be unauthenticated
          }
        }
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("Could not find this internship opportunity.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleApply = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setIsApplying(true);
      await api.post(`/applications/apply/${id}/`);
      setApplied(true);
    } catch (err) {
      console.error("Error applying:", err);
      const msg = err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Failed to submit application. You might have already applied.";
      alert(msg);
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your application?")) return;

    try {
      setIsApplying(true);
      await api.delete(`/applications/cancel/${id}/`);
      setApplied(false);
    } catch (err) {
      console.error("Error cancelling:", err);
      alert("Failed to cancel application.");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-24 px-4 max-w-4xl flex flex-col items-center text-center">
        <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-bold text-slate-800 dark:text-slate-200 animate-pulse">Gathering internship info...</p>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="container mx-auto py-24 px-4 max-w-4xl text-center">
        <div className="bg-destructive/10 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Not Found</h2>
        <p className="text-muted-foreground mb-10 max-w-md mx-auto">{error}</p>
        <Button onClick={() => navigate(-1)} size="lg" className="rounded-2xl px-8">
          <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      {/* Top Simple Nav */}
      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/50">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary transition-all group"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="group-hover:underline underline-offset-4">Go Back</span>
          </button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-xl transition-all duration-300 hover:bg-transparent ${isLiked ? 'text-destructive' : 'hover:text-destructive'}`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-6 w-6 ${isLiked ? 'fill-destructive text-destructive' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl hover:text-primary hover:bg-transparent transition-all duration-300"
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 max-w-6xl pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Header Card */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl overflow-hidden border">
              {/* Larger Banner */}
              <div className="h-64 sm:h-96 w-full relative bg-white dark:bg-slate-950 flex items-center justify-center border-b">
                {internship.banner_image ? (
                  <img src={internship.banner_image} className="w-full h-full object-contain" alt="Banner" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                    <Briefcase className="h-20 w-20" />
                  </div>
                )}
              </div>

              {/* Header Details */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[10px] px-3 py-1">
                    {internship.internship_type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="font-bold uppercase tracking-wider text-[10px] px-3 py-1">
                    {internship.internship_structure.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                    {internship.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-slate-600 dark:text-slate-400 font-semibold">
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group/company"
                      onClick={() => navigate(`/companies/${internship.company}`)}
                    >
                      <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border flex items-center justify-center group-hover/company:border-primary/30 transition-colors">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="group-hover/company:underline underline-offset-4">{internship.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      {internship.wilaya}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      {internship.internship_duration}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Opportunity Overview
                </h2>
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg space-y-4">
                  {internship.description.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>

              <section className="pt-8 border-t">
                <h2 className="text-xl font-bold mb-6">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {internship.required_skills.map(skill => (
                    <Badge
                      key={skill}
                      className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-none px-6 py-3 rounded-2xl text-base font-bold"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border shadow-sm">
              <h3 className="text-lg font-bold mb-8">Key Details</h3>
              <div className="space-y-6">
                <SidebarItem icon={Calendar} label="Starts on" value={internship.offer_start_date} />
                <SidebarItem icon={Calendar} label="Ends on" value={internship.offer_end_date} />
                <SidebarItem icon={Clock} label="Duration" value={internship.internship_duration || "Flexible"} />
                <SidebarItem icon={Users} label="Open Positions" value={`${internship.number_of_places} Interns`} />
                <SidebarItem icon={MapPin} label="Work Mode" value={internship.internship_location} />
              </div>

              <div className="mt-10 pt-8 border-t">
                {userRole === 'COMPANY' || userRole === 'ADMIN' ? null : applied ? (
                  <div className="flex flex-col gap-3">
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-2xl p-6 text-center">
                      <p className="font-bold text-green-800 dark:text-green-400 text-sm">Application Received</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                      onClick={handleCancel}
                      disabled={isApplying}
                    >
                      {isApplying ? "Wait..." : "Cancel Application"}
                    </Button>
                  </div>
                ) : internship.status !== 'OPEN_FOR_APPLICATION' || new Date(internship.offer_end_date) < new Date() ? (
                  <Button
                    className="w-full h-10 text-base font-bold rounded-xl cursor-not-allowed bg-red-200 text-white shadow-none hover:bg-red-300 disabled:opacity-100 disabled:pointer-events-auto"
                    disabled
                  >
                    Closed
                  </Button>
                ) : (
                  <Button
                    className="w-full h-10 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                    onClick={handleApply}
                    disabled={isApplying}
                  >
                    {isApplying ? "Sending..." : "Apply Now"}
                    {!isApplying && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-900 border flex items-center justify-center text-slate-500 shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{label}</p>
        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}
