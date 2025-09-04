import { Row, Col } from 'react-bootstrap';

function SigneReservation() {
    return (
        <Row className="justify-content-center mt-3 mb-2 signeReservation">
            <Col xs="auto" className="d-flex justify-content-around">
                {/* Réservation confirmée */}
                <div className="d-flex align-items-center" style={{ marginRight: '30px' }}>
                    <div 
                        className="rounded-circle d-flex justify-content-center align-items-center"
                        style={{ backgroundColor: '#37976F', width: '10px', height: '10px', color: '#fff', marginRight: '10px' }}
                    >
                    </div>
                    <p>Réservation confirmée</p>
                </div>

                {/* Réservation en attente */}
                <div className="d-flex align-items-center" style={{ marginRight: '30px' }}>
                    <div 
                        className="rounded-circle d-flex justify-content-center align-items-center"
                        style={{ backgroundColor: '#FFD633', width: '10px', height: '10px', color: '#fff', marginRight: '10px' }}
                    >
                    </div>
                    <p>Réservation en attente</p>
                </div>

                {/* Réservation annulée */}
                <div className="d-flex align-items-center">
                    <div 
                        className="rounded-circle d-flex justify-content-center align-items-center"
                        style={{ backgroundColor: '#FF3344', width: '10px', height: '10px', color: '#fff', marginRight: '10px' }}
                    >
                    </div>
                    <p>Réservation annulée</p>
                </div>
            </Col>
        </Row>
    );
}

export default SigneReservation;