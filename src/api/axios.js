import axios from "axios";

// ========================================================
// Configuration de l'URL de l'API (Local vs Render)
// Décommentez celle que vous souhaitez utiliser :
// ========================================================
// const API_URL = "http://localhost:8080/api"; // 💻 Mode LOCAL
const API_URL = "https://backend-ecommerce-54fk.onrender.com/api"; // 🚀 Mode RENDER (remplacez par votre vrai lien Render)

const instance = axios.create({
  baseURL: API_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("7shop_token") || localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid/expired token so subsequent public requests don't fail
      localStorage.removeItem("7shop_token");
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default instance;
