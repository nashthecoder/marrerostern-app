
import Header from '../Components/Header';
import Roles from '../Components/Users/Roles';
import ShowUsers from '../Components/Users/ShowUsers';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Users({ setIsAuthenticated }) {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <>
            <Header title="Gestion d'utilisateurs" setIsAuthenticated={setIsAuthenticated} />
            <Roles />
            <ShowUsers />
        </>
    );
}

export default Users;