import React, { useState, useEffect } from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

function PrestataireDispo() {
    const [prestataires, setPrestataires] = useState([]);

    // Fonction pour récupérer les prestataires depuis Firestore
    useEffect(() => {
        const fetchPrestataires = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "prestataires"));
                const prestataireList = querySnapshot.docs.map(doc => doc.data());
                setPrestataires(prestataireList);
            } catch (error) {
                console.error("Erreur lors de la récupération des prestataires : ", error);
            }
        };

        fetchPrestataires();
    }, []);

    return (
        <Card border="success" className="mb-3" style={{ maxWidth: '18rem' }}>
            <Card.Body>
                <Card.Title as="h5">Prestataires Disponibles</Card.Title>
                <ListGroup variant="flush">
                    {prestataires.length > 0 ? (
                        prestataires.map((prestataire, index) => (
                            <ListGroup.Item key={index}>
                                <strong>Nom:</strong> {prestataire.nom}
                                <br />
                                <strong>Service:</strong> {prestataire.service}
                                <br />
                                <strong>Contact:</strong> {prestataire.contact}
                            </ListGroup.Item>
                        ))
                    ) : (
                        <ListGroup.Item>Aucun prestataire disponible</ListGroup.Item>
                    )}
                </ListGroup>
            </Card.Body>
        </Card>
    );
}

export default PrestataireDispo;