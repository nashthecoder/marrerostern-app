import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { db, auth, storage } from '../../../firebase'; // auth à exporter dans firebase.js
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { logAuditEvent } from '../../utils/audit';
import MySessions from '../MySessions';

function EditUser({ show, handleClose, userId, onUpdate }) {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    role: '',
    password: '',
    phone: '',
    address: '',
    kra: '',
    vat: '',
    payoutDetails: '',
    profilePhotoUrl: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(null);
  const [resetError, setResetError] = useState(null);

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        setLoading(true);
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setFormData(prev => ({
            ...prev,
            ...userSnap.data(),
            password: '' // ne pas pré-remplir le mot de passe
          }));
        }
        setLoading(false);
        setResetSuccess(null);
        setResetError(null);
      };
      fetchUser();
    }
  }, [userId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, 'users', userId);
      let profilePhotoUrl = formData.profilePhotoUrl;
      if (photoFile) {
        // Upload photo to Firebase Storage
        const storageRef = storage.ref();
        const photoRef = storageRef.child(`profile_photos/${userId}_${photoFile.name}`);
        await photoRef.put(photoFile);
        profilePhotoUrl = await photoRef.getDownloadURL();
      }
      const updateData = {
        prenom: formData.prenom,
        nom: formData.nom,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        kra: formData.kra,
        vat: formData.vat,
        payoutDetails: formData.payoutDetails,
        profilePhotoUrl,
      };
      if (formData.password.trim() !== '') {
        updateData.password = formData.password;
      }
      await updateDoc(userRef, updateData);
      await logAuditEvent('update_user', 'users', { userId, updateData });
      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
    }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    setResetLoading(true);
    setResetSuccess(null);
    setResetError(null);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetSuccess(`Email de réinitialisation envoyé à ${formData.email}`);
    } catch (error) {
      setResetError('Erreur lors de l’envoi de l’email de réinitialisation.');
      console.error(error);
    }
    setResetLoading(false);
  };

  const isCurrentUser = auth.currentUser && auth.currentUser.email === formData.email;
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Modifier Utilisateur</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <>
            {resetSuccess && <Alert variant="success">{resetSuccess}</Alert>}
            {resetError && <Alert variant="danger">{resetError}</Alert>}
            <Form>
                {formData.profilePhotoUrl && (
                  <div className="mb-3 text-center">
                    <img src={formData.profilePhotoUrl} alt="Profil" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                  </div>
                )}
              <Form.Group className="mb-3">
                <Form.Label>Téléphone</Form.Label>
                <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Numéro de téléphone" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Adresse</Form.Label>
                <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Adresse" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>ID/KRA</Form.Label>
                <Form.Control type="text" name="kra" value={formData.kra} onChange={handleChange} placeholder="ID/KRA" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>VAT</Form.Label>
                <Form.Control type="text" name="vat" value={formData.vat} onChange={handleChange} placeholder="VAT" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Détails de paiement</Form.Label>
                <Form.Control type="text" name="payoutDetails" value={formData.payoutDetails} onChange={handleChange} placeholder="Détails de paiement" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Photo de profil</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handlePhotoChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Rôle</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="provider">Provider</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Administrator</option>
                  <option value="traveler">Traveler</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Changer le mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Nouveau mot de passe (laisser vide pour ne pas changer)"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button
                variant="warning"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="mb-3"
              >
                {resetLoading ? 'Envoi en cours...' : 'Réinitialiser le mot de passe (email)'}
              </Button>
            </Form>
            {/* Show sessions for current user only */}
            {isCurrentUser && <MySessions />}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Annuler</Button>
        <Button
          style={{ backgroundColor: '#234E5B', borderColor: '#234E5B' }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditUser;