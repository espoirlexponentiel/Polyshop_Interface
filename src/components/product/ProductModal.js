import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();

  const colorsList = Array.isArray(product?.couleurs)
    ? product.couleurs
    : (typeof product?.couleurs === 'string' && product.couleurs ? product.couleurs.split(',').map(s => s.trim()) : ['Standard']);

  const sizesList = Array.isArray(product?.tailles)
    ? product.tailles
    : (typeof product?.tailles === 'string' && product.tailles ? product.tailles.split(',').map(s => s.trim()) : ['Unique']);

  const pointsFortsList = Array.isArray(product?.pointsForts)
    ? product.pointsForts
    : (typeof product?.pointsForts === 'string' && product.pointsForts ? product.pointsForts.split('\n').map(s => s.trim()).filter(Boolean) : []);

  const categoryName = typeof product?.category === 'object' && product?.category 
    ? product.category.nom 
    : (product?.category || 'Rayon 7 Shop');
  
  const [selectedColor, setSelectedColor] = useState(colorsList[0] || 'Standard');
  const [selectedSize, setSelectedSize] = useState(sizesList[0] || 'Unique');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Synchronise images
  const allImages = product?.thumbnails && product.thumbnails.length > 0 
    ? product.thumbnails 
    : [product?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'];

  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setSelectedColor(colorsList[0] || 'Standard');
    setSelectedSize(sizesList[0] || 'Unique');
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  const calculateTotalPrice = () => {
    return ((product.prix || 0) * quantity).toFixed(1).replace('.', ',');
  };

  const getDotClass = (colorName) => {
    if (!colorName || typeof colorName !== 'string') return 'dot-noir';
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
              <h6>Livraison Rapide</h6>
              <span>Partout</span>
            </div>
            <div className="mini-trust-card">
              <div className="trust-ico">🔄</div>
              <h6>30 Jours</h6>
              <span>Retours simples</span>
            </div>
            <div className="mini-trust-card">
              <div className="trust-ico">🛡️</div>
              <h6>7 Shop Certifié</h6>
              <span>Qualité garantie</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Action */}
        <div className="modal-right-col">
          {/* Header Meta */}
          <div className="modal-header-meta">
            <span className="modal-cat-tag">
              7 SHOP • {categoryName?.toUpperCase()}
            </span>
            <div className="modal-rating-badge">
              <span style={{ color: '#eab308' }}>★</span>
              <span>{product.rating || '5.0'} / 5</span>
              <span style={{ color: '#854d0e', fontSize: '0.72rem' }}>
                ({product.reviewCount || 1} avis)
              </span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <h2 className="modal-product-title">{product.nom}</h2>
          <p className="modal-product-subtitle">{product.sousTitre || product.description}</p>

          {/* Price & In-stock badge */}
          <div className="modal-price-stock-row">
            <div className="modal-price-box">
              <span className="modal-price-now">
                {(product.prix || 0).toFixed(1).replace('.', ',')} €
              </span>
              {product.ancienPrix && (
                <span className="modal-price-old">
                  {(product.ancienPrix || 0).toFixed(1).replace('.', ',')} €
                </span>
              )}
            </div>
            <span className="stock-tag-instock">
              {product.stock > 0 ? `En stock (${product.stock} disp.)` : 'Sur commande'}
            </span>
          </div>

          {/* Color Selector */}
          {colorsList.length > 0 && (
            <div className="selector-group">
              <span className="selector-label">
                Option / Couleur : <strong style={{ color: 'var(--primary-blue)' }}>{selectedColor}</strong>
              </span>
              <div className="colors-selector-row">
                {colorsList.map((color, idx) => (
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
          {sizesList.length > 0 && (
            <div className="selector-group">
              <span className="selector-label">
                Format / Taille : <strong style={{ color: 'var(--primary-blue)' }}>{selectedSize}</strong>
              </span>
              <div className="sizes-selector-row">
                {sizesList.map((size, idx) => (
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
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === 'composition' ? 'active' : ''}`}
              onClick={() => setActiveTab('composition')}
            >
              Composition & Détails
            </button>
            <button
              className={`tab-btn ${activeTab === 'avis' ? 'active' : ''}`}
              onClick={() => setActiveTab('avis')}
            >
              Avis Clients ({product.reviewCount || 1})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content-box">
            {activeTab === 'description' && (
              <p>{product.description || 'Produit de qualité supérieure sélectionné par 7 Shop.'}</p>
            )}
            {activeTab === 'composition' && (
              <p>{product.composition || 'Matières sélectionnées de premier choix selon les normes 7 Shop.'}</p>
            )}
            {activeTab === 'avis' && (
              <div>
                <p><strong>Note globale : {product.rating || '5.0'}/5</strong> basé sur {product.reviewCount || 1} retour(s) vérifié(s).</p>
                <p style={{ marginTop: '6px', color: '#64748b' }}>« Produit conforme, excellente qualité et livraison soignée. »</p>
              </div>
            )}
          </div>

          {/* Points Forts Checklist */}
          {pointsFortsList.length > 0 && (
            <div className="points-forts-box">
              <h6>POINTS FORTS 7 SHOP :</h6>
              <ul className="points-forts-list">
                {pointsFortsList.map((pt, idx) => (
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
