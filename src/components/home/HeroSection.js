import React from 'react';
import { useMarket } from '../../context/MarketContext';

export default function HeroSection() {
  const { activeMarket } = useMarket();

  // Split title lines
  const titleLines = activeMarket?.heroTitre ? activeMarket.heroTitre.split('\n') : ['Le style pur.', 'Blanc, Bleu & Jaune.'];

  return (
    <section className="hero-wrapper">
      <div 
        className="hero-grid"
        style={activeMarket?.couleurHeroBg ? { background: activeMarket.couleurHeroBg } : {}}
      >
        {/* Left Content */}
        <div className="hero-left-content">
          <div className="hero-market-tag">
            <span>{activeMarket?.icone || '🏬'}</span>
            <span>{activeMarket?.nom || 'Marché 7 Shop'}</span>
          </div>

          <h1 className="hero-title">
            {titleLines.map((line, idx) => (
              <React.Fragment key={idx}>
                {idx === titleLines.length - 1 ? (
                  <span className="title-accent">{line}</span>
                ) : (
                  <>{line}<br /></>
                )}
              </React.Fragment>
            ))}
          </h1>

          <p className="hero-description">
            {activeMarket?.heroSousTitre || "Découvrez notre sélection exclusive d'articles de qualité 7 Shop."}
          </p>
        </div>

        {/* Right Fashion Model / Product Hero - Se pose directement sur le fond de la carte */}
        <div className="hero-model-container">
          <img 
            src={activeMarket?.heroImageUrl || "/images/hero-model.png?v=5"} 
            alt={activeMarket?.heroImageAlt || activeMarket?.nom || "7 Shop"} 
            className="hero-model-seamless-img"
          />
        </div>
      </div>
    </section>
  );
}
