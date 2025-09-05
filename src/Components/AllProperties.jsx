import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Table, Spinner, Alert, Container, Card } from 'react-bootstrap';

function AllProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const snapshot = await getDocs(collection(db, 'properties'));
        setProperties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError('Failed to fetch properties.');
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Body>
        <Card.Title style={{ color: '#234E5B' }}>Toutes les propriétés</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Propriétaire</th>
                <th>Prestataire</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(property => (
                <tr key={property.id}>
                  <td>{property.name}</td>
                  <td>{property.address}</td>
                  <td>{property.ownerName || property.ownerId}</td>
                  <td>{property.providerName || property.providerId}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}

export default AllProperties;
