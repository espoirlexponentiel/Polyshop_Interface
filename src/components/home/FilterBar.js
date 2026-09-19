import React from 'react';
import { useMarket } from '../../context/MarketContext';

export default function FilterBar({ 
  selectedCategory, 
  onSelectCategory, 
  sortBy, 
  onSortChange 
}) {
  const { activeMarket } = useMarket();

  const rawCategories = ['Toutes', ...(activeMarket?.categories || [])];
  const categories = rawCategories.map(c => 
    typeof c === 'object' && c !== null ? (c.nom || c.name || '') : String(c || '')
  ).filter(Boolean);

  return (
    <div className="filterbar-wrapper" id="catalogue">
      {/* 1. Category Pills for the Active Market */}
      <div className="category-pills-row">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`cat-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat === 'Toutes' ? '🌟 Tous les Rayons' : cat}
          </button>
        ))}
      </div>

      {/* 2. Secondary Filter Bar (Sorting only) */}
      <div className="filterbar-container" style={{ justifyContent: 'flex-end' }}>
        {/* Sorting Dropdown */}
        <div className="filter-right">
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-gray-medium)' }}>
            Trier par :
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select"
          >
            <option value="default">✨ Sélection 7 Shop</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="rating">Mieux notés</option>
          </select>
        </div>
      </div>
    </div>
  );
}
