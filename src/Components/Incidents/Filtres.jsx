import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';

function Filtres() {
    const [periode, setPeriode] = useState('Tous');
    const [logement, setLogement] = useState('Tous');
    const [urgence, setUrgence] = useState('Tous');

    return (
        <Row className="justify-content-center mb-3">
            <Col xs="auto" className="d-flex justify-content-center align-items-center">
                {/* Période */}
                <Form.Group className="mx-2">
                    <Form.Control 
                        as="select" 
                        value={periode} 
                        onChange={(e) => setPeriode(e.target.value)}
                        className="rounded-3"
                    >
                        <option value="Tous" disabled>Période : Tous</option>
                        <option value="1 semaine">1 semaine</option>
                        <option value="1 mois">1 mois</option>
                        <option value="3 mois">3 mois</option>
                    </Form.Control>
                </Form.Group>

                {/* Logement */}
                <Form.Group className="mx-2">
                    <Form.Control 
                        as="select" 
                        value={logement} 
                        onChange={(e) => setLogement(e.target.value)}
                        className="rounded-3"
                    >
                        <option value="Tous" disabled>Logement : Tous</option>
                        <option value="Appartement">Appartement</option>
                        <option value="Maison">Maison</option>
                        <option value="Chambre">Chambre</option>
                    </Form.Control>
                </Form.Group>

                {/* Urgence */}
                <Form.Group className="mx-2">
                    <Form.Control 
                        as="select" 
                        value={urgence} 
                        onChange={(e) => setUrgence(e.target.value)}
                        className="rounded-3"
                    >
                        <option value="Tous" disabled>Urgence : Tous</option>
                        <option value="Haute">Haute</option>
                        <option value="Moyenne">Moyenne</option>
                        <option value="Basse">Basse</option>
                    </Form.Control>
                </Form.Group>
            </Col>
        </Row>
    );
}

export default Filtres;