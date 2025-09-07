import React, { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaUsers, FaClipboardCheck, FaTools } from 'react-icons/fa';
import { Row, Col, Card } from 'react-bootstrap';

function ResumeView() {
  const [userCount, setUserCount] = useState(0);
  const [missionsInProgress, setMissionsInProgress] = useState(0);
  const [openIncidents, setOpenIncidents] = useState(0);

  useEffect(() => {
    async function fetchCounts() {
      try {
        // Users
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        console.log('User count snapshot:', usersSnap.data());
        setUserCount(usersSnap.data().count || 0);

        // Missions in progress
        const missionsQ = query(collection(db, 'missions'), where('status', '==', 'In progress'));
        const missionsSnap = await getCountFromServer(missionsQ);
        console.log('Missions in progress snapshot:', missionsSnap.data());
        setMissionsInProgress(missionsSnap.data().count || 0);

        // Incidents ouverts (À faire or En cours)
        const incidentsAFaireQ = query(collection(db, 'incidents'), where('status', '==', 'À faire'));
        const incidentsEnCoursQ = query(collection(db, 'incidents'), where('status', '==', 'En cours'));
        const [incidentsAFaireSnap, incidentsEnCoursSnap] = await Promise.all([
          getCountFromServer(incidentsAFaireQ),
          getCountFromServer(incidentsEnCoursQ)
        ]);
        const openCount = (incidentsAFaireSnap.data().count || 0) + (incidentsEnCoursSnap.data().count || 0);
        console.log('Incidents ouverts (À faire):', incidentsAFaireSnap.data(), 'Incidents ouverts (En cours):', incidentsEnCoursSnap.data());
        setOpenIncidents(openCount);
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
      }
    }
    fetchCounts();
  }, []);
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
              <h3 style={numberStyle}>{userCount}</h3>
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
              <h3 style={numberStyle}>{missionsInProgress}</h3>
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
              <h3 style={numberStyle}>{openIncidents}</h3>
              <small style={labelStyle}>Incidents ouverts</small>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default ResumeView;