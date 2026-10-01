import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function AdminCategoriesPage() {
  const { markets, addCategory, updateCategory, deleteCategory } = useMarket();
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
      <div className="admin-categories-header">
        <div className="admin-categories-header-text">
          <h2>Catégories & Rayons</h2>
          <p>Gérez les classifications d'articles pour chaque marché de la plateforme.</p>
        </div>

        {/* Market Selector Pill Tabs */}
        <div className="admin-filter-tabs-scroll">
          {markets.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMarketId(m.id)}
              className="admin-cat-market-tab"
              style={{
                background: selectedMarketId === m.id ? m.couleurPrimaire || '#0066ff' : '#ffffff',
                color: selectedMarketId === m.id ? '#ffffff' : '#334155'
              }}
            >
              <span>{m.icone || '🏬'}</span>
              <span>{m.nom}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Add Category + Category List */}
      <div className="admin-categories-grid">
        
        {/* Left: Add New Category Form */}
        <div className="admin-card-panel admin-cat-form-panel">
          <div className="admin-card-header">
            <h3><span>➕</span> Ajouter un Rayon</h3>
          </div>

          <form onSubmit={handleAddCategory} className="admin-cat-form">
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

            <button type="submit" className="btn-admin-primary admin-btn-submit-cat">
              Ajouter au Marché {currentMarket?.nom}
            </button>
          </form>
        </div>

        {/* Right: Categories Table */}
        <div className="admin-card-panel admin-cat-list-panel">
          <div className="admin-card-header">
            <h3>
              <span>{currentMarket?.icone || '📂'}</span> Rayons de {currentMarket?.nom} ({categoriesRaw.length})
            </h3>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-data-table admin-cat-data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Nom du Rayon</th>
                  <th>Produits</th>
                  <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoriesRaw.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      Aucun rayon enregistré pour ce marché. Ajoutez votre premier rayon ci-dessus !
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
                          <strong className="admin-cat-row-title">{catName}</strong>
                          {typeof cat === 'object' && cat?.description && (
                            <div className="admin-cat-row-desc">
                              {cat.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="admin-cat-count-badge" style={{
                            background: count > 0 ? '#dbeafe' : '#f1f5f9',
                            color: count > 0 ? '#1e40af' : '#64748b'
                          }}>
                            {count} {count > 1 ? 'articles' : 'article'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-cat-row-actions">
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              className="btn-admin-edit"
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
                              title="Supprimer ce rayon"
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
