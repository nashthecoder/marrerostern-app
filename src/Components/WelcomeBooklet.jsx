import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';

function WelcomeBooklet({ reservationId }) {
  const [bookletData, setBookletData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookletData();
  }, [reservationId]);

  const fetchBookletData = async () => {
    try {
      // In a real app, you'd fetch the specific booklet for the property
      // For now, we'll create a sample booklet structure
      const sampleBooklet = {
        propertyName: "Villa Marrero Stern",
        address: "123 Rue de la Plage, Nice, France",
        checkInInstructions: {
          title: "Instructions d'arrivée",
          content: [
            "Récupérez les clés dans la boîte sécurisée située à gauche de l'entrée principale",
            "Le code est le même que celui fourni dans votre confirmation de réservation",
            "L'heure d'arrivée standard est 15h00, mais vous pouvez arriver plus tôt si le logement est prêt"
          ]
        },
        amenities: {
          title: "Équipements disponibles",
          content: [
            { name: "WiFi", details: "Réseau: MarreroGuest / Mot de passe: welcome2024" },
            { name: "Climatisation", details: "Télécommande dans le tiroir de la table de nuit" },
            { name: "Parking", details: "Place réservée n°15 dans le parking souterrain" },
            { name: "Cuisine équipée", details: "Lave-vaisselle, micro-ondes, réfrigérateur, plaques de cuisson" }
          ]
        },
        localInfo: {
          title: "Informations locales",
          content: [
            { category: "Restaurants", places: ["Le Bistrot du Port (5 min à pied)", "Restaurant Chez Marie (10 min à pied)"] },
            { category: "Supermarchés", places: ["Carrefour City (3 min à pied)", "Monoprix (7 min à pied)"] },
            { category: "Transports", places: ["Arrêt de bus ligne 12 (2 min à pied)", "Station de métro Garibaldi (10 min à pied)"] }
          ]
        },
        emergencyContacts: {
          title: "Contacts d'urgence",
          content: [
            { name: "Concierge", phone: "+33 6 12 34 56 78", available: "24h/7j" },
            { name: "Propriétaire", phone: "+33 6 98 76 54 32", available: "9h-21h" },
            { name: "Urgences médicales", phone: "15", available: "24h/7j" }
          ]
        },
        houseRules: {
          title: "Règlement intérieur",
          content: [
            "Respecter le voisinage (pas de bruit après 22h)",
            "Ne pas fumer à l'intérieur du logement",
            "Maximum 4 personnes dans le logement",
            "Animaux non autorisés",
            "Départ avant 11h00"
          ]
        }
      };

      setBookletData(sampleBooklet);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="text-center p-5">
      <Spinner animation="border" />
      <p className="mt-3">Chargement du guide d'accueil...</p>
    </div>
  );

  if (error) return <Alert variant="danger">Erreur: {error}</Alert>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Bienvenue à {bookletData.propertyName}
        </h1>
        <p className="text-gray-600">{bookletData.address}</p>
        <Badge bg="success" className="mt-2">Guide d'accueil numérique</Badge>
      </div>

      <Row>
        {/* Check-in Instructions */}
        <Col md={12} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">📋 {bookletData.checkInInstructions.title}</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                {bookletData.checkInInstructions.content.map((instruction, index) => (
                  <li key={index} className="mb-2 d-flex align-items-start">
                    <span className="badge bg-primary rounded-pill me-2 mt-1">{index + 1}</span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Amenities */}
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">🏠 {bookletData.amenities.title}</h5>
            </Card.Header>
            <Card.Body>
              {bookletData.amenities.content.map((amenity, index) => (
                <div key={index} className="mb-3 p-3 bg-light rounded">
                  <h6 className="text-success mb-2">{amenity.name}</h6>
                  <small className="text-muted">{amenity.details}</small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Local Information */}
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">🗺️ {bookletData.localInfo.title}</h5>
            </Card.Header>
            <Card.Body>
              {bookletData.localInfo.content.map((category, index) => (
                <div key={index} className="mb-3">
                  <h6 className="text-info">{category.category}</h6>
                  <ul className="list-unstyled ms-3">
                    {category.places.map((place, placeIndex) => (
                      <li key={placeIndex} className="mb-1">
                        <small>• {place}</small>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Emergency Contacts */}
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-danger text-white">
              <h5 className="mb-0">🚨 {bookletData.emergencyContacts.title}</h5>
            </Card.Header>
            <Card.Body>
              {bookletData.emergencyContacts.content.map((contact, index) => (
                <div key={index} className="mb-3 p-3 border-start border-danger border-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{contact.name}</strong>
                    <Badge bg="outline-danger">{contact.available}</Badge>
                  </div>
                  <a href={`tel:${contact.phone}`} className="text-decoration-none">
                    <h6 className="text-danger mb-0">{contact.phone}</h6>
                  </a>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* House Rules */}
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">📝 {bookletData.houseRules.title}</h5>
            </Card.Header>
            <Card.Body>
              {bookletData.houseRules.content.map((rule, index) => (
                <div key={index} className="mb-2 p-2 bg-warning bg-opacity-10 rounded">
                  <small className="d-flex align-items-center">
                    <span className="text-warning me-2">⚠️</span>
                    {rule}
                  </small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Footer */}
      <div className="text-center mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-0">
          Nous espérons que vous passerez un excellent séjour ! 
          <br />
          N'hésitez pas à nous contacter si vous avez des questions.
        </p>
      </div>
    </div>
  );
}

export default WelcomeBooklet;
