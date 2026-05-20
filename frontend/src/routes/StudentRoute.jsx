import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/api/api";
import ProtectedRoute from "@/routes/ProtectedRoute";
import LoadingScreen from "@/components/ui/LoadingScreen";

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
    return <LoadingScreen text="Loading student workspace..." />;
  }

  if (isStudent) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  return <Navigate to="/" />;
}

export default StudentRoute;
