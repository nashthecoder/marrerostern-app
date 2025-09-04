import React, { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { Table, Button, Spinner, Alert, Card, Modal } from 'react-bootstrap';
import TaskChecklist from './TaskChecklist';

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');
      const q = query(collection(db, 'reservations'), where('prestataire', '==', user.email));
      const snap = await getDocs(q);
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleComplete = async (id) => {
    await updateDoc(doc(db, 'reservations', id), { status: 'Terminé' });
    fetchTasks();
  };

  const openChecklist = (task) => {
    setSelectedTask(task);
    setShowChecklistModal(true);
  };

  return (
    <div>
      <h5 className="mb-4">Mes missions</h5>
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <Table responsive striped hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Logement</th>
                  <th>Tâche</th>
                  <th>Date d'arrivée</th>
                  <th>Date de départ</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td>{t.logements || t.logement || '-'}</td>
                    <td>{t.tache || '-'}</td>
                    <td>{t.dateArrivee?.toDate ? t.dateArrivee.toDate().toLocaleDateString() : (t.dateArrivee ? new Date(t.dateArrivee).toLocaleDateString() : '-')}</td>
                    <td>{t.dateDepart?.toDate ? t.dateDepart.toDate().toLocaleDateString() : (t.dateDepart ? new Date(t.dateDepart).toLocaleDateString() : '-')}</td>
                    <td>
                      <span className={`badge ${t.status === 'Terminé' ? 'bg-success' : t.status === 'En cours' ? 'bg-warning' : 'bg-secondary'}`}>
                        {t.status || 'En attente'}
                      </span>
                    </td>
                    <td>
                      <Button 
                        size="sm" 
                        variant="outline-primary" 
                        className="me-2"
                        onClick={() => openChecklist(t)}
                      >
                        Checklist
                      </Button>
                      {t.status !== 'Terminé' && (
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleComplete(t.id)}
                        >
                          Marquer terminé
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            {tasks.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted">Aucune tâche assignée pour le moment.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Checklist Modal */}
      <Modal show={showChecklistModal} onHide={() => setShowChecklistModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Checklist - {selectedTask?.logement || selectedTask?.logements}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && <TaskChecklist taskId={selectedTask.id} />}
        </Modal.Body>
      </Modal>
    </div>
  );
}
export default MyTasks;
