import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "@/api/api";

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
        else if (role === "ADMIN") setTarget("/admin");
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
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Navigate to={target} replace />;
}
