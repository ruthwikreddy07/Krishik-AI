import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Translate } from './components/Translate';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { MyFarm } from './pages/MyFarm';
import { CropManagement } from './pages/CropManagement';
import { DiseaseScanner } from './pages/DiseaseScanner';
import { Weather } from './pages/Weather';
import { Market } from './pages/Market';
import { Schemes } from './pages/Schemes';
import { AIChatbot } from './pages/AIChatbot';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { PestRisk } from './pages/PestRisk';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { ExpertDashboard } from './pages/ExpertDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected Route wrapper for Farmers
const ProtectedLayout = ({ children }) => {
  const { user } = useContext(AppContext);

  // If user is not authenticated, redirect to the Welcome / Login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is staff, redirect to their dashboard
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user.role === 'expert') {
    return <Navigate to="/expert/dashboard" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
        {/* Navigation Bar */}
        <Navbar />

        {/* Dynamic Route Content */}
        <main className="page-fade-in" style={{ flexGrow: 1, padding: '32px', overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
          <Translate>{children}</Translate>
        </main>
      </div>
    </div>
  );
};

// Protected Route wrapper for Staff
const StaffProtectedLayout = ({ children, allowedRoles }) => {
  const { user } = useContext(AppContext);

  // If staff is not authenticated, redirect to staff login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // If user is a farmer (no role), redirect to farmer dashboard
  if (!user.role) {
    return <Navigate to="/dashboard" replace />;
  }

  // If role is not allowed, redirect to respective dashboard
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'expert') {
      return <Navigate to="/expert/dashboard" replace />;
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '32px' }}>
      <Translate>{children}</Translate>
    </div>
  );
};

// Public Route wrapper (Redirect to appropriate dashboard if logged in)
const PublicLayout = ({ children }) => {
  const { user } = useContext(AppContext);

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'expert') {
      return <Navigate to="/expert/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicLayout>
            <Landing />
          </PublicLayout>
        } />
        <Route path="/admin/login" element={
          <PublicLayout>
            <AdminLogin />
          </PublicLayout>
        } />

        {/* Protected Farmer Routes */}
        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/farm" element={<ProtectedLayout><MyFarm /></ProtectedLayout>} />
        <Route path="/crops" element={<ProtectedLayout><CropManagement /></ProtectedLayout>} />
        <Route path="/disease-scanner" element={<ProtectedLayout><DiseaseScanner /></ProtectedLayout>} />
        <Route path="/weather" element={<ProtectedLayout><Weather /></ProtectedLayout>} />
        <Route path="/market" element={<ProtectedLayout><Market /></ProtectedLayout>} />
        <Route path="/schemes" element={<ProtectedLayout><Schemes /></ProtectedLayout>} />
        <Route path="/chat" element={<ProtectedLayout><AIChatbot /></ProtectedLayout>} />
        <Route path="/pest-risk" element={<ProtectedLayout><PestRisk /></ProtectedLayout>} />
        <Route path="/notifications" element={<ProtectedLayout><Notifications /></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />

        {/* Protected Staff Routes */}
        <Route path="/admin/dashboard" element={
          <StaffProtectedLayout allowedRoles={['admin']}>
            <AdminDashboard />
          </StaffProtectedLayout>
        } />
        <Route path="/expert/dashboard" element={
          <StaffProtectedLayout allowedRoles={['expert', 'admin']}>
            <ExpertDashboard />
          </StaffProtectedLayout>
        } />

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Toast Alert popups container */}
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
