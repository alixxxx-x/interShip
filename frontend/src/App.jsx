import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import MainLayout from "@/components/layout/MainLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";
import CompanyRoute from "@/routes/CompanyRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import ContactUs from "@/pages/ContactUs";
import AdminPanel from "@/pages/AdminPanel";
import AboutUs from "@/pages/AboutUs";
import Internships from "@/pages/Internships";
import Companies from "@/pages/Companies";
import CompaniesDetails from "@/pages/CompaniesDetails";
import Profile from "@/pages/Profile";
import InternshipDetails from "@/pages/InternshipDetails";
import StudentGuidelines from "@/pages/StudentGuidelines";
import FAQ from "@/pages/FAQ";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CompanyDashboard from "@/features/dashboards/CompanyDashboard";
import CompanyListings from "@/features/dashboards/CompanyListings";
import AllApplications from "@/features/dashboards/AllApplications";
import StudentDashboard from "@/features/dashboards/StudentDashboard";
import MyApplications from "@/features/dashboards/MyApplications";
import StudentRoute from "@/routes/StudentRoute";
import DashboardRedirect from "@/routes/DashboardRedirect";
import MyCv from "@/features/dashboards/MyCv";
import Notifications from "@/features/dashboards/Notifications";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="intership-theme">
      <TooltipProvider>
        <ScrollToTop />
        <Routes>
          {/* Main Layout Pages */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/internships/:id" element={<InternshipDetails />} />
            <Route path="/guidelines" element={<StudentGuidelines />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompaniesDetails />} />
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
          </Route>

          {/* Auth & Standalone Pages */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/" />} />

          {/* Company Dashboard Layout */}
          <Route element={<CompanyRoute><DashboardLayout /></CompanyRoute>}>
            <Route path="/companydashboard" element={<CompanyDashboard />} />
            <Route path="/companydashboard/listings" element={<CompanyListings />} />
            <Route path="/companydashboard/applications" element={<AllApplications />} />
            <Route path="/companydashboard/notifications" element={<Notifications />} />
          </Route>

          {/* Student Dashboard Layout */}
          <Route element={<StudentRoute><DashboardLayout /></StudentRoute>}>
            <Route path="/studentdashboard" element={<StudentDashboard />} />
            <Route path="/studentdashboard/cv" element={<MyCv />} />
            <Route path="/studentdashboard/MyApplications" element={<MyApplications />} />
            <Route path="/studentdashboard/notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </ThemeProvider>
  );
}

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

export default App;
