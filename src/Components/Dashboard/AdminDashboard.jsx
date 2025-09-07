import React from 'react';
import ResumeView from './ResumeView';
import RepartitionMission from './RepartitionMission';
import RepartitionStatus from './RepartitionStatus';
import AccesRapide from './AccesRapide';
// import AllUserSessions from '../AllUserSessions';
import AuditLog from '../AuditLog';

// import AllProperties from '../AllProperties';
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


      {/* AuditLog removed from dashboard. Now available on /users page under its own tab. */}
  {/* TODO: Add user management, incident validation, task assignment, invoice generation, all reservations/incidents, stock monitoring, reviews, and messaging shortcuts */}
    </>
  );
}
export default AdminDashboard;
