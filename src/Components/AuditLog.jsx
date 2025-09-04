import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Table, Spinner, Container } from 'react-bootstrap';

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const logList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(logList);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <Container className="mt-4">
      <h4>Audit Logs</h4>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.userId}</td>
                <td>{log.action}</td>
                <td>{log.resource}</td>
                <td><pre style={{margin:0,whiteSpace:'pre-wrap'}}>{JSON.stringify(log.details, null, 2)}</pre></td>
                <td>{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default AuditLog;
