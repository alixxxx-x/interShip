import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "@/api/api";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function DashboardRedirect() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/auth/profile/")
      .then((res) => {
        if (cancelled) return;

        const role = res.data.role;
        if (role === "COMPANY") setTarget("/companydashboard");
        else if (role === "STUDENT") setTarget("/studentdashboard");
        else if (role === "ADMIN_DEPT") setTarget("/admindashboard");
        else if (role === "ADMIN_UNIV") setTarget("/adminunivdashboard");
        else if (role === "ADMIN") setTarget("/superadmindashboard");
        else setTarget("/");
      })
      .catch(() => {
        if (cancelled) return;
        setTarget("/login");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!target) {
    return <LoadingScreen text="Redirecting to your workspace..." />;
  }

  return <Navigate to={target} replace />;
}
