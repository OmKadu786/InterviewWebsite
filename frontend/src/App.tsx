import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout/Layout';
import { LoginModal } from './components/Auth/LoginModal';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from './config/api';
import { useState } from 'react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SetupPage } from './pages/SetupPage';
import { InterviewPage } from './pages/InterviewPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

// Wrapper for Layout to handle location-based props
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Determine props for Layout based on current path
  const showLoginButton = location.pathname === '/';
  const showDoneButton = location.pathname === '/interview';

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleEndInterview = async () => {
    try {
      // 1. Stop camera
      await fetch(API_ENDPOINTS.stopCamera, {
        method: 'POST'
      });

      // 2. Save session if user is logged in
      if (user) {
        // Use endpoint to save session
        await fetch(`${API_ENDPOINTS.analytics}/../session/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });
      }
    } catch (error) {
      console.error('Error ending interview:', error);
    }
    navigate('/analytics');
  };

  return (
    <Layout
      showLoginButton={showLoginButton}
      showDoneButton={showDoneButton}
      onLoginClick={handleLoginClick}
      onDone={handleEndInterview}
    >
      {children}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;