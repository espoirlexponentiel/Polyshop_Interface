import React from 'react';
import { useMarket } from '../../context/MarketContext';

export default function FilterBar({ 
  selectedCategory, 
  onSelectCategory, 
  sortBy, 
  onSortChange,
  totalCount = 0
}) {
  const { activeMarket } = useMarket();

  const rawCategories = ['Toutes', ...(activeMarket?.categories || [])];
  const categories = rawCategories.map(c => 
    typeof c === 'object' && c !== null ? (c.nom || c.name || '') : String(c || '')
  ).filter(Boolean);

  // Helper pour compter les articles par catégorie dans le marché actif
  const getCategoryCount = (catName) => {
    const products = activeMarket?.products || [];
    if (catName === 'Toutes') return products.length;
    return products.filter(p => {
      const pCat = typeof p.category === 'object' && p.category !== null 
        ? (p.category.nom || p.category.name || '') 
        : (typeof p.categoryObj === 'object' && p.categoryObj !== null ? (p.categoryObj.nom || p.categoryObj.name || '') : String(p.category || ''));
      return pCat.trim().toLowerCase() === catName.trim().toLowerCase();
    }).length;
  };

  return (
    <div className="filterbar-wrapper" id="catalogue">
      {/* 1. Header de contrôle : Total d'articles + Sélecteur de Tri */}
      <div className="filterbar-top-row">
        <div className="filterbar-count-badge">
          <span className="filterbar-dot"></span>
          <span className="filterbar-count-text">
            <strong>{totalCount}</strong> article{totalCount > 1 ? 's' : ''} {selectedCategory !== 'Toutes' ? `dans "${selectedCategory}"` : (totalCount > 1 ? 'disponibles' : 'disponible')}
          </span>
        </div>

        {/* Sélecteur de Tri Moderne */}
        <div className="filterbar-sort-box">
          <span className="sort-box-icon">⇅</span>
          <label htmlFor="sort-dropdown-select" className="sort-box-label">
            Trier :
          </label>
          <div className="sort-select-container">
            <select
              id="sort-dropdown-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="filterbar-select-input"
              aria-label="Trier les articles"
            >
              <option value="default">✨ Recommandés</option>
              <option value="price-asc">💰 Prix : Moins cher</option>
              <option value="price-desc">💎 Prix : Plus cher</option>
              <option value="rating">⭐ Mieux notés</option>
              <option value="name-asc">🔤 Nom : A ➔ Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Barre de Catégories Défilable Horizontalement (Scrollable Track) */}
      <div className="category-scroll-container">
        <div className="category-pills-row">
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            const count = getCategoryCount(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`cat-pill-btn ${isActive ? 'active' : ''}`}
                style={isActive && activeMarket?.couleurPrimaire ? {
                  backgroundColor: activeMarket.couleurPrimaire,
                  borderColor: activeMarket.couleurPrimaire,
                  boxShadow: `0 4px 12px ${activeMarket.couleurPrimaire}35`
                } : {}}
              >
                {cat === 'Toutes' ? (
                  <span className="cat-pill-label">🌟 Tout afficher</span>
                ) : (
                  <span className="cat-pill-label">{cat}</span>
                )}
                <span className={`cat-pill-count-badge ${isActive ? 'active' : ''}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
