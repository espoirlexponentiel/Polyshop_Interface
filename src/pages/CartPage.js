import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/layout/CartDrawer';
import axios from '../api/axios';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { isAuthenticated, token, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=cart');
      return;
    }

    if (!shippingAddress.trim()) {
      alert('Veuillez renseigner votre adresse de livraison.');
      return;
    }

    setLoading(true);
    try {
      // Construction de la commande pour le backend
      const orderPayload = {
        adresseLivraison: shippingAddress,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantite: item.quantity,
          taille: item.size,
          couleur: item.color,
          prixUnitaire: item.prix
        }))
      };

      await axios.post('/orders', orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      clearCart();
      setOrderSuccess(true);
    } catch (err) {
      console.error('Erreur validation commande:', err);
      alert('Une erreur est survenue lors de la validation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '60px auto', padding: '40px 24px', textAlign: 'center', background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--color-dark)', marginBottom: '12px' }}>
            Merci pour votre commande 7 SHOP !
          </h2>
          <p style={{ color: 'var(--color-gray-medium)', marginBottom: '24px', lineHeight: '1.6' }}>
            Votre commande a été enregistrée avec succès. Vous recevrez un e-mail de confirmation dès son expédition.
          </p>
          <Link to="/" className="btn-add-to-cart-big" style={{ display: 'inline-flex', width: 'auto', padding: '12px 30px' }}>
            Retourner à l'accueil
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '24px', color: 'var(--color-dark)' }}>
          Mon Panier 🛍️
        </h1>

        {cartItems.length === 0 ? (
          <div style={{ background: '#fff', padding: '50px 24px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--color-gray-border)' }}>
            <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🛒</p>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>Votre panier est vide</h3>
            <p style={{ color: 'var(--color-gray-medium)', marginBottom: '20px' }}>
              Découvrez la nouvelle collection Seven Shop et ajoutez vos articles préférés.
            </p>
            <Link to="/" className="btn-add-quick" style={{ display: 'inline-block', padding: '10px 24px', fontSize: '0.95rem' }}>
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '30px' }}>
            {/* Left: Items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cartItems.map((item) => (
                <div 
                  key={item.cartItemId}
                  style={{
                    background: '#fff',
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-gray-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.nom} 
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} 
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-dark)' }}>{item.nom}</h4>
                      <button 
                        onClick={() => removeFromCart(item.cartItemId)}
                        style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.8rem' }}
                      >
                        ✕ Supprimer
                      </button>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-medium)', marginTop: '4px' }}>
                      Couleur : <strong>{item.color}</strong> • Taille : <strong>{item.size}</strong>
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                      <div className="quantity-picker">
                        <button className="qty-btn" onClick={() => updateQuantity(item.cartItemId, -1)}>-</button>
                        <span className="qty-val">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.cartItemId, 1)}>+</button>
                      </div>

                      <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--primary-blue)' }}>
                        {(item.prix * item.quantity).toFixed(1).replace('.', ',')} €
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Summary & Order form */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-border)', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '16px', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '12px' }}>
                Récapitulatif
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: 'var(--color-gray-dark)' }}>
                <span>Sous-total articles</span>
                <span>{cartTotal.toFixed(1).replace('.', ',')} €</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--color-gray-dark)' }}>
                <span>Livraison Express 24h</span>
                <span style={{ color: '#059669', fontWeight: '800' }}>Gratuite</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-gray-border)', paddingTop: '14px', marginBottom: '24px', fontSize: '1.2rem', fontWeight: '900', color: 'var(--color-dark)' }}>
                <span>Total TTC</span>
                <span style={{ color: 'var(--primary-blue)' }}>{cartTotal.toFixed(1).replace('.', ',')} €</span>
              </div>

              {/* Checkout Form */}
              {isAuthenticated ? (
                <form onSubmit={handlePlaceOrder}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                    Adresse de livraison :
                  </label>
                  <textarea
                    rows="3"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Ex: 12 Rue de la Paix, 75001 Paris"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-gray-light)',
                      marginBottom: '16px',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem'
                    }}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-checkout-primary"
                  >
                    {loading ? 'Validation en cours...' : `Confirmer et Payer • ${cartTotal.toFixed(1).replace('.', ',')} €`}
                  </button>
                </form>
              ) : (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-border)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-dark)', marginBottom: '8px' }}>
                    Connexion requise pour commander
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-medium)', marginBottom: '14px' }}>
                    Connectez-vous en 1 clic pour finaliser votre commande.
                  </p>

                  <button 
                    onClick={loginWithGoogle}
                    className="btn-google-auth"
                    style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continuer avec Google</span>
                  </button>

                  <Link 
                    to="/login?redirect=cart"
                    style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-blue)', display: 'block' }}
                  >
                    Ou se connecter par email
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
