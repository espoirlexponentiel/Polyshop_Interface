import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Charger les commandes depuis le backend
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get("/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      setOrders(res.data);
    })
    .catch(err => {
      console.error("Erreur chargement commandes :", err);
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement des commandes...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Mes Commandes</h2>

      {Array.isArray(orders) && orders.length > 0 ? (
        <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "center" }}>
          <thead>
            <tr>
              <th>ID Commande</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Total (FCFA)</th>
              <th>Articles</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.status}</td>
                <td>{order.totalAmount}</td>
                <td>
                  {order.items && order.items.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {order.items.map(item => (
                        <li key={item.id}>
                          {item.product.nom} × {item.quantity} ({item.unitPrice} FCFA)
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span>Aucun article</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Vous n’avez encore passé aucune commande.</p>
      )}
    </div>
  );
}
