import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { Card, Form, Button, Alert } from 'react-bootstrap';

function TaskChecklist({ taskId }) {
  const [checklist, setChecklist] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChecklist();
  }, [taskId]);

  const fetchChecklist = async () => {
    try {
      const q = query(collection(db, 'task_checklists'), where('taskId', '==', taskId));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChecklistItems(items);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleItemCheck = async (itemId, completed) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Update the checklist item status
      const updatedItems = checklistItems.map(item => 
        item.id === itemId ? { ...item, completed, completedBy: user.uid, completedAt: new Date() } : item
      );
      setChecklistItems(updatedItems);

      // You would update Firestore here
      // await updateDoc(doc(db, 'task_checklists', itemId), { completed, completedBy: user.uid, completedAt: new Date() });
    } catch (e) {
      setError(e.message);
    }
  };

  const defaultChecklistItems = [
    { id: 1, title: 'Vérifier l\'état général du logement', completed: false, required: true },
    { id: 2, title: 'Nettoyer les surfaces', completed: false, required: true },
    { id: 3, title: 'Vérifier les équipements', completed: false, required: true },
    { id: 4, title: 'Prendre des photos de l\'état', completed: false, required: false },
    { id: 5, title: 'Signaler les problèmes éventuels', completed: false, required: false }
  ];

  return (
    <Card className="mt-3">
      <Card.Header className="bg-blue-600 text-white">
        <h6 className="mb-0">Checklist de tâche</h6>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="space-y-3">
          {(checklistItems.length > 0 ? checklistItems : defaultChecklistItems).map(item => (
            <div key={item.id} className="flex items-center p-3 border rounded-lg">
              <Form.Check
                type="checkbox"
                checked={item.completed}
                onChange={(e) => handleItemCheck(item.id, e.target.checked)}
                className="mr-3"
              />
              <div className="flex-1">
                <span className={`${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {item.title}
                </span>
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </div>
              {item.completed && (
                <small className="text-green-600">✓ Terminé</small>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <small className="text-gray-600">
            * Éléments obligatoires pour marquer la tâche comme terminée
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}

export default TaskChecklist;