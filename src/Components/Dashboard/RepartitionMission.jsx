import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card, Row, Col } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

// Enregistrement des éléments requis
ChartJS.register(ArcElement, Tooltip);

const data = {
  labels: ['Utilisateurs', 'Maintenance', 'Approvisionnement'],
  datasets: [
    {
      label: 'Types de mission',
      data: [30, 45, 25],
      backgroundColor: ['#6CE5E8', '#41B8D5', '#2D8BBA'],
      borderColor: '#fff',
      borderWidth: 2,
    },
  ],
};

const colors = ['#6CE5E8', '#41B8D5', '#2D8BBA'];

function RepartitionMission() {
  return (
    <Card className="shadow-sm p-3 mb-4">
      <h4 className="mb-4 text-center">Répartition par type de mission</h4>
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
            }}
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

export default RepartitionMission;