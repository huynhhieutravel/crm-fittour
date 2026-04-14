import React, { useState } from 'react';
import AuditLogDashboard from '../components/AuditLogDashboard';
import { Ticket, PlaneTakeoff, Users, Briefcase, Settings } from 'lucide-react';

export default function AuditLogTab() {
  const [activeSubmenu, setActiveSubmenu] = useState('bookings');

  // Map submenus to module types defined in backend
  const submenus = [
    { id: 'bookings', label: 'Lịch sử Giữ chỗ', icon: <Ticket size={18} />, moduleType: 'BOOKING' }, // Or whatever mapping your db uses
    { id: 'tours', label: 'Tour & Khởi hành', icon: <PlaneTakeoff size={18} />, moduleType: 'OP_TOUR' },
    { id: 'customers', label: 'Khách hàng', icon: <Users size={18} />, moduleType: 'CUSTOMER' },
    { id: 'leads', label: 'Cơ hội (Leads)', icon: <Briefcase size={18} />, moduleType: 'LEAD' },
    { id: 'system', label: 'Hệ thống', icon: <Settings size={18} />, moduleType: 'USER' }, // Includes users, settings
  ];

  const currentMenu = submenus.find(m => m.id === activeSubmenu);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '5px', color: '#1e293b' }}>Nhật ký hệ thống</h2>
        <p style={{ color: '#64748b' }}>Theo dõi lịch sử chỉnh sửa, tạo mới và xóa dữ liệu trên hệ thống.</p>
      </div>

      {/* Submenu Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
        {submenus.map(menu => (
          <button
            key={menu.id}
            onClick={() => setActiveSubmenu(menu.id)}
            style={{
              padding: '10px 15px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeSubmenu === menu.id ? '#0ea5e9' : '#64748b',
              fontWeight: activeSubmenu === menu.id ? 600 : 400,
              borderBottom: activeSubmenu === menu.id ? '2px solid #0ea5e9' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              marginBottom: '-1px'
            }}
          >
            {menu.icon}
            {menu.label}
          </button>
        ))}
      </div>

      {/* Render the core table filtered by selected module */}
      {currentMenu && (
         <AuditLogDashboard key={activeSubmenu} moduleType={currentMenu.moduleType} />
      )}
    </div>
  );
}
