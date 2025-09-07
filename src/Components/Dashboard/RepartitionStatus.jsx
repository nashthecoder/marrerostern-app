
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card, Row, Col } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';

ChartJS.register(ArcElement, Tooltip);

const statusLabels = ['À faire', 'En cours', 'Terminé'];
const colors = ['#F27078', '#F4A44D', '#2060B8'];

function RepartitionStatus() {
  const [counts, setCounts] = useState([0, 0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatusCounts() {
      try {
        const queries = statusLabels.map(status =>
          getCountFromServer(query(collection(db, 'incidents'), where('status', '==', status)))
        );
        const snaps = await Promise.all(queries);
        setCounts(snaps.map(snap => snap.data().count || 0));
      } catch (err) {
        console.error('Error fetching incident status counts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatusCounts();
  }, []);

  const data = {
    labels: statusLabels,
    datasets: [
      {
        label: 'Statuts',
        data: counts,
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  return (
    <Card className="shadow-sm p-3 mb-4">
      <h4 className="mb-4 text-center">Répartition par type de statut</h4>
      <Row className="align-items-center flex-column flex-md-row">
        <Col md={8} className="mb-4 mb-md-0" style={{ height: '200px', position: 'relative' }}>
          {loading ? (
            <div style={{height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Chargement...</div>
          ) : (
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
          )}
        </Col>
        <Col md={4}>
          <ul className="list-unstyled">
            {statusLabels.map((label, index) => (
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
                <span style={{ marginLeft: 8, fontWeight: 600 }}>{counts[index]}</span>
              </li>
            ))}
          </ul>
        </Col>
      </Row>
    </Card>
  );
}

export default RepartitionStatus;