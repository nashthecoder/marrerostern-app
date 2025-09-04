import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
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

import TravelerProfile from './Components/TravelerProfile';

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
      {/* Traveler Profile route */}
      {(role === 'traveler' || role === 'voyageur') && (
        <Route path="/profile" element={<TravelerProfile />} />
      )}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isTraveler ? (
              <Navigate to="/welcome-booklet" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Navigate to="/connexion" />
          )
        }
      />
      {isTraveler && <Route path="/welcome-booklet" element={<WelcomeBooklet reservationId={reservationId || 'test-reservation-id'} />} />}
      {isTraveler && <Route path="/checkin" element={<CheckInForm reservationId={reservationId || 'test-reservation-id'} />} />}
      {isTraveler && <Route path="/review" element={<ReviewForm reservationId={reservationId || 'test-reservation-id'} />} />}
      <Route
        path="/connexion"
        element={<Login setIsAuthenticated={setIsAuthenticated} />}
      />
      {/* Toutes les routes protégées affichées AVEC Sidebar */}
      {isAuthenticated && (
        <Route
          path="/dashboard"
          element={
            <SidebarLayout>
              <Dashboard setIsAuthenticated={setIsAuthenticated} />
            </SidebarLayout>
          }
        />
      )}
      {isAuthenticated && (
        <Route
          path="/users"
          element={
            <SidebarLayout>
              <Users setIsAuthenticated={setIsAuthenticated} />
            </SidebarLayout>
          }
        />
      )}
      {isAuthenticated && (
        <Route
          path="/reservations"
          element={
            <SidebarLayout>
              <Reservations setIsAuthenticated={setIsAuthenticated} />
            </SidebarLayout>
          }
        />
      )}
      {isAuthenticated && (
        <Route
          path="/incidents"
          element={
            <SidebarLayout>
              <Incidents setIsAuthenticated={setIsAuthenticated} />
            </SidebarLayout>
          }
        />
      )}
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