import React, { useEffect, useState } from 'react';
import AccesRapide from './AccesRapide';
import MySessions from '../MySessions';
import Messaging from '../Messaging';
import IncidentReport from '../IncidentReport';
import { Row, Col, Table, Spinner, Alert, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function TravelerDashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Utilisateur non authentifié');
        // Assumes 'client' field in reservations is the user's email or uid
        const q = query(collection(db, 'reservations'), where('client', '==', user.email));
        const snap = await getDocs(q);
        setReservations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchReservations();
  }, []);

  // Hide AccesRapide for traveler/voyageur role
  return (
    <>
      {/* Accès rapide is hidden for traveler/voyageur */}
      <Row className="mt-4">
        <Col xs={12}><MySessions /></Col>
      </Row>
      <Row className="mt-4">
        <Col xs={12}>
          <h5>Mes réservations</h5>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <Spinner animation="border" />
          ) : reservations.length === 0 ? (
            <div>Aucune réservation trouvée.</div>
          ) : (
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>Logement</th>
                  <th>Date d'arrivée</th>
                  <th>Date de départ</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r.id}>
                    <td>{r.logements || r.logement || '-'}</td>
                    <td>{r.dateArrivee?.toDate ? r.dateArrivee.toDate().toLocaleDateString() : (r.dateArrivee ? new Date(r.dateArrivee).toLocaleDateString() : '-')}</td>
                    <td>{r.dateDepart?.toDate ? r.dateDepart.toDate().toLocaleDateString() : (r.dateDepart ? new Date(r.dateDepart).toLocaleDateString() : '-')}</td>
                    <td>{r.status || '-'}</td>
                    <td style={{whiteSpace:'nowrap'}}>
                      <Button size="sm" variant="outline-primary" onClick={() => navigate(`/welcome-booklet?reservationId=${r.id}`)} className="me-2">Livret d'accueil</Button>
                      <Button size="sm" variant="outline-success" onClick={() => navigate(`/checkin?reservationId=${r.id}`)} className="me-2">Check-in</Button>
                      <Button size="sm" variant="outline-warning" onClick={() => navigate(`/review?reservationId=${r.id}`)}>Avis</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={6}><Messaging role="traveler" /></Col>
        <Col md={6}><IncidentReport role="traveler" /></Col>
      </Row>
    </>
  );
}
export default TravelerDashboard;
