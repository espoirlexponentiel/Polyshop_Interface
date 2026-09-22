import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { useSiteConfig } from '../../context/SiteConfigContext';

export default function Navbar() {
  const { cartCount, openDrawer } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { visibleMarkets, activeMarketId, activeMarket, switchMarket } = useMarket();
  const { siteConfig } = useSiteConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMarketDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMarketDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          {siteConfig?.logoUrl ? (
            <img 
              src={siteConfig.logoUrl} 
              alt={siteConfig.brandName || 'Logo'} 
              className="nav-brand-img"
            />
          ) : (
            <div className="brand-badge-7">{siteConfig?.brandBadge || '7'}</div>
          )}
          <div className="brand-text-block">
            <div className="brand-title">{siteConfig?.brandName || '7 SHOP'}</div>
          </div>
        </Link>

        {/* Navigation Desktop */}
        <nav className="nav-links">
          <Link to="/" className={`nav-link-btn ${location.pathname === '/' ? 'active' : ''}`}>
            Boutique
          </Link>
          <a href="#catalogue" className="nav-link-btn">
            Rayons
          </a>
          <Link to={isAuthenticated ? "/orders" : "/login"} className={`nav-link-btn ${location.pathname === '/orders' ? 'active' : ''}`}>
            Mes Commandes
          </Link>

          {/* Admin Direct Access */}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link 
              to="/admin" 
              className="nav-link-btn" 
              style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                color: '#ffb800', 
                fontWeight: '800',
                border: '1px solid #334155'
              }}
            >
              🛡️ Espace Admin
            </Link>
          )}

          {/* Sélecteur de Marché / Univers avec Dropdown */}
          <div className="nav-market-dropdown-wrap" ref={dropdownRef}>
            <button
              className={`nav-market-dropdown-btn ${marketDropdownOpen ? 'open' : ''}`}
              onClick={() => setMarketDropdownOpen(!marketDropdownOpen)}
              type="button"
              aria-label="Sélectionner un marché"
              title="Cliquez pour changer de marché"
            >
              <span className="nav-market-text">
                <span className="nav-market-sub">Marché :</span>
                <strong className="nav-market-current-name">{activeMarket?.nom || 'Sélectionner'}</strong>
              </span>
              <span className={`nav-market-chevron ${marketDropdownOpen ? 'rotate' : ''}`}>▾</span>
            </button>

            {marketDropdownOpen && (
              <div className="nav-market-dropdown-panel">
                <div className="nav-market-panel-header">
                  <span className="panel-title">🏪 Nos Marchés & Univers</span>
                  <span className="panel-subtitle">Cliquez pour changer d'univers</span>
                </div>
                <div className="nav-market-list">
                  {visibleMarkets.map((market) => {
                    const isSelected = market.id === activeMarketId;
                    return (
                      <button
                        key={market.id}
                        type="button"
                        onClick={() => {
                          switchMarket(market.id);
                          setMarketDropdownOpen(false);
                        }}
                        className={`nav-market-option ${isSelected ? 'active' : ''}`}
                        style={isSelected ? { borderLeft: `4px solid ${market.couleurPrimaire}` } : {}}
                      >
                        <span className="option-icon">{market.icone || '🏬'}</span>
                        <div className="option-info">
                          <span className="option-name">{market.nom}</span>
                          <span className="option-desc">
                            {market.categories?.length || 0} rayons • Produits dédiés
                          </span>
                        </div>
                        {isSelected ? (
                          <span className="option-check-badge">✓ Actif</span>
                        ) : (
                          <span className="option-arrow-indicator">→</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          {/* Desktop User actions (hidden on mobile, moved inside mobile drawer) */}
          <div className="desktop-user-actions">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link 
                  to={user?.role === 'ADMIN' ? "/admin" : "/orders"}
                  style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: '700', 
                    color: 'var(--color-dark)',
                    background: '#f8fafc',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Gérer mon compte"
                >
                  <span>👤</span>
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.nom || user?.email || 'Mon Compte'}
                  </span>
                </Link>
                <button 
                  onClick={logout}
                  className="nav-link-btn"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#fee2e2', color: '#dc2626', fontWeight: '700' }}
                  title="Se déconnecter"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="nav-link-btn"
                style={{ background: 'var(--primary-blue-light)', color: 'var(--primary-blue)', fontWeight: '800' }}
              >
                Connexion
              </Link>
            )}
          </div>

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
            <span className="cart-btn-label">Panier</span>
            {cartCount > 0 && (
              <span className="cart-count-badge">{cartCount}</span>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu mobile"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Collapsible */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown-menu">
          {/* User Account / Auth Card */}
          {isAuthenticated ? (
            <div className="mobile-user-card">
              <div className="mobile-user-header">
                <div className="mobile-user-avatar">👤</div>
                <div className="mobile-user-details">
                  <strong className="mobile-user-name">{user?.nom || 'Client 7 Shop'}</strong>
                  <span className="mobile-user-email">{user?.email}</span>
                </div>
                {user?.role === 'ADMIN' && (
                  <span className="mobile-admin-badge">ADMIN</span>
                )}
              </div>
              <div className="mobile-user-links">
                <Link 
                  to="/orders" 
                  className="mobile-sublink-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>📦 Mes Commandes & Suivi</span>
                  <span>›</span>
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link 
                    to="/admin" 
                    className="mobile-sublink-btn admin-highlight"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>🛡️ Panneau d'Administration</span>
                    <span>›</span>
                  </Link>
                )}
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="mobile-logout-btn"
                >
                  🚪 Déconnexion du compte
                </button>
              </div>
            </div>
          ) : (
            <div className="mobile-auth-card">
              <p className="mobile-auth-prompt">
                Connectez-vous pour passer vos commandes et suivre vos livraisons.
              </p>
              <Link 
                to="/login"
                className="mobile-login-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                🔐 Se Connecter / S'inscrire
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <div className="mobile-nav-links">
            <Link 
              to="/" 
              className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>🛍️ Boutique Complète</span>
              <span>›</span>
            </Link>
            <a 
              href="#catalogue" 
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>📂 Rayons & Articles ({activeMarket?.categories?.length || 0})</span>
              <span>›</span>
            </a>
            <Link 
              to={isAuthenticated ? "/orders" : "/login"} 
              className={`mobile-nav-item ${location.pathname === '/orders' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>📦 Suivi de Commande</span>
              <span>›</span>
            </Link>
          </div>
          
          {/* Market Switcher Section in Mobile Menu */}
          <div className="mobile-markets-section">
            <div className="mobile-markets-title">
              <span>🏪</span> Changer de Marché / Univers :
            </div>
            <div className="mobile-markets-grid">
              {visibleMarkets.map((market) => {
                const isSelected = market.id === activeMarketId;
                return (
                  <button
                    key={market.id}
                    type="button"
                    onClick={() => {
                      switchMarket(market.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`mobile-market-btn ${isSelected ? 'active' : ''}`}
                    style={isSelected ? { 
                      borderColor: market.couleurPrimaire || '#0066ff', 
                      backgroundColor: `${market.couleurPrimaire || '#0066ff'}15`,
                      color: market.couleurPrimaire || '#0066ff'
                    } : {}}
                  >
                    <span className="market-btn-icon">{market.icone || '🏬'}</span>
                    <div className="market-btn-text">
                      <strong className="market-btn-name">{market.nom}</strong>
                      <span className="market-btn-sub">{market.categories?.length || 0} rayons disponibles</span>
                    </div>
                    {isSelected && <span className="mobile-market-active-dot">✓ Actif</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
