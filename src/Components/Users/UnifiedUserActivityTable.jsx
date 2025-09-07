import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { collection, collectionGroup, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { Table, Spinner, Alert, Container, Card, Pagination, Row, Col, Form, Button } from 'react-bootstrap';

const PAGE_SIZE = 15;

function UnifiedUserActivityTable() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ resource: '', action: '', from: '', to: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch audit logs
        const auditQ = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));
        const auditSnap = await getDocs(auditQ);
        const auditData = auditSnap.docs.map(doc => ({
          id: doc.id,
          type: 'Audit Log',
          userId: doc.data().userId,
          action: doc.data().action,
          resource: doc.data().resource,
          details: doc.data().details,
          userAgent: '',
          ip: '',
          timestamp: doc.data().timestamp,
        }));
        // Fetch sessions
        const sessionQ = query(collectionGroup(db, 'devices'), orderBy('timestamp', 'desc'));
        const sessionSnap = await getDocs(sessionQ);
        const sessionData = sessionSnap.docs.map(doc => ({
          id: doc.id,
          type: 'Session',
          userId: doc.ref.parent.parent ? doc.ref.parent.parent.id : 'unknown',
          action: doc.data().event || 'login',
          resource: doc.data().userAgent || '',
          details: doc.data().ip || '',
          userAgent: doc.data().userAgent || '',
          ip: doc.data().ip || '',
          timestamp: doc.data().timestamp,
        }));
        setActivity([...auditData, ...sessionData].sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
      } catch (err) {
        setError('Failed to fetch user activity.');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filtering
  const filtered = activity.filter(row => {
    const { resource, action, from, to } = filters;
    let match = true;
    if (resource && !(row.resource || '').toLowerCase().includes(resource.toLowerCase())) match = false;
    if (action && !(row.action || '').toLowerCase().includes(action.toLowerCase())) match = false;
    if (from) {
      const fromDate = new Date(from);
      if (row.timestamp?.toDate && row.timestamp.toDate() < fromDate) match = false;
    }
    if (to) {
      const toDate = new Date(to);
      if (row.timestamp?.toDate && row.timestamp.toDate() > toDate) match = false;
    }
    return match;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Body>
        <Card.Title style={{ color: '#234E5B' }}>User Activity (Audit Logs & Sessions)</Card.Title>
        <Form className="mb-3">
          <Row>
            <Col md={3} className="mb-2">
              <Form.Control name="resource" value={filters.resource} onChange={handleFilterChange} placeholder="Filter by Resource/User Agent" />
            </Col>
            <Col md={3} className="mb-2">
              <Form.Control name="action" value={filters.action} onChange={handleFilterChange} placeholder="Filter by Action/Event" />
            </Col>
            <Col md={2} className="mb-2">
              <Form.Control type="date" name="from" value={filters.from} onChange={handleFilterChange} placeholder="From" />
            </Col>
            <Col md={2} className="mb-2">
              <Form.Control type="date" name="to" value={filters.to} onChange={handleFilterChange} placeholder="To" />
            </Col>
            <Col md={2} className="mb-2">
              <Button variant="secondary" onClick={() => setFilters({ resource: '', action: '', from: '', to: '' })}>Reset</Button>
            </Col>
          </Row>
        </Form>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Type</th>
                  <th>Action/Event</th>
                  <th>Resource/User Agent</th>
                  <th>Details/IP</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map(row => (
                  <tr key={row.type + row.id + row.timestamp?.seconds}>
                    <td>{row.userId}</td>
                    <td>{row.type}</td>
                    <td>{row.action}</td>
                    <td style={{wordBreak:'break-all'}}>{row.resource}</td>
                    <td style={{wordBreak:'break-all'}}>{typeof row.details === 'object' ? JSON.stringify(row.details) : row.details}</td>
                    <td>{row.timestamp?.toDate ? row.timestamp.toDate().toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item key={idx+1} active={idx+1 === currentPage} onClick={() => setCurrentPage(idx+1)}>
                    {idx+1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default UnifiedUserActivityTable;
