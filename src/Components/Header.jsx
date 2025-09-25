import React from 'react';
import Logout from './Logout';
import { Row, Col } from 'react-bootstrap';
import { FaChevronLeft } from 'react-icons/fa';



function Header({ title, setIsAuthenticated, isAuthenticated }) {
  return (
    <div className="d-flex align-items-center justify-content-between mb-4" style={{ gap: '16px' }}>
      <span style={{ fontWeight: 600, fontSize: '1.7rem' }}>{title}</span>
      {isAuthenticated && <Logout setIsAuthenticated={setIsAuthenticated} />}
    </div>
  );
}

export default Header;