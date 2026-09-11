import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_MARKETS } from '../data/defaultMarkets';
import axios from '../api/axios';

const MarketContext = createContext();

const STORAGE_KEY_ACTIVE = '7shop_active_market_id_v3';

export function MarketProvider({ children }) {
  // Clear any legacy mock product data caches
  useEffect(() => {
    try {
      localStorage.removeItem('7shop_markets_data_v2');
      localStorage.removeItem('7shop_markets_data');
    } catch (e) {
      // ignore
    }
  }, []);

  const [baseMarkets, setBaseMarkets] = useState(DEFAULT_MARKETS);
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeMarketId, setActiveMarketId] = useState(() => {
    try {
      const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (savedActive && DEFAULT_MARKETS.some(m => m.id === savedActive)) {
        return savedActive;
      }
    } catch (e) {
      console.error('Error loading active market from storage:', e);
    }
    return 'vestimentaire';
  });

  // Helper to normalize DB product entity
  const normalizeProduct = useCallback((p) => {
    const categoryName = typeof p.category === 'object' && p.category ? (p.category.nom || '') : (p.category || '');
    
    const parseList = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.trim()) {
        if (val.includes(',')) return val.split(',').map(s => s.trim()).filter(Boolean);
        if (val.includes('\n')) return val.split('\n').map(s => s.trim()).filter(Boolean);
        return [val.trim()];
      }
      return [];
    };

    return {
      ...p,
      id: p.id,
      marketId: p.marketId || 'vestimentaire',
      category: categoryName,
      categoryObj: typeof p.category === 'object' ? p.category : null,
      couleurs: parseList(p.couleurs),
      tailles: parseList(p.tailles),
      pointsForts: parseList(p.pointsForts),
      rating: p.rating || 5.0,
      reviewCount: p.reviewCount || 1,
      thumbnails: p.thumbnails && p.thumbnails.length > 0 ? p.thumbnails : [p.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80']
    };
  }, []);

  // Fetch real products from Spring Boot Backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/products');
      const rawProducts = Array.isArray(res.data) ? res.data : (res.data?.value || []);
      const normalized = rawProducts.map(normalizeProduct);
      setDbProducts(normalized);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des produits depuis la BDD :', err);
      setError('Impossible de récupérer les articles depuis la base de données.');
      setDbProducts([]);
    } finally {
      setLoading(false);
    }
  }, [normalizeProduct]);

  // Initial fetch on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Construct markets with strictly DB products
  const markets = baseMarkets.map(m => {
    const marketProducts = dbProducts.filter(p => (p.marketId || 'vestimentaire') === m.id);
    const productCategories = [...new Set(marketProducts.map(p => p.category).filter(Boolean))];
    const combinedCategories = [...new Set([...(m.categories || []), ...productCategories])];

    return {
      ...m,
      categories: combinedCategories,
      products: marketProducts
    };
  });

  // Active Market Object
  const activeMarket = markets.find(m => m.id === activeMarketId) || markets[0] || DEFAULT_MARKETS[0];

  // Save active market ID
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeMarketId);
    } catch (e) {
      console.error('Error saving active market ID:', e);
    }
  }, [activeMarketId]);

  // Dynamic Theme CSS Variables Injection
  useEffect(() => {
    if (!activeMarket) return;
    const root = document.documentElement;
    root.style.setProperty('--primary-blue', activeMarket.couleurPrimaire || '#0066FF');
    root.style.setProperty('--primary-blue-hover', activeMarket.couleurPrimaireHover || '#0052cc');
    root.style.setProperty('--accent-yellow', activeMarket.couleurAccent || '#FFB800');
    document.body.dataset.market = activeMarket.id;
  }, [activeMarket]);

  // Switch Market
  const switchMarket = (marketId) => {
    if (markets.some(m => m.id === marketId)) {
      setActiveMarketId(marketId);
    }
  };

  const updateMarket = (marketId, updatedFields) => {
    setBaseMarkets(prev => prev.map(m => {
      if (m.id === marketId) {
        return { ...m, ...updatedFields };
      }
      return m;
    }));
  };

  const createMarket = (newMarketData) => {
    const slug = newMarketData.slug || newMarketData.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = newMarketData.id || slug || `market-${Date.now()}`;
    
    const created = {
      id,
      slug,
      nom: newMarketData.nom || 'Nouveau Marché',
      icone: newMarketData.icone || '🏬',
      couleurPrimaire: newMarketData.couleurPrimaire || '#0066FF',
      couleurPrimaireHover: newMarketData.couleurPrimaireHover || '#0052cc',
      couleurAccent: newMarketData.couleurAccent || '#FFB800',
      couleurHeroBg: newMarketData.couleurHeroBg || 'linear-gradient(135deg, #ffffff 0%, #f4f8ff 50%, #fffbf0 100%)',
      heroTitre: newMarketData.heroTitre || 'Titre du Marché\nSous-titre accrocheur',
      heroSousTitre: newMarketData.heroSousTitre || 'Découvrez la sélection exclusive de produits.',
      heroImageUrl: newMarketData.heroImageUrl || '/images/hero-model.png?v=5',
      heroImageAlt: newMarketData.heroImageAlt || newMarketData.nom,
      categories: newMarketData.categories || ["Général", "Nouveautés"],
      products: []
    };

    setBaseMarkets(prev => [...prev, created]);
    setActiveMarketId(id);
    return created;
  };

  const deleteMarket = (marketId) => {
    if (markets.length <= 1) {
      alert('Impossible de supprimer le dernier marché restant.');
      return;
    }
    setBaseMarkets(prev => prev.filter(m => m.id !== marketId));
    if (activeMarketId === marketId) {
      const remaining = markets.filter(m => m.id !== marketId);
      setActiveMarketId(remaining[0].id);
    }
  };

  const addCategory = (marketId, categoryName) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    setBaseMarkets(prev => prev.map(m => {
      if (m.id === marketId) {
        if (m.categories.includes(trimmed)) return m;
        return { ...m, categories: [...m.categories, trimmed] };
      }
      return m;
    }));
  };

  const deleteCategory = (marketId, categoryName) => {
    setBaseMarkets(prev => prev.map(m => {
      if (m.id === marketId) {
        return { ...m, categories: m.categories.filter(c => c !== categoryName) };
      }
      return m;
    }));
  };

  // Backend Synchronized Product CRUD Operations
  const addProduct = async (marketId, productData, imageFile = null) => {
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('nom', productData.nom || '');
        formData.append('description', productData.description || '');
        formData.append('prix', productData.prix || 0);
        if (productData.ancienPrix) formData.append('ancienPrix', productData.ancienPrix);
        formData.append('stock', productData.stock || 20);
        formData.append('category', productData.category || 'Général');
        formData.append('marketId', marketId);
        formData.append('sousTitre', productData.sousTitre || '');
        formData.append('badge', productData.badge || '');
        formData.append('tailles', Array.isArray(productData.tailles) ? productData.tailles.join(', ') : (productData.tailles || ''));
        formData.append('couleurs', Array.isArray(productData.couleurs) ? productData.couleurs.join(', ') : (productData.couleurs || ''));
        formData.append('composition', productData.composition || '');
        formData.append('pointsForts', Array.isArray(productData.pointsForts) ? productData.pointsForts.join('\n') : (productData.pointsForts || ''));
        formData.append('image', imageFile);

        await axios.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const payload = {
          nom: productData.nom,
          description: productData.description,
          prix: parseFloat(productData.prix) || 0,
          ancienPrix: productData.ancienPrix ? parseFloat(productData.ancienPrix) : null,
          stock: parseInt(productData.stock, 10) || 20,
          marketId,
          sousTitre: productData.sousTitre,
          badge: productData.badge,
          imageUrl: productData.imageUrl,
          tailles: Array.isArray(productData.tailles) ? productData.tailles.join(', ') : (productData.tailles || ''),
          couleurs: Array.isArray(productData.couleurs) ? productData.couleurs.join(', ') : (productData.couleurs || ''),
          composition: productData.composition,
          pointsForts: Array.isArray(productData.pointsForts) ? productData.pointsForts.join('\n') : (productData.pointsForts || ''),
          category: { nom: productData.category || 'Général' }
        };
        await axios.post('/products', payload);
      }
      await fetchProducts();
      return true;
    } catch (err) {
      console.error('❌ Erreur création produit:', err);
      alert('Erreur lors de la création du produit en base de données.');
      throw err;
    }
  };

  const updateProduct = async (marketId, productId, updatedProductData) => {
    try {
      const payload = {
        nom: updatedProductData.nom,
        description: updatedProductData.description,
        prix: parseFloat(updatedProductData.prix) || 0,
        ancienPrix: updatedProductData.ancienPrix ? parseFloat(updatedProductData.ancienPrix) : null,
        stock: parseInt(updatedProductData.stock, 10) || 0,
        marketId,
        sousTitre: updatedProductData.sousTitre,
        badge: updatedProductData.badge,
        imageUrl: updatedProductData.imageUrl,
        tailles: Array.isArray(updatedProductData.tailles) ? updatedProductData.tailles.join(', ') : (updatedProductData.tailles || ''),
        couleurs: Array.isArray(updatedProductData.couleurs) ? updatedProductData.couleurs.join(', ') : (updatedProductData.couleurs || ''),
        composition: updatedProductData.composition,
        pointsForts: Array.isArray(updatedProductData.pointsForts) ? updatedProductData.pointsForts.join('\n') : (updatedProductData.pointsForts || ''),
        category: { nom: updatedProductData.category || 'Général' }
      };

      await axios.put(`/products/${productId}`, payload);
      await fetchProducts();
      return true;
    } catch (err) {
      console.error('❌ Erreur mise à jour produit:', err);
      alert('Erreur lors de la mise à jour du produit.');
      throw err;
    }
  };

  const deleteProduct = async (marketId, productId) => {
    try {
      await axios.delete(`/products/${productId}`);
      await fetchProducts();
      return true;
    } catch (err) {
      console.error('❌ Erreur suppression produit:', err);
      alert('Erreur lors de la suppression du produit.');
      throw err;
    }
  };

  const resetToDefaults = () => {
    setBaseMarkets(DEFAULT_MARKETS);
    setActiveMarketId('vestimentaire');
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
    fetchProducts();
  };

  // Get all products across all markets
  const allProducts = dbProducts;

  return (
    <MarketContext.Provider value={{
      markets,
      activeMarketId,
      activeMarket,
      allProducts,
      loading,
      error,
      fetchProducts,
      switchMarket,
      updateMarket,
      createMarket,
      deleteMarket,
      addCategory,
      deleteCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      resetToDefaults
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
}
