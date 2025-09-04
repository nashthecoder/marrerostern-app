import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Logout({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimer le token localStorage ou autre méthode de session
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/connexion');
  };

  return (
    <div
      onClick={handleLogout}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#000000', // rouge
        fontWeight: '500',
        marginTop: '15px'
      }}
    >
      <FaSignOutAlt />
      <span>Déconnexion</span>
    </div>
  );
}

export default Logout;