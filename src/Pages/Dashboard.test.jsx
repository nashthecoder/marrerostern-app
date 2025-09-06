import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collection, id) => ({ db, collection, id })),
  getDoc: jest.fn(),
}));

jest.mock('../Components/Dashboard/OwnerDashboard', () => () => <div>Owner Dashboard</div>);

jest.mock('../Components/Header', () => () => <div>Header</div>);

describe('Dashboard Component', () => {
  it('renders OwnerDashboard for user with owner role', async () => {
    const mockUser = { uid: 'owner123' };
    const mockRole = { exists: () => true, data: () => ({ role: 'owner' }) };

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    getDoc.mockResolvedValue(mockRole);

    render(<Dashboard setIsAuthenticated={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Owner Dashboard')).toBeInTheDocument();
    });
  });

  it('shows Access Denied for user without a role', async () => {
    const mockUser = { uid: 'unknown123' };
    const mockRole = { exists: () => false };

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    getDoc.mockResolvedValue(mockRole);

    render(<Dashboard setIsAuthenticated={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });
});
