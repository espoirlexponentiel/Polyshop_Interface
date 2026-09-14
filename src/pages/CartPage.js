import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/layout/CartDrawer';
import axios from '../api/axios';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { isAuthenticated, token, user, loginWithGoogle } = useAuth();
  const { activeMarket, fetchAllData } = useMarket();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderInfo, setLastOrderInfo] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Préremplir le téléphone et l'adresse si déjà présents sur le compte
  useEffect(() => {
    if (user?.telephone && !telephone) {
      setTelephone(user.telephone);
    }
    if (user?.adresse && !shippingAddress) {
      setShippingAddress(user.adresse);
    }
  }, [user]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!isAuthenticated) {
      navigate('/login?redirect=cart');
      return;
    }

    if (!telephone || !telephone.trim()) {
      setValidationError('⚠️ Veuillez renseigner votre numéro de téléphone pour valider votre commande.');
      return;
    }

    if (!shippingAddress || !shippingAddress.trim()) {
      setValidationError('⚠️ Veuillez renseigner votre adresse de livraison.');
      return;
    }

    // Vérification de sécurité sur le stock côté client avant l'envoi
    const exceedingItem = cartItems.find(item => item.stock !== undefined && item.quantity > item.stock);
    if (exceedingItem) {
      setValidationError(`⚠️ La quantité pour l'article « ${exceedingItem.nom} » (${exceedingItem.quantity}) dépasse le stock restant disponible (${exceedingItem.stock}). Veuillez réduire la quantité.`);
      return;
    }

    setLoading(true);
    try {
      // Construction de la commande pour le backend
      const orderPayload = {
        adresseLivraison: shippingAddress.trim(),
        telephone: telephone.trim(),
        modePaiement: "Mobile Money",
        marche: activeMarket?.nom || activeMarket?.id || (cartItems[0]?.marketId) || "Mode & Vestimentaire",
        items: cartItems.map(item => ({
          productId: item.productId,
          quantite: item.quantity,
          taille: item.size,
          couleur: item.color,
          prixUnitaire: item.prix
        }))
      };

      const res = await axios.post('/orders', orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLastOrderInfo({
        id: res.data?.id || res.data?.orderId,
        total: cartTotal,
        telephone: telephone.trim(),
        adresse: shippingAddress.trim()
      });

      clearCart();
      if (fetchAllData) {
        fetchAllData(); // Actualiser immédiatement les stocks restants en boutique
      }
      setOrderSuccess(true);
    } catch (err) {
      console.error('Erreur validation commande:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setValidationError(serverMsg || 'Une erreur est survenue lors de la validation. Veuillez vérifier vos articles et réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    const totalFcfa = Math.round(lastOrderInfo?.total * 655.957) || 0;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ maxWidth: '640px', width: '100%', padding: '40px 32px', textAlign: 'center', background: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 35px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Merci pour votre commande !
            </h2>
            <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5', fontSize: '0.95rem' }}>
              Votre commande a été enregistrée avec succès.
            </p>

            {/* Instruction de paiement Mobile Money */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '2px solid #86efac',
              borderRadius: '16px',
              padding: '22px',
              marginBottom: '28px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.6rem' }}>📱</span>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#065f46', margin: 0 }}>
                    Règlement par Mobile Money uniquement
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#047857', margin: '4px 0 0 0' }}>
                    Montant à transférer : <strong>{(lastOrderInfo?.total || 0).toFixed(2).replace('.', ',')} €</strong> (~ {totalFcfa.toLocaleString('fr-FR')} FCFA)
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#065f46', marginBottom: '14px', lineHeight: '1.5' }}>
                Veuillez effectuer le paiement vers l'un des deux numéros officiels ci-dessous :
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #bbf7d0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>Numéro 1 :</span>
                  <span style={{ fontWeight: '900', fontSize: '1.2rem', color: '#059669', letterSpacing: '0.5px' }}>+228 99 96 53 06</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #bbf7d0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>Numéro 2 :</span>
                  <span style={{ fontWeight: '900', fontSize: '1.2rem', color: '#059669', letterSpacing: '0.5px' }}>+228 96 14 65 04</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.7)', padding: '10px 14px', borderRadius: '10px', marginTop: '12px', fontSize: '0.8rem', color: '#065f46' }}>
                💡 <em>Votre commande sera validée et expédiée immédiatement après réception de votre transfert.</em>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                to="/orders" 
                className="btn-checkout-primary" 
                style={{ textDecoration: 'none', padding: '13px 26px', fontSize: '0.95rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>📦 Suivre ma commande</span>
              </Link>
              <Link 
                to="/" 
                className="btn-admin-secondary" 
                style={{ textDecoration: 'none', padding: '13px 26px', fontSize: '0.95rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>🛍️ Continuer mes achats</span>
              </Link>
            </div>
          </div>
        </main>
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
              Découvrez la collection Seven Shop et ajoutez vos articles préférés.
            </p>
            <Link to="/" className="btn-add-quick" style={{ display: 'inline-block', padding: '10px 24px', fontSize: '0.95rem' }}>
              Découvrir les articles
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '30px' }}>
            {/* Left: Items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cartItems.map((item) => {
                const maxStock = item.stock !== undefined && item.stock !== null ? Number(item.stock) : 99;
                const isOverStock = item.quantity > maxStock;

                return (
                  <div 
                    key={item.cartItemId}
                    style={{
                      background: '#fff',
                      padding: '16px',
                      borderRadius: 'var(--radius-lg)',
                      border: isOverStock ? '2px solid #ef4444' : '1px solid var(--color-gray-border)',
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

                      {/* Stock info */}
                      <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                        {maxStock > 5 ? (
                          <span style={{ color: '#16a34a', fontWeight: '700' }}>✓ En stock ({maxStock} restants)</span>
                        ) : maxStock > 0 ? (
                          <span style={{ color: '#ea580c', fontWeight: '800' }}>⚠️ Plus que {maxStock} restants !</span>
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: '800' }}>❌ Rupture de stock</span>
                        )}
                        {isOverStock && (
                          <span style={{ color: '#dc2626', fontWeight: '800', display: 'block', marginTop: '2px' }}>
                            ⚠️ Quantité sélectionnée supérieure au stock ({item.quantity} / {maxStock})
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                        <div className="quantity-picker">
                          <button 
                            className="qty-btn" 
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                          >
                            -
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button 
                            className="qty-btn" 
                            disabled={item.quantity >= maxStock}
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            title={item.quantity >= maxStock ? `Stock max atteint (${maxStock})` : ''}
                          >
                            +
                          </button>
                        </div>

                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--primary-blue)' }}>
                          {(item.prix * item.quantity).toFixed(2).replace('.', ',')} €
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Summary & Order form */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-border)', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '16px', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '12px' }}>
                Récapitulatif de Commande
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: 'var(--color-gray-dark)' }}>
                <span>Sous-total articles</span>
                <span>{cartTotal.toFixed(2).replace('.', ',')} €</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--color-gray-dark)' }}>
                <span>Livraison Express</span>
                <span style={{ color: '#059669', fontWeight: '800' }}>Gratuite</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-gray-border)', paddingTop: '14px', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '900', color: 'var(--color-dark)' }}>
                <span>Total TTC</span>
                <div>
                  <span style={{ color: 'var(--primary-blue)', display: 'block', textAlign: 'right' }}>
                    {cartTotal.toFixed(2).replace('.', ',')} €
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'block', textAlign: 'right' }}>
                    ~ {Math.round(cartTotal * 655.957).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* Box Moyen de Paiement Unique: Mobile Money */}
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📱</span>
                  <span style={{ fontWeight: '900', fontSize: '0.88rem', color: '#065f46' }}>
                    Paiement 100% Mobile Money
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#047857', marginBottom: '8px', lineHeight: '1.4' }}>
                  Le règlement s'effectue exclusivement par transfert aux numéros :
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                  <div style={{ background: '#fff', padding: '7px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', color: '#334155' }}>Numéro 1 :</span>
                    <strong style={{ color: '#059669', fontSize: '0.95rem' }}>+228 99 96 53 06</strong>
                  </div>
                  <div style={{ background: '#fff', padding: '7px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', color: '#334155' }}>Numéro 2 :</span>
                    <strong style={{ color: '#059669', fontSize: '0.95rem' }}>+228 96 14 65 04</strong>
                  </div>
                </div>
              </div>

              {validationError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {validationError}
                </div>
              )}

              {/* Checkout Form */}
              {isAuthenticated ? (
                <form onSubmit={handlePlaceOrder}>
                  {/* Phone Number Field (Mandatory for order validation) */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', marginBottom: '6px', color: '#0f172a' }}>
                      Numéro de téléphone / WhatsApp <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="Ex: +228 90 00 00 00 ou 90000000"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: !telephone.trim() ? '2px solid #f59e0b' : '1px solid var(--color-gray-light)',
                        background: !telephone.trim() ? '#fffbeb' : '#ffffff',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {!telephone.trim() && (
                      <p style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '4px', fontWeight: '700' }}>
                        ⚠️ Votre numéro est indispensable pour vous contacter et valider la commande.
                      </p>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', marginBottom: '6px', color: '#0f172a' }}>
                      Adresse de livraison <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      rows="3"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Ex: Quartier Totsi, Lomé - Face Pharmacie des Étoiles"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-gray-light)',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-checkout-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
                  >
                    {loading ? 'Validation en cours...' : `Confirmer par Mobile Money • ${cartTotal.toFixed(2).replace('.', ',')} €`}
                  </button>
                </form>
              ) : (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-border)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-dark)', marginBottom: '8px' }}>
                    Connexion requise pour commander
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-medium)', marginBottom: '14px' }}>
                    Connectez-vous avec Google ou par email pour finaliser votre commande.
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
