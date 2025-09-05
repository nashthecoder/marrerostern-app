import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function AdminProfile() {
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

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		setSuccess('');
		try {
			const userRef = doc(db, 'users', user.uid);
			await updateDoc(userRef, formData);
			setSuccess('Profil mis à jour');
			setEditMode(false);
			setProfile(prev => ({ ...prev, ...formData }));
		} catch (e) {
			setError('Erreur mise à jour profil');
		}
		setSaving(false);
	};

	if (loading) return <Spinner animation="border" />;
	if (!profile) return <Alert variant="danger">Profil non trouvé</Alert>;

	return (
		<Card>
			<Card.Body>
				<Card.Title>Mon profil (Admin)</Card.Title>
				{error && <Alert variant="danger">{error}</Alert>}
				{success && <Alert variant="success">{success}</Alert>}
				<Form onSubmit={handleSave}>
					<Form.Group className="mb-3">
						<Form.Label>ID</Form.Label>
						<Form.Control value={profile.id} disabled />
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Email</Form.Label>
						<Form.Control value={profile.email} disabled />
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Adresse</Form.Label>
						<Form.Control name="address" value={formData.address} onChange={handleChange} disabled={!editMode} />
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Téléphone</Form.Label>
						<Form.Control name="phone" value={formData.phone} onChange={handleChange} disabled={!editMode} />
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Rôle</Form.Label>
						<Form.Control value={profile.role} disabled />
					</Form.Group>
					{editMode ? (
						<Button type="submit" disabled={saving}>{saving ? 'Sauvegarde...' : 'Enregistrer'}</Button>
					) : (
						<Button onClick={() => setEditMode(true)}>Modifier</Button>
					)}
				</Form>
			</Card.Body>
		</Card>
	);
}

export default AdminProfile;
