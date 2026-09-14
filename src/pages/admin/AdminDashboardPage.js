import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../../context/MarketContext';
import axios from '../../api/axios';

export default function AdminDashboardPage() {
  const { markets, dbMarkets, allProducts, loading: loadingMarkets } = useMarket();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // 📡 Récupérer les vraies commandes depuis la BDD (API Spring Boot)
  useEffect(() => {
    const fetchAdminOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await axios.get('/orders/admin');
        const realOrders = Array.isArray(res.data) ? res.data : [];
        setOrders(realOrders);
      } catch (err) {
        console.error('Erreur chargement commandes BDD:', err);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
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
            <span className="kpi-value">{totalRevenue.toFixed(2).replace('.', ',')} €</span>
            <span className="kpi-subtext">~ {(totalRevenue * 655.957).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA</span>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: `5px solid ${m.couleurPrimaire || '#0066ff'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.3rem' }}>{m.icone || '🏬'}</span>
                        <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{m.nom}</strong>
                      </div>
                      <span style={{
                        padding: '3px 10px',
                        background: `${m.couleurPrimaire}22`,
                        color: m.couleurPrimaire,
                        fontWeight: '800',
                        borderRadius: '9999px',
                        fontSize: '0.75rem'
                      }}>
                        {m.couleurPrimaire}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', color: '#64748b' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <Link to="/admin/marches" className="btn-admin-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              + Créer un Marché
            </Link>
            <Link to="/admin/categories" className="btn-admin-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              📂 Gérer les Catégories / Rayons
            </Link>
            <Link to="/admin/produits" className="btn-admin-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              + Ajouter un Nouveau Produit
            </Link>
            <Link to="/admin/commandes" className="btn-admin-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              📋 Consulter les Commandes Réelles ({totalOrders})
            </Link>
          </div>

          <div className="admin-card-header" style={{ marginTop: '20px' }}>
            <h3><span>⚠️</span> Alertes Stock Faible (≤ 10)</h3>
          </div>

          {lowStockProducts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lowStockProducts.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#92400e' }}>{p.nom}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#b45309', background: '#fde68a', padding: '2px 8px', borderRadius: '4px' }}>
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
