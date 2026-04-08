import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import AdminPanel from "@/pages/AdminPanel";
import AboutUs from "@/pages/AboutUs";
import Profile from "@/pages/Profile";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="intership-theme">
      <div className="flex flex-col min-h-screen bg-background text-foreground tracking-tight">
        <Navbar />
        {/* Spacer for fixed navbar */}
        <div className="h-16"></div>
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
            <Route path="/logout" element={<Logout />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

export default App;
