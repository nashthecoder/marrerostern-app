
import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function TravelerProfile() {
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      setLoading(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setProfile({ id: snap.id, ...snap.data() });
          setFormData({
            phone: snap.data().phone || '',
            address: snap.data().address || '',
          });
        }
      } catch (e) {
        setError('Erreur chargement profil');
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        phone: formData.phone,
        address: formData.address,
      });
      setSuccess('Profil mis à jour !');
      setEditMode(false);
      setProfile(prev => ({ ...prev, ...formData }));
    } catch (e) {
      setError('Erreur mise à jour profil');
    }
    setSaving(false);
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Card>
      <Card.Body>
        <Card.Title>Mon profil</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <div><b>Profil ID:</b> {profile?.id}</div>
        <div><b>Email:</b> {user?.email || 'Non connecté'}</div>
        {!editMode ? (
          <>
            <div><b>Téléphone:</b> {profile?.phone || '-'}</div>
            <div><b>Adresse:</b> {profile?.address || '-'}</div>
            <Button variant="outline-primary" className="mt-3" onClick={() => setEditMode(true)}>Modifier</Button>
          </>
        ) : (
          <Form className="mt-3">
            <Form.Group className="mb-2">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control name="phone" value={formData.phone} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Adresse</Form.Label>
              <Form.Control name="address" value={formData.address} onChange={handleChange} />
            </Form.Group>
            <Button variant="success" onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>{' '}
            <Button variant="secondary" onClick={() => setEditMode(false)} disabled={saving}>Annuler</Button>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
}
export default TravelerProfile;
