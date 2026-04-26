import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/api/api";
import ProtectedRoute from "@/routes/ProtectedRoute";

function StudentRoute({ children }) {
  const [isStudent, setIsStudent] = useState(null);

  useEffect(() => {
    api
      .get("/auth/profile/")
      .then((res) => {
        setIsStudent(res.data.role === "STUDENT");
      })
      .catch(() => {
        setIsStudent(false);
      });
  }, []);

  if (isStudent === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isStudent) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  return <Navigate to="/" />;
}

export default StudentRoute;
