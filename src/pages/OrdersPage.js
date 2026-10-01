import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import { formatFCFA } from "../utils/priceUtils";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("in_progress"); // Par défaut sur 'En cours'
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState({ text: "", type: "" });
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = React.useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get("/orders");
      const list = Array.isArray(res.data) ? res.data : [];
      setOrders(list);
    } catch (err) {
      console.error("Erreur lors de la récupération des commandes :", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Calcul des statistiques rapides
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const inProgress = orders.filter(o => {
      const s = (o.statut || o.status || "").toUpperCase();
      return s === "EN_ATTENTE" || s === "VALIDEE" || s === "EN_PREPARATION" || s === "EXPEDIEE";
    }).length;
    const delivered = orders.filter(o => (o.statut || o.status || "").toUpperCase() === "LIVREE").length;
    const cancelled = orders.filter(o => (o.statut || o.status || "").toUpperCase() === "ANNULEE").length;
    const totalSpent = orders
      .filter(o => (o.statut || o.status || "").toUpperCase() !== "ANNULEE")
      .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

    return { totalOrders, inProgress, delivered, cancelled, totalSpent };
  }, [orders]);

  // Filtrage par les 3 onglets demandés
  const filteredOrders = useMemo(() => {
    if (activeTab === "in_progress") {
      return orders.filter(o => {
        const s = (o.statut || o.status || "").toUpperCase();
        return s === "EN_ATTENTE" || s === "VALIDEE" || s === "EN_PREPARATION" || s === "EXPEDIEE";
      });
    }
    if (activeTab === "delivered") {
      return orders.filter(o => (o.statut || o.status || "").toUpperCase() === "LIVREE");
    }
    if (activeTab === "cancelled") {
      return orders.filter(o => (o.statut || o.status || "").toUpperCase() === "ANNULEE");
    }
    return orders;
  }, [orders, activeTab]);

  // Annulation de commande (si EN_ATTENTE)
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette commande ? Les articles seront remis en stock.")) {
      return;
    }

    setCancellingId(orderId);
    setCancelMessage({ text: "", type: "" });
    try {
      await axios.delete(`/orders/${orderId}`);
      setCancelMessage({ text: `✅ La commande #CMD-${orderId} a été annulée avec succès.`, type: "success" });
      await fetchOrders();
    } catch (err) {
      console.error("Erreur annulation commande :", err);
      const errMsg = err.response?.data?.error || "Impossible d'annuler cette commande (délai dépassé ou commande déjà traitée).";
      setCancelMessage({ text: `⚠️ ${errMsg}`, type: "error" });
    } finally {
      setCancellingId(null);
    }
  };

  // Helper de statut
  const getStatusConfig = (rawStatus) => {
    const s = (rawStatus || "EN_ATTENTE").toUpperCase();
    switch (s) {
      case "VALIDEE":
        return {
          label: "Commande Confirmée",
          icon: "🔵",
          bg: "#eff6ff",
          color: "#1d4ed8",
          border: "#bfdbfe",
          stepIndex: 1
        };
      case "EN_PREPARATION":
        return {
          label: "En cours de préparation",
          icon: "📦",
          bg: "#f5f3ff",
          color: "#6d28d9",
          border: "#ddd6fe",
          stepIndex: 2
        };
      case "EXPEDIEE":
        return {
          label: "Expédiée / En transit",
          icon: "🚚",
          bg: "#fdf4ff",
          color: "#a21caf",
          border: "#f5d0fe",
          stepIndex: 3
        };
      case "LIVREE":
        return {
          label: "Colis Livré",
          icon: "✅",
          bg: "#ecfdf5",
          color: "#047857",
          border: "#a7f3d0",
          stepIndex: 4
        };
      case "ANNULEE":
        return {
          label: "Commande Annulée",
          icon: "❌",
          bg: "#fef2f2",
          color: "#b91c1c",
          border: "#fecaca",
          stepIndex: -1
        };
      case "EN_ATTENTE":
      default:
        return {
          label: "En attente de traitement",
          icon: "🟡",
          bg: "#fffbeb",
          color: "#b45309",
          border: "#fde68a",
          stepIndex: 0
        };
    }
  };

  // Helper détection de rayon
  const getOrderMarket = (order) => {
    if (order.items && order.items.length > 0) {
      const hasFood = order.items.some(item => {
        const nom = (item.product?.nom || item.nom || "").toLowerCase();
        const cat = (item.product?.category?.nom || item.product?.category || "").toLowerCase();
        const mId = (item.product?.marketId || "").toLowerCase();
        return mId.includes("alim") || cat.includes("alim") || cat.includes("nourriture") || nom.includes("riz") || nom.includes("huile") || nom.includes("tomate") || nom.includes("sucre");
      });
      if (hasFood) return "🌾 Alimentation";
    }
    const m = (order.marche || "").toLowerCase();
    if (m.includes("alim") || m.includes("nourriture") || m.includes("epicerie")) {
      return "🌾 Alimentation";
    }
    return "🛍️ Mode & Vestimentaire";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Date inconnue";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return String(dateStr);
    }
  };

  const toggleRowExpansion = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <Navbar />

      <main className="orders-page-main">
        {/* En-tête Principal */}
        <div className="orders-header-row">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "1.8rem" }}>📦</span>
              <h1 style={{ fontSize: "1.85rem", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" }}>
                Mes Commandes & Suivi
              </h1>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.92rem", margin: 0 }}>
              Retrouvez le statut en direct de vos commandes sur votre compte <strong>{user?.nom || user?.email || "7 Shop"}</strong>.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button 
              onClick={fetchOrders}
              className="btn-admin-secondary"
              style={{ padding: "8px 16px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: "700" }}
              title="Rafraîchir les statuts"
            >
              <span>🔄</span> Actualiser
            </button>
            <Link 
              to="/" 
              className="btn-checkout-primary" 
              style={{ padding: "8px 20px", borderRadius: "10px", textDecoration: "none", fontSize: "0.9rem" }}
            >
              🛍️ Nouvelle Commande
            </Link>
          </div>
        </div>

        {/* Message de notification d'action */}
        {cancelMessage.text && (
          <div style={{
            padding: "12px 18px",
            borderRadius: "12px",
            marginBottom: "24px",
            background: cancelMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: cancelMessage.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${cancelMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            fontSize: "0.9rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span>{cancelMessage.text}</span>
            <button 
              onClick={() => setCancelMessage({ text: "", type: "" })}
              style={{ background: "none", border: "none", fontSize: "1rem", cursor: "pointer", color: "inherit", fontWeight: "800" }}
            >
              ✕
            </button>
          </div>
        )}

        {!isAuthenticated ? (
          /* État non connecté */
          <div style={{ padding: "60px 24px", textAlign: "center", background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🔒</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
              Connexion requise pour consulter vos commandes
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.92rem", marginBottom: "24px", maxWidth: "420px", margin: "0 auto 24px" }}>
              Connectez-vous à votre compte 7 Shop pour suivre vos livraisons et télécharger vos reçus d’achat.
            </p>
            <button 
              onClick={() => navigate("/login?redirect=orders")}
              className="btn-checkout-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px", fontSize: "0.95rem" }}
            >
              <span>Se Connecter</span>
              <span>›</span>
            </button>
          </div>
        ) : loading ? (
          /* Chargement */
          <div style={{ padding: "80px 20px", textAlign: "center", color: "#64748b" }}>
            <div className="spinner-blue" style={{ margin: "0 auto 16px", width: "40px", height: "40px" }}></div>
            <p style={{ fontWeight: "700", fontSize: "1rem" }}>Chargement de vos commandes en cours...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Aucune commande */
          <div style={{ padding: "70px 24px", textAlign: "center", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "14px" }}>🛍️</div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>
              Vous n'avez pas encore passé de commande
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.92rem", margin: "0 auto 24px", maxWidth: "450px", lineHeight: "1.6" }}>
              Explorez notre marché <strong>Mode & Vestimentaire</strong> pour ajouter vos premiers articles au panier !
            </p>
            <Link 
              to="/" 
              className="btn-checkout-primary" 
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 30px", textDecoration: "none", fontSize: "0.95rem" }}
            >
              <span>Découvrir la Boutique 7 Shop</span>
              <span>›</span>
            </Link>
          </div>
        ) : (
          <div>
            {/* 1. KPI Cards Row */}
            <div className="orders-stats-grid">
              <div className="orders-stat-card">
                <span className="orders-stat-label">Total Commandes</span>
                <div className="orders-stat-value">{stats.totalOrders}</div>
                <span className="orders-stat-sub" style={{ color: "#10b981" }}>Historique complet</span>
              </div>

              <div className="orders-stat-card">
                <span className="orders-stat-label">En cours</span>
                <div className="orders-stat-value" style={{ color: "#0066ff" }}>{stats.inProgress}</div>
                <span className="orders-stat-sub" style={{ color: stats.inProgress > 0 ? "#0284c7" : "#64748b" }}>
                  {stats.inProgress > 0 ? "🚚 Suivi direct" : "Aucune en cours"}
                </span>
              </div>

              <div className="orders-stat-card">
                <span className="orders-stat-label">Colis Livrés</span>
                <div className="orders-stat-value" style={{ color: "#059669" }}>{stats.delivered}</div>
                <span className="orders-stat-sub" style={{ color: "#059669" }}>✅ Réceptionnés</span>
              </div>
            </div>

            {/* 2. Les 3 Onglets de filtrage */}
            <div className="orders-tabs-nav">
              <button 
                onClick={() => setActiveTab("in_progress")}
                className="orders-tab-btn"
                style={{
                  background: activeTab === "in_progress" ? "#0066ff" : "#ffffff",
                  color: activeTab === "in_progress" ? "#ffffff" : "#475569",
                  boxShadow: activeTab === "in_progress" ? "0 4px 12px rgba(0, 102, 255, 0.25)" : "none"
                }}
              >
                🚚 En cours ({stats.inProgress})
              </button>

              <button 
                onClick={() => setActiveTab("delivered")}
                className="orders-tab-btn"
                style={{
                  background: activeTab === "delivered" ? "#059669" : "#ffffff",
                  color: activeTab === "delivered" ? "#ffffff" : "#475569",
                  boxShadow: activeTab === "delivered" ? "0 4px 12px rgba(5, 150, 105, 0.25)" : "none"
                }}
              >
                ✅ Livrées ({stats.delivered})
              </button>

              <button 
                onClick={() => setActiveTab("cancelled")}
                className="orders-tab-btn"
                style={{
                  background: activeTab === "cancelled" ? "#dc2626" : "#ffffff",
                  color: activeTab === "cancelled" ? "#ffffff" : "#475569",
                  boxShadow: activeTab === "cancelled" ? "0 4px 12px rgba(220, 38, 38, 0.25)" : "none"
                }}
              >
                ❌ Annulées ({stats.cancelled})
              </button>
            </div>

            {/* 3. Affichage : CARTE pour 'En cours' & EN LIGNE pour les 2 autres */}
            {filteredOrders.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <p style={{ color: "#64748b", fontSize: "0.95rem", fontWeight: "700" }}>
                  Aucune commande trouvée dans cet onglet.
                </p>
              </div>
            ) : activeTab === "in_progress" ? (
              /* ============================================================
                 A. VUE CARTE (Uniquement pour l'onglet 'En cours')
                 ============================================================ */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                {filteredOrders.map((order) => {
                  const statusConf = getStatusConfig(order.statut || order.status);
                  const isPending = (order.statut || order.status || "").toUpperCase() === "EN_ATTENTE";
                  const orderItems = order.items || [];
                  const orderTotal = order.totalAmount || order.total || 0;
                  const rayon = getOrderMarket(order);

                  return (
                    <div key={order.id} className="order-card-box">
                      {/* En-tête de la Carte */}
                      <div className="order-card-header">
                        <div className="order-card-header-top">
                          <div>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Référence Commande
                            </span>
                            <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#0066ff" }}>
                              #CMD-{String(order.id).padStart(5, "0")}
                            </div>
                          </div>

                          <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 14px",
                            borderRadius: "9999px",
                            background: statusConf.bg,
                            color: statusConf.color,
                            border: `1.5px solid ${statusConf.border}`,
                            fontWeight: "800",
                            fontSize: "0.85rem",
                            flexShrink: 0
                          }}>
                            <span>{statusConf.icon}</span>
                            <span>{statusConf.label}</span>
                          </div>
                        </div>

                        <div className="order-card-header-bottom">
                          <div>
                            📅 <strong>{formatDate(order.createdAt || order.date)}</strong>
                          </div>
                          <div>
                            {rayon}
                          </div>
                        </div>
                      </div>

                      {/* Stepper Visuel de Suivi en Direct */}
                      {statusConf.stepIndex >= 0 && (
                        <div className="stepper-scroll-container">
                          <div className="stepper-track-inner">
                            {[
                              { label: "1. Reçue", sub: "Validée" },
                              { label: "2. Préparation", sub: "En atelier" },
                              { label: "3. Expédition", sub: "En transit" },
                              { label: "4. Livraison", sub: "Remise" }
                            ].map((step, sIdx) => {
                              const isCompleted = statusConf.stepIndex >= sIdx;
                              const isCurrent = statusConf.stepIndex === sIdx;

                              return (
                                <div key={sIdx} style={{ flex: 1, minWidth: "70px", textAlign: "center", position: "relative", zIndex: 1 }}>
                                  <div style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    background: isCompleted ? (isCurrent ? "#0066ff" : "#10b981") : "#e2e8f0",
                                    color: isCompleted ? "#ffffff" : "#64748b",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 4px",
                                    fontWeight: "900",
                                    fontSize: "0.82rem",
                                    boxShadow: isCurrent ? "0 0 0 3px rgba(0, 102, 255, 0.2)" : "none",
                                    transition: "all 0.3s ease"
                                  }}>
                                    {isCompleted && !isCurrent ? "✓" : sIdx + 1}
                                  </div>
                                  <div style={{ fontSize: "0.75rem", fontWeight: isCurrent ? "900" : "700", color: isCurrent ? "#0066ff" : isCompleted ? "#0f172a" : "#94a3b8" }}>
                                    {step.label}
                                  </div>
                                  <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>
                                    {step.sub}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Liste des Articles Commandés */}
                      <div className="order-card-body">
                        <h4 style={{ fontSize: "0.78rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                          Articles Commandés ({orderItems.reduce((s, it) => s + (it.quantity || 1), 0)})
                        </h4>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {orderItems.map((item, itIdx) => {
                            const prod = item.product || {};
                            const pName = prod.nom || item.nom || "Article 7 Shop";
                            const pImg = prod.imageUrl || item.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80";
                            const pPrice = item.unitPrice || prod.prix || 0;
                            const pQty = item.quantity || 1;
                            const lineTotal = pPrice * pQty;

                            return (
                              <div key={itIdx} className="order-card-item-row">
                                <div className="order-card-item-left">
                                  <img 
                                    src={pImg} 
                                    alt={pName} 
                                    className="order-card-item-img"
                                  />
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <strong className="order-card-item-name">
                                      {pName}
                                    </strong>
                                    
                                    <div style={{ display: "flex", gap: "4px", marginTop: "2px", fontSize: "0.72rem", color: "#64748b", flexWrap: "wrap" }}>
                                      {item.taille && (
                                        <span style={{ background: "#ffffff", padding: "1px 6px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                                          Taille : <strong>{item.taille}</strong>
                                        </span>
                                      )}
                                      {item.couleur && (
                                        <span style={{ background: "#ffffff", padding: "1px 6px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                                          Couleur : <strong>{item.couleur}</strong>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="order-card-item-price-block">
                                  <div style={{ fontSize: "0.76rem", color: "#64748b", whiteSpace: "nowrap" }}>
                                    {pQty} × {formatFCFA(pPrice)}
                                  </div>
                                  <strong style={{ fontSize: "0.95rem", color: "#0066ff", whiteSpace: "nowrap" }}>
                                    {formatFCFA(lineTotal)}
                                  </strong>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pied de Carte : Infos & Actions */}
                      <div className="order-card-footer">
                        <div style={{ fontSize: "0.80rem", color: "#475569", width: "100%", maxWidth: "500px" }}>
                          {order.adresseLivraison && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                              <span>📍</span>
                              <span><strong>Livraison :</strong> {order.adresseLivraison}</span>
                            </div>
                          )}
                          {order.telephone && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                              <span>📞</span>
                              <span><strong>Contact :</strong> {order.telephone}</span>
                            </div>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.74rem", color: "#64748b", flexWrap: "wrap" }}>
                            <span>📱 {order.modePaiement || "Mobile Money"}</span>
                            <span>•</span>
                            <span style={{ color: "#059669", fontWeight: "700" }}>🚚 Express Gratuite</span>
                          </div>
                        </div>

                        <div className="order-card-footer-actions">
                          <div>
                            <span style={{ fontSize: "0.70rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase", display: "block" }}>
                              Total Payé TTC
                            </span>
                            <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0f172a", whiteSpace: "nowrap" }}>
                              {formatFCFA(orderTotal)}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flexShrink: 0 }}>
                            {isPending && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancellingId === order.id}
                                className="btn-admin-danger"
                                style={{ padding: "8px 12px", fontSize: "0.80rem", borderRadius: "8px" }}
                                title="Annuler ma commande"
                              >
                                {cancellingId === order.id ? "Annulation..." : "❌ Annuler"}
                              </button>
                            )}

                            <button
                              onClick={() => window.print()}
                              className="btn-admin-secondary"
                              style={{ padding: "8px 14px", fontSize: "0.80rem", borderRadius: "8px", fontWeight: "700" }}
                              title="Imprimer le reçu"
                            >
                              🖨️ Reçu
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              /* ============================================================
                 B. VUE EN LIGNE (Pour les onglets 'Livrées' et 'Annulées')
                 ============================================================ */
              <div className="orders-inline-table-wrap">
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                {filteredOrders.map((order) => {
                  const statusConf = getStatusConfig(order.statut || order.status);
                  const orderItems = order.items || [];
                  const orderTotal = order.totalAmount || order.total || 0;
                  const totalItemsCount = orderItems.reduce((sum, it) => sum + (it.quantity || 1), 0);
                  const isExpanded = expandedOrderId === order.id;
                  const rayon = getOrderMarket(order);

                  // Noms résumés des articles
                  const articlesSummary = orderItems.map(it => {
                    const pName = it.product?.nom || it.nom || "Article";
                    return `${it.quantity || 1}x ${pName}`;
                  }).join(", ");

                  return (
                    <div key={order.id} className="order-row-item">
                      {/* Ligne Principale Responsive */}
                      <div 
                        className="order-row-main"
                        onClick={() => toggleRowExpansion(order.id)}
                      >
                        {/* 1. En-tête : Référence + Date à gauche, Statut à droite */}
                        <div className="order-row-header-mobile">
                          <div>
                            <div style={{ fontSize: "1.05rem", fontWeight: "900", color: "#0066ff" }}>
                              #CMD-{String(order.id).padStart(5, "0")}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
                              📅 {formatDate(order.createdAt || order.date)}
                            </div>
                          </div>

                          <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            background: statusConf.bg,
                            color: statusConf.color,
                            border: `1px solid ${statusConf.border}`,
                            fontWeight: "800",
                            fontSize: "0.82rem",
                            flexShrink: 0
                          }}>
                            <span>{statusConf.icon}</span>
                            <span>{statusConf.label}</span>
                          </div>
                        </div>

                        {/* 2. Rayon & Résumé Articles */}
                        <div className="order-row-summary-mobile">
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{
                              fontSize: "0.74rem",
                              fontWeight: "800",
                              background: rayon.includes("Alim") ? "#fef3c7" : "#eff6ff",
                              color: rayon.includes("Alim") ? "#92400e" : "#1e40af",
                              padding: "2px 8px",
                              borderRadius: "6px"
                            }}>
                              {rayon}
                            </span>
                            <span style={{ fontSize: "0.78rem", color: "#475569", fontWeight: "700" }}>
                              ({totalItemsCount} article{totalItemsCount > 1 ? "s" : ""})
                            </span>
                          </div>
                          <div style={{
                            fontSize: "0.85rem",
                            color: "#334155",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                            lineHeight: "1.35"
                          }}>
                            {articlesSummary || "Détails de la commande"}
                          </div>
                        </div>

                        {/* 3. Pied de ligne : Montant + Boutons d'action */}
                        <div className="order-row-footer-mobile" onClick={(e) => e.stopPropagation()}>
                          <div>
                            <span style={{ fontSize: "0.70rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase", display: "block" }}>
                              Total TTC
                            </span>
                            <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#0f172a", whiteSpace: "nowrap" }}>
                              {formatFCFA(orderTotal)}
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                            <button
                              onClick={() => toggleRowExpansion(order.id)}
                              className="btn-admin-secondary"
                              style={{ padding: "6px 12px", fontSize: "0.80rem", borderRadius: "8px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}
                            >
                              <span>{isExpanded ? "▲ Fermer" : "▼ Détails"}</span>
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="btn-admin-secondary"
                              style={{ padding: "6px 12px", fontSize: "0.80rem", borderRadius: "8px", fontWeight: "700" }}
                              title="Imprimer le reçu"
                            >
                              🖨️
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Volet déroulant détaillé pour la ligne */}
                      {isExpanded && (
                        <div className="order-row-expanded-panel">
                          <h5 style={{ fontSize: "0.78rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "10px" }}>
                            Détail des articles achetés :
                          </h5>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                            {orderItems.map((item, itIdx) => {
                              const prod = item.product || {};
                              const pName = prod.nom || item.nom || "Article";
                              const pImg = prod.imageUrl || item.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80";
                              const pPrice = item.unitPrice || prod.prix || 0;
                              const pQty = item.quantity || 1;

                              return (
                                <div 
                                  key={itIdx}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "8px 10px",
                                    background: "#ffffff",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    gap: "8px",
                                    width: "100%",
                                    boxSizing: "border-box"
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                                    <img 
                                      src={pImg} 
                                      alt={pName} 
                                      style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px", border: "1px solid #cbd5e1", flexShrink: 0 }}
                                    />
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <span style={{ fontSize: "0.84rem", fontWeight: "700", color: "#1e293b", wordBreak: "break-word", display: "block", lineHeight: "1.25" }}>{pName}</span>
                                      {(item.taille || item.couleur) && (
                                        <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px", display: "inline-block" }}>
                                          {[item.taille && `Taille: ${item.taille}`, item.couleur && `Couleur: ${item.couleur}`].filter(Boolean).join(" • ")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: "0.82rem", fontWeight: "800", color: "#0066ff", marginLeft: "auto", flexShrink: 0, whiteSpace: "nowrap" }}>
                                    {pQty} × {formatFCFA(pPrice)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.80rem", color: "#64748b", flexWrap: "wrap", gap: "10px" }}>
                            <div>
                              {order.adresseLivraison && <span>📍 {order.adresseLivraison} • </span>}
                              {order.telephone && <span>📞 {order.telephone} • </span>}
                              <span>📱 {order.modePaiement || "Mobile Money"}</span>
                            </div>
                            <div style={{ fontWeight: "700", color: "#0f172a" }}>
                              Total commande : <strong style={{ color: "#0066ff" }}>{formatFCFA(orderTotal)}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
