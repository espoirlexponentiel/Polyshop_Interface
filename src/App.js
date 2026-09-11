import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import HomePage from "./pages/Homepage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/Loginpage";
import RegisterPage from "./pages/Registerpage";
import OrdersPage from "./pages/OrdersPage";
import CreateProductPage from "./pages/CreateProductPage";
import AdminCommandesPage from "./pages/AdminCommandesPage";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/commandes" element={<AdminCommandesPage />} />
            <Route path="/admin/create-product" element={<CreateProductPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
