import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/api/api";
import ProtectedRoute from "@/routes/ProtectedRoute";
import LoadingScreen from "@/components/ui/LoadingScreen";

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
        return <LoadingScreen text="Loading corporate workspace..." />;
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
