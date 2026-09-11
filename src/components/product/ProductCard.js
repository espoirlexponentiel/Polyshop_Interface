import React from 'react';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    const defaultColor = product.couleurs?.[0] || 'Noir';
    const defaultSize = product.tailles?.[0] || 'M';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const getDotClass = (colorName) => {
    const c = colorName.toLowerCase();
    if (c.includes('blanc')) return 'dot-blanc';
    if (c.includes('bleu')) return 'dot-bleu';
    if (c.includes('jaune')) return 'dot-jaune';
    return 'dot-noir';
  };

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
          src={product.imageUrl} 
          alt={product.nom} 
          loading="lazy"
        />
      </div>

      {/* Meta Top: Category & Rating */}
      <div className="card-meta-top">
        <span className="card-category">{product.category}</span>
        <div className="card-rating">
          <span className="rating-star">★</span>
          <span>{product.rating || '4.9'}</span>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
            ({product.reviewCount || 42})
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
      <div className="card-color-dots">
        {product.couleurs?.map((c, i) => (
          <span 
            key={i} 
            className={`mini-color-dot ${getDotClass(c)}`}
            title={c}
          />
        ))}
      </div>

      {/* Footer: Prices and + Ajouter */}
      <div className="card-footer-row">
        <div className="card-prices">
          <span className="price-current">{product.prix?.toFixed(1).replace('.', ',')} €</span>
          {product.ancienPrix && (
            <span className="price-strikethrough">{product.ancienPrix?.toFixed(1).replace('.', ',')} €</span>
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
