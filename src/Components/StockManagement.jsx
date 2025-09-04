import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Card, Form, Button, Alert, ListGroup, Badge, Row, Col } from 'react-bootstrap';

function StockManagement() {
  const [inventory, setInventory] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [newItem, setNewItem] = useState({ name: '', category: '', currentStock: 0, minThreshold: 5 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProperties();
    fetchInventory();
  }, []);

  const fetchProperties = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');
      
      const q = query(collection(db, 'properties'), where('owner', '==', user.email));
      const snapshot = await getDocs(q);
      const propertiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProperties(propertiesData);
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchInventory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');
      
      const q = query(collection(db, 'inventory'), where('owner', '==', user.email), orderBy('category'));
      const snapshot = await getDocs(q);
      const inventoryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(inventoryData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user || !selectedProperty) return;

      await addDoc(collection(db, 'inventory'), {
        ...newItem,
        propertyId: selectedProperty,
        owner: user.email,
        createdAt: new Date(),
        lastUpdated: new Date()
      });

      setNewItem({ name: '', category: '', currentStock: 0, minThreshold: 5 });
      fetchInventory();
    } catch (e) {
      setError(e.message);
    }
  };

  const getStockStatus = (current, min) => {
    if (current === 0) return { variant: 'danger', text: 'Rupture' };
    if (current <= min) return { variant: 'warning', text: 'Stock faible' };
    return { variant: 'success', text: 'En stock' };
  };

  const categories = [...new Set(inventory.map(item => item.category))];
  const lowStockItems = inventory.filter(item => item.currentStock <= item.minThreshold);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h4 className="mb-4">Gestion des Stocks</h4>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Alert for low stock items */}
      {lowStockItems.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <h6>⚠️ Alerte Stock Faible</h6>
          <p className="mb-0">
            {lowStockItems.length} article(s) nécessitent un réapprovisionnement:
            {lowStockItems.map(item => (
              <Badge key={item.id} bg="warning" text="dark" className="ms-1">
                {item.name} ({item.currentStock})
              </Badge>
            ))}
          </p>
        </Alert>
      )}

      <Row>
        <Col md={4}>
          {/* Add New Item Form */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Ajouter un Article</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddItem}>
                <Form.Group className="mb-3">
                  <Form.Label>Propriété</Form.Label>
                  <Form.Select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner une propriété</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Nom de l'article</Form.Label>
                  <Form.Control
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Ex: Draps, Serviettes, Savon..."
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Catégorie</Form.Label>
                  <Form.Control
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    placeholder="Ex: Linge, Produits d'entretien..."
                    required
                  />
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock actuel</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={newItem.currentStock}
                        onChange={(e) => setNewItem({...newItem, currentStock: parseInt(e.target.value) || 0})}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Seuil minimum</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={newItem.minThreshold}
                        onChange={(e) => setNewItem({...newItem, minThreshold: parseInt(e.target.value) || 5})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" className="w-100">Ajouter</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {/* Inventory List */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Inventaire</h5>
              <Badge bg="primary">{inventory.length} articles</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {categories.map(category => (
                <div key={category}>
                  <div className="px-3 py-2 bg-light border-bottom">
                    <h6 className="mb-0 text-uppercase">{category}</h6>
                  </div>
                  <ListGroup variant="flush">
                    {inventory
                      .filter(item => item.category === category)
                      .map(item => {
                        const status = getStockStatus(item.currentStock, item.minThreshold);
                        const property = properties.find(p => p.id === item.propertyId);
                        return (
                          <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{item.name}</h6>
                              <small className="text-muted">
                                {property?.name} • Stock: {item.currentStock} • Seuil: {item.minThreshold}
                              </small>
                            </div>
                            <div className="text-end">
                              <Badge bg={status.variant}>{status.text}</Badge>
                              <br />
                              <small className="text-muted">
                                {item.currentStock} unités
                              </small>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                  </ListGroup>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Restock Actions */}
          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Actions de Réapprovisionnement</h5>
            </Card.Header>
            <Card.Body>
              <Button variant="warning" className="me-2">
                Générer Commande de Réapprovisionnement
              </Button>
              <Button variant="outline-primary" className="me-2">
                Voir Fournisseurs
              </Button>
              <Button variant="outline-success">
                Historique des Commandes
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default StockManagement;