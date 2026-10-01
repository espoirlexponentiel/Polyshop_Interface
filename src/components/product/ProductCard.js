import React from 'react';
import { useCart } from '../../context/CartContext';
import DualPrice from '../common/DualPrice';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();

  const colorsList = Array.isArray(product.couleurs) 
    ? product.couleurs 
    : (typeof product.couleurs === 'string' && product.couleurs ? product.couleurs.split(',').map(s => s.trim()) : []);

  const sizesList = Array.isArray(product.tailles)
    ? product.tailles
    : (typeof product.tailles === 'string' && product.tailles ? product.tailles.split(',').map(s => s.trim()) : []);

  const categoryName = typeof product.category === 'object' && product.category 
    ? product.category.nom 
    : (product.category || 'Article 7 Shop');

  const stock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0;
  const isOutOfStock = stock <= 0;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) {
      if (onQuickView) onQuickView(product);
      return;
    }
    const defaultColor = colorsList[0] || 'Noir';
    const defaultSize = sizesList[0] || 'M';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const getDotClass = (colorName) => {
    if (!colorName || typeof colorName !== 'string') return 'dot-noir';
    const c = colorName.toLowerCase();
    if (c.includes('blanc')) return 'dot-blanc';
    if (c.includes('bleu')) return 'dot-bleu';
    if (c.includes('jaune')) return 'dot-jaune';
    return 'dot-noir';
  };

  const displayImage = product.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';

  return (
    <div 
      className="product-card"
      onClick={() => onQuickView && onQuickView(product)}
    >
      {/* Image container with badge */}
      <div className="card-image-wrap">
        {product.badge && (
          <span className="card-badge">{product.badge}</span>
        )}
        {isOutOfStock && (
          <span className="card-badge" style={{ background: '#dc2626', top: '10px', left: '10px' }}>
            Rupture
          </span>
        )}
        <img 
          src={displayImage} 
          alt={product.nom} 
          loading="lazy"
          style={isOutOfStock ? { opacity: 0.6 } : {}}
        />
      </div>

      {/* Meta Top: Category & Rating */}
      <div className="card-meta-top">
        <span className="card-category">{categoryName}</span>
        <div className="card-rating">
          <span className="rating-star">★</span>
          <span>{product.rating || '5.0'}</span>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
            ({product.reviewCount || 1})
          </span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <h3 className="card-title" title={product.nom}>
        {product.nom}
      </h3>
      <p className="card-subtitle" title={product.sousTitre || product.description}>
        {product.sousTitre || product.description}
      </p>

      {/* Stock remaining info */}
      <div className="card-stock-wrap">
        {stock > 5 ? (
          <span className="stock-badge stock-available">
            ✓ En stock ({stock})
          </span>
        ) : stock > 0 ? (
          <span className="stock-badge stock-warning">
            ⚠️ {stock} restant{stock > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="stock-badge stock-out">
            ✕ Rupture
          </span>
        )}
      </div>

      {/* Color Dots */}
      {colorsList.length > 0 && (
        <div className="card-color-dots">
          {colorsList.map((c, i) => (
            <span 
              key={i} 
              className={`mini-color-dot ${getDotClass(c)}`}
              title={c}
            />
          ))}
        </div>
      )}

      {/* Footer: Prices and + Ajouter */}
      <div className="card-footer-row">
        <DualPrice 
          price={product.prix} 
          oldPrice={product.ancienPrix} 
          size="md"
          className="card-dual-price"
        />

        <button 
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          className={`btn-add-quick ${isOutOfStock ? 'btn-disabled' : ''}`}
          style={isOutOfStock ? { background: '#cbd5e1', color: '#64748b', cursor: 'not-allowed', boxShadow: 'none' } : {}}
          title={isOutOfStock ? "Article en rupture" : "Ajouter au panier"}
        >
          <span className="btn-add-label-desktop">{isOutOfStock ? 'Épuisé' : '+ Ajouter'}</span>
          <span className="btn-add-label-mobile">{isOutOfStock ? '✕' : '+'}</span>
        </button>
      </div>
    </div>
  );
}
