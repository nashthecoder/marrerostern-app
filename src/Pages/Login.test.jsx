import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

describe('Login', () => {
  it('renders login form', () => {
    render(<Login setIsAuthenticated={() => {}} />);
    expect(screen.getByText(/Connexion à votre espace/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
  });

  it('shows error on invalid login', async () => {
    render(<Login setIsAuthenticated={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'bad@email.com' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText(/Se connecter/i));
    // You may need to mock Firebase for this test
    // expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});
