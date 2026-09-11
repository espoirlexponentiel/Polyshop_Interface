import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function ProductPage() {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error("❌ Erreur chargement produit :", err));
  }, [id]);

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "/cart/items",
        { productId: product.id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Vérifie la réponse avant de rediriger
      if (res.data && res.data.message === "Produit ajouté au panier") {
        navigate("/cart"); // redirection seulement si succès
      } else {
        alert("❌ Le produit n'a pas pu être ajouté au panier");
      }
    } catch (err) {
      console.error("❌ Erreur ajout panier :", err);
      alert("❌ Impossible d'ajouter au panier");
    }
  };

  if (!product) return <p>Chargement du produit...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{product.nom}</h2>
      <img src={product.imageUrl} alt={product.nom} style={{ maxWidth: "200px" }} />
      <p>{product.description}</p>
      <p><strong>{product.prix} FCFA</strong></p>
      <p>Stock disponible : {product.stock}</p>

      <label>
        Quantité :
        <input
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          style={{ marginLeft: "10px", width: "60px" }}
        />
      </label>

      <br /><br />
      <button onClick={addToCart}>Ajouter au panier 🛒</button>
    </div>
  );
}
