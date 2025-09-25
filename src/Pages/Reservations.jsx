// src/Pages/Reservations.jsx
import React, { useState } from 'react';
import Header from '../Components/Header';
import { Button, Container, Modal, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import CreateReservation from '../Components/Reservations/CreateReservation';
import ViewReservations from '../Components/Reservations/ViewReservations';
import SigneReservation from '../Components/Reservations/SigneReservation';
import AllProperties from '../Components/AllProperties';
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
        <Tabs defaultActiveKey="reservations" id="reservations-tabs" className="mb-4">
          <Tab eventKey="reservations" title="Réservations">
            <div className="my-3">
              <Button
                onClick={handleOpen}
                style={{ backgroundColor: '#234E5B', color: '#FFF', border: 'none' }}
                className="d-flex align-items-center gap-2"
              >
                <Plus size={20} />
                Créer une réservation
              </Button>
            </div>
            <Modal show={showModal} onHide={handleClose} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>Créer une Réservation</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <CreateReservation onSuccess={handleClose} />
              </Modal.Body>
            </Modal>
            <ViewReservations />
            <Row>
              <Col md={6} xs={12}>
                <MissionNoplanifier />
              </Col>
              <Col md={6} xs={12}>
                <PrestataireDispo />
              </Col>
            </Row>
          </Tab>
          <Tab eventKey="properties" title="Toutes les propriétés">
            <AllProperties paginated={true} pageSize={5} />
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}

export default Reservations;