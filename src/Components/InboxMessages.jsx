import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Alert, ListGroup, Spinner, Form, Row, Col, Button } from 'react-bootstrap';

function InboxMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ user: '', subject: '' });
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10;

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Non authentifié');
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const userEmail = user.email;
        setMessages(
          snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(msg => msg.sender === userEmail || msg.recipient === userEmail)
        );
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchMessages();
  }, []);

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filtered = messages.filter(msg => {
    let match = true;
    if (filters.user && !(msg.sender?.toLowerCase().includes(filters.user.toLowerCase()) || msg.recipient?.toLowerCase().includes(filters.user.toLowerCase()))) match = false;
    if (filters.subject && !(msg.subject || '').toLowerCase().includes(filters.subject.toLowerCase())) match = false;
    return match;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / messagesPerPage);
  const paginated = filtered.slice((currentPage - 1) * messagesPerPage, currentPage * messagesPerPage);

  const openThread = msg => {
    setSelected(msg);
    // Show all messages with same subject and user pair
    setThread(messages.filter(m =>
      m.subject === msg.subject &&
      ((m.sender === msg.sender && m.recipient === msg.recipient) || (m.sender === msg.recipient && m.recipient === msg.sender))
    ));
  };

  return (
    <div>
      <h5>Boîte de réception</h5>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form className="mb-2">
        <Row>
          <Col md={5} className="mb-2">
            <Form.Control name="user" value={filters.user} onChange={handleFilterChange} placeholder="Filtrer par utilisateur" />
          </Col>
          <Col md={5} className="mb-2">
            <Form.Control name="subject" value={filters.subject} onChange={handleFilterChange} placeholder="Filtrer par sujet" />
          </Col>
          <Col md={2} className="mb-2">
            <Button variant="secondary" onClick={() => setFilters({ user: '', subject: '' })}>Réinitialiser</Button>
          </Col>
        </Row>
      </Form>
      {loading ? <Spinner animation="border" /> : (
        <>
          <ListGroup>
            {paginated.map((msg, i) => (
              <ListGroup.Item key={msg.id || i} action onClick={() => openThread(msg)} active={selected && selected.id === msg.id}>
                <div style={{fontSize:'0.95em'}}>
                  <b>{msg.subject || '(Sans sujet)'}</b>
                  <div style={{color:'#555'}}>{msg.text}</div>
                  <div style={{fontSize:'0.85em', color:'#888'}}>
                    <span>De: <b>{msg.sender}</b></span>
                    {msg.recipient && <span> &rarr; <b>{msg.recipient}</b></span>}
                    {msg.createdAt && (
                      <span style={{float:'right'}}>
                        {msg.createdAt.toDate ? msg.createdAt.toDate().toLocaleString() : ''}
                      </span>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <nav>
                <ul className="pagination">
                  <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>&laquo;</button>
                  </li>
                  {[...Array(totalPages)].map((_, idx) => (
                    <li key={idx} className={`page-item${currentPage === idx + 1 ? ' active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>&raquo;</button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
      {selected && (
        <div className="mt-4 p-3 border rounded bg-light">
          <h6>Fil de discussion: <b>{selected.subject || '(Sans sujet)'}</b></h6>
          {thread.map((msg, i) => (
            <div key={msg.id || i} style={{marginBottom:8}}>
              <div><b>{msg.sender}</b> {msg.createdAt && (msg.createdAt.toDate ? msg.createdAt.toDate().toLocaleString() : '')}</div>
              <div style={{marginLeft:10}}>{msg.text}</div>
            </div>
          ))}
          <Button size="sm" variant="outline-secondary" className="mt-2" onClick={() => setSelected(null)}>Fermer</Button>
        </div>
      )}
    </div>
  );
}

export default InboxMessages;
