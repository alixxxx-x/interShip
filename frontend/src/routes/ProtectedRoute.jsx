import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { REFRESH_TOKEN } from "@/constants";

function isTokenExpired(token) {
    if (!token) return true;
    try {
        const decoded = jwtDecode(token);
        if (!decoded || !decoded.exp) return true;
        return decoded.exp < Date.now() / 1000;
    } catch {
        return true;
    }
}

function ProtectedRoute({ children }) {
    const refresh = localStorage.getItem(REFRESH_TOKEN);

    if (isTokenExpired(refresh)) {
        localStorage.clear();
        return <Navigate to="/login" />
    } else {
        return children;
    }
}

export default ProtectedRoute;