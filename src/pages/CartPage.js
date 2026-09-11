import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // 🔐 Charger le panier depuis le backend
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get("/cart/items", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        // ✅ Ton backend renvoie { items: [...] }
        const data = res.data.items || [];
        setItems(data);
        calculateTotal(data);
      })
      .catch(err => {
        console.error("Erreur chargement panier :", err);
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Calcul du total
  const calculateTotal = (cartItems) => {
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.product?.prix || 0) * (item.quantity || 0),
      0
    );
    setTotal(totalAmount);
  };

  // ✏️ Modifier la quantité
  const updateQuantity = async (productId, quantity) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("/cart/items", { productId, quantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      setItems(updated);
      calculateTotal(updated);
    } catch (err) {
      console.error("Erreur mise à jour quantité :", err);
    }
  };

  // ❌ Supprimer un article
  const removeItem = async (productId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/cart/items/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = items.filter(item => item.product.id !== productId);
      setItems(updated);
      calculateTotal(updated);
    } catch (err) {
      console.error("Erreur suppression article :", err);
    }
  };

  // 🛒 Passer la commande
  const checkout = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("/orders", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`✅ Commande passée avec succès ! ID: ${res.data.orderId}, Total: ${res.data.totalAmount} FCFA`);
      setItems([]);
      setTotal(0);
    } catch (err) {
      console.error("Erreur commande :", err);
      alert("❌ Impossible de passer la commande");
    }
  };

  if (loading) return <p>Chargement du panier...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>🛒 Mon Panier</h2>

      {items.length > 0 ? (
        <>
          <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "center" }}>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire (FCFA)</th>
                <th>Sous-total (FCFA)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.product.nom}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                      style={{ width: "60px" }}
                    />
                  </td>
                  <td>{item.product.prix}</td>
                  <td>{item.product.prix * item.quantity}</td>
                  <td>
                    <button onClick={() => removeItem(item.product.id)}>❌ Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: "20px" }}>💰 Total : {total} FCFA</h3>

          <button
            onClick={checkout}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              cursor: "pointer"
            }}
          >
            Commander ✅
          </button>
        </>
      ) : (
        <p>Votre panier est vide.</p>
      )}
    </div>
  );
}
