import AdminDashboard from '../Components/Dashboard/AdminDashboard';
import OwnerDashboard from '../Components/Dashboard/OwnerDashboard';
import ProviderDashboard from '../Components/Dashboard/ProviderDashboard';
import TravelerDashboard from '../Components/Dashboard/TravelerDashboard';
import Header from '../Components/Header';
import { Spinner } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

// DEV: Pass role to SidebarLayout for menu updates
function Dashboard({ setIsAuthenticated }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            console.log('User role fetched:', userSnap.data().role);
            setRole(userSnap.data().role);
          } else {
            console.log('User document does not exist');
            setRole(null);
          }
        } catch (error) {
          console.error('Error fetching role:', error);
          setRole(null);
        }
      } else {
        console.log('User is not authenticated');
        setRole(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setIsAuthenticated]);

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (!role) {
    return <div>Access Denied</div>;
  }

  return (
    <>
      <Header title="Tableau de bord" setIsAuthenticated={setIsAuthenticated} />
      {role === 'admin' && <AdminDashboard />}
      {role === 'owner' && <OwnerDashboard />}
      {role === 'provider' && <ProviderDashboard />}
      {(role === 'traveler' || role === 'voyageur') && <TravelerDashboard />}
    </>
  );
}

export default Dashboard;