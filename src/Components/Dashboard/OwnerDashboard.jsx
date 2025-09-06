 import React, { useEffect, useState } from 'react';
import { auth, db } from '../../../firebase';
import ResumeView from './ResumeView';
import AccesRapide from './AccesRapide';
import MySessions from '../MySessions';
import MyProperties from '../Owner/MyProperties';
import { Row, Col, Spinner } from 'react-bootstrap';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function OwnerDashboard() {
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists() && userSnap.data().role === 'owner') {
            setIsOwner(true);
          } else {
            setIsOwner(false);
          }
        } catch (error) {
          console.error('Error fetching role:', error);
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (!isOwner) {
    return <div>Access Denied</div>;
  }

  return (
    <>
      <ResumeView />
      <h3 className='mt-3 text-customs'>Accès rapide</h3>
      <AccesRapide />
      <Row className="mt-4">
        <Col xs={12}><MySessions /></Col>
      </Row>
      <Row className="mt-4">
        <Col md={6}><MyProperties /></Col>
        <Col md={6}><Messaging role="owner" /><IncidentReport role="owner" /></Col>
      </Row>
      {/* TODO: Add BudgetOverview, BookingCalendar, IncidentReport, Communication, and OwnedProperties components */}
    </>
  );
}
export default OwnerDashboard;
