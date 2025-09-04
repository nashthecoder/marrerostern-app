import React, { useState, useEffect } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { db } from "../../../firebase"; 
import { collection, getDocs } from "firebase/firestore";

function MissionNoplanifier() {
    const [missions, setMissions] = useState([]);

    // Fonction pour récupérer les données depuis Firestore
    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "missions"));
                const missionList = querySnapshot.docs.map(doc => doc.data());
                setMissions(missionList);
            } catch (error) {
                console.error("Erreur lors de la récupération des missions : ", error);
            }
        };

        fetchMissions();
    }, []);

    return (
        <Card border="primary" className="mb-3" style={{ maxWidth: '18rem' }}>
            <Card.Body>
                <Card.Title as="h5">Mission non planifiée</Card.Title>
                <ListGroup variant="flush">
                    {missions.length > 0 ? (
                        missions.map((mission, index) => (
                            <ListGroup.Item key={index}>
                                <strong>Logement:</strong> {mission.logement}
                                <br />
                                <strong>Date:</strong> {mission.date}
                            </ListGroup.Item>
                        ))
                    ) : (
                        <ListGroup.Item>Aucune mission à afficher</ListGroup.Item>
                    )}
                </ListGroup>
            </Card.Body>
        </Card>
    );
}

export default MissionNoplanifier;