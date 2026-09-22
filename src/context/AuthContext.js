import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ========================================================
// URL du Backend pour l'authentification Google (Local vs Render)
// Décommentez celle que vous souhaitez utiliser :
// ========================================================
// const BACKEND_URL = "http://localhost:8080"; // 💻 Mode LOCAL
const BACKEND_URL = "https://backend-ecommerce-54fk.onrender.com"; // 🚀 Mode RENDER (remplacez par votre vrai lien Render)

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('7shop_token'));
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('7shop_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('7shop_token', token);
    } else {
      localStorage.removeItem('7shop_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('7shop_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('7shop_user');
    }
  }, [user]);

  const login = useCallback((newToken, userData) => {
    if (newToken) {
      localStorage.setItem('7shop_token', newToken);
    }
    if (userData) {
      localStorage.setItem('7shop_user', JSON.stringify(userData));
    }
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('7shop_token');
    localStorage.removeItem('7shop_user');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const loginWithGoogle = useCallback(() => {
    // Redirection vers l'endpoint OAuth2 Google du backend Spring Boot
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
        loginWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
