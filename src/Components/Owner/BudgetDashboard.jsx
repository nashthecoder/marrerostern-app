import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Card, Row, Col, Button, Alert, Badge } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function OwnerBudgetDashboard() {
  const [budgetData, setBudgetData] = useState({
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    totalProperties: 0,
    activeReservations: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');

      // Fetch properties
      const propertiesQuery = query(collection(db, 'properties'), where('owner', '==', user.email));
      const propertiesSnapshot = await getDocs(propertiesQuery);
      const properties = propertiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch reservations for revenue calculation
      const reservationsQuery = query(collection(db, 'reservations'), where('proprietaire', '==', user.email));
      const reservationsSnapshot = await getDocs(reservationsQuery);
      const reservations = reservationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate monthly revenue and expenses
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      let monthlyRevenue = 0;
      let monthlyExpenses = 0;
      let activeReservations = 0;

      reservations.forEach(reservation => {
        const bookingDate = reservation.dateArrivee?.toDate ? reservation.dateArrivee.toDate() : new Date(reservation.dateArrivee);
        if (bookingDate && bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear) {
          monthlyRevenue += parseFloat(reservation.prix || 0);
          if (reservation.status === 'Confirmé') {
            activeReservations++;
          }
        }
      });

      // Mock expense data - in a real app, this would come from a finance tracking system
      monthlyExpenses = monthlyRevenue * 0.3; // Assume 30% expenses

      setBudgetData({
        monthlyRevenue,
        monthlyExpenses,
        totalProperties: properties.length,
        activeReservations
      });

      // Generate chart data
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const revenueByMonth = new Array(12).fill(0);
      const expensesByMonth = new Array(12).fill(0);

      reservations.forEach(reservation => {
        const bookingDate = reservation.dateArrivee?.toDate ? reservation.dateArrivee.toDate() : new Date(reservation.dateArrivee);
        if (bookingDate && bookingDate.getFullYear() === currentYear) {
          const month = bookingDate.getMonth();
          revenueByMonth[month] += parseFloat(reservation.prix || 0);
          expensesByMonth[month] += parseFloat(reservation.prix || 0) * 0.3;
        }
      });

      setRevenueData(revenueByMonth);
      setExpenseData(expensesByMonth);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Revenus',
        data: revenueData,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Dépenses',
        data: expenseData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ['Revenus nets', 'Dépenses'],
    datasets: [
      {
        data: [budgetData.monthlyRevenue - budgetData.monthlyExpenses, budgetData.monthlyExpenses],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderColor: ['#16a34a', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h4 className="mb-4">Tableau de Bord Financier</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="text-success">{budgetData.monthlyRevenue.toLocaleString()}€</h3>
              <p className="text-muted mb-0">Revenus ce mois</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="text-danger">{budgetData.monthlyExpenses.toLocaleString()}€</h3>
              <p className="text-muted mb-0">Dépenses ce mois</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="text-primary">{budgetData.totalProperties}</h3>
              <p className="text-muted mb-0">Propriétés</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="text-warning">{budgetData.activeReservations}</h3>
              <p className="text-muted mb-0">Réservations actives</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Revenus et Dépenses par Mois</h5>
            </Card.Header>
            <Card.Body>
              <Bar data={chartData} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
              }} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Répartition ce Mois</h5>
            </Card.Header>
            <Card.Body>
              <Doughnut data={doughnutData} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }} />
              <div className="mt-3 text-center">
                <Badge bg="success" className="me-2">
                  Bénéfice: {(budgetData.monthlyRevenue - budgetData.monthlyExpenses).toLocaleString()}€
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Actions Rapides</h5>
            </Card.Header>
            <Card.Body>
              <Button variant="primary" className="me-2 mb-2">Voir les Factures</Button>
              <Button variant="success" className="me-2 mb-2">Télécharger Rapport Mensuel</Button>
              <Button variant="outline-primary" className="mb-2">Configurer Alertes Budget</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default OwnerBudgetDashboard;