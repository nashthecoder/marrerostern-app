import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collectionGroup, getDocs, orderBy, query } from 'firebase/firestore';
import { Table, Spinner, Alert, Container, Card } from 'react-bootstrap';

function AllUserSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Query all devices subcollections for all users
        const q = query(collectionGroup(db, 'devices'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        setSessions(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          userId: doc.ref.parent.parent ? doc.ref.parent.parent.id : 'unknown',
        })));
      } catch (err) {
        setError('Failed to fetch all user sessions.');
      }
      setLoading(false);
    };
    fetchSessions();
  }, []);

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Body>
        <Card.Title style={{ color: '#234E5B' }}>Sessions actives de tous les utilisateurs</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>User ID</th>
                <th>User Agent</th>
                <th>IP</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr key={session.id + session.userId}>
                  <td>{session.userId}</td>
                  <td style={{wordBreak:'break-all'}}>{session.userAgent}</td>
                  <td>{session.ip}</td>
                  <td>{session.timestamp?.toDate ? session.timestamp.toDate().toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}

export default AllUserSessions;
