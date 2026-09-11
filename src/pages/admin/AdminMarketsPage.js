import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';

export default function AdminMarketsPage() {
  const { markets, updateMarket, createMarket, deleteMarket, switchMarket } = useMarket();
  const [editingMarket, setEditingMarket] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for editing / creating
  const [formData, setFormData] = useState({
    nom: '',
    icone: '🏬',
    couleurPrimaire: '#0066FF',
    couleurAccent: '#FFB800',
    couleurHeroBg: 'linear-gradient(135deg, #ffffff 0%, #f4f8ff 50%, #fffbf0 100%)',
    heroTitre: '',
    heroSousTitre: '',
    heroImageUrl: ''
  });

  const handleOpenEdit = (market) => {
    setIsCreating(false);
    setEditingMarket(market);
    setFormData({
      nom: market.nom || '',
      icone: market.icone || '🏬',
      couleurPrimaire: market.couleurPrimaire || '#0066FF',
      couleurAccent: market.couleurAccent || '#FFB800',
      couleurHeroBg: market.couleurHeroBg || 'linear-gradient(135deg, #ffffff 0%, #f4f8ff 50%, #fffbf0 100%)',
      heroTitre: market.heroTitre || '',
      heroSousTitre: market.heroSousTitre || '',
      heroImageUrl: market.heroImageUrl || ''
    });
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingMarket(null);
    setFormData({
      nom: '',
      icone: '🛒',
      couleurPrimaire: '#10B981',
      couleurAccent: '#0066FF',
      couleurHeroBg: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #f4f8ff 100%)',
      heroTitre: 'Nouveau Marché 7 Shop\nLes Meilleurs Produits',
      heroSousTitre: 'Découvrez notre nouvelle sélection d’articles de qualité supérieure.',
      heroImageUrl: '/images/hero-model.png?v=5'
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isCreating) {
      createMarket(formData);
    } else if (editingMarket) {
      updateMarket(editingMarket.id, formData);
    }
    setEditingMarket(null);
    setIsCreating(false);
  };

  return (
    <div className="admin-markets-root">
      {/* Top Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Marchés & Thèmes Disponibles ({markets.length})</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Chaque marché dispose de sa couleur dominante, de son Hero (textes & photos) et de ses rayons.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-admin-primary">
          + Créer un Nouveau Marché
        </button>
      </div>

      {/* Markets Cards Grid */}
      <div className="markets-admin-grid">
        {markets.map(market => {
          return (
            <div key={market.id} className="market-admin-card">
              <div 
                className="market-card-topbar"
                style={{ backgroundColor: market.couleurPrimaire || '#0066ff' }}
              >
                <div className="market-card-title-group">
                  <span style={{ fontSize: '1.5rem' }}>{market.icone}</span>
                  <div>
                    <h3>{market.nom}</h3>
                    <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>Slug : {market.slug || market.id}</span>
                  </div>
                </div>

                <button 
                  onClick={() => switchMarket(market.id)}
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Activer
                </button>
              </div>

              <div className="market-card-body">
                <div className="market-detail-row">
                  <span className="market-detail-label">Couleur Dominante :</span>
                  <div className="market-color-sample">
                    <span className="color-swatch-box" style={{ backgroundColor: market.couleurPrimaire }}></span>
                    <span>{market.couleurPrimaire}</span>
                  </div>
                </div>

                <div className="market-detail-row">
                  <span className="market-detail-label">Couleur d'Accent :</span>
                  <div className="market-color-sample">
                    <span className="color-swatch-box" style={{ backgroundColor: market.couleurAccent }}></span>
                    <span>{market.couleurAccent}</span>
                  </div>
                </div>

                <div className="market-detail-row">
                  <span className="market-detail-label">Catégories :</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{market.categories?.length || 0} rayons</span>
                </div>

                {/* Hero Preview Box */}
                <div className="market-hero-preview-box">
                  <img 
                    src={market.heroImageUrl || '/images/hero-model.png?v=5'} 
                    alt={market.nom} 
                    className="market-hero-thumb"
                  />
                  <div className="market-hero-preview-text">
                    <h5>{market.heroTitre?.split('\n')[0] || market.nom}</h5>
                    <p>{market.heroSousTitre}</p>
                  </div>
                </div>
              </div>

              <div className="market-card-actions">
                <button 
                  onClick={() => handleOpenEdit(market)}
                  className="btn-admin-edit"
                  style={{ flex: 1 }}
                >
                  ✏️ Modifier Thème & Textes
                </button>

                {markets.length > 1 && (
                  <button 
                    onClick={() => {
                      if (window.confirm(`Supprimer le marché "${market.nom}" ?`)) {
                        deleteMarket(market.id);
                      }
                    }}
                    className="btn-admin-danger"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Modal */}
      {(editingMarket || isCreating) && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3>{isCreating ? 'Créer un Nouveau Marché' : `Personnaliser : ${editingMarket?.nom}`}</h3>
              <button onClick={() => { setEditingMarket(null); setIsCreating(false); }} className="btn-close-modal">✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                {/* Name & Emoji */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px' }}>
                  <div className="form-group-admin">
                    <label>Icône</label>
                    <input 
                      type="text"
                      value={formData.icone}
                      onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                      className="admin-input"
                      style={{ textAlign: 'center', fontSize: '1.2rem' }}
                      maxLength={4}
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Nom du Marché</label>
                    <input 
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Ex: Mode & Vestimentaire, Alimentation..."
                      required
                      className="admin-input"
                    />
                  </div>
                </div>

                {/* Dominant Color Picker */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group-admin">
                    <label>Couleur Dominante (Thème)</label>
                    <div className="color-picker-row">
                      <input 
                        type="color"
                        value={formData.couleurPrimaire}
                        onChange={(e) => setFormData({ ...formData, couleurPrimaire: e.target.value })}
                        className="color-input-native"
                      />
                      <input 
                        type="text"
                        value={formData.couleurPrimaire}
                        onChange={(e) => setFormData({ ...formData, couleurPrimaire: e.target.value })}
                        className="admin-input"
                        style={{ fontFamily: 'monospace', fontWeight: '700' }}
                      />
                    </div>
                  </div>

                  <div className="form-group-admin">
                    <label>Couleur d'Accent</label>
                    <div className="color-picker-row">
                      <input 
                        type="color"
                        value={formData.couleurAccent}
                        onChange={(e) => setFormData({ ...formData, couleurAccent: e.target.value })}
                        className="color-input-native"
                      />
                      <input 
                        type="text"
                        value={formData.couleurAccent}
                        onChange={(e) => setFormData({ ...formData, couleurAccent: e.target.value })}
                        className="admin-input"
                        style={{ fontFamily: 'monospace', fontWeight: '700' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Title */}
                <div className="form-group-admin">
                  <label>Titre Principal du Hero (Saut de ligne avec Entrée)</label>
                  <textarea 
                    value={formData.heroTitre}
                    onChange={(e) => setFormData({ ...formData, heroTitre: e.target.value })}
                    placeholder="Le style pur.&#10;Blanc, Bleu & Jaune."
                    required
                    className="admin-textarea"
                    rows={2}
                  />
                </div>

                {/* Hero Subtitle */}
                <div className="form-group-admin">
                  <label>Sous-titre / Description du Hero</label>
                  <textarea 
                    value={formData.heroSousTitre}
                    onChange={(e) => setFormData({ ...formData, heroSousTitre: e.target.value })}
                    placeholder="Description détaillée de l’univers et des produits..."
                    required
                    className="admin-textarea"
                    rows={3}
                  />
                </div>

                {/* Hero Image URL */}
                <div className="form-group-admin">
                  <label>Photo / Visuel du Hero (URL ou chemin d'image)</label>
                  <input 
                    type="text"
                    value={formData.heroImageUrl}
                    onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                    placeholder="/images/hero-model.png?v=5 ou URL externe"
                    required
                    className="admin-input"
                  />
                </div>

                {/* Live Preview Box */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: formData.couleurHeroBg || '#f8fafc',
                  border: `2px dashed ${formData.couleurPrimaire || '#cbd5e1'}`
                }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: formData.couleurPrimaire, textTransform: 'uppercase' }}>
                    ⚡ Aperçu en direct du Hero :
                  </span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', margin: '6px 0' }}>
                    {formData.heroTitre?.split('\n')[0]} <span style={{ color: formData.couleurPrimaire }}>{formData.heroTitre?.split('\n')[1]}</span>
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{formData.heroSousTitre}</p>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  onClick={() => { setEditingMarket(null); setIsCreating(false); }}
                  className="btn-admin-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-admin-primary">
                  {isCreating ? 'Enregistrer le Marché' : 'Mettre à Jour le Marché'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
