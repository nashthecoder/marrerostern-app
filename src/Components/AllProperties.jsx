import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Table, Spinner, Alert, Container, Card } from 'react-bootstrap';

function AllProperties({ paginated = true, pageSize = 5 }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Pagination logic
  const totalPages = Math.ceil(properties.length / pageSize);
  const paginatedProperties = paginated
    ? properties.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : properties;

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Body>
        <Card.Title style={{ color: '#234E5B' }}>Toutes les propriétés</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <>
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
                {paginatedProperties.map(property => (
                  <tr key={property.id}>
                    <td>{property.name}</td>
                    <td>{property.address}</td>
                    <td>{property.ownerName || property.ownerId}</td>
                    <td>{property.providerName || property.providerId}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {paginated && totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>&laquo;</button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i + 1} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>&raquo;</button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default AllProperties;
