import React from 'react';
import ResumeView from './ResumeView';
import AccesRapide from './AccesRapide';
import MySessions from '../MySessions';
import MyTasks from '../Provider/MyTasks';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTasks, FaComments, FaExclamationTriangle, FaFileInvoiceDollar } from 'react-icons/fa';

function ProviderDashboard() {
  return (
    <div className="space-y-6">
      <ResumeView />
      
      <div>
        <h3 className='mb-4 text-customs'>Accès rapide</h3>
        <AccesRapide />
      </div>

      {/* Quick Actions for Providers */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column">
              <FaTasks size={48} className="text-primary mb-3 mx-auto" />
              <h6>Mes Tâches</h6>
              <p className="text-muted small flex-grow-1">Voir et gérer les tâches assignées</p>
              <Button variant="outline-primary" size="sm" disabled>
                Déjà affiché
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column">
              <FaComments size={48} className="text-success mb-3 mx-auto" />
              <h6>Messages</h6>
              <p className="text-muted small flex-grow-1">Communiquer avec l'équipe</p>
              <Link to="/messages">
                <Button variant="outline-success" size="sm">Ouvrir Chat</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column">
              <FaExclamationTriangle size={48} className="text-warning mb-3 mx-auto" />
              <h6>Incidents</h6>
              <p className="text-muted small flex-grow-1">Signaler des problèmes</p>
              <Link to="/incidents">
                <Button variant="outline-warning" size="sm">Signaler</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column">
              <FaFileInvoiceDollar size={48} className="text-info mb-3 mx-auto" />
              <h6>Factures</h6>
              <p className="text-muted small flex-grow-1">Voir mes factures et paiements</p>
              <Button variant="outline-info" size="sm" disabled>
                Bientôt disponible
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12} className="mb-4">
          <MySessions />
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Mes Missions Assignées</h5>
            </Card.Header>
            <Card.Body>
              <MyTasks />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ProviderDashboard;
