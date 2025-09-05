import React, { useEffect, useState } from 'react';
import { auth, db } from '../../../firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Table, Spinner, Alert } from 'react-bootstrap';

function TravelerMessagesTable() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [senderFilter, setSenderFilter] = useState('');
  const pageSize = 10;

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Utilisateur non authentifié');
        const q = query(
          collection(db, 'messages'),
          where('participants', 'array-contains-any', [user.uid, user.email]),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchMessages();
  }, []);

  // Filtered messages by search and sender
  const filteredMessages = messages.filter(msg => {
    const searchMatch =
      search === '' ||
      (msg.subject && msg.subject.toLowerCase().includes(search.toLowerCase())) ||
      (msg.text && msg.text.toLowerCase().includes(search.toLowerCase()));
    const senderMatch = senderFilter === '' || msg.sender === senderFilter;
    return searchMatch && senderMatch;
  });
  const pagedMessages = filteredMessages.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredMessages.length / pageSize);
  // Unique senders for filter dropdown
  const uniqueSenders = Array.from(new Set(messages.map(m => m.sender).filter(Boolean)));

  return (
    <div>
      <h5>Mes messages</h5>
      <div className="d-flex mb-2 gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Recherche par sujet ou contenu..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{maxWidth: 250}}
        />
        <select
          className="form-select"
          value={senderFilter}
          onChange={e => { setSenderFilter(e.target.value); setPage(0); }}
          style={{maxWidth: 200}}
        >
          <option value="">Tous les expéditeurs</option>
          {uniqueSenders.map(sender => (
            <option key={sender} value={sender}>{sender}</option>
          ))}
        </select>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Spinner animation="border" /> : (
        <>
        <Table bordered hover responsive style={{width:'100%'}}>
          <thead>
            <tr>
              <th>Sujet</th>
              <th>Contenu</th>
              <th>De</th>
              <th>À</th>
              <th>Date/Heure</th>
            </tr>
          </thead>
          <tbody>
            {pagedMessages.length === 0 ? (
              <tr><td colSpan={5}>Aucun message trouvé.</td></tr>
            ) : pagedMessages.map(msg => (
              <tr key={msg.id}>
                <td>{msg.subject || '(Sans sujet)'}</td>
                <td>{msg.text}</td>
                <td>{msg.sender}</td>
                <td>{msg.recipient}</td>
                <td>{msg.createdAt && msg.createdAt.toDate ? msg.createdAt.toDate().toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Précédent</button>
          <span>Page {page + 1} / {totalPages || 1}</span>
          <button className="btn btn-secondary" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Suivant</button>
        </div>
        </>
      )}
    </div>
  );
}
export default TravelerMessagesTable;
