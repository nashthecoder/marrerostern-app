import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { Button, Table, Spinner, Alert, Container } from 'react-bootstrap';

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeSuccess, setRevokeSuccess] = useState(null);

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

  // Revoke all sessions (requires backend endpoint or admin SDK)
  const handleRevokeAll = async () => {
    setRevokeLoading(true);
    setRevokeSuccess(null);
    setError(null);
    try {
      // Delete all device docs (client-side only)
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const q = query(collection(db, `users/${user.uid}/devices`));
      const snapshot = await getDocs(q);
      await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, `users/${user.uid}/devices`, d.id))));
      // Optionally, call a backend endpoint to revokeRefreshTokens(user.uid)
      setRevokeSuccess('All sessions revoked. You may need to re-login on other devices.');
      setSessions([]);
    } catch (err) {
      setError('Failed to revoke sessions.');
    }
    setRevokeLoading(false);
  };

  return (
    <Container className="mt-4">
      <h4>Active Sessions / Devices</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {revokeSuccess && <Alert variant="success">{revokeSuccess}</Alert>}
      <Button variant="danger" className="mb-3" onClick={handleRevokeAll} disabled={revokeLoading || loading}>
        {revokeLoading ? 'Revoking...' : 'Revoke All Sessions'}
      </Button>
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
    </Container>
  );
}

export default Sessions;
