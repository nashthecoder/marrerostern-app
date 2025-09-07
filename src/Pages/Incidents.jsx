
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Filter } from "react-bootstrap-icons";
import Header from "../Components/Header";
import Filtres from "../Components/Incidents/Filtres";
import TravelerIncidentReportForm from "../Components/Incidents/TravelerIncidentReportForm";
import AdminIncidentValidation from "../Components/Incidents/AdminIncidentValidation";


function Incidents() {
    const [role, setRole] = useState(null);
    useEffect(() => {
        const fetchRole = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userDocRef);
                if (userSnap.exists()) {
                    setRole(userSnap.data().role);
                }
            }
        };
        fetchRole();
    }, []);

    return (
        <>
            <Header title="Suivi incidents et stocks  " setIsAuthenticated={() => {}}/>
            <Filtres />
            <div className="mt-4">
                {role === 'traveler' || role === 'voyageur' ? (
                    <TravelerIncidentReportForm />
                ) : null}
                {role === 'admin' ? <AdminIncidentValidation /> : null}
            </div>
        </>
    );
}
export default Incidents;