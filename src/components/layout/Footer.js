import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        {/* Main 4 Columns Grid */}
        <div className="footer-main-grid">
          
          {/* Column 1: Brand & Contact */}
          <div className="footer-col brand-col">
            <div className="footer-brand-header">
              <div className="brand-badge-7">7</div>
              <div>
                <div className="brand-title">7 SHOP</div>
                <div className="brand-official-tag">SEVEN SHOP OFFICIAL</div>
              </div>
            </div>

            <p className="footer-desc">
              7 Shop (Seven Shop) — Les essentiels du quotidien : sous-vêtements (boxers, chaussettes, débardeurs), 
              tapettes, pull-overs, ceintures, pantalons, coupes oversize et casquettes.
            </p>

            <div className="footer-signature-colors">
              <span className="sig-label">Couleurs signatures :</span>
              <div className="sig-pills">
                <span className="sig-pill"><span className="nuance-dot dot-blanc"></span> Blanc</span>
                <span className="sig-pill"><span className="nuance-dot dot-bleu"></span> Bleu</span>
                <span className="sig-pill"><span className="nuance-dot dot-jaune"></span> Jaune</span>
              </div>
            </div>

            <div className="footer-contact-info">
              <p>Service Client 7 Shop : <a href="mailto:contact@7shop.com">contact@7shop.com</a></p>
              <p>Assistance directe : <strong>+33 (0)1 89 20 07 07</strong> (9h - 19h)</p>
            </div>
          </div>

          {/* Column 2: Rayons & Articles */}
          <div className="footer-col">
            <h4 className="footer-col-title">RAYONS & ARTICLES</h4>
            <ul className="footer-links-list">
              <li><a href="#catalogue">Boxers</a></li>
              <li><a href="#catalogue">Chaussettes</a></li>
              <li><a href="#catalogue">Débardeurs</a></li>
              <li><a href="#catalogue">Tapettes</a></li>
              <li><a href="#catalogue">Pull-overs</a></li>
              <li><a href="#catalogue">Ceintures</a></li>
              <li><a href="#catalogue">Pantalons</a></li>
              <li><a href="#catalogue">Oversizes</a></li>
              <li><a href="#catalogue">Casquettes</a></li>
            </ul>
          </div>

          {/* Column 3: Espace & Services */}
          <div className="footer-col">
            <h4 className="footer-col-title">ESPACE & SERVICES</h4>
            <ul className="footer-links-list">
              <li><Link to="/login">Mon Espace Client</Link></li>
              <li><a href="#paiement">Paiement Google Pay Sécurisé</a></li>
              <li><a href="#confidentialite">Politique de Confidentialité</a></li>
              <li><a href="#cgv">Conditions Générales de Vente</a></li>
              <li><a href="#guide-tailles">Guide des Tailles</a></li>
            </ul>
          </div>

          {/* Column 4: Club 7 Shop Newsletter */}
          <div className="footer-col club-col">
            <h4 className="footer-col-title club-title">
              <span className="club-icon">💥</span> CLUB 7 SHOP
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
            © 2026 7 Shop (Seven Shop) • Tous droits réservés.
          </p>

          <div className="payment-badges-row">
            <span className="pay-badge">G Pay</span>
            <span className="pay-badge"> Pay</span>
            <span className="pay-badge">VISA</span>
            <span className="pay-badge">Mastercard</span>
            <span className="pay-badge">CB 3D-Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
