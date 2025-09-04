import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../assets/css/ViewReservation.css';

function ViewReservations() {
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [conflict, setConflict] = useState(null);
  const [conflictReason, setConflictReason] = useState('');
  const [assignedProvider, setAssignedProvider] = useState('');

  // Fonction pour récupérer les réservations depuis Firebase
  const fetchReservations = async () => {
    const querySnapshot = await getDocs(collection(db, 'reservations'));
    const data = querySnapshot.docs.map(doc => {
      const reservation = doc.data();
      return {
        ...reservation,
        dateArrivee: reservation.dateArrivee.toDate(),  // Conversion de Timestamp en Date
        dateDepart: reservation.dateDepart.toDate(),    // Conversion de Timestamp en Date
      };
    });
    setReservations(data);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Fonction pour vérifier les conflits pour la date sélectionnée
  const checkConflict = (date) => {
    const conflicts = reservations.filter(reservation => {
      const dateArrivee = new Date(reservation.dateArrivee);
      const dateDepart = new Date(reservation.dateDepart);

      return date >= dateArrivee && date <= dateDepart; // Date dans la plage de réservation
    });

    if (conflicts.length > 0) {
      setConflict({
        date: date.toDateString(),
        reservations: conflicts
      });
    } else {
      setConflict(null);
    }
  };

  // Fonction pour gérer la sélection d'une date
  const handleDateChange = (date) => {
    setSelectedDate(date);
    checkConflict(date);
  };

  // Récupérer toutes les dates de réservation pour marquer la plage complète
  const getReservationDates = () => {
    return reservations.map(reservation => {
      const dates = [];
      const startDate = new Date(reservation.dateArrivee);
      const endDate = new Date(reservation.dateDepart);

      // Ajouter toutes les dates entre dateArrivee et dateDepart
      while (startDate <= endDate) {
        dates.push(new Date(startDate));
        startDate.setDate(startDate.getDate() + 1);
      }
      return { dates, logement: reservation.logements, status: reservation.status, id: reservation.id }; // Retourner aussi le logement et le statut
    });
  };

  // Fonction pour afficher le logement et la couleur des jours réservés
  const renderReservationTitles = ({ date, view }) => {
    const reservationDates = getReservationDates();
    const currentDate = date.toDateString();

    // Chercher une réservation pour cette date
    const reservationForDate = reservationDates.find(reservation => 
        reservation.dates.some(d => d.toDateString() === currentDate)
    );

    if (reservationForDate) {
        const { logement, status } = reservationForDate; // Inclure le statut
        let colorClass = 'default-bg'; // Par défaut

        // Appliquer la couleur en fonction du statut
        if (status === 'En attente') {
        colorClass = 'yellow-bg'; // Jaune pour En attente
        } else if (status === 'Réservation confirmée') {
        colorClass = 'green-bg'; // Vert pour confirmé
        } else if (status === 'Réservation annulée') {
        colorClass = 'red-bg'; // Rouge pour annulé
        }

        // N'afficher le titre que sur la première date de la réservation
        if (reservationForDate.dates[0].toDateString() === currentDate) {
            return (
            <div className={`reservation-title ${colorClass}`}>
                {logement} - {status} {/* Afficher le logement et le statut une seule fois */}
            </div>
            );
        }
    }
    return null;
  };

  return (
    <div className="calendar-container">
      <h2>Voir les Réservations</h2>

      {/* Affichage du calendrier avec toute la largeur */}
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileContent={renderReservationTitles}  // Afficher le titre des réservations sur la date
        className="full-width-calendar"
      />

      {/* Affichage des conflits */}
      {conflict && (
        <div>
          <h3>Conflit détecté pour la date: {conflict.date}</h3>
          <ul>
            {conflict.reservations.map((reservation, index) => (
              <li key={index}>
                {reservation.client} - {reservation.dateArrivee.toLocaleDateString()} à {reservation.dateDepart.toLocaleDateString()} : {reservation.tache}
              </li>
            ))}
          </ul>

          <div>
            <label>Choisir la raison du conflit:</label>
            <select
              value={conflictReason}
              onChange={(e) => setConflictReason(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              <option value="double_reservation">Double réservation</option>
              <option value="prestataire_indisponible">Prestataire indisponible</option>
            </select>
          </div>

          <div>
            <label>Assigner un prestataire:</label>
            <select
              value={assignedProvider}
              onChange={(e) => setAssignedProvider(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              <option value="provider_1">Prestataire 1</option>
              <option value="provider_2">Prestataire 2</option>
            </select>
          </div>

          <button onClick={handleSubmitConflict}>Traiter le conflit</button>
        </div>
      )}
    </div>
  );
}

export default ViewReservations;