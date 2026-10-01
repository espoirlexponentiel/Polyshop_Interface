import React, { useState, useEffect, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/home/HeroSection';
import TrustBar from '../components/home/TrustBar';
import FilterBar from '../components/home/FilterBar';
import ProductCard from '../components/product/ProductCard';
import ProductModal from '../components/product/ProductModal';
import CartDrawer from '../components/layout/CartDrawer';
import Footer from '../components/layout/Footer';

export default function HomePage() {
  const { visibleMarkets, activeMarket, loading, error, switchMarket, fetchProducts } = useMarket();
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [sortBy, setSortBy] = useState('default');
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Reset selected category to 'Toutes' when active market changes
  useEffect(() => {
    setSelectedCategory('Toutes');
  }, [activeMarket?.id]);

  // Products from the currently active market (strictly from database)
  const marketProducts = activeMarket?.products || [];

  // Filter by Category (handles object, string and case sensitivity)
  const categoryFiltered = marketProducts.filter(p => {
    if (selectedCategory === 'Toutes') return true;
    const catName = typeof p.category === 'object' && p.category !== null 
      ? (p.category.nom || p.category.name || '') 
      : (typeof p.categoryObj === 'object' && p.categoryObj !== null ? (p.categoryObj.nom || p.categoryObj.name || '') : String(p.category || ''));
    return catName.trim().toLowerCase() === String(selectedCategory).trim().toLowerCase();
  });

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...categoryFiltered].sort((a, b) => {
      const priceA = Number(a.prix || 0);
      const priceB = Number(b.prix || 0);
      const ratingA = Number(a.rating || 0);
      const ratingB = Number(b.rating || 0);
      const nameA = String(a.nom || '').toLowerCase();
      const nameB = String(b.nom || '').toLowerCase();

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'rating') return ratingB - ratingA;
      if (sortBy === 'name-asc') return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
      return 0;
    });
  }, [categoryFiltered, sortBy]);

  // Group products into sequential rows for mobile
  const productRows = useMemo(() => {
    if (!sortedProducts || sortedProducts.length === 0) return [];
    const N = sortedProducts.length;

    if (N <= 3) {
      return [sortedProducts];
    }

    if (N === 4) {
      return [
        sortedProducts.slice(0, 3),
        sortedProducts.slice(3, 4)
      ];
    }

    if (N === 5) {
      return [
        sortedProducts.slice(0, 3),
        sortedProducts.slice(3, 5)
      ];
    }

    // Pour N >= 6 : répartir sur 3 lignes (ex: N=8 -> 3 sur 1ère, 3 sur 2e, 2 sur 3e)
    const base = Math.floor(N / 3);
    const rem = N % 3;
    const c1 = base + (rem >= 1 ? 1 : 0);
    const c2 = base + (rem >= 2 ? 1 : 0);
    const c3 = base;

    return [
      sortedProducts.slice(0, c1),
      sortedProducts.slice(c1, c1 + c2),
      sortedProducts.slice(c1 + c2, c1 + c2 + c3)
    ].filter(r => r.length > 0);
  }, [sortedProducts]);

  // Other visible markets with active products
  const otherMarketsWithProducts = (visibleMarkets || []).filter(m => m.id !== activeMarket?.id && (m.products?.length || 0) > 0);

  return (
    <div className="homepage-root">
      {/* 1. Header & Navigation */}
      <Navbar />

      {/* 2. Hero Section Dynamique selon le Marché */}
      <HeroSection />

      {/* 4. Barre de Réassurance (4 Piliers) */}
      <TrustBar />

      {/* 5. Section Catalogue & Grille Produits du Marché */}
      <section className="catalog-section" id="catalogue">
        <div className="catalog-header-centered">
          <span className="catalog-badge">
            {activeMarket?.icone || '🏬'} MARCHÉ {activeMarket?.nom?.toUpperCase() || '7 SHOP'}
          </span>
          <h2 className="catalog-title">Nos Produits Disponibles</h2>
          <p className="catalog-subtitle">
            Sélection officielle issue de notre catalogue en ligne pour le marché <strong>{activeMarket?.nom}</strong>.
          </p>
        </div>


        {loading ? (
          <div className="loading-products-box">
            <div className="spinner-blue"></div>
            <p>Chargement des articles de votre boutique...</p>
          </div>
        ) : error ? (
          <div className="empty-market-banner error-banner">
            <div className="empty-market-icon">⚠️</div>
            <h3 className="empty-market-title">Connexion temporairement indisponible</h3>
            <p className="empty-market-desc">{error}</p>
            <button 
              onClick={() => fetchProducts()} 
              className="btn-explore-market"
              style={{ marginTop: '16px', background: 'var(--primary-blue, #0066FF)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              🔄 Actualiser la page
            </button>
          </div>
        ) : marketProducts.length === 0 ? (
          /* BANNIÈRE PAS D'ARTICLES DANS CE MARCHÉ */
          <div className="empty-market-banner">
            <div className="empty-market-icon">📦</div>
            <h3 className="empty-market-title">Aucun article disponible pour le moment</h3>
            <p className="empty-market-desc">
              Les articles pour le marché <strong>{activeMarket?.nom}</strong> seront très bientôt disponibles.
            </p>

            {otherMarketsWithProducts.length > 0 && (
              <div className="empty-market-suggestions">
                <span className="suggestions-label">Explorez nos marchés avec des articles disponibles :</span>
                <div className="empty-market-actions">
                  {otherMarketsWithProducts.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => switchMarket(m.id)}
                      className="btn-explore-market"
                    >
                      <span>{m.icone}</span>
                      <span>Marché {m.nom} ({m.products.length} article{m.products.length > 1 ? 's' : ''})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Filtres de Catégories & Tri */}
            <FilterBar 
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalCount={sortedProducts.length}
            />

            {/* Grille Produits : Desktop (Grille 3 Colonnes) & Mobile (Lignes Défilantes Indépendantes à 3 colonnes) */}
            {sortedProducts.length > 0 ? (
              <div className="products-display-wrapper">
                {/* 1. Version Ordinateur / Web : Grille standard 3 colonnes */}
                <div className="desktop-products-grid">
                  {sortedProducts.map(product => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      onQuickView={(prod) => setActiveModalProduct(prod)}
                    />
                  ))}
                </div>

                {/* 2. Version Smartphone / Mobile : Lignes de défilement indépendantes (3 colonnes visibles par ligne) */}
                <div className="mobile-products-rows">
                  {productRows.map((rowItems, rowIdx) => (
                    <div key={rowIdx} className="mobile-single-row-wrap">
                      <div className="mobile-row-track">
                        {rowItems.map(product => (
                          <ProductCard 
                            key={product.id}
                            product={product}
                            onQuickView={(prod) => setActiveModalProduct(prod)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-products-box">
                <p>Aucun produit ne correspond à ces filtres dans le marché <strong>{activeMarket?.nom}</strong>.</p>
                <button 
                  onClick={() => setSelectedCategory('Toutes')}
                  className="btn-reset-filters"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 6. Modale Détail Produit (Quick View) */}
      {activeModalProduct && (
        <ProductModal 
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
        />
      )}

      {/* 7. Tiroir Panier Latéral */}
      <CartDrawer />

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
