import React from 'react';
import { NavLink, Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // 🔒 Protection stricte : Connexion obligatoire avec rôle ADMIN
  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return <Navigate to="/login?redirect=admin" state={{ from: location }} replace />;
  }

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/admin/marches':
        return { title: 'Gestion des Marchés & Thèmes', sub: 'Personnalisez les couleurs, visuels Hero et textes de chaque marché' };
      case '/admin/categories':
        return { title: 'Gestion des Catégories', sub: 'Organisez les rayons et classifications de vos marchés' };
      case '/admin/produits':
        return { title: 'Gestion des Produits & Stocks', sub: 'Ajoutez, éditez et gérez les fiches articles et les stocks' };
      case '/admin/commandes':
        return { title: 'Suivi des Commandes', sub: 'Consultez et traitez les commandes clients en temps réel' };
      default:
        return { title: 'Tableau de Bord & Statistiques', sub: 'Vue d’ensemble des performances de votre plateforme 7 Shop' };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="admin-layout-root">
      {/* 1. Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-brand-badge">7</div>
          <div>
            <div className="admin-brand-title">7 SHOP</div>
            <div className="admin-brand-sub">ADMIN CONSOLE</div>
          </div>
        </div>

        <nav className="admin-nav-menu">
          <NavLink 
            to="/admin" 
            end 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">📊</span>
            <span>Dashboard & Stats</span>
          </NavLink>

          <NavLink 
            to="/admin/marches" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">🏬</span>
            <span>Marchés & Thèmes</span>
          </NavLink>

          <NavLink 
            to="/admin/categories" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">📂</span>
            <span>Catégories</span>
          </NavLink>

          <NavLink 
            to="/admin/produits" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">📦</span>
            <span>Produits & Stocks</span>
          </NavLink>

          <NavLink 
            to="/admin/commandes" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">📋</span>
            <span>Commandes</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '10px', fontSize: '0.8rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Connecté en tant que :</div>
            <div style={{ color: '#ffffff', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.nom || user.email}
            </div>
            <div style={{ color: '#38bdf8', fontSize: '0.72rem', fontWeight: '800', marginTop: '2px' }}>
              🛡️ {user.role}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/" className="btn-back-to-shop" style={{ flex: 1 }}>
              <span>← Boutique</span>
            </Link>
            <button 
              onClick={logout} 
              className="btn-admin-danger"
              style={{ padding: '8px 12px', fontSize: '0.78rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              title="Se déconnecter"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content View */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-page-title-wrap">
            <h1>{meta.title}</h1>
            <p>{meta.sub}</p>
          </div>

          <div className="admin-topbar-actions">
            <span className="admin-badge-role">ADMIN : {user.nom || user.email}</span>
            <Link to="/" className="btn-admin-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
              👁️ Voir le site
            </Link>
            <button 
              onClick={logout}
              className="btn-admin-danger"
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            >
              Déconnexion
            </button>
          </div>
        </header>

        <div className="admin-body-container">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
