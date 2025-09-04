import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { Card, Row, Col, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function BookingCalendar() {
  const [reservations, setReservations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newReservation, setNewReservation] = useState({
    guestName: '',
    guestEmail: '',
    checkIn: new Date(),
    checkOut: new Date(),
    price: '',
    propertyId: '',
    status: 'Confirmé'
  });

  useEffect(() => {
    fetchProperties();
    fetchReservations();
  }, []);

  const fetchProperties = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');
      
      const q = query(collection(db, 'properties'), where('owner', '==', user.email));
      const snapshot = await getDocs(q);
      const propertiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProperties(propertiesData);
      
      if (propertiesData.length > 0) {
        setSelectedProperty(propertiesData[0].id);
        setNewReservation(prev => ({ ...prev, propertyId: propertiesData[0].id }));
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchReservations = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');
      
      const q = query(collection(db, 'reservations'), where('proprietaire', '==', user.email));
      const snapshot = await getDocs(q);
      const reservationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(reservationsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setNewReservation(prev => ({ ...prev, checkIn: date }));
  };

  const handleAddReservation = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');

      const property = properties.find(p => p.id === newReservation.propertyId);
      
      await addDoc(collection(db, 'reservations'), {
        ...newReservation,
        logement: property?.name || '',
        proprietaire: user.email,
        dateArrivee: newReservation.checkIn,
        dateDepart: newReservation.checkOut,
        prix: parseFloat(newReservation.price) || 0,
        createdAt: new Date()
      });

      setShowModal(false);
      setNewReservation({
        guestName: '',
        guestEmail: '',
        checkIn: new Date(),
        checkOut: new Date(),
        price: '',
        propertyId: selectedProperty,
        status: 'Confirmé'
      });
      fetchReservations();
    } catch (e) {
      setError(e.message);
    }
  };

  // Check if a date has reservations
  const getDateStatus = (date) => {
    const dateString = date.toDateString();
    const reservationsOnDate = reservations.filter(res => {
      const checkIn = res.dateArrivee?.toDate ? res.dateArrivee.toDate() : new Date(res.dateArrivee);
      const checkOut = res.dateDepart?.toDate ? res.dateDepart.toDate() : new Date(res.dateDepart);
      return date >= checkIn && date <= checkOut && res.propertyId === selectedProperty;
    });
    return reservationsOnDate;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const reservationsOnDate = getDateStatus(date);
      if (reservationsOnDate.length > 0) {
        return (
          <div className="calendar-tile-content">
            {reservationsOnDate.map(res => (
              <div key={res.id} className="reservation-indicator" 
                   style={{backgroundColor: res.status === 'Confirmé' ? '#28a745' : '#ffc107'}}></div>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const reservationsOnDate = getDateStatus(date);
      if (reservationsOnDate.length > 0) {
        return 'has-reservation';
      }
    }
    return null;
  };

  const upcomingReservations = reservations
    .filter(res => {
      const checkIn = res.dateArrivee?.toDate ? res.dateArrivee.toDate() : new Date(res.dateArrivee);
      return checkIn >= new Date() && res.propertyId === selectedProperty;
    })
    .sort((a, b) => {
      const dateA = a.dateArrivee?.toDate ? a.dateArrivee.toDate() : new Date(a.dateArrivee);
      const dateB = b.dateArrivee?.toDate ? b.dateArrivee.toDate() : new Date(b.dateArrivee);
      return dateA - dateB;
    })
    .slice(0, 5);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h4>Calendrier des Réservations</h4>
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          {/* Property Selector */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Propriété</h6>
            </Card.Header>
            <Card.Body>
              <Form.Select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </Form.Select>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Actions</h6>
            </Card.Header>
            <Card.Body>
              <Button 
                variant="primary" 
                className="w-100 mb-2"
                onClick={() => setShowModal(true)}
              >
                Ajouter Réservation
              </Button>
              <Button variant="outline-primary" className="w-100 mb-2">
                Synchroniser Calendriers
              </Button>
              <Button variant="outline-secondary" className="w-100">
                Exporter iCal
              </Button>
            </Card.Body>
          </Card>

          {/* Upcoming Reservations */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Prochaines Réservations</h6>
            </Card.Header>
            <Card.Body className="p-0">
              {upcomingReservations.length === 0 ? (
                <p className="p-3 mb-0 text-muted">Aucune réservation à venir</p>
              ) : (
                upcomingReservations.map(res => {
                  const checkIn = res.dateArrivee?.toDate ? res.dateArrivee.toDate() : new Date(res.dateArrivee);
                  const checkOut = res.dateDepart?.toDate ? res.dateDepart.toDate() : new Date(res.dateDepart);
                  return (
                    <div key={res.id} className="p-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <strong>{res.guestName || res.nomClient}</strong>
                        <Badge bg={res.status === 'Confirmé' ? 'success' : 'warning'}>
                          {res.status}
                        </Badge>
                      </div>
                      <small className="text-muted">
                        {checkIn.toLocaleDateString()} - {checkOut.toLocaleDateString()}
                      </small>
                    </div>
                  );
                })
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          {/* Calendar */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Calendrier</h6>
              <div>
                <Badge bg="success" className="me-2">Confirmé</Badge>
                <Badge bg="warning">En attente</Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Calendar
                onChange={handleDateClick}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="w-100"
              />
              
              {/* Legend */}
              <div className="mt-3 text-center">
                <small className="text-muted">
                  Cliquez sur une date pour ajouter une réservation
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Reservation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une Réservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddReservation}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom du client</Form.Label>
                  <Form.Control
                    type="text"
                    value={newReservation.guestName}
                    onChange={(e) => setNewReservation({...newReservation, guestName: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email du client</Form.Label>
                  <Form.Control
                    type="email"
                    value={newReservation.guestEmail}
                    onChange={(e) => setNewReservation({...newReservation, guestEmail: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date d'arrivée</Form.Label>
                  <Form.Control
                    type="date"
                    value={newReservation.checkIn.toISOString().split('T')[0]}
                    onChange={(e) => setNewReservation({...newReservation, checkIn: new Date(e.target.value)})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de départ</Form.Label>
                  <Form.Control
                    type="date"
                    value={newReservation.checkOut.toISOString().split('T')[0]}
                    onChange={(e) => setNewReservation({...newReservation, checkOut: new Date(e.target.value)})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Propriété</Form.Label>
                  <Form.Select
                    value={newReservation.propertyId}
                    onChange={(e) => setNewReservation({...newReservation, propertyId: e.target.value})}
                    required
                  >
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix (€)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={newReservation.price}
                    onChange={(e) => setNewReservation({...newReservation, price: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select
                value={newReservation.status}
                onChange={(e) => setNewReservation({...newReservation, status: e.target.value})}
              >
                <option value="Confirmé">Confirmé</option>
                <option value="En attente">En attente</option>
                <option value="Annulé">Annulé</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                Ajouter Réservation
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Custom CSS */}
      <style jsx>{`
        .calendar-tile-content {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        .reservation-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin: 1px;
        }
        .has-reservation {
          background-color: rgba(40, 167, 69, 0.1) !important;
        }
      `}</style>
    </div>
  );
}

export default BookingCalendar;