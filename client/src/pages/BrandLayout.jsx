import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../styles/brand-guideline.css';

const BrandLayout = ({ children }) => {
  return (
    <div className="bp-layout">
      {/* ── Left Sidebar ── */}
      <aside className="bp-sidebar">
        <NavLink to="/tai-lieu" className="bp-sidebar-brand" style={{ marginBottom: '24px', opacity: 0.7, fontSize: '1rem' }}>
          <ArrowLeft size={16} /> Quay lại CRM
        </NavLink>
        <div className="bp-sidebar-brand">
          FIT Tour <span style={{ color: 'var(--bp-orange)' }}>Bespoke</span>
        </div>
        
        <nav className="bp-sidebar-nav">
          <NavLink 
            to="/cam-nang-thuong-hieu" 
            end
            className={({ isActive }) => `bp-sidebar-item ${isActive ? 'active' : ''}`}
          >
            Tổng quan (Định Vị)
          </NavLink>
          <NavLink 
            to="/cam-nang-thuong-hieu/logo" 
            className={({ isActive }) => `bp-sidebar-item ${isActive ? 'active' : ''}`}
          >
            Logo
          </NavLink>
          <NavLink 
            to="/cam-nang-thuong-hieu/mau-sac" 
            className={({ isActive }) => `bp-sidebar-item ${isActive ? 'active' : ''}`}
          >
            Màu Sắc
          </NavLink>
          <NavLink 
            to="/cam-nang-thuong-hieu/phong-chu" 
            className={({ isActive }) => `bp-sidebar-item ${isActive ? 'active' : ''}`}
          >
            Phông Chữ
          </NavLink>
          <NavLink 
            to="/cam-nang-thuong-hieu/facebook" 
            className={({ isActive }) => `bp-sidebar-item ${isActive ? 'active' : ''}`}
          >
            Facebook & AI
          </NavLink>
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="bp-main">
        {children}
      </main>
    </div>
  );
};

export default BrandLayout;
