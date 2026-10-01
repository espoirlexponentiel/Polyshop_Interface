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
                <span className="nav-market-sub">Marché</span>
                <strong className="nav-market-current-name">{activeMarket?.nom || 'Sélectionner'}</strong>
              </span>
              <span className={`nav-market-chevron ${marketDropdownOpen ? 'rotate' : ''}`}>▾</span>
            </button>

            {marketDropdownOpen && (
              <div className="nav-market-dropdown-panel">
                <div className="nav-market-panel-header">
                  <span className="panel-title">🏪 Marché</span>
                  <span className="panel-subtitle">Changer de marché</span>
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
                            {market.products?.length || 0} articles disponibles
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

      {/* Mobile Left White Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-left-drawer" onClick={(e) => e.stopPropagation()}>
            {/* 1. Drawer Header */}
            <div className="drawer-header-dark">
              <Link to="/" className="drawer-brand" onClick={() => setMobileMenuOpen(false)}>
                {siteConfig?.logoUrl ? (
                  <img 
                    src={siteConfig.logoUrl} 
                    alt={siteConfig.brandName || 'Logo'} 
                    className="drawer-brand-img"
                  />
                ) : (
                  <div className="drawer-brand-badge">{siteConfig?.brandBadge || '7'}</div>
                )}
                <div className="drawer-brand-text">
                  <span className="drawer-brand-name">{siteConfig?.brandName || '7 SHOP'}</span>
                  <span className="drawer-brand-tag">Boutique Officielle</span>
                </div>
              </Link>
              <button 
                className="drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                ✕
              </button>
            </div>

            {/* 2. Drawer Body (Scrollable) */}
            <div className="drawer-body-dark">
              {/* Navigation Links */}
              <div className="drawer-section">
                <span className="drawer-section-title">Navigation</span>
                <nav className="drawer-nav-list">
                  <Link 
                    to="/" 
                    className={`drawer-nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="drawer-link-icon">🛍️</span>
                    <span className="drawer-link-text">Boutique & Accueil</span>
                    <span className="drawer-link-chevron">›</span>
                  </Link>

                  <Link 
                    to={isAuthenticated ? "/orders" : "/login?redirect=orders"} 
                    className={`drawer-nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="drawer-link-icon">📦</span>
                    <span className="drawer-link-text">Mes Commandes & Suivi</span>
                    <span className="drawer-link-chevron">›</span>
                  </Link>

                  <button 
                    type="button"
                    className="drawer-nav-link drawer-cart-link"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openDrawer();
                    }}
                  >
                    <span className="drawer-link-icon">🛒</span>
                    <span className="drawer-link-text">Mon Panier</span>
                    <span className="drawer-cart-badge">{cartCount}</span>
                  </button>

                  {isAuthenticated && user?.role === 'ADMIN' && (
                    <Link 
                      to="/admin" 
                      className={`drawer-nav-link admin-glow ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="drawer-link-icon">🛡️</span>
                      <span className="drawer-link-text">Espace Administration</span>
                      <span className="drawer-admin-pill">ADMIN</span>
                    </Link>
                  )}
                </nav>
              </div>

              {/* Marchés Switcher */}
              <div className="drawer-section">
                <div className="drawer-section-header-row">
                  <span className="drawer-section-title">🏪 Marché</span>
                  <span className="drawer-section-hint">Changer de marché</span>
                </div>
                <div className="drawer-markets-list">
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
                        className={`drawer-market-chip ${isSelected ? 'active' : ''}`}
                        style={isSelected ? { 
                          borderColor: market.couleurPrimaire || '#0066ff', 
                          background: `${market.couleurPrimaire || '#0066ff'}12`,
                          color: market.couleurPrimaire || '#0066ff'
                        } : {}}
                      >
                        <span className="drawer-market-icon">{market.icone || '🏬'}</span>
                        <div className="drawer-market-info">
                          <strong className="drawer-market-name">{market.nom}</strong>
                          <span className="drawer-market-count">{market.products?.length || 0} articles</span>
                        </div>
                        {isSelected && <span className="drawer-market-active-dot">✓ Actif</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Drawer Bottom Footer (User info or Login button) */}
            <div className="drawer-footer-dark">
              {isAuthenticated ? (
                <div className="drawer-user-profile-box">
                  <div className="drawer-user-info-row">
                    <div className="drawer-user-avatar-circle">
                      👤
                    </div>
                    <div className="drawer-user-text-meta">
                      <span className="drawer-user-greeting">Connecté en tant que</span>
                      <strong className="drawer-user-fullname" title={user?.nom || user?.email}>
                        {user?.nom || user?.prenom || user?.email || 'Client 7 Shop'}
                      </strong>
                      <span className="drawer-user-email-text">{user?.email}</span>
                    </div>
                  </div>
                  <div className="drawer-user-actions-row">
                    <Link 
                      to="/orders" 
                      className="drawer-btn-orders-quick"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      📦 Commandes
                    </Link>
                    <button 
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="drawer-btn-logout"
                      title="Se déconnecter"
                    >
                      🚪 Déconnexion
                    </button>
                  </div>
                </div>
              ) : (
                <div className="drawer-auth-bottom-box">
                  <p className="drawer-auth-pitch">
                    Connectez-vous pour passer commande et suivre vos livraisons.
                  </p>
                  <Link 
                    to="/login"
                    className="drawer-btn-login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>🔐 Se Connecter / S'inscrire</span>
                    <span>›</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
