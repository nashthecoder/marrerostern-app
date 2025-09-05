import React from 'react';
import Logout from './Logout';
import { Row, Col } from 'react-bootstrap';

function Header({ title, setIsAuthenticated, isAuthenticated }) {
  return (
    <Row className="align-items-center justify-content-between mb-4">
      <Col>
        <h2>{title}</h2>
      </Col>
      {isAuthenticated && (
        <Col xs="auto" className="ms-auto">
          <Logout setIsAuthenticated={setIsAuthenticated} />
        </Col>
      )}
    </Row>
  );
}

export default Header;