import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../assets/css/ViewReservation.css';
import { Badge, Dropdown, ButtonGroup, Button, OverlayTrigger, Popover } from 'react-bootstrap';


function ViewReservations() {
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [conflict, setConflict] = useState(null);
  const [conflictReason, setConflictReason] = useState('');
  const [assignedProvider, setAssignedProvider] = useState('');
  const [propertyMap, setPropertyMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [filter, setFilter] = useState('all');
  const [loadingMaps, setLoadingMaps] = useState(true);
  // Accessible status badge rendering
  const getStatusBadge = (status) => {
    let variant, icon, label;
    switch (status) {
      case 'Réservation confirmée':
      case 'confirmée':
      case 'Confirmée':
        variant = 'success'; icon = '✔️'; label = 'Confirmée'; break;
      case 'Réservation annulée':
      case 'annulée':
      case 'Annulée':
        variant = 'danger'; icon = '✖️'; label = 'Annulée'; break;
      case 'En attente':
      case 'en attente':
      case 'En Attente':
        variant = 'warning'; icon = '⏳'; label = 'En attente'; break;
      default:
        variant = 'secondary'; icon = '❓'; label = status || 'Inconnu';
    }
    return (
      <Badge bg={variant} aria-label={label} className="status-badge" style={{fontSize: '0.85em', marginTop: 4}}>
        <span aria-hidden="true">{icon}</span> <span className="visually-hidden">{label}</span>
        <span className="d-inline d-md-none">{icon}</span>
        <span className="d-none d-md-inline">{label}</span>
      </Badge>
    );
  };

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


  // Fetch properties and users for mapping IDs to names
  useEffect(() => {
    fetchReservations();
    const fetchPropertiesAndUsers = async () => {
      setLoadingMaps(true);
      try {
        // Fetch properties
        const propSnap = await getDocs(collection(db, 'properties'));
        const propMap = {};
        propSnap.docs.forEach(doc => {
          const data = doc.data();
          propMap[doc.id] = data.name && data.name.trim() ? data.name : (data.address && data.address.trim() ? data.address : doc.id);
        });
        setPropertyMap(propMap);

        // Fetch users
        const userSnap = await getDocs(collection(db, 'users'));
        const uMap = {};
        userSnap.docs.forEach(doc => {
          const data = doc.data();
          let displayName = '';
          if (data.prenom && data.nom) {
            displayName = `${data.prenom} ${data.nom}`.trim();
          } else if (data.prenom) {
            displayName = data.prenom;
          } else if (data.nom) {
            displayName = data.nom;
          } else if (data.email) {
            displayName = data.email;
          } else {
            displayName = doc.id;
          }
          uMap[doc.id] = displayName;
        });
        setUserMap(uMap);
      } catch (e) {
        // Ignore errors for now
      }
      setLoadingMaps(false);
    };
    fetchPropertiesAndUsers();
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
    // Only proceed if maps are loaded
    if (loadingMaps) return [];
    // Use a Set to avoid duplicate reservation IDs for a given date
    const seen = new Set();
    // For confirmed filter, match any status containing 'confirmée' (case-insensitive, accent-insensitive)
    return reservations
      .filter(res => {
        if (filter === 'all') return true;
        if (filter === 'pending') return res.status === 'En attente';
        if (filter === 'confirmed') {
          const status = (res.status || '').toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return status.includes('confirmee');
        }
        if (filter === 'cancelled') return res.status === 'Réservation annulée';
        return true;
      })
      .map(reservation => {
        const dates = [];
        const startDate = new Date(reservation.dateArrivee);
        const endDate = new Date(reservation.dateDepart);
        while (startDate <= endDate) {
          dates.push(new Date(startDate));
          startDate.setDate(startDate.getDate() + 1);
        }
        // Map logement and client to display names
        const logementName = propertyMap[reservation.logements] || '—';
        const clientName = userMap[reservation.client] || reservation.client || '—';
        return {
          ...reservation,
          dates,
          logement: logementName,
          client: clientName,
        };
      })
      .filter(res => {
        // Remove duplicates by reservation id and start date
        const key = res.id + (res.dates[0] ? res.dates[0].toDateString() : '');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };

  // Fonction pour afficher le logement et la couleur des jours réservés
  // Render all reservations for a given date as accessible cards/labels
  const renderReservationTitles = ({ date, view }) => {
    if (loadingMaps) return null;
    const reservationDates = getReservationDates();
    const currentDate = date.toDateString();
    // Only show reservations whose start date is today
    const reservationsForDate = reservationDates.filter(reservation =>
      reservation.dates.length > 0 && reservation.dates[0].toDateString() === currentDate
    );
    if (reservationsForDate.length === 0) return null;

    return (
      <div className="reservation-cards-container" style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        {reservationsForDate.map((reservation, idx) => {
          const popover = (
            <Popover id={`popover-res-${reservation.id}`}>
              <Popover.Header as="h3">Détails réservation</Popover.Header>
              <Popover.Body>
                <div><strong>Propriété:</strong> {reservation.logement}</div>
                <div><strong>Client:</strong> {reservation.client}</div>
                <div><strong>Email:</strong> {reservation.email || '—'}</div>
                <div><strong>Tâche:</strong> {reservation.tache || '—'}</div>
                <div><strong>Statut:</strong> {reservation.status}</div>
                <div><strong>Arrivée:</strong> {reservation.dateArrivee?.toLocaleDateString?.() || ''}</div>
                <div><strong>Départ:</strong> {reservation.dateDepart?.toLocaleDateString?.() || ''}</div>
              </Popover.Body>
            </Popover>
          );
          return (
            <OverlayTrigger
              key={reservation.id || idx}
              trigger={["hover", "focus"]}
              placement="auto"
              overlay={popover}
              rootClose
            >
              <div
                className="reservation-card"
                tabIndex={0}
                aria-label={`Réservation pour ${reservation.logement}, invité ${reservation.client}, statut ${reservation.status}`}
                style={{
                  background: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: 6,
                  marginBottom: 2,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  minWidth: 0,
                  outline: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{fontWeight: 600, fontSize: '1em', color: '#234E5B'}}>{reservation.logement}</div>
                <div style={{fontSize: '0.95em', color: '#333'}}>{reservation.client}</div>
                <div style={{marginTop: 2}}>{getStatusBadge(reservation.status)}</div>
              </div>
            </OverlayTrigger>
          );
        })}
      </div>
    );
  };

  return (
    <div className="calendar-container" style={{background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
      <h2 style={{color: '#234E5B', fontWeight: 700, fontSize: '1.5rem'}}>Voir les Réservations</h2>

      {/* Reservation status legend */}
      <div style={{display: 'flex', gap: 32, alignItems: 'center', margin: '18px 0 10px 0', fontSize: '1.05em'}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <span style={{display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#1abc9c', marginRight: 4}}></span>
          Confirmée
        </span>
        <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <span style={{display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#f7ca3e', marginRight: 4}}></span>
          En attente
        </span>
        <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <span style={{display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#f74e5c', marginRight: 4}}></span>
          Annulée
        </span>
      </div>

      {/* Filter toggle */}
      <div className="calendar-filter-toggle" style={{marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
        <span style={{fontWeight: 500, color: '#234E5B'}}>Filtrer:</span>
        <div style={{display: 'flex', gap: 10}}>
          <Button
            variant={filter==='all' ? 'primary' : 'outline-primary'}
            onClick={()=>setFilter('all')}
            aria-pressed={filter==='all'}
            style={{
              borderRadius: 999,
              padding: '6px 18px',
              fontWeight: 600,
              boxShadow: filter==='all' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              borderWidth: 2
            }}
          >Toutes</Button>
          <Button
            variant={filter==='pending' ? 'warning' : 'outline-warning'}
            onClick={()=>setFilter('pending')}
            aria-pressed={filter==='pending'}
            style={{
              borderRadius: 999,
              padding: '6px 18px',
              fontWeight: 600,
              boxShadow: filter==='pending' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              borderWidth: 2
            }}
          >En attente</Button>
          <Button
            variant={filter==='confirmed' ? 'success' : 'outline-success'}
            onClick={()=>setFilter('confirmed')}
            aria-pressed={filter==='confirmed'}
            style={{
              borderRadius: 999,
              padding: '6px 18px',
              fontWeight: 600,
              boxShadow: filter==='confirmed' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              borderWidth: 2
            }}
          >Confirmées</Button>
          <Button
            variant={filter==='cancelled' ? 'danger' : 'outline-danger'}
            onClick={()=>setFilter('cancelled')}
            aria-pressed={filter==='cancelled'}
            style={{
              borderRadius: 999,
              padding: '6px 18px',
              fontWeight: 600,
              boxShadow: filter==='cancelled' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              borderWidth: 2
            }}
          >Annulées</Button>
        </div>
      </div>

      {/* Calendar with accessible reservation cards */}
      <div style={{overflowX: 'auto'}}>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={renderReservationTitles}
          className="full-width-calendar"
          tileClassName={({date, view}) => {
            // Add date label at top-left
            return 'calendar-tile-cell';
          }}
          formatShortWeekday={(locale, date) => date.toLocaleDateString(locale, { weekday: 'short' })}
          formatDay={(locale, date) => <span style={{fontWeight: 600}}>{date.getDate()}</span>}
        />
      </div>

      {/* Affichage des conflits (unchanged) */}
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

// Remove any legend JSX after the main calendar container
}

export default ViewReservations;