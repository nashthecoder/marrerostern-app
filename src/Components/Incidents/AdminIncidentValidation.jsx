import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Badge, Spinner } from 'react-bootstrap';
import { db } from '../../../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

function AdminIncidentValidation() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchIncidents() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'incidents'));
      setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchIncidents();
  }, []);

  const handleShowModal = (incident) => {
    setSelectedIncident(incident);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedIncident(null);
  };

  const handleStatusChange = async (status) => {
    if (!selectedIncident) return;
    setActionLoading(true);
    const incidentRef = doc(db, 'incidents', selectedIncident.id);
    await updateDoc(incidentRef, { status });
    setIncidents(incidents.map(i => i.id === selectedIncident.id ? { ...i, status } : i));
    setActionLoading(false);
    handleCloseModal();
  };

  return (
    <div className="mt-4">
      <h4>Validation des incidents</h4>
      {loading ? <Spinner animation="border" /> : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Description</th>
              <th>Reporter</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(incident => (
              <tr key={incident.id}>
                <td>{incident.description}</td>
                <td>{incident.reporter || '-'}</td>
                <td><Badge bg={incident.status === 'approved' ? 'success' : incident.status === 'rejected' ? 'danger' : incident.status === 'resolved' ? 'primary' : 'secondary'}>{incident.status || 'pending'}</Badge></td>
                <td>{incident.createdAt?.toDate ? incident.createdAt.toDate().toLocaleString() : ''}</td>
                <td>
                  <Button size="sm" variant="info" onClick={() => handleShowModal(incident)}>Voir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Détails de l'incident</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedIncident && (
            <div>
              <p><strong>Description:</strong> {selectedIncident.description}</p>
              <p><strong>Reporter:</strong> {selectedIncident.reporter}</p>
              <p><strong>Status:</strong> {selectedIncident.status || 'pending'}</p>
              <p><strong>Date:</strong> {selectedIncident.createdAt?.toDate ? selectedIncident.createdAt.toDate().toLocaleString() : ''}</p>
              {selectedIncident.photoUrl && (
                <div>
                  <strong>Photo:</strong><br/>
                  <img src={selectedIncident.photoUrl} alt="Incident" style={{ maxWidth: '100%' }} />
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" disabled={actionLoading} onClick={() => handleStatusChange('approved')}>Approuver</Button>
          <Button variant="danger" disabled={actionLoading} onClick={() => handleStatusChange('rejected')}>Rejeter</Button>
          <Button variant="primary" disabled={actionLoading} onClick={() => handleStatusChange('resolved')}>Résoudre</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminIncidentValidation;
