// src/App.jsx
import React, { useContext, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserProvider, UserContext } from './context/UserContext.jsx'; // Ensure correct path
import { Toaster } from 'sonner';

// Layout Components
import Sidebar from './components/layout/Sidebar';       // For admin panel
import Navbar from './components/layout/Navbar';         // For admin panel
import Footer from './components/layout/Footer';         // For admin panel
// import FullPageLoader from './components/layout/FullPageLoader'; // Create this simple component

// Eagerly loaded core pages for admin
import AdminLoginPage from './pages/Login.jsx'; // Your admin login page
import Home from './pages/Home.jsx'; // Your admin dashboard page

// Lazy loaded pages for admin panel
const UsersPage = lazy(() => import('./pages/Users.jsx'));
const UserAccountPage = lazy(() => import('./pages/UserAccount.jsx'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications.jsx'));
const AddAdminPage = lazy(() => import('./pages/AddAdmin.jsx'));
const AdminSettings = lazy(() => import('./pages/AdminSettings.jsx'));
const MessData = lazy(() => import('./pages/MessData.jsx'));
const RentalData = lazy(() => import('./pages/RentalData.jsx'));
const LaundryData = lazy(() => import('./pages/LaundryData.jsx'));
const PlumberData = lazy(() => import('./pages/PlumberData.jsx'));
const ElectricianData = lazy(() => import('./pages/ElectricianData.jsx'));
const MedicalData= lazy(() => import('./pages/MedicalData.jsx'));
const PendingApprovals = lazy(() => import('./pages/PendingApprovals.jsx'));
const AddData = lazy(() => import('./pages/AddData.jsx'));
const ApprovedSubmissions = lazy(() => import('./pages/ApprovedSubmissions.jsx'));

const UnderMaintenancePage = lazy(() => import('./pages/UnderMaintenance.jsx'));
const RejectedSubmissions = lazy(() => import('./pages/RejectedSubmissions.jsx'));
// const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx')); // Create a simple 404 page

// --- Simple Full Page Loader Component (can be in its own file) ---
const FullPageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 9999 }}>
    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Protected Route Component for Admin
const AdminProtectedRoute = () => {
  const { isAdminAuthenticated, isAdminAuthLoading } = useContext(UserContext);
  const location = useLocation();

  if (isAdminAuthLoading) {
    return <FullPageLoader />; // Show loader while checking auth status
  }

  if (!isAdminAuthenticated()) {
    // User is not authenticated as admin, redirect to login page
    // Save the current location they were trying to go to
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  // If authenticated as admin, render the child routes within the AdminLayout
  return <AdminLayout />;
};

// Layout for Admin Dashboard pages
const AdminLayout = () => (
  <div className="layout-wrapper layout-content-navbar">
    <div className="layout-container">
      <Sidebar />
      <div className="layout-page">
        <Navbar />
        <div className="content-wrapper">
          <Suspense fallback={<FullPageLoader />}> {/* Fallback for lazy loaded routes */}
            <Outlet /> {/* Nested admin routes will render here */}
          </Suspense>
          <Footer />
        </div>
      </div>
    </div>
    <div className="layout-overlay layout-menu-toggle"></div>
  </div>
);

// Component to handle the root path redirect logic
const RootRedirect = () => {
  const { isAdminAuthenticated, isAdminAuthLoading } = useContext(UserContext);

  if (isAdminAuthLoading) {
    return <FullPageLoader />;
  }

  return isAdminAuthenticated() ? <Navigate to="/" replace /> : <Navigate to="/admin/login" replace />;
};


function App() {
  return (
    <UserProvider>
      <Router>
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            {/* Public Admin Login Route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Protected Admin Routes wrapped by AdminProtectedRoute */}
            <Route element={<AdminProtectedRoute />}>
              {/* AdminLayout is applied to all routes within AdminProtectedRoute */}
              <Route path="/" element={<Home />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/users/:userId/manage" element={<UserAccountPage />} />
              {/* <Route path="/admin/users/add" element={<AddUserPage />} /> */}
              <Route path="/admin/admins/add" element={<AddAdminPage />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              
              <Route path="/admin/submissions/mess" element={<MessData/>} />
              <Route path="/admin/submissions/rental" element={<RentalData />} />
              <Route path="/admin/submissions/laundry" element={<LaundryData />} />
              <Route path="/admin/submissions/plumber" element={<PlumberData />} />
              <Route path="/admin/submissions/electrician" element={<ElectricianData />} />
              <Route path="/admin/submissions/medical" element={<MedicalData />} />
              <Route path="/admin/submissions/pending" element={<PendingApprovals />} />
              <Route path="/admin/submissions/approved" element={<ApprovedSubmissions />} />
              <Route path="/admin/submissions/rejected" element={<RejectedSubmissions />} />


            </Route>

            {/* Root path redirect logic */}
            <Route path="/" element={<RootRedirect />} />
            
            <Route path="/maintenance" element={<UnderMaintenancePage />} />
            {/* Fallback for any other unmatched route (could be a 404 page) */}
            {/* <Route path="*" element={<NotFoundPage />} />  */}
          </Routes>
        </Suspense>
        
        {/* Sonner Toaster - Global toast provider */}
        <Toaster 
          position="top-right"
          expand={true}
          richColors={true}
          closeButton={true}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(0 0% 3.9%)',
              color: 'hsl(0 0% 98%)',
              border: '1px solid hsl(0 0% 14.9%)',
            },
          }}
        />
      </Router>
    </UserProvider>
  );
}

export default App;