
import Header from '../Components/Header';
// import AllUserSessions from '../Components/AllUserSessions';
import UnifiedUserActivityTable from '../Components/Users/UnifiedUserActivityTable';
import AuditLog from '../Components/AuditLog';
import { Tabs, Tab } from 'react-bootstrap';
// import Roles from '../Components/Users/Roles';
import ShowUsers from '../Components/Users/ShowUsers';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';


function Users({ setIsAuthenticated }) {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        const fetchRole = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userSnap = await getDoc(userDocRef);
                    if (userSnap.exists()) {
                        setRole(userSnap.data().role);
                    } else {
                        setRole(null);
                    }
                } catch (error) {
                    setRole(null);
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        };
        fetchRole();
    }, []);

    if (loading) return <div className="text-center my-4">Chargement...</div>;
    if (role !== 'admin') return <div className="text-center my-4 text-danger">Accès refusé : réservé aux administrateurs.</div>;

    const UserRoleFilter = () => (
      <div className="mb-3" style={{ maxWidth: 300 }}>
        <label htmlFor="roleFilter" className="form-label"><strong>Filtrer par rôle</strong></label>
        <select
          id="roleFilter"
          className="form-select"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">Tous</option>
          <option value="admin">Administrateur</option>
          <option value="provider">Prestataire</option>
          <option value="owner">Propriétaire</option>
          <option value="traveler">Voyageur</option>
        </select>
      </div>
    );

    return (
        <>
            <Header title="Gestion d'utilisateurs" setIsAuthenticated={setIsAuthenticated} />
            <Tabs defaultActiveKey="users" id="user-management-tabs" className="mb-4" justify>
                <Tab eventKey="users" title="Listes">
                    <div className="mt-4">
                        <UserRoleFilter />
                        <ShowUsers roleFilter={roleFilter} />
                    </div>
                </Tab>
                <Tab eventKey="activity" title="User Activity">
                    <div className="mt-4"><UnifiedUserActivityTable /></div>
                </Tab>
                <Tab eventKey="audit" title="Audit Logs">
                    <div className="mt-4"><AuditLog /></div>
                </Tab>
            </Tabs>
        </>
    );
}

export default Users;