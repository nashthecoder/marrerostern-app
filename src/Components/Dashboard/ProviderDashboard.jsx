import React from 'react';
import ResumeView from './ResumeView';
import AccesRapide from './AccesRapide';
import MySessions from '../MySessions';
import { Row, Col } from 'react-bootstrap';

function ProviderDashboard() {
  return (
    <>
      <ResumeView />
      <h3 className='mt-3 text-customs'>Accès rapide</h3>
      <AccesRapide />
      <Row className="mt-4">
        <Col xs={12}><MySessions /></Col>
      </Row>
      <Row className="mt-4">
        <Col md={6}><MyTasks /></Col>
        <Col md={6}><Messaging role="provider" /><IncidentReport role="provider" /></Col>
      </Row>
      {/* TODO: Add AssignedTasks, TaskChecklist, IncidentReport, StockLevels, Invoices, Ratings, and Messaging components */}
    </>
  );
}
export default ProviderDashboard;
