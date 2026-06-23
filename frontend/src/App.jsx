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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected Route wrapper
const ProtectedLayout = ({ children }) => {
  const { user } = useContext(AppContext);

  // If user is not authenticated, redirect to the Welcome / Login page
  if (!user) {
    return <Navigate to="/" replace />;
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

// Public Route wrapper (Redirect to dashboard if logged in)
const PublicLayout = ({ children }) => {
  const { user } = useContext(AppContext);

  if (user) {
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

        {/* Protected Routes */}
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
