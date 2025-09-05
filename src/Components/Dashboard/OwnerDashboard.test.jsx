import { render, screen } from '@testing-library/react';
import OwnerDashboard from './Dashboard/OwnerDashboard';

describe('OwnerDashboard', () => {
  it('renders budget overview', () => {
    render(<OwnerDashboard />);
    expect(screen.getByText(/Budget/i)).toBeInTheDocument();
  });
});
