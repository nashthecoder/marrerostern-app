import React from 'react';
import { Card } from 'react-bootstrap';
import { auth } from '../../firebase';

function TravelerProfile() {
  const user = auth.currentUser;
  return (
    <Card>
      <Card.Body>
        <Card.Title>Mon profil</Card.Title>
        <div><b>Email:</b> {user?.email || 'Non connecté'}</div>
        {/* Add more traveler info here as needed */}
      </Card.Body>
    </Card>
  );
}
export default TravelerProfile;
