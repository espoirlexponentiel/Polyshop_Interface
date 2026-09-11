import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 🔓 Connexion
      const res = await axios.post("/users/login", { email, password });

      const token = res.data.token;
      localStorage.setItem("token", token);

      // 🔐 Récupérer l'utilisateur connecté via /me
      const me = await axios.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const role = me.data.role?.toUpperCase(); // ✅ force majuscules
      localStorage.setItem("role", role);
      console.log("Rôle reçu :", role);

      // ✅ Redirection selon le rôle
      if (role === "ADMIN") {
        navigate("/commandes");
      } else {
        navigate("/categories");
      }
    } catch (err) {
      console.error("Erreur login :", err);
      alert("❌ Erreur de connexion");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Connexion</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        required
      />
      <button type="submit">Se connecter</button>
    </form>
  );
}
