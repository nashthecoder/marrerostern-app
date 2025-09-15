import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { db } from '../../../firebase';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';


function CreateReservation({ onSuccess, isAdmin }) {
  const [form, setForm] = useState({
    logements: '',
    client: '',
    dateArrivee: '',
    dateDepart: '',
    prestataire: '',
    tache: '',
    note: '',
    status: 'En attente',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch properties
        const propSnap = await getDocs(collection(db, 'properties'));
        setProperties(propSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        // Fetch providers
        const userSnap = await getDocs(collection(db, 'users'));
        setProviders(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(u => u.role === 'provider'));
      } catch (e) {
        setError('Erreur lors du chargement des données: ' + e.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      // Convertir les dates d'arrivée et de départ en objets Date (pour assurer la compatibilité avec Firebase)
      const dateArrivee = new Date(form.dateArrivee);
      const dateDepart = new Date(form.dateDepart);

      // Ajouter les données à Firestore, en convertissant les dates en Timestamp
      const docRef = await addDoc(collection(db, 'reservations'), {
        ...form,
        dateArrivee: Timestamp.fromDate(dateArrivee),
        dateDepart: Timestamp.fromDate(dateDepart),
        createdAt: Timestamp.now(),
      });

      // Notification/task assignment logic placeholder
      // TODO: Send notification to provider and create task if prestataire and tache are set
      // Example: await addDoc(collection(db, 'tasks'), { providerId: form.prestataire, reservationId: docRef.id, tache: form.tache, ... })

      setSuccess(`Réservation créée avec ID : ${docRef.id}`);
      setForm({
        logements: '',
        client: '',
        dateArrivee: '',
        dateDepart: '',
        prestataire: '',
        tache: '',
        note: '',
        status: 'En attente',
      });

      if (onSuccess) onSuccess();

    } catch (err) {
      setError('Erreur lors de la création : ' + err.message);
    }
  };

  return (
    <Container className="mt-3">
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Spinner animation="border" /> : (
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Logements</Form.Label>
                <Form.Select
                  name="logements"
                  value={form.logements}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un logement</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name || p.address || p.id}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Client</Form.Label>
              <Form.Control
                type="text"
                name="client"
                value={form.client}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Date d’arrivée</Form.Label>
              <Form.Control
                type="date"
                name="dateArrivee"
                value={form.dateArrivee}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Date de départ</Form.Label>
              <Form.Control
                type="date"
                name="dateDepart"
                value={form.dateDepart}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Assigné un prestataire ?</Form.Label>
              <Form.Select
                name="prestataire"
                value={form.prestataire}
                onChange={handleChange}
              >
                <option value="">Aucun</option>
                {providers.map((u) => (
                  <option key={u.id} value={u.id}>{u.prenom || ''} {u.nom || ''} ({u.email})</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Assigné un tâche ?</Form.Label>
              <Form.Control
                type="text"
                name="tache"
                value={form.tache}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Note</Form.Label>
          <Form.Control
            as="textarea"
            name="note"
            rows={3}
            value={form.note}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Si l'utilisateur est admin, afficher un champ pour changer le statut */}
        {isAdmin && (
          <Form.Group className="mb-3">
            <Form.Label>Statut de la réservation</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="En attente">En attente</option>
              <option value="Réservation confirmée">Réservation confirmée</option>
              <option value="Réservation annulée">Réservation annulée</option>
            </Form.Control>
          </Form.Group>
        )}

        <Button
          type="submit"
          style={{ backgroundColor: '#234E5B', color: '#FFF', border: 'none' }}
        >
          Enregistrer la réservation
        </Button>
        </Form>
      )}
    </Container>
  );
}

export default CreateReservation;