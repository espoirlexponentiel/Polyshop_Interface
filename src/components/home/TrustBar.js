import React from 'react';

export default function TrustBar() {
  const guarantees = [
    {
      icon: "🚚",
      title: "Livraison 24h",
      desc: "Expédition Rapide & Soignée"
    },
    {
      icon: "🔒",
      title: "Paiement Sécurisé",
      desc: "Mobile Money (T-Money & Flooz)"
    },
    {
      icon: "✨",
      title: "Qualité PolyShop",
      desc: "Matières Premium Certifiées"
    }
  ];

  return (
    <div className="trustbar-wrapper">
      <div className="trustbar-grid">
        {guarantees.map((item, index) => (
          <div key={index} className="trust-item">
            <div className="trust-icon-box">
              {item.icon}
            </div>
            <div className="trust-info">
              <h5>{item.title}</h5>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
