import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/api/api";
import ProtectedRoute from "@/routes/ProtectedRoute";

function CompanyRoute({ children }) {
    const [isCompany, setIsCompany] = useState(null);

    useEffect(() => {
        api.get("/auth/profile/")
            .then(res => {
                if (res.data.role === "COMPANY") {
                    setIsCompany(true);
                } else {
                    setIsCompany(false);
                }
            })
            .catch(() => {
                setIsCompany(false);
            });
    }, []);

    if (isCompany === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isCompany === true) {
        return (
            <ProtectedRoute>
                {children}
            </ProtectedRoute>
        );
    } else {
        return <Navigate to="/" />; // Redirect unauthorized users to home instead of login (if they are logged in but just wrong role)
    }
}

export default CompanyRoute;
