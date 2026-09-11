import { useState } from "react";
import axios from "../api/axios";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !username || !password) {
      setMessage("❌ Tous les champs sont obligatoires.");
      return;
    }

    try {
      const res = await axios.post("/users/register", {
        email,
        username,
        password,
      });

      setMessage("✅ Inscription réussie !");
      console.log("Utilisateur inscrit :", res.data);
    } catch (err) {
      console.error("Erreur d'inscription :", err.response?.data || err.message);
      if (err.response?.status === 409) {
        setMessage("❌ Cet email est déjà utilisé.");
      } else if (err.response?.status === 400) {
        setMessage("❌ Données invalides. Vérifiez le format.");
      } else {
        setMessage("❌ Erreur d'inscription. Veuillez réessayer.");
      }
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
      <form onSubmit={handleRegister}>
        <h2>Créer un compte</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nom d'utilisateur"
          required
        />
        <br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          required
        />
        <br />
        <button type="submit">S'inscrire</button>
      </form>

      {message && <p style={{ marginTop: "1rem", color: message.includes("✅") ? "green" : "darkred" }}>{message}</p>}

      <hr />

      <div style={{ marginTop: "20px" }}>
        <p>Ou connectez-vous avec Google :</p>
        <a href="http://localhost:8080/oauth2/authorize/google">
          <button>Connexion Google</button>
        </a>
      </div>
    </div>
  );
}
