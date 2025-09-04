import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Table, Spinner, Alert, Container, Card } from 'react-bootstrap';

function MySessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');
        const q = query(collection(db, `users/${user.uid}/devices`), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError('Failed to fetch sessions.');
      }
      setLoading(false);
    };
    fetchSessions();
  }, []);

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Body>
        <Card.Title style={{ color: '#234E5B' }}>Mes sessions actives</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>User Agent</th>
                <th>IP</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr key={session.id}>
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

export default MySessions;
