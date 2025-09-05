
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, query, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { Alert, Button, Form, ListGroup, Spinner } from 'react-bootstrap';

function Messaging({ role }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Non authentifié');
        // Only show messages where user is sender or recipient
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const userEmail = user.email;
        setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(msg => msg.sender === userEmail || msg.recipient === userEmail));
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchMessages();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');
      await addDoc(collection(db, 'messages'), {
        subject,
        text: content,
        sender: user.email,
        role,
        createdAt: serverTimestamp(),
        recipient: '', // You can add recipient selection if needed
      });
      setSubject('');
      setContent('');
    } catch (e) {
      setError(e.message);
    }
    setSending(false);
  };

  return (
    <div>
      <h5>Messagerie</h5>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSend} className="mb-2">
        <Form.Group className="mb-2">
          <Form.Label>Sujet</Form.Label>
          <Form.Control value={subject} onChange={e => setSubject(e.target.value)} placeholder="Sujet du message" required disabled={sending} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Message</Form.Label>
          <Form.Control as="textarea" rows={2} value={content} onChange={e => setContent(e.target.value)} placeholder="Votre message..." required disabled={sending} />
        </Form.Group>
        <Button type="submit" className="mt-2" disabled={sending || !subject || !content}>Envoyer</Button>
      </Form>
      {loading ? <Spinner animation="border" /> : (
        <ListGroup>
          {messages.map((msg, i) => (
            <ListGroup.Item key={msg.id || i}>
              <div style={{fontSize:'0.95em'}}>
                <b>{msg.subject || '(Sans sujet)'}</b>
                <div style={{color:'#555'}}>{msg.text}</div>
                <div style={{fontSize:'0.85em', color:'#888'}}>
                  <span>De: <b>{msg.sender}</b> ({msg.role})</span>
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
      )}
    </div>
  );
}
export default Messaging;
