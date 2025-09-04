import React from 'react';
import ResumeView from './ResumeView';
import RepartitionMission from './RepartitionMission';
import RepartitionStatus from './RepartitionStatus';
import AccesRapide from './AccesRapide';
import AllUserSessions from '../AllUserSessions';
import AuditLog from '../AuditLog';
import { Row, Col, Card } from 'react-bootstrap';

function AdminDashboard() {
  return (
    <>
      <ResumeView />
      <Row className="mt-4">
        <Col md={6} sm={12}><RepartitionMission /></Col>
        <Col md={6} sm={12}><RepartitionStatus /></Col>
      </Row>
      <h3 className='mt-3 text-customs'>Accès rapide</h3>
      <AccesRapide />
      <Row className="mt-4">
        <Col xs={12}><AllUserSessions /></Col>
      </Row>
      <Row className="mt-4">
        <Col xs={12}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title className="mb-3" style={{ color: '#234E5B' }}>Journal d'audit</Card.Title>
              <div style={{overflowX:'auto'}}><AuditLog /></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
  <Messaging role="admin" />
  <IncidentReport role="admin" />
  {/* TODO: Add user management, incident validation, task assignment, invoice generation, all reservations/incidents, stock monitoring, reviews, and messaging shortcuts */}
    </>
  );
}
export default AdminDashboard;
