import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_MARKETS } from '../data/defaultMarkets';
import axios from '../api/axios';

const MarketContext = createContext();

const STORAGE_KEY_ACTIVE = '7shop_active_market_id_v4';

export function MarketProvider({ children }) {
  const [dbMarkets, setDbMarkets] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeMarketId, setActiveMarketId] = useState(() => {
    try {
      const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (savedActive) return savedActive;
    } catch (e) {
      console.error('Error loading active market from storage:', e);
    }
    return 'vestimentaire';
  });

  // Helper to normalize DB product entity
  const normalizeProduct = useCallback((p) => {
    const categoryName = typeof p.category === 'object' && p.category ? (p.category.nom || '') : (p.category || '');
    const marketIdFromCat = typeof p.category === 'object' && p.category?.market?.id ? p.category.market.id : null;
    
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
      marketId: p.marketId || marketIdFromCat || 'vestimentaire',
      category: categoryName,
      categoryId: typeof p.category === 'object' && p.category ? p.category.id : null,
      categoryObj: typeof p.category === 'object' ? p.category : null,
      couleurs: parseList(p.couleurs),
      tailles: parseList(p.tailles),
      pointsForts: parseList(p.pointsForts),
      rating: p.rating || 5.0,
      reviewCount: p.reviewCount || 1,
      thumbnails: p.thumbnails && p.thumbnails.length > 0 ? p.thumbnails : [p.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80']
    };
  }, []);

  // Fetch all data from Spring Boot Backend (Markets, Categories, Products)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Markets
      const marketsRes = await axios.get('/markets');
      const rawMarkets = Array.isArray(marketsRes.data) ? marketsRes.data : [];
      setDbMarkets(rawMarkets);

      // 2. Fetch Categories
      const categoriesRes = await axios.get('/categories');
      const rawCategories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      setDbCategories(rawCategories);

      // 3. Fetch Products
      const productsRes = await axios.get('/products');
      const rawProducts = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.value || []);
      const normalizedProducts = rawProducts.map(normalizeProduct);
      setDbProducts(normalizedProducts);

    } catch (err) {
      console.error('❌ Erreur lors du chargement des articles :', err);
      setError('Impossible de charger les articles de la boutique.');
    } finally {
      setLoading(false);
    }
  }, [normalizeProduct]);

  // Initial fetch on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Combined markets structure (Database first, or DEFAULT_MARKETS fallback if DB is empty)
  const markets = (dbMarkets.length > 0 ? dbMarkets : DEFAULT_MARKETS).map(m => {
    // Categories for this market from DB
    const marketDbCats = dbCategories.filter(c => {
      const catMarketId = c.market?.id || c.marketId || (typeof c.market === 'string' ? c.market : null);
      return catMarketId === m.id;
    });

    // Also extract categories from m.categories if provided
    const rawMarketCats = Array.isArray(m.categories) ? m.categories : [];
    
    // Merge category objects
    const allCatObjs = marketDbCats.length > 0 ? marketDbCats : rawMarketCats.filter(c => typeof c === 'object' && c !== null);

    // Extract ONLY pure string names for `categories` array
    const namesFromDb = marketDbCats.map(c => (typeof c === 'string' ? c : (c.nom || c.name || ''))).filter(Boolean);
    const namesFromRaw = rawMarketCats.map(c => (typeof c === 'string' ? c : (c.nom || c.name || ''))).filter(Boolean);
    
    const combinedCategoryNames = Array.from(new Set([...namesFromDb, ...namesFromRaw]));

    // Products for this market from DB
    const marketProducts = dbProducts.filter(p => (p.marketId === m.id || p.categoryObj?.market?.id === m.id));

    return {
      ...m,
      categories: combinedCategoryNames,
      categoriesList: allCatObjs.length > 0 ? allCatObjs : combinedCategoryNames.map((name, i) => ({ id: i + 1, nom: name })),
      products: marketProducts
    };
  });

  // Active Market Object & Visible Markets
  const visibleMarkets = markets.filter(m => m.isActive !== false);
  const activeMarket = visibleMarkets.find(m => m.id === activeMarketId) || markets.find(m => m.id === activeMarketId) || visibleMarkets[0] || markets[0] || DEFAULT_MARKETS[0];

  // Save active market ID
  useEffect(() => {
    if (activeMarket?.id) {
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE, activeMarket.id);
      } catch (e) {
        console.error('Error saving active market ID:', e);
      }
    }
  }, [activeMarket]);

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

  // 🏬 CRUD Marchés (Persisté en BDD)
  const createMarket = async (newMarketData) => {
    try {
      const slug = newMarketData.slug || newMarketData.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const id = newMarketData.id || slug || `market-${Date.now()}`;
      
      const payload = {
        id,
        slug,
        nom: newMarketData.nom,
        icone: newMarketData.icone || '🏬',
        couleurPrimaire: newMarketData.couleurPrimaire || '#0066FF',
        couleurPrimaireHover: newMarketData.couleurPrimaireHover || '#0052cc',
        couleurAccent: newMarketData.couleurAccent || '#FFB800',
        couleurHeroBg: newMarketData.couleurHeroBg || 'linear-gradient(135deg, #ffffff 0%, #f4f8ff 50%, #fffbf0 100%)',
        heroTitre: newMarketData.heroTitre || `Marché ${newMarketData.nom}`,
        heroSousTitre: newMarketData.heroSousTitre || 'Découvrez notre sélection.',
        heroImageUrl: newMarketData.heroImageUrl || '/images/hero-model.png?v=5',
        heroImageAlt: newMarketData.heroImageAlt || newMarketData.nom,
        isActive: newMarketData.isActive !== false
      };

      await axios.post('/markets', payload);
      await fetchAllData();
      setActiveMarketId(id);
      return true;
    } catch (err) {
      console.error('❌ Erreur création marché:', err);
      alert('Erreur lors de la création du marché.');
      throw err;
    }
  };

  const updateMarket = async (marketId, updatedFields) => {
    try {
      await axios.put(`/markets/${marketId}`, updatedFields);
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('❌ Erreur mise à jour marché:', err);
      alert('Erreur lors de la mise à jour du marché.');
      throw err;
    }
  };

  const toggleMarketVisibility = async (marketId) => {
    try {
      await axios.put(`/markets/${marketId}/toggle-visibility`);
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('❌ Erreur visibilité marché:', err);
      alert('Erreur lors du changement de visibilité du marché.');
      throw err;
    }
  };

  const deleteMarket = async (marketId) => {
    if (marketId === 'vestimentaire') {
      alert('🛡️ Le marché de référence (Mode & Vestimentaire) est protégé et ne peut pas être supprimé. Vous pouvez en revanche le masquer.');
      return false;
    }
    try {
      await axios.delete(`/markets/${marketId}`);
      await fetchAllData();
      if (activeMarketId === marketId) {
        setActiveMarketId('vestimentaire');
      }
      return true;
    } catch (err) {
      console.error('❌ Erreur suppression marché:', err);
      const msg = err.response?.data?.error || 'Erreur lors de la suppression du marché.';
      alert(msg);
      throw err;
    }
  };

  // 📂 CRUD Catégories
  const addCategory = async (marketId, categoryName, description = '') => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    try {
      await axios.post('/categories', {
        nom: trimmed,
        marketId: marketId || activeMarketId,
        description
      });
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('❌ Erreur création catégorie:', err);
      alert('Erreur lors de la création du rayon.');
      throw err;
    }
  };

  const updateCategory = async (categoryId, updatedData) => {
    try {
      await axios.put(`/categories/${categoryId}`, updatedData);
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('❌ Erreur modification catégorie:', err);
      alert('Erreur lors de la modification du rayon.');
      throw err;
    }
  };

  const deleteCategory = async (marketId, categoryIdOrName) => {
    try {
      // Trouver l'ID numérique de la catégorie si le nom est fourni
      let catId = categoryIdOrName;
      if (typeof categoryIdOrName === 'string') {
        const found = dbCategories.find(c => (c.market?.id === marketId || c.marketId === marketId) && c.nom.toLowerCase() === categoryIdOrName.toLowerCase());
        if (found) catId = found.id;
      }
      
      if (catId && (typeof catId === 'number' || !isNaN(Number(catId)))) {
        await axios.delete(`/categories/${catId}`);
      }
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('❌ Erreur suppression catégorie:', err);
      alert('Erreur lors de la suppression du rayon.');
      throw err;
    }
  };

  // 📦 CRUD Produits
  const addProduct = async (marketId, productData, imageFile = null) => {
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('nom', productData.nom || '');
        formData.append('description', productData.description || '');
        formData.append('prix', productData.prix || 0);
        if (productData.ancienPrix) formData.append('ancienPrix', productData.ancienPrix);
        formData.append('stock', productData.stock || 20);
        if (productData.categoryId) formData.append('categoryId', productData.categoryId);
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
          category: productData.categoryId 
            ? { id: productData.categoryId } 
            : { nom: productData.category || 'Général' }
        };
        await axios.post('/products', payload);
      }
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('❌ Erreur création produit:', err);
      alert('Erreur lors de la création du produit.');
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
        category: updatedProductData.categoryId 
          ? { id: updatedProductData.categoryId } 
          : { nom: updatedProductData.category || 'Général' }
      };

      await axios.put(`/products/${productId}`, payload);
      await fetchAllData();
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
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('❌ Erreur suppression produit:', err);
      alert('Erreur lors de la suppression du produit.');
      throw err;
    }
  };

  // Seed default 7 Shop markets & categories if desired
  const seedDefaultMarkets = async () => {
    setLoading(true);
    try {
      for (const m of DEFAULT_MARKETS) {
        await axios.post('/markets', {
          id: m.id,
          slug: m.slug || m.id,
          nom: m.nom,
          icone: m.icone,
          couleurPrimaire: m.couleurPrimaire,
          couleurPrimaireHover: m.couleurPrimaireHover,
          couleurAccent: m.couleurAccent,
          couleurHeroBg: m.couleurHeroBg,
          heroTitre: m.heroTitre,
          heroSousTitre: m.heroSousTitre,
          heroImageUrl: m.heroImageUrl,
          heroImageAlt: m.heroImageAlt
        });

        for (const catName of m.categories) {
          await axios.post('/categories', {
            nom: catName,
            marketId: m.id
          });
        }
      }
      await fetchAllData();
      alert('✅ Les marchés et rayons 7 Shop ont été initialisés avec succès !');
    } catch (err) {
      console.error('❌ Erreur seeding:', err);
      alert('Erreur lors de l\'initialisation des marchés par défaut.');
    } finally {
      setLoading(false);
    }
  };

  // Backward compatibility alias for fetchProducts
  const fetchProducts = fetchAllData;

  const allProducts = dbProducts;
  const allCategories = dbCategories;

  return (
    <MarketContext.Provider value={{
      markets,
      visibleMarkets,
      dbMarkets,
      dbCategories,
      allCategories,
      activeMarketId,
      activeMarket,
      allProducts,
      loading,
      error,
      fetchAllData,
      fetchProducts,
      switchMarket,
      updateMarket,
      toggleMarketVisibility,
      createMarket,
      deleteMarket,
      addCategory,
      updateCategory,
      deleteCategory,
      addProduct,
      updateProduct,
      deleteProduct,
      seedDefaultMarkets
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
