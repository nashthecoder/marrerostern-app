import React, { useEffect, useState } from 'react';
import { Form, Container, Row, Col, Spinner } from 'react-bootstrap';
import { auth, db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';

function getLabelForRole(role) {
  switch (role) {
    case 'admin':
      return 'Administrateur';
    case 'proprietaire':
      return 'Propriétaire';
    case 'utilisateur':
      return 'Utilisateur';
    default:
      return 'Rôle inconnu';
  }
}

function Roles() {
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserRole(userData.role || 'utilisateur');
          } else {
            console.warn('User document not found.');
            setUserRole('utilisateur');
          }
        } catch (error) {
          console.error('Erreur en récupérant le rôle :', error);
          setUserRole('utilisateur');
        } finally {
          setLoading(false);
        }
      } else {
        setUserRole('utilisateur');
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  if (loading) {
    return (
      <Container className="mt-3">
        <Row>
          <Col>
            <Spinner animation="border" />
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-3">
      <Row>
        <Col md={12}>
          <Form.Group className="border border-dark p-3 rounded">
            <Form.Label><strong>Rôle</strong></Form.Label>
            <Form.Select value={userRole} disabled>
              <option value={userRole}>{getLabelForRole(userRole)}</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </Container>
  );
}

export default Roles;