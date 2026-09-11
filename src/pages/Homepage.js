import React, { useState } from 'react';
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
  const { markets, activeMarket, loading, error, switchMarket } = useMarket();
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [selectedNuance, setSelectedNuance] = useState('Tous');
  const [sortBy, setSortBy] = useState('default');
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Products from the currently active market (strictly from database)
  const marketProducts = activeMarket?.products || [];

  // Filter by Category
  const categoryFiltered = marketProducts.filter(p => {
    if (selectedCategory === 'Toutes') return true;
    return p.category === selectedCategory;
  });

  // Filter by Nuance
  const nuanceFiltered = categoryFiltered.filter(p => {
    if (selectedNuance === 'Tous') return true;
    return p.couleurs?.some(c => typeof c === 'string' && c.toLowerCase().includes(selectedNuance.toLowerCase()));
  });

  // Sort products
  const sortedProducts = [...nuanceFiltered].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.prix || 0) - (b.prix || 0);
    if (sortBy === 'price-desc') return (b.prix || 0) - (a.prix || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  // Other markets with active products
  const otherMarketsWithProducts = markets.filter(m => m.id !== activeMarket?.id && (m.products?.length || 0) > 0);

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
            {activeMarket?.icone || '🏬'} RAYON {activeMarket?.nom?.toUpperCase() || '7 SHOP'}
          </span>
          <h2 className="catalog-title">Nos Produits Disponibles</h2>
          <p className="catalog-subtitle">
            Sélection officielle issue de notre catalogue en ligne pour le marché <strong>{activeMarket?.nom}</strong>.
          </p>
        </div>

        {loading ? (
          <div className="loading-products-box">
            <div className="spinner-blue"></div>
            <p>Chargement des articles de la base de données...</p>
          </div>
        ) : error ? (
          <div className="empty-market-banner error-banner">
            <div className="empty-market-icon">⚠️</div>
            <h3 className="empty-market-title">Erreur de connexion</h3>
            <p className="empty-market-desc">{error}</p>
          </div>
        ) : marketProducts.length === 0 ? (
          /* BANNIÈRE PAS D'ARTICLES DANS CE RAYON */
          <div className="empty-market-banner">
            <div className="empty-market-icon">📦</div>
            <h3 className="empty-market-title">Aucun article disponible pour le moment</h3>
            <p className="empty-market-desc">
              Il n'y a actuellement aucun article enregistré dans la base de données pour le rayon <strong>{activeMarket?.nom}</strong>.
            </p>

            {otherMarketsWithProducts.length > 0 && (
              <div className="empty-market-suggestions">
                <span className="suggestions-label">Explorez nos rayons avec des articles disponibles :</span>
                <div className="empty-market-actions">
                  {otherMarketsWithProducts.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => switchMarket(m.id)}
                      className="btn-explore-market"
                    >
                      <span>{m.icone}</span>
                      <span>Rayon {m.nom} ({m.products.length} article{m.products.length > 1 ? 's' : ''})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Filtres de Catégories & Nuances & Tri */}
            <FilterBar 
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedNuance={selectedNuance}
              onSelectNuance={setSelectedNuance}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Grille de cartes centrée */}
            {sortedProducts.length > 0 ? (
              <div className="products-grid">
                {sortedProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onQuickView={(prod) => setActiveModalProduct(prod)}
                  />
                ))}
              </div>
            ) : (
              <div className="no-products-box">
                <p>Aucun produit ne correspond à ces filtres dans le marché <strong>{activeMarket?.nom}</strong>.</p>
                <button 
                  onClick={() => { setSelectedCategory('Toutes'); setSelectedNuance('Tous'); }}
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
