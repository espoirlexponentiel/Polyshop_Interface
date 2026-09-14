import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function AdminCategoriesPage() {
  const { markets, addCategory, updateCategory, deleteCategory, loading } = useMarket();
  const [selectedMarketId, setSelectedMarketId] = useState(markets[0]?.id || 'vestimentaire');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Editing state
  const [editingCat, setEditingCat] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editMarketId, setEditMarketId] = useState('');

  const currentMarket = markets.find(m => m.id === selectedMarketId) || markets[0];
  
  // Catégories sous forme de liste d'objets ou de chaînes
  const categoriesRaw = currentMarket?.categoriesList || currentMarket?.categories || [];
  const products = currentMarket?.products || [];

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory(selectedMarketId, newCatName.trim(), newCatDesc.trim());
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleOpenEdit = (cat) => {
    const catName = typeof cat === 'object' && cat !== null ? (cat.nom || cat.name || '') : String(cat || '');
    const catId = typeof cat === 'object' && cat !== null ? cat.id : null;
    const catDesc = typeof cat === 'object' && cat?.description ? cat.description : '';
    setEditingCat({ id: catId, originalName: catName });
    setEditName(catName);
    setEditDesc(catDesc);
    setEditMarketId(selectedMarketId);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingCat) return;

    if (editingCat.id) {
      await updateCategory(editingCat.id, {
        nom: editName.trim(),
        description: editDesc.trim(),
        marketId: editMarketId
      });
    } else {
      // Fallback if was mock
      await addCategory(editMarketId, editName.trim(), editDesc.trim());
    }
    setEditingCat(null);
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
                value={currentMarket?.nom || selectedMarketId}
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
                placeholder="Ex: Épicerie Fine, Sous-vêtements..."
                required
                className="admin-input"
              />
            </div>

            <div className="form-group-admin">
              <label>Description (Optionnelle)</label>
              <input 
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Ex: Sélection de qualité supérieure"
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
              <span>{currentMarket?.icone || '📂'}</span> Rayons de {currentMarket?.nom} ({categoriesRaw.length})
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
                {categoriesRaw.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      Aucun rayon enregistré pour ce marché. Ajoutez votre premier rayon à gauche !
                    </td>
                  </tr>
                ) : (
                  categoriesRaw.map((cat, idx) => {
                    const catName = typeof cat === 'object' && cat !== null ? (cat.nom || cat.name || '') : String(cat || '');
                    const catId = typeof cat === 'object' && cat !== null ? cat.id : catName;
                    
                    const count = products.filter(p => {
                      const pCat = typeof p.category === 'object' && p.category !== null ? p.category.nom : p.category;
                      return pCat === catName;
                    }).length;

                    return (
                      <tr key={catId || idx}>
                        <td style={{ color: '#94a3b8', fontWeight: '700' }}>{idx + 1}</td>
                        <td>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{catName}</strong>
                          {typeof cat === 'object' && cat?.description && (
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                              {cat.description}
                            </div>
                          )}
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
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              className="btn-admin-edit"
                              style={{ padding: '6px 12px' }}
                            >
                              Éditer
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Supprimer le rayon "${catName}" du marché ${currentMarket?.nom} ?`)) {
                                  deleteCategory(selectedMarketId, catId);
                                }
                              }}
                              className="btn-admin-danger"
                              style={{ padding: '6px 10px' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCat && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '460px' }}>
            <div className="admin-modal-header">
              <h3>Modifier le Rayon : {editingCat.originalName}</h3>
              <button onClick={() => setEditingCat(null)} className="btn-close-modal">✕</button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body">
                <div className="form-group-admin">
                  <label>Marché</label>
                  <select 
                    value={editMarketId} 
                    onChange={(e) => setEditMarketId(e.target.value)}
                    className="admin-select"
                  >
                    {markets.map(m => (
                      <option key={m.id} value={m.id}>{m.icone} {m.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Nom du Rayon</label>
                  <input 
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="admin-input"
                  />
                </div>

                <div className="form-group-admin">
                  <label>Description</label>
                  <input 
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="admin-input"
                    placeholder="Description optionnelle"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setEditingCat(null)} className="btn-admin-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn-admin-primary">
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
