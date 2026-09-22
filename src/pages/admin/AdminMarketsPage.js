import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import axios from '../../api/axios';

export default function AdminMarketsPage() {
  const { markets, dbMarkets, updateMarket, createMarket, deleteMarket, toggleMarketVisibility, switchMarket, seedDefaultMarkets } = useMarket();
  const [editingMarket, setEditingMarket] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state for editing / creating
  const [formData, setFormData] = useState({
    nom: '',
    icone: '🏬',
    couleurPrimaire: '#0066FF',
    couleurAccent: '#FFB800',
    couleurHeroBg: 'linear-gradient(135deg, #ffffff 0%, #f4f8ff 50%, #fffbf0 100%)',
    heroTitre: '',
    heroSousTitre: '',
    heroImageUrl: '',
    heroImageWidth: '480px',
    heroImageHeight: '500px',
    heroImageObjectFit: 'contain',
    isActive: true
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
      heroImageUrl: market.heroImageUrl || '',
      heroImageWidth: market.heroImageWidth || '480px',
      heroImageHeight: market.heroImageHeight || '500px',
      heroImageObjectFit: market.heroImageObjectFit || 'contain',
      isActive: market.isActive !== false
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
      heroImageUrl: '/images/hero-model.png?v=5',
      heroImageWidth: '480px',
      heroImageHeight: '500px',
      heroImageObjectFit: 'contain',
      isActive: true
    });
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploadingImage(true);
    try {
      const res = await axios.post('/markets/upload-image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        setFormData(prev => ({ ...prev, heroImageUrl: res.data.url }));
      }
    } catch (err) {
      console.error('❌ Erreur upload Cloudinary marché:', err);
      alert('Erreur lors du téléversement de l\'image vers Cloudinary.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isCreating) {
      await createMarket(formData);
    } else if (editingMarket) {
      await updateMarket(editingMarket.id, formData);
    }
    setEditingMarket(null);
    setIsCreating(false);
  };

  return (
    <div className="admin-markets-root">
      {/* Top Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Gestion des Marchés & Univers ({markets.length})</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Configurez les thèmes, visuels, rayons et la visibilité publique de chaque marché.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {dbMarkets?.length === 0 && (
            <button 
              onClick={seedDefaultMarkets} 
              className="btn-admin-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🌱 Réinitialiser les 2 Marchés 7 Shop
            </button>
          )}
          <button onClick={handleOpenCreate} className="btn-admin-primary">
            + Créer un Nouveau Marché
          </button>
        </div>
      </div>

      {/* Markets Cards Grid */}
      <div className="markets-admin-grid">
        {markets.map(market => {
          const isDefaultRoot = market.id === 'vestimentaire';
          const isVisible = market.isActive !== false;

          return (
            <div key={market.id} className="market-admin-card" style={{ opacity: isVisible ? 1 : 0.82, border: isVisible ? '1px solid #e2e8f0' : '2px dashed #94a3b8' }}>
              <div 
                className="market-card-topbar"
                style={{ backgroundColor: market.couleurPrimaire || '#0066ff' }}
              >
                <div className="market-card-title-group">
                  <span style={{ fontSize: '1.5rem' }}>{market.icone || '🏬'}</span>
                  <div>
                    <h3>{market.nom}</h3>
                    <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>Slug : {market.slug || market.id}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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
                    title="Sélectionner ce marché dans l'application"
                  >
                    Activer
                  </button>
                </div>
              </div>

              <div className="market-card-body">
                {/* Visibilité Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: isVisible ? '#f0fdf4' : '#f8fafc', borderRadius: '8px', border: `1px solid ${isVisible ? '#bbf7d0' : '#e2e8f0'}`, marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isVisible ? '#166534' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isVisible ? '🟢 Visible aux clients' : '👁️ Masqué aux clients'}
                  </span>
                  <button
                    onClick={() => toggleMarketVisibility(market.id)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      cursor: 'pointer',
                      color: isVisible ? '#dc2626' : '#16a34a'
                    }}
                  >
                    {isVisible ? 'Masquer' : 'Rendre Visible'}
                  </button>
                </div>

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
                  <span className="market-detail-label">Rayons / Catégories :</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{market.categories?.length || 0} rayon(s)</span>
                </div>

                <div className="market-detail-row">
                  <span className="market-detail-label">Produits Associés :</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{market.products?.length || 0} article(s)</span>
                </div>

                <div className="market-detail-row">
                  <span className="market-detail-label">Dimensions Visuel :</span>
                  <span style={{ fontWeight: '700', color: '#0369a1', fontSize: '0.8rem', background: '#f0f9ff', padding: '2px 6px', borderRadius: '4px' }}>
                    📐 {market.heroImageWidth || '480px'} × {market.heroImageHeight || '500px'} ({market.heroImageObjectFit || 'contain'})
                  </span>
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

                {isDefaultRoot ? (
                  <span 
                    style={{
                      padding: '8px 12px',
                      background: '#f1f5f9',
                      color: '#475569',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Le marché par défaut (Mode & Vestimentaire) ne peut pas être supprimé"
                  >
                    🔒 Protégé
                  </span>
                ) : (
                  <button 
                    onClick={async () => {
                      if (window.confirm(`Supprimer définitivement le marché "${market.nom}" et tous ses rayons associés ?`)) {
                        await deleteMarket(market.id);
                      }
                    }}
                    className="btn-admin-danger"
                    title="Supprimer ce marché"
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

                {/* Hero Image URL & Cloudinary Upload */}
                <div className="form-group-admin">
                  <label>Photo / Visuel du Hero (Upload Cloudinary ou URL)</label>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileUpload}
                      style={{ fontSize: '0.85rem' }}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <span style={{ fontSize: '0.8rem', color: '#0066ff', fontWeight: '700' }}>
                        ⏳ Téléversement vers Cloudinary...
                      </span>
                    )}
                  </div>

                  <input 
                    type="text"
                    value={formData.heroImageUrl}
                    onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                    placeholder="https://res.cloudinary.com/... ou /images/hero-model.png"
                    required
                    className="admin-input"
                  />
                </div>

                {/* 📐 Contrôles de Dimensions de l'Image (Largeur & Hauteur) */}
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📐 Contrôle des Dimensions du Visuel
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                      {formData.heroImageWidth || '480px'} × {formData.heroImageHeight || '500px'}
                    </span>
                  </div>

                  {/* Largeur (Width) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>
                        Largeur (Width) :
                      </label>
                      <input 
                        type="text"
                        value={formData.heroImageWidth || '480px'}
                        onChange={(e) => setFormData({ ...formData, heroImageWidth: e.target.value })}
                        placeholder="Ex: 480px, 100%, auto"
                        style={{
                          width: '100px',
                          padding: '4px 8px',
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                          fontWeight: '700'
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="range"
                        min="150"
                        max="900"
                        step="10"
                        value={parseInt(String(formData.heroImageWidth || '480').replace(/[^0-9]/g, ''), 10) || 480}
                        onChange={(e) => setFormData({ ...formData, heroImageWidth: `${e.target.value}px` })}
                        style={{ flex: 1, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', minWidth: '45px', textAlign: 'right' }}>
                        {parseInt(String(formData.heroImageWidth || '480').replace(/[^0-9]/g, ''), 10) || 480}px
                      </span>
                    </div>

                    {/* Presets Largeur */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Compact (320px)', val: '320px' },
                        { label: 'Moyen (420px)', val: '420px' },
                        { label: 'Standard (480px)', val: '480px' },
                        { label: 'Grand (600px)', val: '600px' },
                        { label: 'Plein (100%)', val: '100%' },
                        { label: 'Auto', val: 'auto' }
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setFormData({ ...formData, heroImageWidth: preset.val })}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            borderRadius: '4px',
                            background: formData.heroImageWidth === preset.val ? '#0066FF' : '#ffffff',
                            color: formData.heroImageWidth === preset.val ? '#ffffff' : '#475569',
                            border: `1px solid ${formData.heroImageWidth === preset.val ? '#0066FF' : '#cbd5e1'}`,
                            cursor: 'pointer'
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hauteur (Height) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>
                        Hauteur (Height) :
                      </label>
                      <input 
                        type="text"
                        value={formData.heroImageHeight || '500px'}
                        onChange={(e) => setFormData({ ...formData, heroImageHeight: e.target.value })}
                        placeholder="Ex: 500px, auto"
                        style={{
                          width: '100px',
                          padding: '4px 8px',
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                          fontWeight: '700'
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="range"
                        min="150"
                        max="800"
                        step="10"
                        value={parseInt(String(formData.heroImageHeight || '500').replace(/[^0-9]/g, ''), 10) || 500}
                        onChange={(e) => setFormData({ ...formData, heroImageHeight: `${e.target.value}px` })}
                        style={{ flex: 1, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', minWidth: '45px', textAlign: 'right' }}>
                        {parseInt(String(formData.heroImageHeight || '500').replace(/[^0-9]/g, ''), 10) || 500}px
                      </span>
                    </div>

                    {/* Presets Hauteur */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Compact (350px)', val: '350px' },
                        { label: 'Moyen (420px)', val: '420px' },
                        { label: 'Standard (500px)', val: '500px' },
                        { label: 'Grand (620px)', val: '620px' },
                        { label: 'Auto', val: 'auto' }
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setFormData({ ...formData, heroImageHeight: preset.val })}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            borderRadius: '4px',
                            background: formData.heroImageHeight === preset.val ? '#0066FF' : '#ffffff',
                            color: formData.heroImageHeight === preset.val ? '#ffffff' : '#475569',
                            border: `1px solid ${formData.heroImageHeight === preset.val ? '#0066FF' : '#cbd5e1'}`,
                            cursor: 'pointer'
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode d'Ajustement (Object-Fit) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Ajustement visuel (Object Fit) :
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { val: 'contain', label: 'Contain (Sans rogner)', desc: 'Garde toute l\'image visible' },
                        { val: 'cover', label: 'Cover (Remplir)', desc: 'Remplit tout le cadre' },
                        { val: 'fill', label: 'Fill (Étirer)', desc: 'Force les dimensions' }
                      ].map((fit) => (
                        <button
                          key={fit.val}
                          type="button"
                          onClick={() => setFormData({ ...formData, heroImageObjectFit: fit.val })}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textAlign: 'center',
                            background: (formData.heroImageObjectFit || 'contain') === fit.val ? '#0066FF' : '#ffffff',
                            color: (formData.heroImageObjectFit || 'contain') === fit.val ? '#ffffff' : '#334155',
                            border: `1px solid ${(formData.heroImageObjectFit || 'contain') === fit.val ? '#0066FF' : '#cbd5e1'}`,
                            cursor: 'pointer'
                          }}
                        >
                          {fit.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visibilité Publique Switch */}
                <div className="form-group-admin" style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
                    <input 
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Rendre ce marché visible aux clients</strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Si décoché, le marché, ses rayons et ses produits seront masqués sur le site public.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Live Preview Box */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: formData.couleurHeroBg || '#f8fafc',
                  border: `2px dashed ${formData.couleurPrimaire || '#cbd5e1'}`,
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: formData.couleurPrimaire, textTransform: 'uppercase' }}>
                      ⚡ Aperçu en direct du Hero :
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Largeur: {formData.heroImageWidth || '480px'} | Hauteur: {formData.heroImageHeight || '500px'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', margin: '4px 0' }}>
                        {formData.heroTitre?.split('\n')[0]} <span style={{ color: formData.couleurPrimaire }}>{formData.heroTitre?.split('\n')[1]}</span>
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>{formData.heroSousTitre}</p>
                    </div>

                    {formData.heroImageUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '100%' }}>
                        <img 
                          src={formData.heroImageUrl} 
                          alt="Aperçu Hero" 
                          style={{ 
                            width: formData.heroImageWidth ? (formData.heroImageWidth.includes('%') || formData.heroImageWidth.includes('px') ? formData.heroImageWidth : `${formData.heroImageWidth}px`) : '180px',
                            height: formData.heroImageHeight ? (formData.heroImageHeight.includes('%') || formData.heroImageHeight.includes('px') ? formData.heroImageHeight : `${formData.heroImageHeight}px`) : '160px',
                            maxWidth: '100%',
                            maxHeight: '220px',
                            objectFit: formData.heroImageObjectFit || 'contain',
                            borderRadius: '8px',
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))'
                          }} 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
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
