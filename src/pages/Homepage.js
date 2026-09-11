import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/home/HeroSection';
import TrustBar from '../components/home/TrustBar';
import FilterBar from '../components/home/FilterBar';
import ProductCard from '../components/product/ProductCard';
import ProductModal from '../components/product/ProductModal';
import CartDrawer from '../components/layout/CartDrawer';
import Footer from '../components/layout/Footer';

export default function HomePage() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [selectedNuance, setSelectedNuance] = useState('Tous');
  const [sortBy, setSortBy] = useState('default');
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Tentative de récupération depuis l'API backend avec enrichissement
  useEffect(() => {
    axios.get('/products')
      .then(res => {
        if (res.data && res.data.length > 0) {
          const merged = res.data.map(apiProd => {
            const match = DEFAULT_PRODUCTS.find(d => d.id === apiProd.id || d.nom.toLowerCase() === apiProd.nom.toLowerCase());
            return {
              ...match,
              ...apiProd,
              prix: apiProd.prix || match?.prix || 25.0,
              couleurs: match?.couleurs || ["Noir", "Blanc", "Bleu", "Jaune"],
              tailles: match?.tailles || ["S", "M", "L", "XL", "XXL"],
              thumbnails: match?.thumbnails || [apiProd.imageUrl],
              rating: match?.rating || 4.9,
              reviewCount: match?.reviewCount || 50,
              pointsForts: match?.pointsForts || DEFAULT_PRODUCTS[0].pointsForts
            };
          });
          setProducts(merged);
        }
      })
      .catch(() => {
        setProducts(DEFAULT_PRODUCTS);
      });
  }, []);

  // Filtrage par Nuance de Couleur
  const filteredProducts = products.filter(p => {
    if (selectedNuance === 'Tous') return true;
    return p.couleurs?.some(c => c.toLowerCase().includes(selectedNuance.toLowerCase()));
  });

  // Tri des produits
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.prix - b.prix;
    if (sortBy === 'price-desc') return b.prix - a.prix;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="homepage-root">
      {/* 1. Header & Navigation */}
      <Navbar />

      {/* 2. Hero Section avec mannequin noir posé sur le fond */}
      <HeroSection />

      {/* 3. Barre de Réassurance (4 Piliers) */}
      <TrustBar />

      {/* 4. Section Catalogue & Grille Produits */}
      <section className="catalog-section">
        {/* Filtres de Nuances & Tri */}
        <FilterBar 
          selectedNuance={selectedNuance}
          onSelectNuance={setSelectedNuance}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Grille de cartes */}
        <div className="products-grid">
          {sortedProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              onQuickView={(prod) => setActiveModalProduct(prod)}
            />
          ))}
        </div>
      </section>

      {/* 5. Modale Détail Produit (Quick View) */}
      {activeModalProduct && (
        <ProductModal 
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
        />
      )}

      {/* 6. Tiroir Panier Latéral */}
      <CartDrawer />

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
