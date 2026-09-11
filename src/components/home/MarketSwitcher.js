import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { Link } from 'react-router-dom';

export default function MarketSwitcher() {
  const { markets, activeMarketId, switchMarket } = useMarket();

  return (
    <div className="market-switcher-wrap">
      <div className="market-switcher-container">
        <div className="market-switcher-label">
          <span className="market-dot-pulse"></span>
          <span>Marchés 7 Shop :</span>
        </div>

        <div className="market-tabs-row">
          {markets.map(market => {
            const isActive = market.id === activeMarketId;
            return (
              <button
                key={market.id}
                onClick={() => switchMarket(market.id)}
                className={`market-tab-btn ${isActive ? 'active' : ''}`}
                style={isActive ? {
                  backgroundColor: market.couleurPrimaire,
                  color: '#ffffff',
                  boxShadow: `0 4px 14px ${market.couleurPrimaire}44`
                } : {}}
              >
                <span className="market-icon">{market.icone || '🏬'}</span>
                <span className="market-name">{market.nom}</span>
                {isActive && <span className="market-active-badge">Actif</span>}
              </button>
            );
          })}

          {/* Quick link to Admin to customize or add markets */}
          <Link to="/admin/marches" className="market-tab-btn btn-admin-tab" title="Gérer les Marchés & Thèmes (Admin)">
            <span>⚙️</span>
            <span>Gérer / Créer Marché</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
