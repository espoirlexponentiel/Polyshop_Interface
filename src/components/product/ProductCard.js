import React from 'react';
import { useCart } from '../../context/CartContext';

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
    : (product.category || 'Rayon 7 Shop');

  const handleQuickAdd = (e) => {
    e.stopPropagation();
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
        <img 
          src={displayImage} 
          alt={product.nom} 
          loading="lazy"
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
        <div className="card-prices">
          <span className="price-current">{(product.prix || 0).toFixed(1).replace('.', ',')} €</span>
          {product.ancienPrix && (
            <span className="price-strikethrough">{(product.ancienPrix || 0).toFixed(1).replace('.', ',')} €</span>
          )}
        </div>

        <button 
          onClick={handleQuickAdd}
          className="btn-add-quick"
          title="Ajouter au panier"
        >
          + Ajouter
        </button>
      </div>
    </div>
  );
}
