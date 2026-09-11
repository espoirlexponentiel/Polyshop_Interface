import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // 🔐 redirige si non connecté
      return;
    }

    axios
      .get("/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error("Erreur chargement catégories :", err);
        alert("Impossible de charger les catégories");
      });
  }, [navigate]);

  return (
    <div>
      <h2>Catégories d'articles</h2>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            <strong>{cat.nom}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
