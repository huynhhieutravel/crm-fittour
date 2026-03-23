import React from 'react';
import { Trash2, ArrowLeft, Info, HelpCircle, Mail, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function DataDeletion() {
  const navigate = useNavigate();

  return (
    <div className="login-container" style={{ overflowY: 'auto', padding: '4rem 1rem', display: 'block' }}>
      <div className="login-form" style={{ maxWidth: '900px', width: '100%', margin: '0 auto', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(30px)' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: 600 }}
          className="hover-glow"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '1.25rem', color: '#ef4444', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)' }}>
            <Trash2 size={48} />
          </div>
          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Hướng dẫn Xóa dữ liệu</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Quy trình thu hồi dữ liệu cá nhân (Data Deletion Callback)</p>
        </header>

        <div style={{ color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1.05rem' }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Info size={22} color="var(--secondary)" /> 1. Cam kết tuân thủ của Meta
            </h2>
            <p>Theo quy định của Meta về quyền riêng tư, chúng tôi cung cấp quy trình minh bạch để khách hàng có thể yêu cầu xóa dữ liệu của mình đã được thu thập qua ứng dụng Messenger tích hợp trong CRM.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <HelpCircle size={22} color="var(--secondary)" /> 2. Cách thức yêu cầu xóa dữ liệu
            </h2>
            <p>Bạn có thể yêu cầu xóa dữ liệu cá nhân (bao gồm ID Facebook, tên, lịch sử chat) theo một trong các cách sau:</p>
            <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={18} color="var(--secondary)" /> Qua Email</h4>
                <p>Gửi yêu cầu tới <strong>huynhhieutravel@gmail.com</strong> với tiêu đề "Yêu cầu xóa dữ liệu cá nhân". Chúng tôi sẽ xử lý trong vòng 24-48 giờ.</p>
              </div>
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={18} color="var(--secondary)" /> Qua Messenger</h4>
                <p>Nhắn tin trực tiếp cho Fanpage FIT Tour với nội dung yêu cầu xóa dữ liệu. Nhân viên trực tổng đài sẽ xác nhận và thực hiện xóa ngay lập tức.</p>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Trash2 size={22} color="#ef4444" /> 3. Điều gì diễn ra khi xóa dữ liệu?
            </h2>
            <p>Khi yêu cầu được thực thi:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem' }}>
              <li>Mọi thông tin định danh của bạn sẽ bị gỡ bỏ khỏi hệ thống CRM.</li>
              <li>Lịch sử tin nhắn giữa bạn và Fanpage sẽ bị ẩn/xóa trên hệ thống quản lý tin nhắn tập trung của chúng tôi.</li>
              <li>Chúng tôi sẽ không thể tiếp tục gửi thông tin tư vấn tour cá nhân hóa cho đến khi bạn bắt đầu một cuộc hội thoại mới.</li>
            </ul>
          </section>

          <footer style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', fontSize: '0.9rem' }}>
            <p>© 2026 FIT TOUR - Minh bạch & Bảo mật dữ liệu khách hàng.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default DataDeletion;
