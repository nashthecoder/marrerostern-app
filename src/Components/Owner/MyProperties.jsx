import React, { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';

function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });
  const [editId, setEditId] = useState(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');
      const q = query(collection(db, 'properties'), where('owner', '==', user.email));
      const snap = await getDocs(q);
      setProperties(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');
      if (editId) {
        await updateDoc(doc(db, 'properties', editId), { ...form });
      } else {
        await addDoc(collection(db, 'properties'), { ...form, owner: user.email });
      }
      setShowModal(false);
      setForm({ name: '', address: '' });
      setEditId(null);
      fetchProperties();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEdit = (property) => {
    setForm({ name: property.name, address: property.address });
    setEditId(property.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce logement ?')) return;
    await deleteDoc(doc(db, 'properties', id));
    fetchProperties();
  };

  return (
    <div>
      <h5>Mes logements</h5>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button onClick={() => { setShowModal(true); setEditId(null); setForm({ name: '', address: '' }); }} className="mb-2">Ajouter un logement</Button>
      {loading ? <Spinner animation="border" /> : (
        <Table bordered hover>
          <thead>
            <tr><th>Nom</th><th>Adresse</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.address}</td>
                <td>
                  <Button size="sm" onClick={() => handleEdit(p)} className="me-2">Éditer</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>Supprimer</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editId ? 'Éditer' : 'Ajouter'} un logement</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            </Form.Group>
            <Button type="submit">Enregistrer</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
export default MyProperties;
