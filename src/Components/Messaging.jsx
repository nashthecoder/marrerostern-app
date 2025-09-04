import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, query, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { Alert, Button, Form, ListGroup, Spinner } from 'react-bootstrap';

function Messaging({ role }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Non authentifié');
        // Show all messages for now, filter by role if needed
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setMessages(snap.docs.map(doc => doc.data()));
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
        text,
        sender: user.email,
        role,
        createdAt: serverTimestamp(),
      });
      setText('');
      // Optionally refetch
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
        <Form.Control value={text} onChange={e => setText(e.target.value)} placeholder="Votre message..." required disabled={sending} />
        <Button type="submit" className="mt-2" disabled={sending || !text}>Envoyer</Button>
      </Form>
      {loading ? <Spinner animation="border" /> : (
        <ListGroup>
          {messages.map((msg, i) => (
            <ListGroup.Item key={i}>
              <b>{msg.sender}</b> ({msg.role}): {msg.text}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
export default Messaging;
