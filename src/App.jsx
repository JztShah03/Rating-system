import { useCallback, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import RatingPage from './pages/RatingPage';
import TechnicianSelection from './pages/TechnicianSelection';
import ThankYouPage from './pages/ThankYouPage';
import PasswordProtection from './components/PasswordProtection';

const SELECTED_TECHNICIAN_KEY = 'selectedTechnician';

// Function to load the selected technician from localStorage
function loadStoredTechnician() {
  try {
    const rawValue = localStorage.getItem(SELECTED_TECHNICIAN_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    console.warn('Unable to read selected technician from localStorage.', error);
    localStorage.removeItem(SELECTED_TECHNICIAN_KEY);
    return null;
  }
}

// Admin Route with Authentication
function AdminRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('ratingAdminAuthenticated') === 'true'
  );

  function handleLogout() {
    sessionStorage.removeItem('ratingAdminAuthenticated');
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

export default function App() {
  const navigate = useNavigate();
  const [selectedTechnician, setSelectedTechnician] = useState(loadStoredTechnician);

  // Handle technician selection
  const handleSelectTechnician = useCallback(
    (technician) => {
      console.log('Selected technician:', technician);  // Debugging line to verify technician selection
      localStorage.setItem(SELECTED_TECHNICIAN_KEY, JSON.stringify(technician));
      setSelectedTechnician(technician);
      navigate('/rating');  // Navigate to the Rating Page after selection
    },
    [navigate]
  );

  // Handle clearing technician selection
  const handleClearTechnician = useCallback(() => {
    console.log('Clearing selected technician...');  // Debugging line to verify technician clearing
    localStorage.removeItem(SELECTED_TECHNICIAN_KEY);
    setSelectedTechnician(null);
  }, []);

  // Application Context to manage technician selection
  const appContext = useMemo(
    () => ({
      selectedTechnician,
      handleSelectTechnician,
      handleClearTechnician
    }),
    [handleClearTechnician, handleSelectTechnician, selectedTechnician]
  );

  // Debugging: Checking the technician and flow state
  console.log('Selected Technician in App.jsx:', selectedTechnician);  // Should print selected technician or null

  return (
    <PasswordProtection>
      <Routes>
        {/* Route for Technician Selection */}
        <Route
          path="/"
          element={<TechnicianSelection onSelectTechnician={appContext.handleSelectTechnician} />}
        />
        
        {/* Route for Rating Page, shows selected technician's details */}
        <Route
          path="/rating"
          element={
            <RatingPage
              selectedTechnician={appContext.selectedTechnician}
              onClearTechnician={appContext.handleClearTechnician}
            />
          }
        />
        
        {/* Route for Thank You Page */}
        <Route
          path="/thank-you"
          element={<ThankYouPage onClearTechnician={appContext.handleClearTechnician} />}
        />
        
        {/* Route for Admin Dashboard with authentication */}
        <Route path="/admin" element={<AdminRoute />} />
        
        {/* Catch-all route to redirect to Technician Selection Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PasswordProtection>
  );
}