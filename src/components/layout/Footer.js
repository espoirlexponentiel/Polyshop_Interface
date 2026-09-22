import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../../context/MarketContext';
import { useSiteConfig } from '../../context/SiteConfigContext';

export default function Footer() {
  const { activeMarket } = useMarket();
  const { siteConfig } = useSiteConfig();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const categories = activeMarket?.categories || ["Boxers", "Chaussettes", "Débardeurs", "Tapettes", "Pull-overs", "Ceintures", "Pantalons", "Oversizes", "Casquettes"];

  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        {/* Main 4 Columns Grid */}
        <div className="footer-main-grid">
          
          {/* Column 1: Brand & Contact */}
          <div className="footer-col brand-col">
            <div className="footer-brand-header">
              {siteConfig?.logoUrl ? (
                <img 
                  src={siteConfig.logoUrl} 
                  alt={siteConfig.brandName || 'Logo'} 
                  style={{ maxHeight: '40px', maxWidth: '120px', objectFit: 'contain' }}
                />
              ) : (
                <div className="brand-badge-7">{siteConfig?.brandBadge || 'P'}</div>
              )}
              <div>
                <div className="brand-title">{siteConfig?.brandName || 'PolyShop'}</div>
                <div className="brand-official-tag">{siteConfig?.tagline || 'POLYSHOP OFFICIAL'}</div>
              </div>
            </div>

            <p className="footer-desc">
              {siteConfig?.brandName || 'PolyShop'} — Plateforme de commerce d'excellence multi-marchés. Découvrez notre univers {activeMarket?.nom || 'Mode & Vestimentaire'} avec des matières nobles et des produits sélectionnés pour votre quotidien.
            </p>
          </div>

          {/* Column 2: Rayons & Articles (Dynamique selon le Marché) */}
          <div className="footer-col">
            <h4 className="footer-col-title">
              RAYONS {activeMarket?.nom?.toUpperCase() || 'ARTICLES'}
            </h4>
            <ul className="footer-links-list">
              {categories.slice(0, 9).map((cat, idx) => (
                <li key={idx}>
                  <a href="#catalogue">{cat}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Espace & Services */}
          <div className="footer-col">
            <h4 className="footer-col-title">ESPACE & SERVICES</h4>
            <ul className="footer-links-list">
              <li><Link to="/login">Mon Espace Client</Link></li>
              <li><Link to="/admin">Espace Administration {siteConfig?.brandName || 'PolyShop'}</Link></li>
              <li><a href="#paiement">Paiement Mobile Money Sécurisé</a></li>
              <li><a href="#confidentialite">Politique de Confidentialité</a></li>
              <li><a href="#cgv">Conditions Générales de Vente</a></li>
              <li><a href="#guide-tailles">Guide & FAQ</a></li>
            </ul>
          </div>

          {/* Column 4: Club Newsletter */}
          <div className="footer-col club-col">
            <h4 className="footer-col-title club-title">
              <span className="club-icon">💥</span> CLUB {siteConfig?.brandName?.toUpperCase() || 'POLYSHOP'}
            </h4>
            
            <p className="club-desc">
              Bénéficiez de <strong>-10%</strong> sur votre première commande avec le code <span className="promo-code">WELCOME10</span>.
            </p>

            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn" aria-label="S'inscrire">
                →
              </button>
            </form>

            {subscribed && (
              <p style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '700', marginTop: '6px' }}>
                ✓ Inscription confirmée ! Code : WELCOME10
              </p>
            )}

            <p className="no-spam-note">
              Pas de spam. Désinscription à tout moment.
            </p>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © 2026 {siteConfig?.brandName || 'PolyShop'} (PolyShop) • Tous droits réservés.
          </p>

          <div className="payment-badges-row">
            <span className="pay-badge">+228 99965306</span>
            <span className="pay-badge">+228 96146504</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
