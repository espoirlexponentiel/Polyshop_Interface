import React, { useState } from 'react';

const INITIAL_ORDERS = [
  {
    id: "CMD-78921",
    date: "11/09/2026 15:42",
    client: {
      nom: "Amadou Diallo",
      email: "amadou.diallo@gmail.com",
      telephone: "+221 77 654 32 10",
      adresse: "14 Rue des Jardins, Dakar, Sénégal"
    },
    statut: "En attente",
    modePaiement: "Google Pay (Carte Visa)",
    marche: "Mode & Vestimentaire",
    articles: [
      {
        nom: "Pack 3 Boxers Coton Stretch 7 Shop",
        taille: "L",
        couleur: "Noir",
        quantite: 2,
        prixUnitaire: 34.9,
        imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
      },
      {
        nom: "Casquette Signature 7 Shop",
        taille: "Taille Unique",
        couleur: "Jaune",
        quantite: 1,
        prixUnitaire: 28.0,
        imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80"
      }
    ],
    fraisPort: 4.9,
    total: 102.7
  },
  {
    id: "CMD-78920",
    date: "11/09/2026 14:15",
    client: {
      nom: "Fatou Bamba",
      email: "fatou.bamba@yahoo.fr",
      telephone: "+225 07 89 45 12 33",
      adresse: "Cocody Riviera 3, Abidjan, Côte d'Ivoire"
    },
    statut: "Expédiée",
    modePaiement: "Mobile Money",
    marche: "Alimentation Générale",
    articles: [
      {
        nom: "Riz Parfumé Jasmin 7 Shop Superbe Qualité 5kg",
        taille: "Sac 5kg",
        couleur: "Blanc",
        quantite: 3,
        prixUnitaire: 14.5,
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
      },
      {
        nom: "Huile de Tournesol Pure 7 Shop 5 Litres",
        taille: "Bidon 5L",
        couleur: "Doré",
        quantite: 2,
        prixUnitaire: 12.9,
        imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80"
      }
    ],
    fraisPort: 5.0,
    total: 74.3
  },
  {
    id: "CMD-78919",
    date: "10/09/2026 19:30",
    client: {
      nom: "Koffi Mensah",
      email: "koffi.mensah@gmail.com",
      telephone: "+228 90 12 34 56",
      adresse: "Boulevard du 13 Janvier, Lomé, Togo"
    },
    statut: "Livrée",
    modePaiement: "Carte Bancaire",
    marche: "Mode & Vestimentaire",
    articles: [
      {
        nom: "T-Shirt Oversize Coton Lourd 7 Shop",
        taille: "XL",
        couleur: "Blanc",
        quantite: 1,
        prixUnitaire: 45.0,
        imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
      }
    ],
    fraisPort: 4.9,
    total: 49.9
  }
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('7shop_admin_orders_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_ORDERS;
  });

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeModalOrder, setActiveModalOrder] = useState(null);

  const handleUpdateStatus = (orderId, newStatus) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, statut: newStatus };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('7shop_admin_orders_v1', JSON.stringify(updated));
    if (activeModalOrder && activeModalOrder.id === orderId) {
      setActiveModalOrder({ ...activeModalOrder, statut: newStatus });
    }
  };

  const filteredOrders = orders.filter(o => selectedStatus === 'all' || o.statut === selectedStatus);

  const getStatusClass = (status) => {
    switch (status) {
      case 'En attente': return 'status-en-attente';
      case 'Validée': return 'status-validee';
      case 'Expédiée': return 'status-expediee';
      case 'Livrée': return 'status-livree';
      case 'Annulée': return 'status-annulee';
      default: return 'status-validee';
    }
  };

  return (
    <div className="admin-orders-root">
      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Commandes Clients ({orders.length})</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Suivez et mettez à jour l’état des livraisons et des paiements.</p>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'En attente', 'Validée', 'Expédiée', 'Livrée', 'Annulée'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className="btn-admin-secondary"
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                background: selectedStatus === st ? '#0f172a' : '#ffffff',
                color: selectedStatus === st ? '#ffffff' : '#475569',
                borderColor: selectedStatus === st ? '#0f172a' : '#cbd5e1'
              }}
            >
              {st === 'all' ? 'Toutes les commandes' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Panel */}
      <div className="admin-card-panel">
        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>N° Commande</th>
                <th>Date</th>
                <th>Client</th>
                <th>Marché</th>
                <th>Articles</th>
                <th>Total</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <strong style={{ color: '#0066ff' }}>{order.id}</strong>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{order.date}</td>
                  <td>
                    <div>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{order.client?.nom}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.client?.telephone}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#334155' }}>{order.marche}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600' }}>{order.articles?.length || 0} article{order.articles?.length > 1 ? 's' : ''}</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                      {order.total?.toFixed(2).replace('.', ',')} €
                    </strong>
                  </td>
                  <td>
                    <span className={`status-pill ${getStatusClass(order.statut)}`}>
                      {order.statut}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeModalOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '720px' }}>
            <div className="admin-modal-header">
              <div>
                <h3>Détail de la Commande {activeModalOrder.id}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Passée le {activeModalOrder.date}</span>
              </div>
              <button onClick={() => setActiveModalOrder(null)} className="btn-close-modal">✕</button>
            </div>

            <div className="admin-modal-body">
              {/* Status Update Row */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Statut Actuel :</span>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`status-pill ${getStatusClass(activeModalOrder.statut)}`} style={{ fontSize: '0.85rem' }}>
                      {activeModalOrder.statut}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>Changer Statut :</label>
                  <select 
                    value={activeModalOrder.statut}
                    onChange={(e) => handleUpdateStatus(activeModalOrder.id, e.target.value)}
                    className="admin-select"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    <option value="En attente">⏳ En attente</option>
                    <option value="Validée">✓ Validée</option>
                    <option value="Expédiée">🚚 Expédiée</option>
                    <option value="Livrée">🎉 Livrée</option>
                    <option value="Annulée">❌ Annulée</option>
                  </select>
                </div>
              </div>

              {/* Customer Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>👤 Informations Client</h5>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>{activeModalOrder.client?.nom}</p>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>✉️ {activeModalOrder.client?.email}</p>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>📞 {activeModalOrder.client?.telephone}</p>
                </div>

                <div>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>📍 Livraison & Paiement</h5>
                  <p style={{ fontSize: '0.85rem', color: '#0f172a' }}>{activeModalOrder.client?.adresse}</p>
                  <p style={{ fontSize: '0.82rem', color: '#0066ff', fontWeight: '700', marginTop: '6px' }}>💳 {activeModalOrder.modePaiement}</p>
                </div>
              </div>

              {/* Order Items List */}
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                  Articles Commandés ({activeModalOrder.articles?.length})
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeModalOrder.articles?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={item.imageUrl} alt={item.nom} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>{item.nom}</strong>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Taille/Option : <strong>{item.taille}</strong> • Couleur : <strong>{item.couleur}</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>
                          {item.quantite} × {item.prixUnitaire?.toFixed(2).replace('.', ',')} €
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                          {(item.quantite * item.prixUnitaire)?.toFixed(2).replace('.', ',')} €
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total Summary */}
              <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Frais de livraison : <strong>{activeModalOrder.fraisPort?.toFixed(2).replace('.', ',')} €</strong></span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: '800' }}>Total TTC Commande</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0066ff' }}>
                    {activeModalOrder.total?.toFixed(2).replace('.', ',')} €
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
