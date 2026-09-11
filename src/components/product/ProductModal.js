import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  
  const [selectedColor, setSelectedColor] = useState(product?.couleurs?.[0] || 'Noir');
  const [selectedSize, setSelectedSize] = useState(product?.tailles?.[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Synchronise images
  const allImages = product?.thumbnails && product.thumbnails.length > 0 
    ? product.thumbnails 
    : [product?.imageUrl];

  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setSelectedColor(product?.couleurs?.[0] || 'Noir');
    setSelectedSize(product?.tailles?.[0] || 'M');
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  const calculateTotalPrice = () => {
    return (product.prix * quantity).toFixed(1).replace('.', ',');
  };

  const getDotClass = (colorName) => {
    const c = colorName.toLowerCase();
    if (c.includes('blanc')) return 'dot-blanc';
    if (c.includes('bleu')) return 'dot-bleu';
    if (c.includes('jaune')) return 'dot-jaune';
    return 'dot-noir';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-wrap" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Fermer"
        >
          ✕
        </button>

        {/* LEFT COLUMN: Gallery & Trust Cards */}
        <div className="modal-left-col">
          {/* Main Image */}
          <div className="modal-main-img-box">
            {product.badge && (
              <span className="card-badge" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                {product.badge}
              </span>
            )}
            <img 
              src={allImages[activeImageIndex] || product.imageUrl} 
              alt={product.nom} 
            />
          </div>

          {/* Thumbnails row */}
          {allImages.length > 1 && (
            <div className="modal-thumbnails-row">
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail-box ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img} alt={`Aperçu ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}

          {/* 3 Mini Trust Cards */}
          <div className="modal-trust-cards">
            <div className="mini-trust-card">
              <div className="trust-ico">🚚</div>
              <h6>Livraison 24h</h6>
              <span>Express</span>
            </div>
            <div className="mini-trust-card">
              <div className="trust-ico">🔄</div>
              <h6>30 Jours</h6>
              <span>Retours gratuits</span>
            </div>
            <div className="mini-trust-card">
              <div className="trust-ico">🛡️</div>
              <h6>7 Shop Certifié</h6>
              <span>Qualité premium</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Action */}
        <div className="modal-right-col">
          {/* Header Meta */}
          <div className="modal-header-meta">
            <span className="modal-cat-tag">
              7 SHOP • {product.category?.toUpperCase()}
            </span>
            <div className="modal-rating-badge">
              <span style={{ color: '#eab308' }}>★</span>
              <span>{product.rating || '4.92'} / 5</span>
              <span style={{ color: '#854d0e', fontSize: '0.72rem' }}>
                ({product.reviewCount || 168} avis)
              </span>
            </div>
          </div>

          {/* Title & Jacquard Subtitle */}
          <h2 className="modal-product-title">{product.nom}</h2>
          <p className="modal-product-subtitle">{product.sousTitre || product.description}</p>

          {/* Price & In-stock badge */}
          <div className="modal-price-stock-row">
            <div className="modal-price-box">
              <span className="modal-price-now">
                {product.prix?.toFixed(1).replace('.', ',')} €
              </span>
              {product.ancienPrix && (
                <span className="modal-price-old">
                  {product.ancienPrix?.toFixed(1).replace('.', ',')} €
                </span>
              )}
            </div>
            <span className="stock-tag-instock">En stock</span>
          </div>

          {/* Color Selector */}
          {product.couleurs && product.couleurs.length > 0 && (
            <div className="selector-group">
              <span className="selector-label">
                Couleur : <strong style={{ color: 'var(--primary-blue)' }}>{selectedColor}</strong>
              </span>
              <div className="colors-selector-row">
                {product.couleurs.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(color)}
                    className={`color-option-btn ${selectedColor === color ? 'active' : ''}`}
                  >
                    <span className={`nuance-dot ${getDotClass(color)}`}></span>
                    <span>{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.tailles && product.tailles.length > 0 && (
            <div className="selector-group">
              <span className="selector-label">
                Taille : <strong style={{ color: 'var(--primary-blue)' }}>{selectedSize}</strong>
              </span>
              <div className="sizes-selector-row">
                {product.tailles.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(size)}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabs header */}
          <div className="modal-tabs-header">
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description & Coupe
            </button>
            <button
              className={`tab-btn ${activeTab === 'composition' ? 'active' : ''}`}
              onClick={() => setActiveTab('composition')}
            >
              Composition & Matière
            </button>
            <button
              className={`tab-btn ${activeTab === 'avis' ? 'active' : ''}`}
              onClick={() => setActiveTab('avis')}
            >
              Avis Clients ({product.reviewCount || 168})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content-box">
            {activeTab === 'description' && (
              <p>{product.description}</p>
            )}
            {activeTab === 'composition' && (
              <p>{product.composition || '100% Coton biologique haute densité. Finitions soignées anti-frottements.'}</p>
            )}
            {activeTab === 'avis' && (
              <div>
                <p><strong>Note globale : {product.rating || '4.92'}/5</strong> basé sur {product.reviewCount || 168} retours vérifiés.</p>
                <p style={{ marginTop: '6px', color: '#64748b' }}>« Matière très agréable, ne bouge pas au lavage. Coupe impeccable ! » — Alexandre D.</p>
              </div>
            )}
          </div>

          {/* Points Forts 7 Shop Checklist */}
          {product.pointsForts && product.pointsForts.length > 0 && (
            <div className="points-forts-box">
              <h6>POINTS FORTS 7 SHOP :</h6>
              <ul className="points-forts-list">
                {product.pointsForts.map((pt, idx) => (
                  <li key={idx}>
                    <span className="check-blue">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modal Bottom Actions */}
          <div className="modal-bottom-actions">
            {/* Quantity Picker */}
            <div className="quantity-picker">
              <button 
                className="qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="qty-val">{quantity}</span>
              <button 
                className="qty-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>

            {/* Big Add to Cart Button */}
            <button 
              className="btn-add-to-cart-big"
              onClick={handleAddToCart}
            >
              <span>Ajouter au panier</span>
              <span>•</span>
              <span>{calculateTotalPrice()} €</span>
              <span>›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
