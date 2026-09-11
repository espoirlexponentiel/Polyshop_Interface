import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { cartCount, openDrawer } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <div className="brand-badge-7">7</div>
          <div className="brand-text-block">
            <div className="brand-title">7 SHOP</div>
          </div>
        </Link>

        {/* Navigation Desktop */}
        <nav className="nav-links">
          <Link to="/" className="nav-link-btn active">
            Tous les Rayons
          </Link>
          <a href="#catalogue" className="nav-link-btn">
            Catégories <span style={{ fontSize: '0.75rem' }}>▼</span>
          </a>
          <Link to={isAuthenticated ? "/orders" : "/login"} className="nav-link-btn">
            Mon Compte
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-dark)' }}>
                {user?.nom || user?.email || 'Client'}
              </span>
              <button 
                onClick={logout}
                className="nav-link-btn"
                style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#f1f5f9' }}
              >
                Déconnexion
              </button>
            </div>
          )}

          {/* Cart Button with Count Badge */}
          <button 
            onClick={openDrawer}
            className="btn-cart-nav"
            aria-label="Ouvrir le panier"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Panier</span>
            {cartCount > 0 && (
              <span className="cart-count-badge">{cartCount}</span>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu mobile"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu Collapsible */}
      {mobileMenuOpen && (
        <div style={{
          padding: '16px 24px',
          background: '#ffffff',
          borderTop: '1px solid var(--color-gray-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Link 
            to="/" 
            className="nav-link-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            Tous les Rayons
          </Link>
          <a 
            href="#catalogue" 
            className="nav-link-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            Catégories
          </a>
          <Link 
            to={isAuthenticated ? "/orders" : "/login"} 
            className="nav-link-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            Mon Compte
          </Link>
        </div>
      )}
    </header>
  );
}
