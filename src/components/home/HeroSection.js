import React from 'react';

export default function HeroSection() {
  return (
    <section className="hero-wrapper">
      <div className="hero-grid">
        {/* Left Content */}
        <div className="hero-left-content">
          <h1 className="hero-title">
            Le style pur.<br />
            <span className="title-accent">Blanc, Bleu & Jaune</span>.
          </h1>

          <p className="hero-description">
            Découvrez l'univers <strong>7 Shop</strong> : sous-vêtements (boxers, chaussettes, débardeurs), 
            tapettes, pull-overs, ceintures, pantalons, coupes oversize et casquettes. 
            Des matières sélectionnées pour une tenue impeccable au quotidien.
          </p>
        </div>

        {/* Right Fashion Model - Se pose naturellement sur le fond sans cadre */}
        <div className="hero-model-container">
          <img 
            src="/images/hero-model.jpg" 
            alt="Modèle 7 Shop - Collection Africaine" 
            className="hero-model-seamless-img"
          />
        </div>
      </div>
    </section>
  );
}
