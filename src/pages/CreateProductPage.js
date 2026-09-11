import { useState } from "react";
import axios from "../api/axios";

export default function CreateProductPage() {
  const [form, setForm] = useState({
    nom: "",
    description: "",
    prix: "",
    stock: "",
    category: ""
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔄 Gestion des champs texte
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📤 Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (image) formData.append("image", image);

    try {
      const res = await axios.post("/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert(res.data.message || "✅ Produit créé avec succès !");
      console.log("Produit créé :", res.data.product);

      // 🔄 Réinitialiser le formulaire
      setForm({ nom: "", description: "", prix: "", stock: "", category: "" });
      setImage(null);
    } catch (err) {
      console.error("Erreur création produit :", err);
      alert("❌ Impossible de créer le produit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Créer un produit 🛒</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
        
        <input
          name="nom"
          placeholder="Nom du produit"
          value={form.nom}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          name="prix"
          type="number"
          placeholder="Prix (FCFA)"
          value={form.prix}
          onChange={handleChange}
          required
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock disponible"
          value={form.stock}
          onChange={handleChange}
          required
        />

        <input
          name="category"
          placeholder="Nom de la catégorie"
          value={form.category}
          onChange={handleChange}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Création en cours..." : "Créer ✅"}
        </button>
      </form>
    </div>
  );
}
