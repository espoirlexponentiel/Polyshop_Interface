import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import axios from '../../api/axios';

export default function AdminProductsPage() {
  const { markets, allProducts, loading, addProduct, updateProduct, deleteProduct, fetchProducts } = useMarket();
  
  const [selectedMarketId, setSelectedMarketId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    marketId: markets[0]?.id || 'vestimentaire',
    nom: '',
    sousTitre: '',
    category: '',
    badge: 'NOUVEAU',
    prix: '',
    ancienPrix: '',
    stock: 20,
    imageUrl: '',
    tailles: 'S, M, L, XL',
    couleurs: 'Noir, Blanc, Bleu, Jaune',
    description: '',
    composition: '',
    pointsForts: 'Matières sélectionnées de premier choix\nTenue et confort irréprochables'
  });

  // Filter real DB products
  const displayedProducts = allProducts
    .filter(p => selectedMarketId === 'all' || (p.marketId || 'vestimentaire') === selectedMarketId)
    .filter(p => {
      const q = searchQuery.toLowerCase();
      const nom = (p.nom || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return nom.includes(q) || cat.includes(q);
    });

  const handleOpenCreate = () => {
    const targetM = markets.find(m => m.id === selectedMarketId) || markets[0];
    setIsCreating(true);
    setEditingProduct(null);
    setFormData({
      marketId: targetM?.id || 'vestimentaire',
      nom: '',
      sousTitre: '',
      category: targetM?.categories?.[0] || 'Général',
      badge: 'NOUVEAU',
      prix: 25.0,
      ancienPrix: '',
      stock: 25,
      imageUrl: '',
      tailles: 'S, M, L, XL, XXL',
      couleurs: 'Noir, Blanc, Bleu, Jaune',
      description: 'Article de qualité supérieure sélectionné par 7 Shop.',
      composition: 'Matières certifiées 7 Shop.',
      pointsForts: 'Matières sélectionnées de premier choix\nTenue et confort irréprochables'
    });
  };

  const handleOpenEdit = (prod) => {
    setIsCreating(false);
    setEditingProduct(prod);
    setFormData({
      marketId: prod.marketId || 'vestimentaire',
      nom: prod.nom,
      sousTitre: prod.sousTitre || '',
      category: prod.category || '',
      badge: prod.badge || '',
      prix: prod.prix || '',
      ancienPrix: prod.ancienPrix || '',
      stock: prod.stock || 0,
      imageUrl: prod.imageUrl || '',
      tailles: Array.isArray(prod.tailles) ? prod.tailles.join(', ') : (prod.tailles || ''),
      couleurs: Array.isArray(prod.couleurs) ? prod.couleurs.join(', ') : (prod.couleurs || ''),
      description: prod.description || '',
      composition: prod.composition || '',
      pointsForts: Array.isArray(prod.pointsForts) ? prod.pointsForts.join('\n') : (prod.pointsForts || '')
    });
  };

  // Upload to Cloudinary via backend Spring Boot endpoint
  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploadingImage(true);
    try {
      const res = await axios.post('/products/upload-image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
      }
    } catch (err) {
      console.error('❌ Erreur upload Cloudinary:', err);
      alert('Erreur lors du téléversement de l\'image vers Cloudinary. Veuillez vérifier votre connexion.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      prix: parseFloat(formData.prix) || 0,
      ancienPrix: formData.ancienPrix ? parseFloat(formData.ancienPrix) : null,
      stock: parseInt(formData.stock, 10) || 0,
      tailles: typeof formData.tailles === 'string' ? formData.tailles.split(',').map(s => s.trim()).filter(Boolean) : formData.tailles,
      couleurs: typeof formData.couleurs === 'string' ? formData.couleurs.split(',').map(s => s.trim()).filter(Boolean) : formData.couleurs,
      pointsForts: typeof formData.pointsForts === 'string' ? formData.pointsForts.split('\n').map(s => s.trim()).filter(Boolean) : formData.pointsForts
    };

    try {
      if (isCreating) {
        await addProduct(formData.marketId, payload);
      } else if (editingProduct) {
        await updateProduct(formData.marketId, editingProduct.id, payload);
      }
      setEditingProduct(null);
      setIsCreating(false);
    } catch (err) {
      // alert already shown
    }
  };

  const currentMarketObj = markets.find(m => m.id === formData.marketId) || markets[0];

  return (
    <div className="admin-products-root">
      {/* Top Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <input 
            type="text"
            placeholder="🔍 Rechercher un article en base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-input"
            style={{ width: '260px' }}
          />

          {/* Market Filter */}
          <select 
            value={selectedMarketId}
            onChange={(e) => setSelectedMarketId(e.target.value)}
            className="admin-select"
          >
            <option value="all">🌐 Tous les Marchés ({markets.length})</option>
            {markets.map(m => (
              <option key={m.id} value={m.id}>{m.icone} {m.nom} ({m.products?.length || 0})</option>
            ))}
          </select>

          <button onClick={fetchProducts} className="btn-admin-secondary" title="Rafraîchir depuis la base">
            🔄 Actualiser BDD
          </button>
        </div>

        <button onClick={handleOpenCreate} className="btn-admin-primary">
          + Nouveau Produit
        </button>
      </div>

      {/* Products Table Panel */}
      <div className="admin-card-panel">
        <div className="admin-card-header">
          <h3><span>🏷️</span> Catalogue BDD ({displayedProducts.length} articles)</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p>Chargement des données depuis la base de données...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>📦 Aucun article trouvé en base de données pour cette sélection</p>
            <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Cliquez sur <strong>+ Nouveau Produit</strong> pour ajouter un article.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Marché</th>
                  <th>Rayon / Catégorie</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Note</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map(prod => {
                  const marketObj = markets.find(m => m.id === prod.marketId);
                  const marketLabel = marketObj ? `${marketObj.icone} ${marketObj.nom}` : prod.marketId;

                  return (
                    <tr key={prod.id}>
                      <td>
                        <div className="prod-thumb-cell">
                          <img 
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'} 
                            alt={prod.nom} 
                            className="prod-cell-img" 
                          />
                          <div>
                            <span className="prod-cell-title">{prod.nom}</span>
                            <span className="prod-cell-sub">{prod.sousTitre || prod.description}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '700', color: '#475569' }}>{marketLabel}</span>
                      </td>
                      <td>
                        <span style={{ padding: '3px 8px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}>
                          {prod.category || 'Général'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                          {(prod.prix || 0).toFixed(2).replace('.', ',')} €
                        </strong>
                        {prod.ancienPrix && (
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.75rem', marginLeft: '6px' }}>
                            {(prod.ancienPrix || 0).toFixed(2).replace('.', ',')} €
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          fontWeight: '800',
                          color: prod.stock <= 10 ? '#dc2626' : '#16a34a'
                        }}>
                          {prod.stock} unités
                        </span>
                      </td>
                      <td>
                        <span>⭐ {prod.rating || '5.0'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleOpenEdit(prod)} className="btn-admin-edit">
                            Éditer
                          </button>
                          <button 
                            onClick={async () => {
                              if (window.confirm(`Supprimer l'article "${prod.nom}" de la base de données ?`)) {
                                await deleteProduct(prod.marketId, prod.id);
                              }
                            }}
                            className="btn-admin-danger"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {(editingProduct || isCreating) && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3>{isCreating ? 'Ajouter un Produit (Base de Données)' : `Modifier : ${editingProduct?.nom}`}</h3>
              <button onClick={() => { setEditingProduct(null); setIsCreating(false); }} className="btn-close-modal">✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                
                {/* Market & Category Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group-admin">
                    <label>Marché Rattaché</label>
                    <select 
                      value={formData.marketId}
                      onChange={(e) => {
                        const mId = e.target.value;
                        const mObj = markets.find(m => m.id === mId);
                        setFormData({
                          ...formData,
                          marketId: mId,
                          category: mObj?.categories?.[0] || 'Général'
                        });
                      }}
                      className="admin-select"
                    >
                      {markets.map(m => (
                        <option key={m.id} value={m.id}>{m.icone} {m.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-admin">
                    <label>Rayon / Catégorie</label>
                    <input 
                      type="text"
                      list="categories-list"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ex: T-shirts, Épicerie..."
                      className="admin-input"
                      required
                    />
                    <datalist id="categories-list">
                      {currentMarketObj?.categories?.map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Product Name & Subtitle */}
                <div className="form-group-admin">
                  <label>Nom du Produit</label>
                  <input 
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Pack 3 Boxers Coton Stretch ou Riz Parfumé Jasmin 5kg"
                    required
                    className="admin-input"
                  />
                </div>

                <div className="form-group-admin">
                  <label>Sous-titre / Accroche</label>
                  <input 
                    type="text"
                    value={formData.sousTitre}
                    onChange={(e) => setFormData({ ...formData, sousTitre: e.target.value })}
                    placeholder="Ex: Matières douces & maintien ergonomique"
                    className="admin-input"
                  />
                </div>

                {/* Pricing, Badge & Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group-admin">
                    <label>Prix (€)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={formData.prix}
                      onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                      required
                      className="admin-input"
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Prix Barré (€)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={formData.ancienPrix}
                      onChange={(e) => setFormData({ ...formData, ancienPrix: e.target.value })}
                      placeholder="Optionnel"
                      className="admin-input"
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Stock</label>
                    <input 
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      className="admin-input"
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Badge</label>
                    <input 
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="BEST-SELLER"
                      className="admin-input"
                    />
                  </div>
                </div>

                {/* Cloudinary Image Upload & URL */}
                <div className="form-group-admin">
                  <label>Image du Produit (Upload Cloudinary ou URL)</label>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileUpload}
                      style={{ fontSize: '0.85rem' }}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <span style={{ color: '#0284c7', fontSize: '0.85rem', fontWeight: '700' }}>
                        ☁️ Upload Cloudinary en cours...
                      </span>
                    )}
                  </div>

                  <input 
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://res.cloudinary.com/..."
                    required
                    className="admin-input"
                  />

                  {formData.imageUrl && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={formData.imageUrl} 
                        alt="Aperçu" 
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                      />
                      <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '700' }}>
                        ✅ Image prête
                      </span>
                    </div>
                  )}
                </div>

                {/* Tailles & Nuances / Options */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group-admin">
                    <label>Tailles / Formats (séparés par virgules)</label>
                    <input 
                      type="text"
                      value={formData.tailles}
                      onChange={(e) => setFormData({ ...formData, tailles: e.target.value })}
                      placeholder="S, M, L, XL ou 5 kg, 10 kg"
                      className="admin-input"
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Couleurs / Variantes (séparées par virgules)</label>
                    <input 
                      type="text"
                      value={formData.couleurs}
                      onChange={(e) => setFormData({ ...formData, couleurs: e.target.value })}
                      placeholder="Noir, Blanc, Bleu, Jaune"
                      className="admin-input"
                    />
                  </div>
                </div>

                {/* Description & Composition */}
                <div className="form-group-admin">
                  <label>Description Complète</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="admin-textarea"
                    rows={2}
                  />
                </div>

                {/* Points Forts */}
                <div className="form-group-admin">
                  <label>Points Forts (1 par ligne)</label>
                  <textarea 
                    value={formData.pointsForts}
                    onChange={(e) => setFormData({ ...formData, pointsForts: e.target.value })}
                    className="admin-textarea"
                    rows={2}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  onClick={() => { setEditingProduct(null); setIsCreating(false); }}
                  className="btn-admin-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-admin-primary" disabled={uploadingImage}>
                  {isCreating ? 'Enregistrer en BDD' : 'Mettre à Jour BDD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
