import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import axios from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle, isAuthenticated, user } = useAuth();
  const { siteConfig } = useSiteConfig();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated && !location.search.includes('token')) {
      if (user?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location.search]);

  // Détection du retour OAuth Google (token dans les paramètres d'URL)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    const urlRole = params.get('role') || 'USER';
    const urlNom = params.get('nom') || urlEmail;
    const redirectParam = params.get('redirect') || '';

    if (urlToken) {
      const userData = { email: urlEmail, role: urlRole, nom: urlNom, username: urlNom };
      login(urlToken, userData);

      // Charger le profil complet s'il existe déjà
      axios.get('/users/me', { headers: { Authorization: `Bearer ${urlToken}` } })
        .then(res => {
          if (res.data?.user) {
            login(urlToken, res.data.user);
          }
        })
        .catch(() => {});

      if (urlRole === 'ADMIN' || redirectParam === 'admin') {
        navigate('/admin', { replace: true });
      } else if (redirectParam === 'cart' || redirectParam === 'checkout') {
        navigate('/cart', { replace: true });
      } else if (redirectParam === 'orders') {
        navigate('/orders', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else if (params.get('error')) {
      const err = params.get('error');
      if (err === 'oauth2_failed') {
        setError('Échec de la connexion avec Google. Veuillez vérifier votre compte ou réessayer.');
      } else {
        try {
          setError(`Échec de la connexion Google : ${decodeURIComponent(err)}`);
        } catch {
          setError(`Échec de la connexion Google : ${err}`);
        }
      }
    }
  }, [location.search, login, navigate]);

  const queryParams = new URLSearchParams(location.search);
  const redirectTarget = queryParams.get('redirect') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await axios.post('/users/login', { email: cleanEmail, password });
      if (res.data && res.data.token) {
        const loggedUser = res.data.user || {
          email: res.data.email || cleanEmail,
          role: res.data.role || 'USER',
          nom: res.data.nom || res.data.username || cleanEmail
        };

        // Sauvegarde immédiate dans le contexte et localStorage
        login(res.data.token, loggedUser);

        // Redirection vers la destination ou directement la boutique
        if (redirectTarget === 'admin' || (loggedUser.role === 'ADMIN' && !redirectTarget)) {
          navigate('/admin', { replace: true });
        } else if (redirectTarget === 'cart' || redirectTarget === 'checkout') {
          navigate('/cart', { replace: true });
        } else if (redirectTarget === 'orders') {
          navigate('/orders', { replace: true });
        } else {
          // 🛍️ Redirection directe vers la boutique pour les clients
          navigate('/', { replace: true });
        }
      } else {
        setError('Identifiants incorrects.');
      }
    } catch (err) {
      console.error('Erreur login:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setError(serverMsg || 'Impossible de se connecter. Vérifiez vos identifiants.');
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
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--color-dark)' }}>Connexion</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-medium)', marginTop: '4px' }}>
              Accédez à vos commandes et finalisez vos achats {siteConfig?.brandName || '7 Shop'}
            </p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Google One-Click Login */}
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
            <span>Continuer avec Google</span>
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
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
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
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--color-gray-medium)' }}>Pas encore de compte ? </span>
            <Link to="/register" style={{ color: 'var(--primary-blue)', fontWeight: '800' }}>
              Créer un compte
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
