import { Filter } from "react-bootstrap-icons"
import Header from "../Components/Header"
import Filtres from "../Components/Incidents/Filtres"

function Incidents() {
    return (
        <>
            <Header title="Suivi incidents et stocks  " setIsAuthenticated={() => {}}/>
            <Filtres />
        </>
    )
}
export default Incidents