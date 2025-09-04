import React, { useState } from 'react';
import { FaBars, FaChevronLeft } from 'react-icons/fa';
import {
  FaTachometerAlt,
  FaUsers,
  FaClipboardList,
  FaTools,
  FaFileInvoiceDollar,
  FaComments,
  FaWarehouse,
  FaCalendarAlt,
  FaChartLine,
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import '../assets/css/sidebar.css';
import FooterSidebar from './FooterSidebar';

import { useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

function SidebarLayout({ children, setIsAuthenticated }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchRole = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setRole(userSnap.data().role);
          } else {
            setRole(null);
          }
        } catch (error) {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    };
    fetchRole();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const activePath = location.pathname;

  const isTraveler = role === 'traveler' || role === 'voyageur';
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className={`sidebar bg-dark text-white ${sidebarOpen ? "open" : ""}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="p-3 flex-grow-1">
          {/* Logo */}
          <div className="mb-4">
            <img src="/images/logo.png" alt="Logo" className="sidebar-logo" />
          </div>

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
                {(role === 'admin' || role === 'administrator') && (
                  <>
                    <li className={`mb-3 ${activePath === "/users" ? "active" : ""}`}>
                      <Link to="/users" className="text-light text-decoration-none d-flex align-items-center">
                        <FaUsers className="me-2" /> Gestion utilisateurs
                      </Link>
                    </li>
                    <li className={`mb-3 ${activePath === "/stock" ? "active" : ""}`}>
                      <Link to="/stock" className="text-light text-decoration-none d-flex align-items-center">
                        <FaWarehouse className="me-2" /> Gestion des stocks
                      </Link>
                    </li>
                  </>
                )}
                {(role === 'owner' || role === 'proprietaire') && (
                  <>
                    <li className={`mb-3 ${activePath === "/budget" ? "active" : ""}`}>
                      <Link to="/budget" className="text-light text-decoration-none d-flex align-items-center">
                        <FaChartLine className="me-2" /> Budget Overview
                      </Link>
                    </li>
                    <li className={`mb-3 ${activePath === "/calendar" ? "active" : ""}`}>
                      <Link to="/calendar" className="text-light text-decoration-none d-flex align-items-center">
                        <FaCalendarAlt className="me-2" /> Calendrier réservations
                      </Link>
                    </li>
                  </>
                )}
                <li className={`mb-3 ${activePath === "/reservations" ? "active" : ""}`}>
                  <Link to="/reservations" className="text-light text-decoration-none d-flex align-items-center">
                    <FaClipboardList className="me-2" /> Réservations et missions
                  </Link>
                </li>
                <li className={`mb-3 ${activePath === "/incidents" ? "active" : ""}`}>
                  <Link to="/incidents" className="text-light text-decoration-none d-flex align-items-center">
                    <FaTools className="me-2" /> Suivi incidents
                  </Link>
                </li>
                <li className={`mb-3 ${activePath === "/messages" ? "active" : ""}`}>
                  <Link to="/messages" className="text-light text-decoration-none d-flex align-items-center">
                    <FaComments className="me-2" /> Messagerie
                  </Link>
                </li>
                <li className={`mb-3 ${activePath === "/facturation" ? "active" : ""}`}>
                  <Link to="/facturation" className="text-light text-decoration-none d-flex align-items-center">
                    <FaFileInvoiceDollar className="me-2" /> Module de facturation
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="p-3" style={{ flexShrink: 0 }}>
          <FooterSidebar />
        </div>
      </div>

      {/* Toggle Button (mobile) */}
      <button
        className="sidebar-toggle d-md-none"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <FaChevronLeft /> : <FaBars />}
      </button>

      {/* Contenu principal */}
      <div className="flex-grow-1 p-4 content-area">
        {children}
      </div>
    </div>
  );
}

export default SidebarLayout;