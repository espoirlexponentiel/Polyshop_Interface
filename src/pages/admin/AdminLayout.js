import React from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import '../../styles/admin.css';

export default function AdminLayout({ children }) {
  const location = useLocation();

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
          <Link to="/" className="btn-back-to-shop">
            <span>←</span>
            <span>Retour Boutique</span>
          </Link>
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
            <span className="admin-badge-role">ADMINISTRATEUR</span>
            <Link to="/" className="btn-admin-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
              👁️ Voir le site
            </Link>
          </div>
        </header>

        <div className="admin-body-container">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
