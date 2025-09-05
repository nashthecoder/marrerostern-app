import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import TravelerProfile from './Components/TravelerProfile';
import AdminProfile from './Components/AdminProfile';
import OwnerProfile from './Components/OwnerProfile';
import ProviderProfile from './Components/ProviderProfile';
import Messaging from './Components/Messaging';
import IncidentReport from './Components/IncidentReport';
import TravelerIncidentReportForm from './Components/Incidents/TravelerIncidentReportForm';
import Login from './Pages/Login';
import SidebarLayout from './Components/SidebarLayout';
import { useState } from 'react';
import Users from './Pages/Users';
import Reservations from './Pages/Reservations';
import Incidents from './Pages/Incidents';
import TravelerLogin from './Components/TravelerLogin';
import CheckInForm from './Components/CheckInForm';
import WelcomeBooklet from './Components/WelcomeBooklet';
import ReviewForm from './Components/ReviewForm';

import { useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';



function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function RoutedApp({ isAuthenticated, role, setIsAuthenticated }) {
  const query = useQuery();
  // Get reservationId from query param for traveler features
  const reservationId = query.get('reservationId');
    const isTraveler = role === 'traveler' || role === 'voyageur';
    return (
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/connexion" />
            )
          }
        />
        {/* Traveler routes */}
        {isTraveler && (
          <>
            <Route path="/dashboard" element={<SidebarLayout><Dashboard setIsAuthenticated={setIsAuthenticated} /></SidebarLayout>} />
            <Route path="/profile" element={<SidebarLayout><TravelerProfile /></SidebarLayout>} />
            <Route path="/communications" element={<SidebarLayout><Messaging role="traveler" /></SidebarLayout>} />
            <Route path="/incidents" element={<SidebarLayout><TravelerIncidentReportForm /></SidebarLayout>} />
            <Route path="/welcome-booklet" element={<WelcomeBooklet reservationId={reservationId || 'test-reservation-id'} />} />
            <Route path="/checkin" element={<CheckInForm reservationId={reservationId || 'test-reservation-id'} />} />
            <Route path="/review" element={<ReviewForm reservationId={reservationId || 'test-reservation-id'} />} />
          </>
        )}
        {/* Other roles */}
        {!isTraveler && (
          <>
            <Route path="/dashboard" element={<SidebarLayout><Dashboard setIsAuthenticated={setIsAuthenticated} /></SidebarLayout>} />
            <Route path="/users" element={<SidebarLayout><Users setIsAuthenticated={setIsAuthenticated} /></SidebarLayout>} />
            <Route path="/reservations" element={<SidebarLayout><Reservations setIsAuthenticated={setIsAuthenticated} /></SidebarLayout>} />
            <Route path="/incidents" element={<SidebarLayout><IncidentReport role={role} /></SidebarLayout>} />
            <Route path="/profile" element={<SidebarLayout>
              {role === 'admin' && <AdminProfile />}
              {role === 'owner' && <OwnerProfile />}
              {role === 'provider' && <ProviderProfile />}
            </SidebarLayout>} />
          </>
        )}
        <Route path="/connexion" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        {/* Redirection sécurité pour toute tentative d'accès */}
        {!isAuthenticated && (
          <Route path="*" element={<Navigate to="/connexion" />} />
        )}
      </Routes>
    );
}


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setRole(userSnap.data().role);
          } else {
            setRole(null);
          }
        } catch {
          setRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <RoutedApp isAuthenticated={isAuthenticated} role={role} setIsAuthenticated={setIsAuthenticated} />
    </Router>
  );
}

export default App;