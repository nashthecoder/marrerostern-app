import React, { useState, useEffect } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import { auth, db } from '../../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

function TravelerIncidentSummary() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function fetchIncidents() {
            const user = auth.currentUser;
            if (!user) return;
            const q = query(collection(db, 'incidents'), where('reporterId', '==', user.uid));
            const snapshot = await getDocs(q);
            setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }
        fetchIncidents();
    }, []);

    const handleRowClick = (incident) => {
        setSelectedIncident(incident);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedIncident(null);
    };

    return (
        <div>
            <h4>Mes incidents signalés</h4>
            {loading ? (
                <div>Chargement...</div>
            ) : incidents.length === 0 ? (
                <div>Aucun incident signalé.</div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Période</th>
                            <th>Logement</th>
                            <th>Urgence</th>
                            <th>Date de création</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.map(incident => (
                            <tr key={incident.id}>
                                <td>{incident.periodeStart} à {incident.periodeEnd}</td>
                                <td>{incident.logement}</td>
                                <td>{incident.urgence}</td>
                                <td>{incident.createdAt?.toDate ? incident.createdAt.toDate().toLocaleString() : ''}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleRowClick(incident)}>
                                        Voir détails
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Détails de l'incident</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedIncident && (
                        <div>
                            <p><strong>Période:</strong> {selectedIncident.periodeStart} à {selectedIncident.periodeEnd}</p>
                            <p><strong>Logement:</strong> {selectedIncident.logement}</p>
                            <p><strong>Urgence:</strong> {selectedIncident.urgence}</p>
                            <p><strong>Description:</strong> {selectedIncident.description}</p>
                            {selectedIncident.photoUrl && (
                                <div>
                                    <strong>Photo:</strong><br/>
                                    <img src={selectedIncident.photoUrl} alt="Incident" style={{ maxWidth: '100%' }} />
                                </div>
                            )}
                            <p><strong>Date de création:</strong> {selectedIncident.createdAt?.toDate ? selectedIncident.createdAt.toDate().toLocaleString() : ''}</p>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default TravelerIncidentSummary;
