import { render, screen } from '@testing-library/react';
import AdminDashboard from './Dashboard/AdminDashboard';

describe('AdminDashboard', () => {
  it('renders global dashboard', () => {
    render(<AdminDashboard />);
    expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
  });
});
