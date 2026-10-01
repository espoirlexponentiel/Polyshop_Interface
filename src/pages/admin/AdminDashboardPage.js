import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../../context/MarketContext';
import axios from '../../api/axios';
import { formatFCFA } from '../../utils/priceUtils';

export default function AdminDashboardPage() {
  const { markets, dbMarkets, allProducts } = useMarket();
  const [orders, setOrders] = useState([]);

  // 📡 Récupérer les vraies commandes depuis la BDD (API Spring Boot)
  useEffect(() => {
    const fetchAdminOrders = async () => {
      try {
        const res = await axios.get('/orders/admin');
        const realOrders = Array.isArray(res.data) ? res.data : [];
        setOrders(realOrders);
      } catch (err) {
        console.error('Erreur chargement commandes BDD:', err);
        setOrders([]);
      }
    };

    fetchAdminOrders();
  }, []);

  // Vraies statistiques calculées depuis la BDD
  const totalProducts = allProducts?.length || 0;
  const totalMarkets = (dbMarkets?.length > 0 ? dbMarkets.length : markets?.length) || 0;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

  // Alertes réelles de stock faible (stock <= 10)
  const lowStockProducts = (allProducts || []).filter(p => (p.stock || 0) <= 10);

  return (
    <div className="admin-dashboard-root">
      {/* 1. KPIs Row */}
      <div className="stats-grid-row">
        <div className="kpi-card">
          <div className="kpi-info-col">
            <span className="kpi-label">Chiffre d'Affaires Réel</span>
            <span className="kpi-value">{formatFCFA(totalRevenue)}</span>
          </div>
          <div className="kpi-icon-box icon-green">💰</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info-col">
            <span className="kpi-label">Commandes BDD</span>
            <span className="kpi-value">{totalOrders}</span>
            <span className="kpi-subtext">
              {totalOrders === 0 ? 'Aucune commande' : `${totalOrders} commande${totalOrders > 1 ? 's' : ''} enregistrée${totalOrders > 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="kpi-icon-box icon-blue">📦</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info-col">
            <span className="kpi-label">Marchés en BDD</span>
            <span className="kpi-value">{totalMarkets}</span>
            <span className="kpi-subtext">Rayons & boutiques configurés</span>
          </div>
          <div className="kpi-icon-box icon-yellow">🏬</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info-col">
            <span className="kpi-label">Articles en Base</span>
            <span className="kpi-value">{totalProducts}</span>
            <span className="kpi-subtext" style={{ color: lowStockProducts.length > 0 ? '#f59e0b' : '#10b981' }}>
              {lowStockProducts.length} alerte{lowStockProducts.length > 1 ? 's' : ''} stock
            </span>
          </div>
          <div className="kpi-icon-box icon-purple">🏷️</div>
        </div>
      </div>

      {/* 2. Grid Panels */}
      <div className="dashboard-sections-grid">
        
        {/* Left: Markets Breakdown */}
        <div className="admin-card-panel">
          <div className="admin-card-header">
            <h3><span>🏬</span> Répartition & Stocks par Marché</h3>
            <Link to="/admin/marches" className="btn-admin-edit">Gérer les Marchés</Link>
          </div>

          <div className="admin-markets-scroll-track">
            {markets.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Aucun marché disponible pour le moment.</p>
            ) : (
              markets.map(m => {
                const marketProds = m.products || [];
                const productCount = marketProds.length;
                const categoryCount = m.categories?.length || 0;

                return (
                  <div 
                    key={m.id}
                    className="admin-market-stat-item"
                    style={{
                      borderLeft: `5px solid ${m.couleurPrimaire || '#0066ff'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{m.icone || '🏬'}</span>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nom}</strong>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        background: `${m.couleurPrimaire || '#0066ff'}18`,
                        color: m.couleurPrimaire || '#0066ff',
                        fontWeight: '800',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        flexShrink: 0
                      }}>
                        {m.couleurPrimaire || '#0066ff'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.80rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span>📦 <strong>{productCount}</strong> produit{productCount > 1 ? 's' : ''}</span>
                      <span>📂 <strong>{categoryCount}</strong> rayon{categoryCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Quick Actions & Stock Alerts */}
        <div className="admin-card-panel">
          <div className="admin-card-header">
            <h3><span>⚡</span> Actions Rapides</h3>
          </div>

          <div className="admin-quick-actions-grid">
            <Link to="/admin/parametres" className="btn-admin-primary admin-quick-action-btn btn-brand-highlight">
              <span>🎨</span>
              <span>Logo & Marque</span>
            </Link>
            <Link to="/admin/marches" className="btn-admin-secondary admin-quick-action-btn">
              <span>🏬</span>
              <span>Marchés & Thèmes</span>
            </Link>
            <Link to="/admin/categories" className="btn-admin-secondary admin-quick-action-btn">
              <span>📂</span>
              <span>Rayons / Catégories</span>
            </Link>
            <Link to="/admin/produits" className="btn-admin-secondary admin-quick-action-btn">
              <span>📦</span>
              <span>+ Nouveau Produit</span>
            </Link>
            <Link to="/admin/commandes" className="btn-admin-secondary admin-quick-action-btn full-width-mobile">
              <span>📋</span>
              <span>Commandes ({totalOrders})</span>
            </Link>
          </div>

          <div className="admin-card-header" style={{ marginTop: '24px' }}>
            <h3><span>⚠️</span> Alertes Stock Faible (≤ 10)</h3>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="admin-low-stock-list">
              {lowStockProducts.slice(0, 5).map(p => (
                <div key={p.id} className="admin-low-stock-item">
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#92400e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.nom}
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#b45309', background: '#fde68a', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>
                    Stock : {p.stock}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: '600' }}>✓ Aucun article en rupture de stock.</p>
          )}
        </div>
      </div>
    </div>
  );
}
