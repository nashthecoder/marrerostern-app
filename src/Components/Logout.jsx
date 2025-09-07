import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { trackLogout } from '../utils/autoTracker';

function Logout({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Supprimer le token localStorage ou autre méthode de session
    const auth = getAuth();
    const user = auth.currentUser;
    let ip = '';
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      ip = data.ip;
    } catch (e) {}
    if (user) {
      await trackLogout(user.uid, ip);
    }
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