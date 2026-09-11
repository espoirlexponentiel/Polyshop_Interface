import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function AdminCategoriesPage() {
  const { markets, addCategory, deleteCategory } = useMarket();
  const [selectedMarketId, setSelectedMarketId] = useState(markets[0]?.id || 'vestimentaire');
  const [newCatName, setNewCatName] = useState('');

  const currentMarket = markets.find(m => m.id === selectedMarketId) || markets[0];
  const categories = currentMarket?.categories || [];
  const products = currentMarket?.products || [];

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(selectedMarketId, newCatName.trim());
    setNewCatName('');
  };

  return (
    <div className="admin-categories-root">
      {/* Top Selector by Market */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Catégories & Rayons</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Gérez les classifications d'articles pour chaque marché de la plateforme.</p>
        </div>

        {/* Market Selector Pill Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {markets.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMarketId(m.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid #cbd5e1',
                background: selectedMarketId === m.id ? m.couleurPrimaire || '#0066ff' : '#ffffff',
                color: selectedMarketId === m.id ? '#ffffff' : '#334155',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{m.icone || '🏬'}</span>
              <span>{m.nom}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Add Category + Category List */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
        
        {/* Left: Add New Category Form */}
        <div className="admin-card-panel">
          <div className="admin-card-header">
            <h3><span>➕</span> Ajouter un Rayon</h3>
          </div>

          <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group-admin">
              <label>Marché Cible</label>
              <input 
                type="text"
                value={currentMarket?.nom}
                disabled
                className="admin-input"
                style={{ background: '#f1f5f9', fontWeight: '700' }}
              />
            </div>

            <div className="form-group-admin">
              <label>Nom de la Catégorie / Rayon</label>
              <input 
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Épicerie Fine, Chaussettes..."
                required
                className="admin-input"
              />
            </div>

            <button type="submit" className="btn-admin-primary" style={{ marginTop: '8px' }}>
              Ajouter au Marché {currentMarket?.nom}
            </button>
          </form>
        </div>

        {/* Right: Categories Table */}
        <div className="admin-card-panel">
          <div className="admin-card-header">
            <h3>
              <span>{currentMarket?.icone || '📂'}</span> Rayons de {currentMarket?.nom} ({categories.length})
            </h3>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom du Rayon</th>
                  <th>Produits Associés</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => {
                  const count = products.filter(p => p.category === cat).length;

                  return (
                    <tr key={idx}>
                      <td style={{ color: '#94a3b8', fontWeight: '700' }}>{idx + 1}</td>
                      <td>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{cat}</strong>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 10px',
                          background: count > 0 ? '#dbeafe' : '#f1f5f9',
                          color: count > 0 ? '#1e40af' : '#64748b',
                          borderRadius: '9999px',
                          fontWeight: '800',
                          fontSize: '0.78rem'
                        }}>
                          {count} article{count > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer le rayon "${cat}" du marché ${currentMarket?.nom} ?`)) {
                              deleteCategory(selectedMarketId, cat);
                            }
                          }}
                          className="btn-admin-danger"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
