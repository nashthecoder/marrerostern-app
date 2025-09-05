import { render, screen } from '@testing-library/react';
import TravelerDashboard from './Dashboard/TravelerDashboard';

describe('TravelerDashboard', () => {
  it('renders reservations section', () => {
    render(<TravelerDashboard />);
    expect(screen.getByText(/Mes réservations/i)).toBeInTheDocument();
  });
});
