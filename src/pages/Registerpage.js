import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import axios from '../api/axios';

export default function RegisterPage() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const { siteConfig } = useSiteConfig();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanNom = nom.trim();
      const cleanTel = telephone.trim();

      // 1. Création du compte
      await axios.post('/users/register', { 
        nom: cleanNom,
        username: cleanNom,
        email: cleanEmail,
        telephone: cleanTel,
        password 
      });

      // 2. Connexion automatique immédiate
      try {
        const loginRes = await axios.post('/users/login', { email: cleanEmail, password });
        if (loginRes.data && loginRes.data.token) {
          const loggedUser = loginRes.data.user || {
            email: cleanEmail,
            role: loginRes.data.role || 'USER',
            nom: cleanNom,
            telephone: cleanTel
          };
          login(loginRes.data.token, loggedUser);
          navigate('/', { replace: true });
          return;
        }
      } catch (loginErr) {
        console.warn('Auto-connexion post inscription:', loginErr);
      }

      // Redirection boutique si auto-login
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Erreur inscription:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setError(serverMsg || 'Impossible de créer le compte. Cet email est peut-être déjà utilisé.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px' }}>
        <div style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-gray-border)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            {siteConfig?.logoUrl ? (
              <img 
                src={siteConfig.logoUrl} 
                alt={siteConfig.brandName} 
                style={{ maxHeight: '44px', maxWidth: '140px', objectFit: 'contain', margin: '0 auto 12px', display: 'block' }} 
              />
            ) : (
              <div className="brand-badge-7" style={{ margin: '0 auto 12px' }}>{siteConfig?.brandBadge || '7'}</div>
            )}
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--color-dark)' }}>Inscription</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-medium)', marginTop: '4px' }}>
              Rejoignez l'univers {siteConfig?.brandName || '7 Shop'} et profitez de la livraison rapide
            </p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Google One-Click */}
          <button
            onClick={loginWithGoogle}
            className="btn-google-auth"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '20px', fontSize: '0.92rem' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>S'inscrire avec Google</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', color: '#94a3b8', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-gray-border)' }}></div>
            <span>OU PAR EMAIL</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-gray-border)' }}></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                Nom Complet
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                placeholder="Ex: Alexandre Dupont"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-gray-light)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                Adresse Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-gray-light)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                Numéro de téléphone / WhatsApp
              </label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                required
                placeholder="Ex: +228 90 00 00 00"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-gray-light)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Au moins 6 caractères"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-gray-light)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-checkout-primary"
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--color-gray-medium)' }}>Déjà un compte ? </span>
            <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: '800' }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
