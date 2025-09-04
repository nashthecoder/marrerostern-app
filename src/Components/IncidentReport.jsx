import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Alert, Button, Form } from 'react-bootstrap';

function IncidentReport({ role }) {
  const [desc, setDesc] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');
      await addDoc(collection(db, 'incidents'), {
        description: desc,
        reporter: user.email,
        role,
        createdAt: serverTimestamp(),
      });
      setDesc('');
      setSuccess('Incident signalé !');
    } catch (e) {
      setError(e.message);
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h5>Signaler un incident</h5>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Control as="textarea" rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Décrivez l'incident..." required disabled={submitting} />
        <Button type="submit" className="mt-2" disabled={submitting || !desc}>Envoyer</Button>
      </Form>
    </div>
  );
}
export default IncidentReport;
