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
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CompanyDashboard from "@/features/dashboards/CompanyDashboard";
import CompanyAnalytics from "@/features/dashboards/CompanyAnalytics";
import CompanyListings from "@/features/dashboards/CompanyListings";
import CreateOfferPage from "@/features/dashboards/CreateOfferPage";
import AllApplications from "@/features/dashboards/AllApplications";
import StudentDashboard from "@/features/dashboards/StudentDashboard";
import MyApplications from "@/features/dashboards/MyApplications";
import TrackInternships from "@/features/dashboards/TrackInternships";
import StudentRoute from "@/routes/StudentRoute";
import DashboardRedirect from "@/routes/DashboardRedirect";
import MyCv from "@/features/dashboards/MyCv";
import AdminDeptDashboard from "@/features/dashboards/AdminDeptDashboard";
import AdminUnivDashboard from "@/features/dashboards/AdminUnivDashboard";
import AdminDepartments from "@/features/dashboards/AdminDepartments";
import SuperAdminDashboard from "@/features/dashboards/SuperAdminDashboard";
import SuperAdminUniversities from "@/features/dashboards/SuperAdminUniversities";
import AdminUsers from "@/features/dashboards/AdminUsers";
import AdminCompanies from "@/features/dashboards/AdminCompanies";
import AdminValidations from "@/features/dashboards/AdminValidations";
import AdminAnalytics from "@/features/dashboards/AdminAnalytics";
import CompanyTrackInternships from "@/features/dashboards/CompanyTrackInternships";
import AdminMessages from "@/features/dashboards/AdminMessages";
import Notifications from "@/features/dashboards/Notifications";
import Settings from "@/pages/Settings";

import CompanyMessages from "@/features/dashboards/CompanyMessages";
import StudentMessages from "@/features/dashboards/StudentMessages";
import FloatingChatbot from "@/components/FloatingChatbot";

import { LanguageProvider } from "@/components/language-provider";
import { ToastProvider } from "@/components/ui/custom-toast";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="intership-theme">
      <LanguageProvider>
      <ToastProvider>
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
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
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
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth Pages (No Navbar/Footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />

          {/* Auth & Standalone Pages */}
          <Route
            path="/admindashboard"
            element={
              <AdminRoute>
                <DashboardLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDeptDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="validations" element={<AdminValidations />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route
            path="/adminunivdashboard"
            element={
              <AdminRoute>
                <DashboardLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminUnivDashboard />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route
            path="/superadmindashboard"
            element={
              <AdminRoute>
                <DashboardLayout />
              </AdminRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="universities" element={<SuperAdminUniversities />} />
            <Route path="validations" element={<AdminValidations />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

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
            <Route path="/companydashboard/analytics" element={<CompanyAnalytics />} />
            <Route path="/companydashboard/new-offer" element={<CreateOfferPage />} />
            <Route path="/companydashboard/listings" element={<CompanyListings />} />
            <Route path="/companydashboard/applications" element={<AllApplications />} />
            <Route path="/companydashboard/TrackInternships" element={<CompanyTrackInternships />} />
            <Route path="/companydashboard/messages" element={<CompanyMessages />} />
            <Route path="/companydashboard/notifications" element={<Notifications />} />
          </Route>

          {/* Student Dashboard Layout */}
          <Route element={<StudentRoute><DashboardLayout /></StudentRoute>}>
            <Route path="/studentdashboard" element={<StudentDashboard />} />
            <Route path="/studentdashboard/cv" element={<MyCv />} />
            <Route path="/studentdashboard/MyApplications" element={<MyApplications />} />
            <Route path="/studentdashboard/TrackInternships" element={<TrackInternships />} />
            <Route path="/studentdashboard/messages" element={<StudentMessages />} />
            <Route path="/studentdashboard/notifications" element={<Notifications />} />
          </Route>
        </Routes>
        <FloatingChatbot />
      </TooltipProvider>
      </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

export default App;
