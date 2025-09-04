import AdminDashboard from '../Components/Dashboard/AdminDashboard';
import OwnerDashboard from '../Components/Dashboard/OwnerDashboard';
import ProviderDashboard from '../Components/Dashboard/ProviderDashboard';
import TravelerDashboard from '../Components/Dashboard/TravelerDashboard';
import Header from '../Components/Header';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import AuditLog from '../Components/AuditLog';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import MySessions from '../Components/MySessions';
import AllUserSessions from '../Components/AllUserSessions';

function Dashboard({ setIsAuthenticated }) {
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchRole = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUserEmail(currentUser.email);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setRole(userSnap.data().role);
          } else {
            setRole(null);
          }
        } catch (error) {
          setRole(null);
        }
      } else {
        setRole(null);
        setUserEmail('');
      }
      setRoleLoading(false);
    };
    fetchRole();
  }, []);

  // Accept both 'traveler' and 'voyageur' for traveler dashboard
  const isTraveler = role === 'traveler' || role === 'voyageur';

  return (
    <>
      <Container fluid>
        <Header title="Tableau de bord" setIsAuthenticated={setIsAuthenticated} />
        <div style={{fontSize:'0.9em', color:'#888', marginBottom:8}}>
          <b>Debug:</b> role = <code>{role}</code>, user = <code>{userEmail}</code>
        </div>
        {roleLoading ? (
          <div className="text-center my-4"><Spinner animation="border" /></div>
        ) : role === 'admin' ? (
          <AdminDashboard />
        ) : role === 'owner' ? (
          <OwnerDashboard />
        ) : role === 'provider' ? (
          <ProviderDashboard />
        ) : isTraveler ? (
          <TravelerDashboard />
        ) : (
          <div className="text-center my-4">Aucun rôle détecté.</div>
        )}
      </Container>
    </>
  );
}
export default Dashboard;