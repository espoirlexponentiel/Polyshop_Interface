import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('7shop_token');
    localStorage.removeItem('7shop_user');
  };

  const loginWithGoogle = () => {
    // Redirection vers l'endpoint OAuth2 Google du backend Spring Boot
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

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
