import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
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
