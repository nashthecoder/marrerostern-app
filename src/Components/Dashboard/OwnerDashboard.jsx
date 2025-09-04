import React from 'react';
import ResumeView from './ResumeView';
import AccesRapide from './AccesRapide';
import MySessions from '../MySessions';
import MyProperties from '../Owner/MyProperties';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaChartLine, FaCalendarAlt, FaComments, FaWarehouse } from 'react-icons/fa';

function OwnerDashboard() {
  return (
    <div className="space-y-6">
      <ResumeView />
      
      <div>
        <h3 className='mb-4 text-customs'>Accès rapide</h3>
        <AccesRapide />
      </div>

      {/* Quick Actions for Owners */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column">
              <FaChartLine size={48} className="text-success mb-3 mx-auto" />
              <h6>Budget Overview</h6>
              <p className="text-muted small flex-grow-1">Suivez vos revenus et dépenses</p>
              <Link to="/budget">
                <Button variant="outline-success" size="sm">Voir Dashboard</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column">
              <FaCalendarAlt size={48} className="text-primary mb-3 mx-auto" />
              <h6>Calendrier</h6>
              <p className="text-muted small flex-grow-1">Gérez vos réservations</p>
              <Link to="/calendar">
                <Button variant="outline-primary" size="sm">Ouvrir Calendrier</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column">
              <FaComments size={48} className="text-info mb-3 mx-auto" />
              <h6>Messages</h6>
              <p className="text-muted small flex-grow-1">Communiquez avec votre équipe</p>
              <Link to="/messages">
                <Button variant="outline-info" size="sm">Voir Messages</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column">
              <FaWarehouse size={48} className="text-warning mb-3 mx-auto" />
              <h6>Stock</h6>
              <p className="text-muted small flex-grow-1">Gérez vos inventaires</p>
              <Link to="/stock">
                <Button variant="outline-warning" size="sm">Voir Stock</Button>
              </Link>
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
          <MyProperties />
        </Col>
      </Row>
    </div>
  );
}

export default OwnerDashboard;
