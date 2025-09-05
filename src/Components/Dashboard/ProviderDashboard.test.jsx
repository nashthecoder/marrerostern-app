import { render, screen } from '@testing-library/react';
import ProviderDashboard from './Dashboard/ProviderDashboard';

describe('ProviderDashboard', () => {
  it('renders assigned tasks section', () => {
    render(<ProviderDashboard />);
    expect(screen.getByText(/Mes tâches/i)).toBeInTheDocument();
  });
});
