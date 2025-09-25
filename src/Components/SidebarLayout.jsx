import React, { useState, useEffect } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import '../assets/css/sidebar.css';
import FooterSidebar from './FooterSidebar';
import Header from './Header';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

function SidebarLayout({ children, setIsAuthenticated }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const location = useLocation();

  useEffect(() => {
    const fetchRole = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setEmail(currentUser.email);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setRole(userSnap.data().role);
          } else {
            setRole(null);
          }
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
        setEmail("");
      }
    };
    fetchRole();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const activePath = location.pathname;
  const isTraveler = role === 'traveler' || role === 'voyageur';

  return (
    <div style={{ position: 'relative' }}>
      {/* Sidebar open chevron (when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          className="sidebar-open-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Ouvrir le menu latéral"
          style={{
            position: 'fixed',
            top: 20,
            left: 10,
            zIndex: 1300,
            background: '#20434e',
            border: 'none',
            color: '#fff',
            fontSize: 22,
            borderRadius: '8px',
            padding: '6px 10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaChevronLeft style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}
      {/* Sidebar */}
      <div className={`sidebar bg-dark text-white${sidebarOpen ? " open" : ""}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 1200 }}>
        {/* Close button inside sidebar, top right */}
        {sidebarOpen && (
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu latéral"
            style={{ position: 'absolute', top: 12, right: 12, zIndex: 1200, background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}
          >
            <FaChevronLeft />
          </button>
        )}
        <div className="p-3 flex-grow-1">
          {/* Logo */}
          <div className="mb-2">
            <img src="/images/logo.png" alt="Logo" className="sidebar-logo" />
          </div>
          {(email || role) && (
            <div className="mb-4" style={{lineHeight:1.2, paddingTop: '1rem'}}>
              <hr style={{ borderColor: '#f7f8f8ff', margin: '0 0 0.5rem 0' }} />
              {email && <div className="small text-light">{email}</div>}
              {role && <div className="small text-secondary">{role}</div>}
            </div>
          )}



            {/* Logout button removed from sidebar; only appears in header */}
          <ul className="list-unstyled">
            <li className={`mb-3 ${activePath === "/dashboard" ? "active" : ""}`}>
              <Link to="/dashboard" className="text-light text-decoration-none d-flex align-items-center">
                <FaTachometerAlt className="me-2" /> Tableau de bord
              </Link>
            </li>
            {isTraveler ? (
              <>
                <li className={`mb-3 ${activePath === "/profile" ? "active" : ""}`}>
                  <Link to="/profile" className="text-light text-decoration-none d-flex align-items-center">
                    <FaUsers className="me-2" /> Mon profil
                  </Link>
                </li>
                <li className={`mb-3 ${activePath === "/communications" ? "active" : ""}`}>
                  <Link to="/communications" className="text-light text-decoration-none d-flex align-items-center">
                    <FaComments className="me-2" /> Messagerie
                  </Link>
                </li>
                <li className={`mb-3 ${activePath === "/incidents" ? "active" : ""}`}>
                  <Link to="/incidents" className="text-light text-decoration-none d-flex align-items-center">
                    <FaTools className="me-2" /> Signaler un incident
                  </Link>
                </li>
              </>
            ) : (
              <>
                {role === 'admin' && (
                  <li className={`mb-3 ${activePath === "/users" ? "active" : ""}`}>
                    <Link to="/users" className="text-light text-decoration-none d-flex align-items-center">
                      <FaUsers className="me-2" /> Gestions utilisateurs
                    </Link>
                  </li>
                )}
                <li className={`mb-3 ${activePath === "/reservations" ? "active" : ""}`}>
                  <Link to="/reservations" className="text-light text-decoration-none d-flex align-items-center">
                    <FaClipboardList className="me-2" /> Réservations et missions
                  </Link>
                </li>
                <li className={`mb-3 ${activePath === "/incidents" ? "active" : ""}`}>
                  <Link to="/incidents" className="text-light text-decoration-none d-flex align-items-center">
                    <FaTools className="me-2" /> Suivi incidents et stocks
                  </Link>
                </li>
                <li className={`mb-3 ${activePath === "/facturation" ? "active" : ""}`}>
                  <Link to="/facturation" className="text-light text-decoration-none d-flex align-items-center">
                    <FaFileInvoiceDollar className="me-2" /> Module de facturation Centralisé
                  </Link>
                </li>
                <li className={`mb-3 ${activePath === "/communications" ? "active" : ""}`}>
                  <Link to="/communications" className="text-light text-decoration-none d-flex align-items-center">
                    <FaComments className="me-2" /> Communications & Avis
                  </Link>
                </li>
                {role === 'owner' && (
                  <>
                    <li className={`mb-3 ${activePath === "/dashboard" ? "active" : ""}`}>
                      <Link to="/dashboard" className="text-light text-decoration-none d-flex align-items-center">
                        <FaTachometerAlt className="me-2" /> Tableau de bord
                      </Link>
                    </li>
                    <li className={`mb-3 ${activePath === "/my-properties" ? "active" : ""}`}>
                      <Link to="/my-properties" className="text-light text-decoration-none d-flex align-items-center">
                        <FaClipboardList className="me-2" /> Mes propriétés
                      </Link>
                    </li>
                    <li className={`mb-3 ${activePath === "/messaging" ? "active" : ""}`}>
                      <Link to="/messaging" className="text-light text-decoration-none d-flex align-items-center">
                        <FaComments className="me-2" /> Messagerie
                      </Link>
                    </li>
                    <li className={`mb-3 ${activePath === "/incident-report" ? "active" : ""}`}>
                      <Link to="/incident-report" className="text-light text-decoration-none d-flex align-items-center">
                        <FaTools className="me-2" /> Signaler un incident
                      </Link>
                    </li>
                    <li className={`mb-3 ${activePath === "/budget-overview" ? "active" : ""}`}>
                      <Link to="/budget-overview" className="text-light text-decoration-none d-flex align-items-center">
                        <FaFileInvoiceDollar className="me-2" /> Aperçu du budget
                      </Link>
                    </li>
                    <li className={`mb-3 ${activePath === "/booking-calendar" ? "active" : ""}`}>
                      <Link to="/booking-calendar" className="text-light text-decoration-none d-flex align-items-center">
                        <FaClipboardList className="me-2" /> Calendrier des réservations
                      </Link>
                    </li>
                    <li className={`mb-3 ${activePath === "/owned-properties" ? "active" : ""}`}>
                      <Link to="/owned-properties" className="text-light text-decoration-none d-flex align-items-center">
                        <FaClipboardList className="me-2" /> Propriétés possédées
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </div>

        <div className="p-3" style={{ flexShrink: 0 }}>
          <FooterSidebar />
        </div>
      </div>




      {/* Contenu principal */}
      <div
        className="flex-grow-1 p-4 content-area"
        style={{
          marginLeft: sidebarOpen ? 240 : 0,
          paddingLeft: sidebarOpen ? undefined : 20,
          transition: 'margin-left 0.3s, padding-left 0.3s'
        }}
      >
        {children}

      </div>
    </div>
  );
}

// Helper to get page title from path
function getPageTitle(path) {
  switch (path) {
    case '/dashboard':
      return 'Tableau de bord';
    case '/reservations':
      return 'Réservations et missions';
    case '/users':
      return 'Gestions utilisateurs';
    case '/incidents':
      return 'Incidents';
    case '/communications':
      return 'Communications & Avis';
    case '/profile':
      return 'Mon profil';
    default:
      return 'Marrero Stern';
  }
}


export default SidebarLayout;