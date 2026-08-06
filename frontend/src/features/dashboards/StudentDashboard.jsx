import { useEffect, useState } from "react";
import { 
  Sigma, 
  CheckCheck, 
  ClockFading, 
  Plus,
  Briefcase,
  ChevronRight,
  FileText,
  Building2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import CreateCvModal from "./CreateCvModal";
import { useSearchParams } from "react-router-dom";
import api from "@/api/api";
import LoadingScreen from "@/components/ui/LoadingScreen"; 
import { useLanguage } from "@/components/language-provider";

export default function StudentDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cvModalMode, setCvModalMode] = useState("create");
  const [cvForModal, setCvForModal] = useState(null);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const isModalOpen = searchParams.get("newOffer") === "true";
  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const openModal = async () => {
    try {
      const res = await api.get("/cv/");
      setCvModalMode("edit");
      setCvForModal(res.data);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404) {
        setCvModalMode("create");
        setCvForModal(null);
      } else {
        console.error("Failed to check existing CV:", e);
        setCvModalMode("create");
        setCvForModal(null);
      }
    } finally {
      setSearchParams({ newOffer: "true" });
    }
  };
  const closeModal = () => setSearchParams({});

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/student/dashboard/");
      const nextStats = res?.data?.stats ?? null;
      const nextApps = Array.isArray(res?.data?.applications) ? res.data.applications : [];

      setStats(nextStats);
      setApplications(nextApps);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setError("Failed to load dashboard data.");
      setStats(null);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
        <LoadingScreen fullScreen={false} />
      </div>
    );
  }

  const statCards = [
    {
      title: t("pendingApplications"),
      value: stats?.pendingAplications || 0,
      icon: ClockFading,
      description: t("pendingAppsDesc"),
      iconColor: "text-purple-500"
    },
    {
      title: t("acceptedApplications"),
      value: stats?.acceptedApplications?.toLocaleString() || "0",
      icon: CheckCheck,
      description: t("acceptedAppsDesc"),
      iconColor: "text-emerald-500"
    },
    {
      title: t("totalApplications"),
      value: stats?.totalApplications || 0,
      icon: Sigma,
      description: t("activePositions"),
      iconColor: "text-blue-500"
    },
    {
      title: t("profileCompletion"),
      value: `${stats?.profileCompletion ?? 0}%`,
      icon: FileText,
      description: t("basedOnCv"),
      iconColor: "text-amber-500"
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30";
      case "Accepted":
      case "Completed":
      case "Validated":
        return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30";
      case "Rejected":
      case "Cancelled":
        return "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30";
      default:
        return "bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700";
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "Pending":
        return t("statusPending");
      case "Accepted":
        return t("statusAccepted");
      case "Completed":
        return t("statusCompleted");
      case "Validated":
        return t("statusValidated");
      case "Rejected":
        return t("statusRejected");
      case "Cancelled":
        return t("statusCancelled");
      default:
        return status;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background h-full animate-in fade-in duration-500" style={{ fontFamily: appleFont }}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
            {t("navDashboard")}
          </h1>
          <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1 max-w-xl">
            {t("dashboardDesc")}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={openModal} 
            className="flex items-center justify-center w-full sm:w-auto gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t("createCv")}
          </button>
        </div>
        
        {/* Create CV Modal */}
        <CreateCvModal 
          open={isModalOpen} 
          onOpenChange={closeModal}
          mode={cvModalMode}
          initialCv={cvForModal}
          onCvCreated={() => {
              fetchDashboardData(); 
          }} 
        />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 md:p-5 flex flex-col justify-between h-full">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.iconColor} flex-shrink-0`} />
                  <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate leading-tight">
                    {stat.title}
                  </span>
                </div>
                <div className="flex flex-col mt-3 sm:mt-4">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                    {String(stat.value).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-1.5">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Applications Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-visible">
        <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-zinc-50 tracking-tight">{t("recentApplications")}</h3>
            <p className="text-[11px] font-medium text-gray-500 dark:text-zinc-400">{t("recentAppsDesc")}</p>
          </div>
          <button 
            onClick={() => navigate("/studentdashboard/MyApplications")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-gray-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800/30"
          >
            {t("viewAll")} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {error ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 dark:bg-zinc-900/50 rounded-b-xl">
            <span className="text-gray-400 dark:text-zinc-600">
              <FileText className="w-10 h-10 stroke-[1.5]" />
            </span>
            <span className="text-[13px] font-medium text-gray-500 dark:text-zinc-400">{t("noApplicationsFound")}</span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500">
              {t("startApplyingMsg")}
            </span>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[40%]">{t("offer")}</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-4 w-[20%]">{t("companyLabel")}</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-4 w-[20%] text-center">{t("status")}</th>
                  <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 w-[20%] text-center">{t("appliedDate")}</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/40 dark:hover:bg-zinc-900/35 transition-colors duration-150 group"
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/30 shadow-sm shrink-0">
                          <Briefcase className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          {application.internship ? (
                            <button
                              className="text-[13px] font-bold text-gray-900 dark:text-zinc-100 truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                              onClick={() => navigate(`/internships/${application.internship}`)}
                            >
                              {application.offer}
                            </button>
                          ) : (
                            <span className="text-[13px] font-bold text-gray-900 dark:text-zinc-100 truncate">{application.offer}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-zinc-700">
                          <Building2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="text-[12px] font-medium text-gray-700 dark:text-zinc-200 truncate max-w-[120px]">
                          {application.companyName || application.company || t("corporatePartner")}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(application.status)}`}>
                          {translateStatus(application.status)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-6 text-center">
                      <span className="text-[12px] font-medium text-gray-600 dark:text-zinc-300">
                        {application.appliedDate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
