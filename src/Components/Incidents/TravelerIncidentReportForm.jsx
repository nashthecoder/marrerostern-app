import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { auth, db, storage } from '../../../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function TravelerIncidentReportForm() {
    const [periodeStart, setPeriodeStart] = useState('');
    const [periodeEnd, setPeriodeEnd] = useState('');
    const [logement, setLogement] = useState('');
    const [logements, setLogements] = useState([]);
    const [urgence, setUrgence] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch logements from Firestore
        async function fetchLogements() {
            const logementsSnapshot = await getDocs(collection(db, 'logements'));
            const logementsList = logementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLogements(logementsList);
        }
        fetchLogements();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Non authentifié');
            let photoUrl = '';
            if (photo) {
                // Upload photo to Firebase Storage
                const storageRef = ref(storage, `incident_photos/${user.uid}_${Date.now()}_${photo.name}`);
                await uploadBytes(storageRef, photo);
                photoUrl = await getDownloadURL(storageRef);
            }
            await addDoc(collection(db, 'incidents'), {
                periodeStart,
                periodeEnd,
                logement,
                urgence,
                description,
                photoUrl, // Save the download URL, not the file object
                reporterId: user.uid, // REQUIRED for rules
                reporter: user.email, // optional
                createdAt: serverTimestamp(),
            });
            setSuccess('Incident signalé !');
            setPeriodeStart('');
            setPeriodeEnd('');
            setLogement('');
            setUrgence('');
            setDescription('');
            setPhoto(null);
        } catch (e) {
            setError(e.message);
        }
        setSubmitting(false);
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-3">
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="justify-content-center">
                <Col xs="auto" className="d-flex justify-content-center align-items-center">
                    {/* Période */}
                    <Form.Group className="mx-2">
                        <Form.Label>Période</Form.Label>
                        <div className="d-flex align-items-center gap-2">
                            <Form.Control 
                                type="date" 
                                value={periodeStart} 
                                onChange={(e) => setPeriodeStart(e.target.value)}
                                className="rounded-3"
                                required
                                disabled={submitting}
                            />
                            <span>à</span>
                            <Form.Control 
                                type="date" 
                                value={periodeEnd} 
                                onChange={(e) => setPeriodeEnd(e.target.value)}
                                className="rounded-3"
                                required
                                disabled={submitting}
                            />
                        </div>
                    </Form.Group>

                    {/* Logement */}
                    <Form.Group className="mx-2">
                        <Form.Label>Logement</Form.Label>
                        <Form.Control 
                            as="select" 
                            value={logement} 
                            onChange={(e) => setLogement(e.target.value)}
                            className="rounded-3"
                            disabled={submitting}
                        >
                            <option value="">Sélectionner le logement</option>
                            {logements.map(l => (
                                <option key={l.id} value={l.id}>{l.nom || l.id}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    {/* Urgence */}
                    <Form.Group className="mx-2">
                        <Form.Label>Urgence</Form.Label>
                        <Form.Control 
                            as="select" 
                            value={urgence} 
                            onChange={(e) => setUrgence(e.target.value)}
                            className="rounded-3"
                            disabled={submitting}
                        >
                            <option value="">Sélectionner l'urgence</option>
                            <option value="Haute">Haute (Urgence immédiate)</option>
                            <option value="Moyenne">Moyenne (À traiter rapidement)</option>
                            <option value="Basse">Basse (Non urgent)</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            <Row className="mt-3 justify-content-center">
                <Col xs={12} md={8}>
                    <Form.Group className="mb-3">
                        <Form.Label>Description de l'incident</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Décrivez l'incident..."
                            disabled={submitting}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Photo (optionnel)</Form.Label>
                        <Form.Control 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files[0])}
                            disabled={submitting}
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" disabled={submitting}>
                        {submitting ? 'Envoi...' : 'Envoyer'}
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

export default TravelerIncidentReportForm;