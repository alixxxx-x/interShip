import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import ProtectedRoute from "./ProtectedRoute";

function AdminRoute({ children }) {
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        api.get("/me") //tretoutni user info
            .then(res => {
                if (res.data.role === "admin") {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            })
            .catch(() => {
                setIsAdmin(false);
            }
            );
    }, []);

    if (isAdmin === null) {
        return <div>checking...</div>
    }

    if (isAdmin === true) {
        return children;
    } else {
        return <Navigate to="/login" />;
    }
}

export default AdminRoute;