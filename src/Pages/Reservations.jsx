// src/Pages/Reservations.jsx
import React, { useState } from 'react';
import Header from '../Components/Header';
import { Button, Container, Modal, Row, Col } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import CreateReservation from '../Components/Reservations/CreateReservation';
import ViewReservations from '../Components/Reservations/ViewReservations';
import SigneReservation from '../Components/Reservations/SigneReservation';
import MissionNoplanifier from '../Components/Reservations/MissionNoplanifier';
import PrestataireDispo from '../Components/Reservations/PrestataireDispo';

function Reservations() {
  const [showModal, setShowModal] = useState(false);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <>
      <Header title="Réservations et missions" setIsAuthenticated={() => {}} />

      <Container className="mt-4">
        <Button
          onClick={handleOpen}
          style={{ backgroundColor: '#234E5B', color: '#FFF', border: 'none' }}
          className="d-flex align-items-center gap-2"
        >
          <Plus size={20} />
          Créer une réservation
        </Button>
      </Container>

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Créer une Réservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateReservation onSuccess={handleClose} />
        </Modal.Body>
      </Modal>
      <div className="container">
        <ViewReservations />
        <SigneReservation />
        <Row>
          <Col md={6} xs={12}>
           <MissionNoplanifier /> 
          </Col>
          <Col md={6} xs={12}>
            <PrestataireDispo />
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Reservations;