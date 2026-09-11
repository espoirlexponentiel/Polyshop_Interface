import React from 'react';

export default function FilterBar({ selectedNuance, onSelectNuance, sortBy, onSortChange }) {
  const nuances = [
    { label: 'Tous', value: 'Tous' },
    { label: 'Blanc', value: 'Blanc', dotClass: 'dot-blanc' },
    { label: 'Bleu', value: 'Bleu', dotClass: 'dot-bleu' },
    { label: 'Jaune', value: 'Jaune', dotClass: 'dot-jaune' },
    { label: 'Noir', value: 'Noir', dotClass: 'dot-noir' }
  ];

  return (
    <div className="filterbar-container" id="catalogue">
      {/* Nuances Filter */}
      <div className="filter-left">
        <span className="filter-label">
          <span>🎨</span> Nuance :
        </span>
        <div className="filter-pills-group">
          {nuances.map(n => (
            <button
              key={n.value}
              onClick={() => onSelectNuance(n.value)}
              className={`filter-pill ${selectedNuance === n.value ? 'active' : ''}`}
            >
              {n.dotClass && <span className={`nuance-dot ${n.dotClass}`}></span>}
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </div>

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
  );
}
