import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("Erreur chargement produits :", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenue sur notre boutique 🛍️</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map(product => (
          <div 
            key={product.id} 
            style={{ border: "1px solid #ccc", padding: "10px", width: "220px", textAlign: "center" }}
          >
          <img src={product.imageUrl} alt={product.nom} style={{ maxWidth: "200px" }} />

            <h3>{product.nom}</h3>
            <p>{product.description}</p>
            <p><strong>{product.prix} FCFA</strong></p>

            {/* ✅ Lien vers ProductPage */}
            <Link to={`/product/${product.id}`}>
              <button style={{ marginTop: "10px" }}>Voir</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
