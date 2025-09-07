import React from 'react';
import { FaUsers, FaClipboardCheck, FaTools } from 'react-icons/fa';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function AccesRapide() {
  const iconCircleStyle = {
    backgroundColor: '#4D7399',
    borderRadius: '50%',
    padding: '15px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60px',
    height: '60px',
    fontSize: '24px',
    marginRight: '15px',
  };

  const labelStyle = {
    color: '#000000',
    fontWeight: 500,
  };

  return (
    <Row className="g-4">
      {/* Gestion d'utilisateur */}
      <Col md={4} sm={12}>
        <Link to="/users" style={{ textDecoration: 'none' }}>
          <Card className="shadow-sm text-center">
            <Card.Body className="d-flex align-items-center">
              <div style={iconCircleStyle}>
                <FaUsers />
              </div>
              <div>
                <small style={labelStyle}>Gestion d'utilisateur</small>
              </div>
            </Card.Body>
          </Card>
        </Link>
      </Col>

      {/* Gestion des missions */}
      <Col md={4} sm={12}>
        <Link to="/mission-management" style={{ textDecoration: 'none' }}>
          <Card className="shadow-sm text-center">
            <Card.Body className="d-flex align-items-center">
              <div style={iconCircleStyle}>
                <FaClipboardCheck />
              </div>
              <div>
                <small style={labelStyle}>Gestion des missions</small>
              </div>
            </Card.Body>
          </Card>
        </Link>
      </Col>

      {/* Gestion des incidents */}
      <Col md={4} sm={12}>
        <Link to="/incidents" style={{ textDecoration: 'none' }}>
          <Card className="shadow-sm text-center">
            <Card.Body className="d-flex align-items-center">
              <div style={iconCircleStyle}>
                <FaTools />
              </div>
              <div>
                <small style={labelStyle}>Gestion des incidents</small>
              </div>
            </Card.Body>
          </Card>
        </Link>
      </Col>
    </Row>
  );
}

export default AccesRapide;