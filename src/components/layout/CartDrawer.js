import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatFCFA, formatEuro } from '../../utils/priceUtils';

export default function CartDrawer() {
  const { cartItems, isDrawerOpen, closeDrawer, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleProceedCheckout = () => {
    closeDrawer();
    if (!isAuthenticated) {
      // Redirection vers login avec conservation du panier
      navigate('/login?redirect=checkout');
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="drawer-overlay" onClick={closeDrawer}>
      <div 
        className="drawer-panel" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>🛍️</span>
            <h3>Mon Panier ({cartCount})</h3>
          </div>
          <button 
            onClick={closeDrawer}
            style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-gray-medium)' }}
          >
            ✕
          </button>
        </div>

        {/* Items List */}
        <div className="drawer-items-list">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--color-gray-medium)' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛒</p>
              <p style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-dark)' }}>
                Votre panier est vide
              </p>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                Ajoutez des articles de la collection 7 Shop pour commencer !
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.cartItemId} className="drawer-item-card">
                <img 
                  src={item.imageUrl} 
                  alt={item.nom} 
                  className="drawer-item-img"
                />
                <div className="drawer-item-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h5 className="drawer-item-title">{item.nom}</h5>
                    <button 
                      onClick={() => removeFromCart(item.cartItemId)}
                      style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '700' }}
                    >
                      Supprimer
                    </button>
                  </div>

                  <span className="drawer-item-variants">
                    Couleur: {item.color} • Taille: {item.size}
                  </span>

                  <div className="drawer-item-bottom">
                    <div>
                      <span style={{ fontWeight: '800', color: 'var(--primary-blue)', fontSize: '0.95rem', display: 'block', lineHeight: 1.1 }}>
                        {formatFCFA(item.prix * item.quantity)}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '1px' }}>
                        ~ {formatEuro(item.prix * item.quantity)}
                      </span>
                      {item.stock !== undefined && item.stock <= 5 && (
                        <span style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: '750', display: 'block', marginTop: '2px' }}>
                          (Max : {item.stock} dispo)
                        </span>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="quantity-picker" style={{ padding: '2px' }}>
                      <button 
                        className="qty-btn" 
                        style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                      >
                        -
                      </button>
                      <span className="qty-val" style={{ width: '24px', fontSize: '0.85rem' }}>
                        {item.quantity}
                      </span>
                      <button 
                        className="qty-btn" 
                        style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}
                        disabled={item.stock !== undefined && item.quantity >= item.stock}
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        title={item.stock !== undefined && item.quantity >= item.stock ? `Stock max (${item.stock})` : ''}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-total-row">
              <span>Total Estimé</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--primary-blue)', fontSize: '1.25rem', fontWeight: '900', display: 'block', lineHeight: 1.1 }}>
                  {formatFCFA(cartTotal)}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                  ~ {formatEuro(cartTotal)}
                </span>
              </div>
            </div>

            <button 
              onClick={handleProceedCheckout}
              className="btn-checkout-primary"
            >
              {isAuthenticated ? 'Finaliser la commande ›' : 'Se connecter pour commander ›'}
            </button>

            {!isAuthenticated && (
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-gray-medium)', marginTop: '8px' }}>
                🔒 Connexion rapide sécurisée par Google ou email
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
