import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, Eye, Globe, UserCheck, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="login-container" style={{ overflowY: 'auto', padding: '4rem 1rem', display: 'block' }}>
      <div className="login-form" style={{ maxWidth: '900px', width: '100%', margin: '0 auto', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(30px)' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: 600, transition: 'all 0.3s' }}
          className="hover-glow"
        >
          <ArrowLeft size={18} /> Quay lại trang chủ
        </button>

        <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '1.25rem', color: 'var(--secondary)', marginBottom: '1.5rem', boxShadow: 'var(--gold-glow)' }}>
            <ShieldCheck size={48} />
          </div>
          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>Chính sách Bảo mật</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Cập nhật lần cuối: 17 tháng 03, 2026</p>
        </header>

        <div style={{ color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1.05rem' }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Eye size={22} color="var(--secondary)" /> 1. Thu thập thông tin cá nhân
            </h2>
            <p>FIT TOUR CRM cam kết bảo vệ quyền riêng tư của khách hàng. Chúng tôi thu thập các loại thông tin sau để phục vụ quy trình tư vấn du lịch:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem', marginBottom: '1rem' }}>
              <li><strong>Thông tin cơ bản:</strong> Họ tên, ảnh đại diện và địa chỉ ID Facebook khi bạn tương tác qua Messenger.</li>
              <li><strong>Thông tin liên lạc:</strong> Số điện thoại, email (nếu được cung cấp) để gửi chương trình tour và xác nhận đặt chỗ.</li>
              <li><strong>Dữ liệu hội thoại:</strong> Nội dung tin nhắn trao đổi giữa khách hàng và nhân viên tư vấn để lưu vết quy trình chăm sóc.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Globe size={22} color="var(--secondary)" /> 2. Mục đích sử dụng dữ liệu
            </h2>
            <p>Dữ liệu thu thập được sử dụng duy nhất cho các mục đích sau:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem' }}>
              <li>Quản lý và cá nhân hóa trải nghiệm tư vấn tour du lịch (Tibet, Xinjiang, Mongolia...).</li>
              <li>Tự động hóa việc tạo Lead và cập nhật trạng thái khách hàng tiềm năng.</li>
              <li>Gửi các thông báo về lịch trình, thanh toán và các cập nhật quan trọng liên quan đến chuyến đi.</li>
              <li>Nâng cao chất lượng dịch vụ thông qua phân tích xu hướng quan tâm của khách hàng.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Lock size={22} color="var(--secondary)" /> 3. Bảo mật và Lưu trữ
            </h2>
            <p>Chúng tôi triển khai các tiêu chuẩn bảo mật cấp cao nhất để bảo vệ dữ liệu khách hàng:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem' }}>
              <li><strong>Mã hóa:</strong> Toàn bộ đường truyền dữ liệu được bảo vệ bằng giao thức SSL/HTTPS.</li>
              <li><strong>Lưu trữ biệt lập:</strong> Dữ liệu được lưu trữ trên hệ thống máy chủ riêng của FIT TOUR, không chia sẻ hạ tầng với các dịch vụ công cộng.</li>
              <li><strong>Quyền truy cập hạn chế:</strong> Chỉ nhân viên có tài khoản được cấp quyền (Admin, Sales) mới có thể tiếp cận dữ liệu khách hàng.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <UserCheck size={22} color="var(--secondary)" /> 4. Quyền của chủ thể dữ liệu
            </h2>
            <p>Theo quy chuẩn của Meta và pháp luật hiện hành, khách hàng hoàn toàn có quyền:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem' }}>
              <li>Yêu cầu kiểm tra, cập nhật hoặc đính chính thông tin cá nhân.</li>
              <li>Yêu cầu xóa bỏ hoàn toàn lịch sử hội thoại và thông tin cá nhân khỏi hệ thống CRM của FIT TOUR.</li>
              <li>Rút lại sự đồng ý cho phép ứng dụng truy cập dữ liệu Messenger bất kỳ lúc nào.</li>
            </ul>
          </section>

          <section style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Mail size={22} color="var(--secondary)" /> 5. Liên hệ với chúng tôi
            </h2>
            <p>Nếu bạn có bất kỳ thắc mắc hoặc yêu cầu nào liên quan đến việc bảo mật dữ liệu, vui lòng liên hệ:</p>
            <div style={{ marginTop: '1rem', color: 'white', fontWeight: 500 }}>
              <p>📍 FIT TOUR - Hệ thống Quản lý Khách hàng Tập trung</p>
              <p>🌐 Website: crm.tournuocngoai.com</p>
              <p>💬 Hỗ trợ kỹ thuật: Qua Facebook Messenger chính thức của trang.</p>
            </div>
          </section>

          <footer style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-light)' }}>
            <p>© 2026 FIT TOUR CRM. Mọi quyền được bảo lưu.</p>
            <p style={{ marginTop: '0.5rem' }}>Ứng dụng tuân thủ nghiêm ngặt Chính sách Dữ liệu Nền tảng của Meta.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
