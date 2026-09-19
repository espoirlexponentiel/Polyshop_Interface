import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { MarketProvider } from "./context/MarketContext";
import { SiteConfigProvider } from "./context/SiteConfigContext";

// Public Pages
import HomePage from "./pages/Homepage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/Loginpage";
import RegisterPage from "./pages/Registerpage";
import OrdersPage from "./pages/OrdersPage";

// Admin Dashboard & Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminMarketsPage from "./pages/admin/AdminMarketsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

function App() {
  return (
    <SiteConfigProvider>
      <MarketProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/orders" element={<OrdersPage />} />

                {/* Admin Routes with Sidebar Layout */}
                <Route path="/admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
                <Route path="/admin/parametres" element={<AdminLayout><AdminSettingsPage /></AdminLayout>} />
                <Route path="/admin/marches" element={<AdminLayout><AdminMarketsPage /></AdminLayout>} />
                <Route path="/admin/categories" element={<AdminLayout><AdminCategoriesPage /></AdminLayout>} />
                <Route path="/admin/produits" element={<AdminLayout><AdminProductsPage /></AdminLayout>} />
                <Route path="/admin/commandes" element={<AdminLayout><AdminOrdersPage /></AdminLayout>} />

                {/* Fallback legacy route */}
                <Route path="/commandes" element={<AdminLayout><AdminOrdersPage /></AdminLayout>} />
              </Routes>
            </Router>
          </CartProvider>
        </AuthProvider>
      </MarketProvider>
    </SiteConfigProvider>
  );
}

export default App;
