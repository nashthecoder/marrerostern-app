import React, { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div>
      <h5>Mes missions</h5>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Spinner animation="border" /> : (
        <Table bordered hover>
          <thead>
            <tr><th>Logement</th><th>Tâche</th><th>Date d'arrivée</th><th>Date de départ</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td>{t.logements || t.logement || '-'}</td>
                <td>{t.tache || '-'}</td>
                <td>{t.dateArrivee?.toDate ? t.dateArrivee.toDate().toLocaleDateString() : (t.dateArrivee ? new Date(t.dateArrivee).toLocaleDateString() : '-')}</td>
                <td>{t.dateDepart?.toDate ? t.dateDepart.toDate().toLocaleDateString() : (t.dateDepart ? new Date(t.dateDepart).toLocaleDateString() : '-')}</td>
                <td>{t.status || '-'}</td>
                <td>
                  {t.status !== 'Terminé' && <Button size="sm" onClick={() => handleComplete(t.id)}>Marquer terminé</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
export default MyTasks;
