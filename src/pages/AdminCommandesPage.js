import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function AdminCommandesPage() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    console.log("Role stocké :", role);

    // ✅ Vérifie token et rôle
    if (!token || role?.toUpperCase() !== "ADMIN") {
      navigate("/login"); // 🔐 redirige si non connecté ou non admin
      return;
    }

    // ✅ Récupère toutes les commandes
    axios
      .get("/orders/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCommandes(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement commandes :", err);
        alert("Impossible de charger les commandes");
        setLoading(false);
      });
  }, [navigate]);

  // ✅ Fonction pour modifier le statut
  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/orders/admin/${id}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Met à jour localement
      setCommandes((prev) =>
        prev.map((cmd) =>
          cmd.id === id ? { ...cmd, status: newStatus } : cmd
        )
      );
    } catch (err) {
      console.error("Erreur modification statut :", err);
      alert("Impossible de modifier le statut");
    }
  };

  if (loading) {
    return <p>Chargement des commandes...</p>;
  }

  return (
    <div>
      <h2>📦 Commandes reçues</h2>
      {commandes.length === 0 ? (
        <p>Aucune commande disponible.</p>
      ) : (
        <ul>
          {commandes.map((cmd) => (
            <li key={cmd.id} style={{ marginBottom: "1rem" }}>
              <strong>Commande #{cmd.id}</strong> <br />
              👤 Client : {cmd.user_id} <br />
              📅 Date : {new Date(cmd.createdAt).toLocaleString()} <br />
              💰 Total : {cmd.totalAmount} € <br />
              🚚 Statut :
              <select
                value={cmd.status}
                onChange={(e) => handleStatusChange(cmd.id, e.target.value)}
                style={{ marginLeft: "0.5rem" }}
              >
                <option value="EN_ATTENTE">EN_ATTENTE</option>
                <option value="EN_PREPARATION">EN_PREPARATION</option>
                <option value="EXPEDIEE">EXPEDIEE</option>
                <option value="LIVREE">LIVREE</option>
                <option value="ANNULEE">ANNULEE</option>
              </select>
              <br />
              🛒 Articles :
              <ul>
                {cmd.items?.map((item) => (
                  <li key={item.id}>
                    {item.product?.nom} — {item.quantity} × {item.product?.prix} €
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
