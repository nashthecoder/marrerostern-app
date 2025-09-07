
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, query, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';


function Messaging({ role }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [thread, setThread] = useState([]);
  const [users, setUsers] = useState([]);
  const [recipient, setRecipient] = useState('');

  // Fetch all messages for the user (to build thread) and all users for recipient dropdown
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Non authentifié');
        // Fetch messages
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
        const snap = await getDocs(q);
        const userEmail = user.email;
        setMessages(
          snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(msg => msg.sender === userEmail || msg.recipient === userEmail)
        );
        // Fetch users
        const usersSnap = await getDocs(collection(db, 'users'));
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Update thread when subject or recipient changes
  useEffect(() => {
    if (!subject || !recipient) {
      setThread([]);
      return;
    }
    const user = auth.currentUser;
    if (!user) return;
    const userEmail = user.email;
    // Show all messages with same subject and user pair
    setThread(
      messages.filter(m =>
        m.subject === subject &&
        ((m.sender === userEmail && m.recipient === recipient) || (m.sender === recipient && m.recipient === userEmail))
      )
    );
  }, [subject, recipient, messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');
      if (!recipient) throw new Error('Veuillez sélectionner un destinataire.');
      await addDoc(collection(db, 'messages'), {
        subject,
        text: content,
        sender: user.email,
        role,
        createdAt: serverTimestamp(),
        recipient,
        participants: [user.email, recipient],
      });
      setContent('');
    } catch (e) {
      setError(e.message);
    }
    setSending(false);
  };

  // Filter recipient options based on current user's role
  const getRecipientOptions = () => {
    const user = auth.currentUser;
    if (!user) return [];
    const userEmail = user.email;
    if (role === 'admin') {
      // Admin can message anyone except self
      return users.filter(u => u.email && u.email !== userEmail);
    } else if (role === 'owner') {
      // Owner can message admin and travelers
      return users.filter(u => u.email && u.email !== userEmail && (u.role === 'admin' || u.role === 'traveler'));
    } else if (role === 'traveler') {
      // Traveler can message owners
      return users.filter(u => u.email && u.email !== userEmail && u.role === 'owner');
    } else if (role === 'provider') {
      // Provider can message admins
      return users.filter(u => u.email && u.email !== userEmail && u.role === 'admin');
    }
    return [];
  };

  return (
    <div>
      <h5>Messagerie</h5>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSend} className="mb-2">
        <Form.Group className="mb-2">
          <Form.Label>Destinataire</Form.Label>
          <Form.Select value={recipient} onChange={e => setRecipient(e.target.value)} required disabled={sending}>
            <option value="">Sélectionner un destinataire</option>
            {getRecipientOptions().map(u => (
              <option key={u.id} value={u.email}>{u.prenom || ''} {u.nom || ''} ({u.email}) [{u.role}]</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Sujet</Form.Label>
          <Form.Control value={subject} onChange={e => setSubject(e.target.value)} placeholder="Sujet du message" required disabled={sending} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Message</Form.Label>
          <Form.Control as="textarea" rows={2} value={content} onChange={e => setContent(e.target.value)} placeholder="Votre message..." required disabled={sending} />
        </Form.Group>
        <Button type="submit" className="mt-2" disabled={sending || !subject || !content || !recipient}>Envoyer</Button>
      </Form>
      {loading ? <Spinner animation="border" /> : null}
      {subject && recipient && thread.length > 0 && (
        <div className="mt-4 p-3 border rounded bg-light">
          <h6>Fil de discussion: <b>{subject}</b></h6>
          {thread.map((msg, i) => (
            <div key={msg.id || i} style={{marginBottom:8}}>
              <div><b>{msg.sender}</b> {msg.createdAt && (msg.createdAt.toDate ? msg.createdAt.toDate().toLocaleString() : '')}</div>
              <div style={{marginLeft:10}}>{msg.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Messaging;
