import React from 'react';
import { FaUsers, FaClipboardCheck, FaTools } from 'react-icons/fa';
import { Row, Col, Card } from 'react-bootstrap';

function ResumeView() {
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

  const numberStyle = {
    color: '#000000',
    fontWeight: 900,
    fontSize: 32,
    marginBottom: 0,
  };

  const labelStyle = {
    color: '#000000',
    fontWeight: 500,
  };

  return (
    <Row className="g-4">
      {/* Utilisateurs */}
      <Col md={4} sm={12}>
        <Card className="shadow-sm text-center">
          <Card.Body className="d-flex align-items-center custom-card">
            <div style={iconCircleStyle}>
              <FaUsers />
            </div>
            <div>
              <h3 style={numberStyle}>125</h3>
              <small style={labelStyle}>Utilisateurs</small>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Missions en cours */}
      <Col md={4} sm={12}>
        <Card className="shadow-sm text-center">
          <Card.Body className="d-flex align-items-center">
            <div style={iconCircleStyle}>
              <FaClipboardCheck />
            </div>
            <div>
              <h3 style={numberStyle}>42</h3>
              <small style={labelStyle}>Missions en cours</small>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Incidents ouverts */}
      <Col md={4} sm={12}>
        <Card className="shadow-sm text-center">
          <Card.Body className="d-flex align-items-center">
            <div style={iconCircleStyle}>
              <FaTools />
            </div>
            <div>
              <h3 style={numberStyle}>8</h3>
              <small style={labelStyle}>Incidents ouverts</small>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default ResumeView;