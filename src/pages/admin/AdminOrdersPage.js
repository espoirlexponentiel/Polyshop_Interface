import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';
import DualPrice from '../../components/common/DualPrice';
import { formatFCFA, formatEuro } from '../../utils/priceUtils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeModalOrder, setActiveModalOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // 📡 Récupération des commandes
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/orders/admin');
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 🔄 Mise à jour du statut
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await axios.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      
      // Mettre à jour l'état local
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, statut: newStatus, status: newStatus } : o));
      
      if (activeModalOrder && activeModalOrder.id === orderId) {
        setActiveModalOrder(prev => ({ ...prev, statut: newStatus, status: newStatus }));
      }
    } catch (err) {
      console.error('Erreur modification statut:', err);
      alert('Erreur lors de la mise à jour du statut.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (selectedStatus === 'all') return true;
    const s = o.statut || o.status || '';
    return s.toUpperCase() === selectedStatus.toUpperCase();
  });

  const getStatusClass = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('ATTENTE') || s === 'PENDING') return 'status-en-attente';
    if (s.includes('PREPAR')) return 'status-en-preparation';
    if (s.includes('VALIDE') || s.includes('CONFIRMED') || s === 'PAID') return 'status-validee';
    if (s.includes('EXPEDIE') || s === 'SHIPPED') return 'status-expediee';
    if (s.includes('LIVRE') || s === 'DELIVERED') return 'status-livree';
    if (s.includes('ANNULE') || s === 'CANCELLED') return 'status-annulee';
    return 'status-validee';
  };

  const formatDisplayStatus = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('ATTENTE')) return '⏳ En attente';
    if (s.includes('PREPAR')) return '📦 En préparation';
    if (s.includes('VALIDE') || s === 'PAID') return '✓ Validée';
    if (s.includes('EXPEDIE')) return '🚚 Expédiée';
    if (s.includes('LIVRE')) return '🎉 Livrée';
    if (s.includes('ANNULE')) return '❌ Annulée';
    return status || 'En attente';
  };

  return (
    <div className="admin-orders-root">
      {/* Filter Tabs & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Gestion des Commandes Clients ({orders.length})</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Suivez et gérez en temps réel les commandes passées par vos clients sur votre boutique 7 Shop.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchOrders} 
            className="btn-admin-secondary"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            title="Actualiser la liste"
          >
            🔄 Rafraîchir
          </button>

          {['all', 'EN_ATTENTE', 'VALIDEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className="btn-admin-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.82rem',
                background: selectedStatus === st ? '#0f172a' : '#ffffff',
                color: selectedStatus === st ? '#ffffff' : '#475569',
                borderColor: selectedStatus === st ? '#0f172a' : '#cbd5e1'
              }}
            >
              {st === 'all' ? 'Toutes' : formatDisplayStatus(st)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Panel */}
      <div className="admin-card-panel">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <div className="spinner-blue" style={{ margin: '0 auto 12px' }}></div>
            <p>Chargement des commandes en cours...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Aucune commande pour le moment</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '400px', margin: '6px auto 0' }}>
              Dès qu'un client valide son panier, sa commande s'affichera immédiatement ici avec ses coordonnées et ses articles.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Articles</th>
                  <th>Montant Total</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const clientNom = order.client?.nom || order.userNom || order.userEmail || 'Client';
                  const clientTel = order.client?.telephone || order.telephone || '';
                  const total = order.totalAmount || order.total || 0;
                  const itemsCount = order.items?.length || 0;

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ color: '#0066ff' }}>#{order.id}</strong>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : (order.date || 'Récemment')}
                      </td>
                      <td>
                        <div>
                          <strong style={{ display: 'block', color: '#0f172a' }}>{clientNom}</strong>
                          {clientTel && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📞 {clientTel}</span>}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '600' }}>
                          {itemsCount} article{itemsCount > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        <DualPrice price={total} size="sm" />
                      </td>
                      <td>
                        <span className={`status-pill ${getStatusClass(order.statut || order.status)}`}>
                          {formatDisplayStatus(order.statut || order.status)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => setActiveModalOrder(order)}
                          className="btn-admin-primary"
                          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                        >
                          Détails / Traiter
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {activeModalOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '720px' }}>
            <div className="admin-modal-header">
              <div>
                <h3>Détail de la Commande #{activeModalOrder.id}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Passée le {activeModalOrder.createdAt ? new Date(activeModalOrder.createdAt).toLocaleString('fr-FR') : activeModalOrder.date}
                </span>
              </div>
              <button onClick={() => setActiveModalOrder(null)} className="btn-close-modal">✕</button>
            </div>

            <div className="admin-modal-body">
              {/* Status Update Row */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Statut Actuel :</span>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`status-pill ${getStatusClass(activeModalOrder.statut || activeModalOrder.status)}`} style={{ fontSize: '0.85rem' }}>
                      {formatDisplayStatus(activeModalOrder.statut || activeModalOrder.status)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>Changer Statut :</label>
                  <select 
                    value={activeModalOrder.statut || activeModalOrder.status || 'EN_ATTENTE'}
                    onChange={(e) => handleUpdateStatus(activeModalOrder.id, e.target.value)}
                    disabled={updatingStatus}
                    className="admin-select"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    <option value="EN_ATTENTE">⏳ En attente</option>
                    <option value="VALIDEE">✓ Validée</option>
                    <option value="EN_PREPARATION">📦 En préparation</option>
                    <option value="EXPEDIEE">🚚 Expédiée</option>
                    <option value="LIVREE">🎉 Livrée</option>
                    <option value="ANNULEE">❌ Annulée</option>
                  </select>
                </div>
              </div>

              {/* Customer Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>👤 Informations Client</h5>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>{activeModalOrder.client?.nom || activeModalOrder.userNom || 'Client'}</p>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>✉️ {activeModalOrder.client?.email || activeModalOrder.userEmail || 'Non renseigné'}</p>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>📞 {activeModalOrder.client?.telephone || activeModalOrder.telephone || 'Non renseigné'}</p>
                </div>

                <div>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>📍 Livraison & Paiement</h5>
                  <p style={{ fontSize: '0.85rem', color: '#0f172a' }}>{activeModalOrder.client?.adresse || activeModalOrder.adresseLivraison || 'Adresse standard'}</p>
                  <p style={{ fontSize: '0.82rem', color: '#059669', fontWeight: '800', marginTop: '6px' }}>📱 Mode de règlement : {activeModalOrder.modePaiement || 'Mobile Money (T-Money / Flooz)'}</p>
                </div>
              </div>

              {/* Order Items List */}
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                  Articles Commandés ({activeModalOrder.items?.length || 0})
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeModalOrder.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.product?.imageUrl && (
                          <img src={item.product.imageUrl} alt={item.product.nom} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                        )}
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>{item.product?.nom || 'Article'}</strong>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {item.taille && <>Taille : <strong>{item.taille}</strong> </>}
                            {item.couleur && <>• Couleur : <strong>{item.couleur}</strong></>}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>
                          {item.quantity} × {formatFCFA(item.unitPrice || 0)}
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>
                          {formatFCFA(item.quantity * (item.unitPrice || 0))}
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          ~ {formatEuro(item.quantity * (item.unitPrice || 0))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total Summary */}
              <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Frais de livraison : <strong style={{ color: '#059669' }}>Gratuit</strong></span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: '800' }}>Total TTC Commande</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0066ff', display: 'block', lineHeight: 1.1 }}>
                    {formatFCFA(activeModalOrder.totalAmount || activeModalOrder.total || 0)}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                    ~ {formatEuro(activeModalOrder.totalAmount || activeModalOrder.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button onClick={() => setActiveModalOrder(null)} className="btn-admin-primary">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
