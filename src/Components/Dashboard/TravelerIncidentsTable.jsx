import React, { useEffect, useState } from 'react';
import { auth, db } from '../../../firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Table, Spinner, Alert, Button, Collapse } from 'react-bootstrap';

function TravelerIncidentsTable() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const pageSize = 10;

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Utilisateur non authentifié');
        const userEmail = user.email;
        const q = query(collection(db, 'incidents'), where('reporter', '==', userEmail), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setIncidents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchIncidents();
  }, []);

  // Filtered incidents by search and urgency
  const filteredIncidents = incidents.filter(incident => {
    const searchMatch =
      search === '' ||
      (incident.description && incident.description.toLowerCase().includes(search.toLowerCase()));
    const urgencyMatch = urgencyFilter === '' || incident.urgence === urgencyFilter;
    return searchMatch && urgencyMatch;
  });
  const pagedIncidents = filteredIncidents.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredIncidents.length / pageSize);
  // Unique urgencies for filter dropdown
  const uniqueUrgencies = Array.from(new Set(incidents.map(i => i.urgence).filter(Boolean)));

  return (
    <div>
      <h5>Mes incidents signalés</h5>
      <div className="d-flex mb-2 gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Recherche par description..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{maxWidth: 250}}
        />
        <select
          className="form-select"
          value={urgencyFilter}
          onChange={e => { setUrgencyFilter(e.target.value); setPage(0); }}
          style={{maxWidth: 200}}
        >
          <option value="">Toutes urgences</option>
          {uniqueUrgencies.map(urgency => (
            <option key={urgency} value={urgency}>{urgency}</option>
          ))}
        </select>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Spinner animation="border" /> : (
        <>
        <Table bordered hover responsive style={{width:'100%'}}>
          <thead>
            <tr>
              <th>Période</th>
              <th>Logement</th>
              <th>Urgence</th>
              <th>Description</th>
              <th>Date/Heure</th>
              <th>Détails</th>
            </tr>
          </thead>
          <tbody>
            {pagedIncidents.length === 0 ? (
              <tr><td colSpan={6}>Aucun incident trouvé.</td></tr>
            ) : pagedIncidents.map(incident => (
              <React.Fragment key={incident.id}>
                <tr>
                  <td>{incident.periodeStart} à {incident.periodeEnd}</td>
                  <td>{incident.logement}</td>
                  <td>{incident.urgence}</td>
                  <td>{incident.description}</td>
                  <td>{incident.createdAt && incident.createdAt.toDate ? incident.createdAt.toDate().toLocaleString() : ''}</td>
                  <td>
                    <Button size="sm" variant="info" onClick={() => setExpanded(expanded === incident.id ? null : incident.id)}>
                      {expanded === incident.id ? 'Réduire' : 'Voir'}
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} style={{padding:0, border:'none'}}>
                    <Collapse in={expanded === incident.id}>
                      <div style={{background:'#f8f9fa', padding:'1em'}}>
                        <b>Description complète:</b> {incident.description}<br/>
                        <b>Logement:</b> {incident.logement}<br/>
                        <b>Période:</b> {incident.periodeStart} à {incident.periodeEnd}<br/>
                        <b>Urgence:</b> {incident.urgence}<br/>
                        {incident.photoUrl && incident.photoUrl !== '' && (
                          <div><b>Photo:</b> <a href={incident.photoUrl} target="_blank" rel="noopener noreferrer">Voir la photo</a></div>
                        )}
                        <b>Date/Heure:</b> {incident.createdAt && incident.createdAt.toDate ? incident.createdAt.toDate().toLocaleString() : ''}
                      </div>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </Table>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Précédent</button>
          <span>Page {page + 1} / {totalPages || 1}</span>
          <button className="btn btn-secondary" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Suivant</button>
        </div>
        </>
      )}
    </div>
  );
}
export default TravelerIncidentsTable;
