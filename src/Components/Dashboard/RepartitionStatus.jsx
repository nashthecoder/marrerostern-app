import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card, Row, Col } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

// Enregistrement des éléments requis
ChartJS.register(ArcElement, Tooltip);

const data = {
  labels: ['À faire', 'En cours', 'Terminé'],
  datasets: [
    {
      label: 'Statuts',
      data: [25, 50, 25],
      backgroundColor: ['#F27078', '#F4A44D', '#2060B8'],
      borderColor: '#fff',
      borderWidth: 2,
    },
  ],
};

const colors = ['#F27078', '#F4A44D', '#2060B8'];

function RepartitionStatus() {
  return (
    <Card className="shadow-sm p-3 mb-4">
      <h4 className="mb-4 text-center">Répartition par type de statut</h4>
      <Row className="align-items-center flex-column flex-md-row">
        <Col md={8} className="mb-4 mb-md-0" style={{ height: '200px', position: 'relative' }}>
          <Doughnut
            data={data}
            options={{
              plugins: {
                legend: {
                  display: false,
                },
              },
              maintainAspectRatio: false,
              // height et width permettent parfois d'ajuster la taille, mais ici on préfère CSS sur container
            }}
            // taille canvas contrôlée par le parent avec height CSS
          />
        </Col>
        <Col md={4}>
          <ul className="list-unstyled">
            {data.labels.map((label, index) => (
              <li key={label} className="mb-3 d-flex align-items-center">
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: colors[index],
                    borderRadius: '50%',
                    display: 'inline-block',
                    marginRight: '10px',
                    flexShrink: 0,
                  }}
                ></span>
                <span style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>{label}</span>
              </li>
            ))}
          </ul>
        </Col>
      </Row>
    </Card>
  );
}

export default RepartitionStatus;