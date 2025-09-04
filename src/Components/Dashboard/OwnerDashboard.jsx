import React from 'react';
import ResumeView from './ResumeView';
import AccesRapide from './AccesRapide';
import MySessions from '../MySessions';
import { Row, Col } from 'react-bootstrap';

function OwnerDashboard() {
  return (
    <>
      <ResumeView />
      <h3 className='mt-3 text-customs'>Accès rapide</h3>
      <AccesRapide />
      <Row className="mt-4">
        <Col xs={12}><MySessions /></Col>
      </Row>
      <Row className="mt-4">
        <Col md={6}><MyProperties /></Col>
        <Col md={6}><Messaging role="owner" /><IncidentReport role="owner" /></Col>
      </Row>
      {/* TODO: Add BudgetOverview, BookingCalendar, IncidentReport, Communication, and OwnedProperties components */}
    </>
  );
}
export default OwnerDashboard;
