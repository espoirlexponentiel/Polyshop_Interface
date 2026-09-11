import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';

export default function Navbar() {
  const { cartCount, openDrawer } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { markets, activeMarketId, activeMarket, switchMarket } = useMarket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
          <div className="brand-badge-7">7</div>
          <div className="brand-text-block">
            <div className="brand-title">7 SHOP</div>
          </div>
        </Link>

        {/* Navigation Desktop */}
        <nav className="nav-links">
          <Link to="/" className="nav-link-btn active">
            Boutique
          </Link>
          <a href="#catalogue" className="nav-link-btn">
            Rayons
          </a>
          <Link to={isAuthenticated ? "/orders" : "/login"} className="nav-link-btn">
            Mon Compte
          </Link>

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
                  {markets.map((market) => {
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
        <div className="mobile-dropdown-menu">
          <Link 
            to="/" 
            className="nav-link-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            Boutique
          </Link>
          <a 
            href="#catalogue" 
            className="nav-link-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            Rayons
          </a>
          <Link 
            to={isAuthenticated ? "/orders" : "/login"} 
            className="nav-link-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            Mon Compte
          </Link>
          
          <div className="mobile-markets-section">
            <div className="mobile-markets-title">🏪 Sélectionner un Marché :</div>
            <div className="mobile-markets-grid">
              {markets.map((market) => {
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
                    style={isSelected ? { borderColor: market.couleurPrimaire, backgroundColor: `${market.couleurPrimaire}15` } : {}}
                  >
                    <span>{market.icone || '🏬'}</span>
                    <span>{market.nom}</span>
                    {isSelected && <span className="mobile-market-active-dot">●</span>}
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
