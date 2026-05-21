import { useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Claims from "./pages/Claims.jsx";
import CustomerLogin from "./pages/CustomerLogin.jsx";
import CustomerPortal from "./pages/CustomerPortal.jsx";
import Customers from "./pages/Customers.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Login from "./pages/Login.jsx";
import Payments from "./pages/Payments.jsx";
import Policies from "./pages/Policies.jsx";
import Profile from "./pages/Profile.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import RbacReport from "./pages/RbacReport.jsx";
import SecurityCenter from "./pages/SecurityCenter.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import Activities from "./pages/Activities.jsx";
import BackupCenter from "./pages/BackupCenter.jsx";
import Intelligence from "./pages/Intelligence.jsx";
import Notifications from "./pages/Notifications.jsx";
import Reports from "./pages/Reports.jsx";
import Tickets from "./pages/Tickets.jsx";
import { clearAuthUser, saveAuthUser } from "./utils/authStorage.js";

const moduleMeta = {
  "/": {
    className: "page-dashboard"
  },
  "/customers": {
    className: "page-customers"
  },
  "/vehicles": {
    className: "page-vehicles"
  },
  "/policies": {
    className: "page-policies"
  },
  "/claims": {
    className: "page-claims"
  },
  "/payments": {
    className: "page-payments"
  },
  "/activities": {
    className: "page-activities"
  },
  "/security": {
    className: "page-security"
  },
  "/intelligence": {
    className: "page-intelligence"
  },
  "/tickets": {
    className: "page-tickets"
  },
  "/notifications": {
    className: "page-notifications"
  },
  "/reports": {
    className: "page-reports"
  },
  "/backups": {
    className: "page-backups"
  },
  "/rbac-report": {
    className: "page-rbac"
  },
  "/profile": {
    className: "page-profile"
  }
};

const getModuleMeta = (pathname) => moduleMeta[pathname] || moduleMeta["/"];

const AppLayout = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();
  const meta = getModuleMeta(location.pathname);

  return (
    <ProtectedRoute>
      <div className={`app-shell min-h-screen ${meta.className}`}>
        <Sidebar
          isOpen={isSidebarOpen}
          isExpanded={isSidebarExpanded}
          onClose={() => setIsSidebarOpen(false)}
          onToggleExpand={() => setIsSidebarExpanded((current) => !current)}
        />
        <div className={`relative z-10 transition-[padding] duration-300 ${isSidebarExpanded ? "lg:pl-64" : "lg:pl-[60px]"}`}>
          <Navbar onLogout={onLogout} onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="app-main mx-auto w-full max-w-[1680px] px-4 py-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/security" element={<SecurityCenter />} />
              <Route path="/intelligence" element={<Intelligence />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/backups" element={<BackupCenter />} />
              <Route path="/rbac-report" element={<RbacReport />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const App = () => {
  const navigate = useNavigate();

  const handleAuth = (userInfo) => {
    saveAuthUser(userInfo);
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    // Remove user data
    clearAuthUser();

    // Redirect to login page
    navigate("/login", { replace: true });

    // Optional: refresh app state
    window.location.reload();
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onAuth={handleAuth} />} />
      <Route path="/customer-login" element={<CustomerLogin />} />
      <Route path="/customer-portal" element={<CustomerPortal />} />
      <Route path="/register" element={<Register onAuth={handleAuth} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword onAuth={handleAuth} />} />
      <Route path="/verify-email/:token" element={<VerifyEmail onAuth={handleAuth} />} />
      <Route path="/*" element={<AppLayout onLogout={handleLogout} />} />
    </Routes>
  );
};

export default App;
