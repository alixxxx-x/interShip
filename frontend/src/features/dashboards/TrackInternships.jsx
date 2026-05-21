import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { DownloadCloud } from "lucide-react";

export default function TrackInternships() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/applications/");
        const data = Array.isArray(res.data) ? res.data : [];
        
        // Filter only validated or completed internships
        const trackingList = data.filter((app) => {
          const statusRaw = String(app.status || "").trim().toUpperCase();
          return app.is_validated_by_admin || statusRaw === "VALIDATED" || statusRaw === "COMPLETE";
        });
        
        setApplications(trackingList);
      } catch (e) {
        console.error("Failed to load applications:", e);
        setError("Failed to load your internships.");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getBadgeStyle = (status, internshipStatus) => {
    const raw = String(status || "").trim().toUpperCase();
    const internshipRaw = String(internshipStatus || "").trim().toUpperCase();
    if (raw === "PENDING") {
      return {
        bg: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
        dot: "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]",
        label: "Pending",
      };
    }
    if (raw === "COMPLETE") {
      return {
        bg: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
        dot: "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]",
        label: "Completed",
      };
    }
    if (raw === "VALIDATED" && internshipRaw === "FINISHED") {
      return {
        bg: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        dot: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]",
        label: "Finished",
      };
    }
    if (raw === "VALIDATED") {
      return {
        bg: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        dot: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]",
        label: "Validated",
      };
    }
    return {
      bg: "bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400",
      dot: "bg-gray-500 shadow-[0_0_6px_rgba(107,114,128,0.8)]",
      label: status || "Unknown",
    };
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
            Track Internships
            {applications.length > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 select-none">
                {applications.length}
              </span>
            )}
          </h1>
          <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1">
            Track your ongoing and completed internships.
          </p>
        </div>
      </div>

      {/* Internships Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-[10px] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        {error ? (
          <div className="p-6 text-sm text-red-500 text-center font-medium bg-red-50/50 dark:bg-red-500/10">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 dark:bg-zinc-900/50">
            <span className="text-gray-400 dark:text-zinc-600">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </span>
            <span className="text-[13px] font-medium text-gray-500 dark:text-zinc-400">
              You don't have any ongoing or completed internships yet.
            </span>
          </div>
        ) : (
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="bg-blue-50 dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800">
                <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6">Internship Name</th>
                <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-center">Status</th>
                <th className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 py-3.5 px-6 text-right w-32">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => {
                const offer =
                  application.offer ||
                  application.offer_title ||
                  application.internship_title ||
                  (application.internship ? `Internship #${application.internship}` : "-");

                const isCompleted = String(application.status || "").trim().toUpperCase() === "COMPLETE";
                const isFinished = String(application.internship_status || "").trim().toUpperCase() === "FINISHED";
                const offerId = application.internship;
                const style = getBadgeStyle(application.status, application.internship_status);

                return (
                  <tr 
                    key={application.id} 
                    className="transition-colors duration-150 border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/40 dark:hover:bg-zinc-900/35"
                  >
                    <td className="py-4 px-6 text-left">
                      {offerId ? (
                        <button
                          className="text-[13px] font-semibold text-gray-900 dark:text-zinc-100 truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer text-left"
                          onClick={() => navigate(`/internships/${offerId}`)}
                        >
                          {offer}
                        </button>
                      ) : (
                        <span className="text-[13px] font-semibold text-gray-900 dark:text-zinc-100 truncate">
                          {offer}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {(isCompleted || isFinished) && application.is_validated_by_admin ? (
                        <button
                          onClick={async () => {
                            try {
                              const res = await api.get(`/admin/applications/${application.id}/certificate/`, {
                                responseType: "blob",
                              });
                              const url = window.URL.createObjectURL(new Blob([res.data]));
                              const link = document.createElement("a");
                              link.href = url;
                              link.setAttribute("download", `Certificate_${application.id}.pdf`);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              window.URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error("Failed to download certificate:", err);
                            }
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wide rounded-[6px] bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 border border-blue-200/50 dark:border-blue-800/30 transition-all duration-200"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                          Download
                        </button>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wide rounded-[6px] bg-gray-50 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-500 border border-gray-200/50 dark:border-zinc-700/50 cursor-not-allowed transition-all duration-200 opacity-60"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                          Pending
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
