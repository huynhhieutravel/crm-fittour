import React from 'react';
import { FileText, ArrowLeft, Scale, ShieldAlert, CheckCircle, HelpCircle, AlertTriangle, ShieldCheck, Globe, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="login-container" style={{ overflowY: 'auto', padding: '4rem 1rem', display: 'block' }}>
      <div className="login-form" style={{ maxWidth: '950px', width: '100%', margin: '0 auto', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: 600, transition: 'all 0.3s' }}
          className="hover-glow"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '1.5rem', color: 'var(--secondary)', marginBottom: '1.5rem', boxShadow: 'var(--gold-glow)' }}>
            <Scale size={54} />
          </div>
          <h1 style={{ color: 'white', fontSize: '2.8rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Điều khoản Dịch vụ</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Cập nhật lần cuối: 17 tháng 03, 2026 | FIT TOUR CRM SYSTEM</p>
        </header>

        <div style={{ color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1.05rem', textAlign: 'justify' }}>
          
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '1.5rem' }}>
              <Globe size={24} color="var(--secondary)" /> 1. Định nghĩa và Phạm vi
            </h2>
            <p><strong>"Dịch vụ"</strong> đề cập đến hệ thống FIT TOUR ERP (erp.fittour.vn), bao gồm tất cả các tính năng quản lý Lead, Booking, và tích hợp tin nhắn đa nền tảng.</p>
            <p style={{ marginTop: '0.5rem' }}><strong>"Người dùng"</strong> đề cập đến bất kỳ cá nhân hoặc tổ chức nào được cấp quyền truy cập vào hệ thống để quản lý dữ liệu khách hàng của FIT TOUR.</p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '1.5rem' }}>
              <ShieldCheck size={24} color="var(--secondary)" /> 2. Quyền sở hữu và Bản quyền
            </h2>
            <p>Toàn bộ mã nguồn, thiết kế giao diện (UI/UX), thuật toán xử lý dữ liệu và nội dung trên hệ thống FIT TOUR CRM thuộc quyền sở hữu độc quyền của <strong>FIT TOUR</strong>. Mọi hành vi sao chép, chỉnh sửa hoặc sử dụng trái phép mã nguồn hệ thống sẽ bị coi là vi phạm bản quyền và bị xử lý theo pháp luật hiện hành.</p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '1.5rem' }}>
              <CheckCircle size={24} color="var(--secondary)" /> 3. Điều khoản sử dụng tài khoản
            </h2>
            <ul style={{ marginLeft: '1.5rem', listStyleType: 'square' }}>
              <li><strong>Bảo mật:</strong> Người dùng chịu trách nhiệm hoàn toàn về việc giữ bí mật mật khẩu và thông tin đăng nhập. FIT TOUR không chịu trách nhiệm cho bất kỳ tổn thất nào phát sinh từ việc sơ suất bảo mật phía người dùng.</li>
              <li><strong>Sử dụng đúng mục đích:</strong> Hệ thống chỉ được sử dụng cho các hoạt động nghiệp vụ du lịch của FIT TOUR. Cấm tuyệt đối việc sử dụng CRM để phát tán mã độc, spam, hoặc thu thập dữ liệu trái phép.</li>
              <li><strong>Giới hạn quyền:</strong> Tài khoản được cấp quyền "Sales" không được phép truy cập/thay đổi cấu hình hệ thống dành cho "Admin".</li>
            </ul>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '1.5rem' }}>
              <AlertTriangle size={24} color="var(--secondary)" /> 4. Xử lý dữ liệu khách hàng
            </h2>
            <p>FIT TOUR CRM tích hợp với nền tảng Meta để quản lý Messenger. Người dùng cam kết:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem' }}>
              <li>Tuân thủ nghiêm ngặt Chính sách Dữ liệu của Meta và pháp luật bảo vệ dữ liệu cá nhân của Việt Nam.</li>
              <li>Không được chia sẻ, bán hoặc chuyển giao dữ liệu khách hàng trên CRM cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý bằng văn bản của FIT TOUR.</li>
              <li>Mọi truy xuất dữ liệu đều được hệ thống lưu vết (Logs) để phục vụ công tác kiểm tra định kỳ.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '1.5rem' }}>
              <Clock size={24} color="var(--secondary)" /> 5. Giới hạn trách nhiệm
            </h2>
            <p>FIT TOUR nỗ lực tối đa để đảm bảo hệ thống hoạt động 24/7. Tuy nhiên, chúng tôi không chịu trách nhiệm trong các trường hợp:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem' }}>
              <li>Gián đoạn dịch vụ do sự cố từ phía đối tác hạ tầng (VPS, Domain, Facebook API).</li>
              <li>Mất mát dữ liệu do tấn công mạng vượt quá khả năng phòng vệ kỹ thuật thông thường.</li>
              <li>Sự cố bất khả kháng theo quy định của pháp luật.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '3rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '1.25rem', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <HelpCircle size={22} color="var(--secondary)" /> 6. Thay đổi điều khoản
            </h2>
            <p>FIT TOUR có quyền cập nhật, thay đổi Điều khoản dịch vụ này bất kỳ lúc nào để phù hợp với quy mô phát triển và quy định pháp luật. Phiên bản mới sẽ có hiệu lực ngay khi được đăng tải trên hệ thống.</p>
          </section>

          <footer style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-light)' }}>
            <p>© 2026 FIT TOUR CRM. Toàn quyền quản lý bởi Ban Giám Đốc FIT TOUR.</p>
            <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>Hệ thống quản lý nội bộ - Tuyệt mật dữ liệu khách hàng.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
