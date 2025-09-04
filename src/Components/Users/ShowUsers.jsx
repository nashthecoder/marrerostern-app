import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import EditUser from './EditUser';
import AddUser from './AddUser';
import {
  Container, Table, Card, Row, Col,
  Button, Pagination, Spinner
} from 'react-bootstrap';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { logAuditEvent } from '../../utils/audit';

function ShowUsers() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [loading, setLoading] = useState(true);

  const [editUserId, setEditUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  const handleEdit = (userId) => {
    setEditUserId(userId);
    setShowEditModal(true);
  };

  const fetchUsers = async () => {
    try {
      const userCollection = collection(db, 'users');
      const snapshot = await getDocs(userCollection);
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
      await logAuditEvent('toggle_user_status', 'users', { userId: user.id, newStatus });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'suspendu' ? 'actif' : 'suspendu';
    try {
      await updateDoc(doc(db, 'users', user.id), { status: newStatus });
      setUsers(prevUsers =>
        prevUsers.map(u => u.id === user.id ? { ...u, status: newStatus } : u)
      );
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.prenom || ''} ${user.nom || ''} ?`)) {
      try {
        await deleteDoc(doc(db, 'users', user.id));
        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
        await logAuditEvent('delete_user', 'users', { userId: user.id });
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        alert('Erreur lors de la suppression de l\'utilisateur.');
      }
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return <Pagination>{items}</Pagination>;
  };

  const actionButtonStyle = {
    backgroundColor: '#234E5B',
    borderColor: '#234E5B',
    color: '#fff'
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Liste des Utilisateurs</h4>
        <Button style={actionButtonStyle} onClick={() => setShowAddModal(true)}>
          Ajouter Utilisateur
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          {users.length === 0 && (
            <div className="text-center text-muted">Aucun utilisateur trouvé.</div>
          )}

          <div className="d-none d-md-block">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        {user.profilePhotoUrl ? (
                          <img src={user.profilePhotoUrl} alt="Profil" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: '#ccc' }}>—</span>
                        )}
                      </td>
                      <td>{user.prenom} {user.nom}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.status}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(user.id)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                        >
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
          </div>

          <div className="d-block d-md-none">
            <Row>
              {currentUsers.map(user => (
                <Col xs={12} key={user.id} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>{`${user.prenom || ''} ${user.nom || ''}`.trim() || '---'}</Card.Title>
                      <Card.Text>
                        <strong>Email:</strong> {user.email} <br />
                        <strong>Rôle:</strong> {user.role} <br />
                        <strong>Status:</strong> {user.status || '---'}
                      </Card.Text>
                      <div className="d-flex justify-content-start flex-wrap gap-2">
                        <Button size="sm" style={actionButtonStyle} onClick={() => handleEdit(user.id)}>Modifier</Button>
                        <Button size="sm" style={actionButtonStyle} onClick={() => handleToggleStatus(user)}>
                          {user.status === 'suspendu' ? 'Activer' : 'Suspendre'}
                        </Button>
                        <Button size="sm" style={actionButtonStyle} onClick={() => handleDeleteUser(user)}>Supprimer</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <div className="d-flex justify-content-center mt-3">
            {renderPagination()}
          </div>
        </>
      )}

      <EditUser
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        userId={editUserId}
        onUpdate={() => {
          setLoading(true);
          setEditUserId(null);
          setShowEditModal(false);
          fetchUsers();
        }}
      />

      {/* Modal ajout utilisateur */}
      <AddUser
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onUserAdded={() => {
          setShowAddModal(false);
          fetchUsers(); // recharge la liste après ajout
        }}
      />
    </Container>
  );
}

export default ShowUsers;