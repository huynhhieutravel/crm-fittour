import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home } from 'lucide-react';
import SalesDashboard from './SalesDashboard';

const WorkspaceTab = ({ 
  currentUser,
  leads = [], 
  setEditingLead,
  setShowAddLeadModal,
  bookings = [],
  customers = [],
  departures = [],
  tourTemplates = [],
  users = [],
  checkPerm
}) => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/reminders/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(res.data);
    } catch (err) {
      console.error('Lỗi khi tải nhắc nhở Workspace:', err);
    }
  };

  const markReminderDone = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/reminders/${id}/done`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const getReminderLabel = (type) => {
    switch(type) {
      case 'PREPARE_DOCS': return 'Nhắc chuẩn bị giấy tờ/Visa';
      case 'PAYMENT': return 'Nhắc thanh toán & Hành lý';
      case 'ITINERARY': return 'Gửi Lịch trình chi tiết';
      case 'FEEDBACK': return 'Xin Feedback chuyến đi';
      case 'REBOOK': return 'Chăm sóc / Gợi ý Upsell';
      default: return 'Nhắc nhở khác';
    }
  };

  // Phân luồng Định tuyến
  if (!currentUser) return <div>Đang tải Không gian làm việc...</div>;

  // Render SalesDashboard nếu là sales hoặc marketing (hoặc admin/manager để review)
  if (currentUser && ['sales', 'marketing', 'admin', 'manager'].includes(currentUser.role)) {
    return (
      <SalesDashboard 
        currentUser={currentUser}
        leads={leads}
        setEditingLead={setEditingLead}
        setShowAddLeadModal={setShowAddLeadModal}
        reminders={reminders}
        markReminderDone={markReminderDone}
        getReminderLabel={getReminderLabel}
        bookings={bookings}
        customers={customers}
        departures={departures}
        tourTemplates={tourTemplates}
        users={users}
        checkPerm={checkPerm}
      />
    );
  }

  // Render Default / Placeholder OpsDashboard (Có thể tách biệt OpsDashboard sau)
  if (currentUser && ['operator'].includes(currentUser.role)) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        <Home size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ color: '#1e293b' }}>Góc Điều Hành (Operator Hub)</h2>
        <p>Tính năng đặc thù cho Điều hành (Visa, Công nợ, Danh sách Khởi hành) sắp ra mắt.</p>
        <p>Hiện bạn vẫn có thể dùng các Menu bên trái để làm việc nhé.</p>
      </div>
    );
  }

  // Fallback (Manager/Admin...)
  return (
    <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
      <Home size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
      <h2 style={{ color: '#1e293b' }}>Góc Làm Việc Của Cán Bộ Quản Lý</h2>
      <p>Với vai trò Quản lý/Admin, xin chọn [Tổng Quan GĐ] trên cột Menu để xem toàn diện!</p>
    </div>
  );

};

export default WorkspaceTab;
