import React from 'react'
import { FaLinkedin, FaTwitter } from 'react-icons/fa';

function FooterSidebar() {
  const menus = [
    "Contact",
    "À propos",
    "Mentions légales",
    "Tutoriel",
    "Carrières",
    "Carrières",
    "Carrières",
  ]

  return (
    <div style={{ padding: '1rem', color: '#fff', fontSize: '12px', fontFamily: 'inter, sans-serif' }}>
      {/* Menu en grille 2 colonnes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px 20px',
          marginBottom: '1.5rem',
        }}
      >
        {menus.map((item, idx) => (
          <div key={idx} style={{ cursor: 'pointer' }}>
            {item}
          </div>
        ))}
      </div>

      {/* Section "Nous suivre" */}
      <div>
        <h5>Nous suivre :</h5>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', fontSize: '1.25rem' }}>
            <FaLinkedin style={{ cursor: 'pointer', color: '#0A66C2' }} />
            <FaTwitter style={{ cursor: 'pointer', color: '#1DA1F2' }} />
        </div>
      </div>
    </div>
  )
}

export default FooterSidebar