import React from 'react';
import { useMarket } from '../../context/MarketContext';

export default function HeroSection() {
  const { activeMarket } = useMarket();

  // Split title lines
  const titleLines = activeMarket?.heroTitre ? activeMarket.heroTitre.split('\n') : ['Le style pur.', 'Blanc, Bleu & Jaune.'];

  // Formateur robuste de dimension (supporte nombre brut 450, ou chaîne '450px', '100%', 'auto')
  const formatDimension = (val) => {
    if (!val && val !== 0) return undefined;
    const str = String(val).trim();
    if (!str) return undefined;
    if (str === 'auto' || str.endsWith('px') || str.endsWith('%') || str.endsWith('rem') || str.endsWith('vh') || str.endsWith('vw')) {
      return str;
    }
    return `${str}px`;
  };

  const customImgStyle = {
    ...(activeMarket?.heroImageWidth ? { width: formatDimension(activeMarket.heroImageWidth), maxWidth: '100%' } : {}),
    ...(activeMarket?.heroImageHeight ? { height: formatDimension(activeMarket.heroImageHeight), maxHeight: 'none' } : {}),
    ...(activeMarket?.heroImageObjectFit ? { objectFit: activeMarket.heroImageObjectFit } : {})
  };

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
            style={customImgStyle}
          />
        </div>
      </div>
    </section>
  );
}
