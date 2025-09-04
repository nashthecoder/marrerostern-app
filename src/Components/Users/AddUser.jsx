import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { db, storage } from '../../../firebase';
// ...existing code...
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { logAuditEvent } from '../../utils/audit';

function AddUser({ show, handleClose, onUserAdded }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
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
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleAddUser = async () => {
    setError(null);
    setLoading(true);
    try {
      const uid = uuidv4();
      let profilePhotoUrl = '';
      if (photoFile) {
        // Upload photo to Firebase Storage
        const storageRef = storage.ref();
        const photoRef = storageRef.child(`profile_photos/${uid}_${photoFile.name}`);
        await photoRef.put(photoFile);
        profilePhotoUrl = await photoRef.getDownloadURL();
      }
      const newUser = {
        ...formData,
        profilePhotoUrl,
        uid,
        status: 'actif',
        createdAt: Timestamp.now(),
      };
      await addDoc(collection(db, 'users'), newUser);
      await logAuditEvent('create_user', 'users', { email: newUser.email, role: newUser.role });
      onUserAdded();
      handleClose();
    } catch (err) {
      setError("Erreur lors de l'ajout de l'utilisateur.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un utilisateur</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Entrez le prénom"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Entrez le nom"
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemple@email.com"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Entrez un mot de passe"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Rôle</Form.Label>
            <Form.Select name="role" value={formData.role} onChange={handleChange}>
              <option value="">-- Choose a role --</option>
              <option value="provider">Provider</option>
              <option value="owner">Owner</option>
              <option value="admin">Administrator</option>
              <option value="traveler">Traveler</option>
            </Form.Select>
          </Form.Group>
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
        <Button
          style={{ backgroundColor: '#234E5B', borderColor: '#234E5B' }}
          onClick={handleAddUser}
          disabled={loading}
        >
          {loading ? 'Ajout...' : 'Ajouter'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddUser;