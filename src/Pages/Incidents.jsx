import { Filter } from "react-bootstrap-icons"
import Header from "../Components/Header"
import Filtres from "../Components/Incidents/Filtres"
import TravelerIncidentReportForm from "../Components/Incidents/TravelerIncidentReportForm";

function Incidents() {
    return (
        <>
            <Header title="Suivi incidents et stocks  " setIsAuthenticated={() => {}}/>
            <Filtres />
            {/* Traveler incident report form below filters */}
            <div className="mt-4">
                <TravelerIncidentReportForm onSubmit={data => {/* handle submit logic here */}} />
            </div>
        </>
    )
}
export default Incidents