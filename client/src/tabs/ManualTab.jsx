import React from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Shield, Target, FileText, Users, Map, ShoppingCart, CheckCircle, XCircle, AlertTriangle, Filter, BarChart2, Search, Edit3, Copy, ArrowUpRight } from 'lucide-react';

const ManualOverview = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>Phân quyền & Giới thiệu</h1>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.6 }}>
        Tổng quan về hệ thống FIT TOUR CRM và quy định phân quyền tài khoản cho từng bộ phận.
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{ padding: '10px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px' }}>
            <Target size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>1. Tại sao FIT TOUR cần hệ thống này?</h2>
        </div>
        <div style={{ color: '#475569', lineHeight: 1.7, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>
            Hệ thống <strong>FIT TOUR CRM</strong> được thiết kế theo tư duy "Single Source of Truth" (Nguồn dữ liệu duy nhất), thay thế hoàn toàn các file Excel/Google Sheets rời rạc, tin nhắn Zalo chồng chéo.
          </p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <li><strong style={{ color: '#1e293b' }}>Quản trị Data & Lead:</strong> Thu thập Lead tập trung từ Facebook Ads, Zalo; ngăn chặn triệt để việc mất/quên khách hàng.</li>
            <li><strong style={{ color: '#1e293b' }}>Vận hành Tour & Hướng Dẫn Viên:</strong> Điều phối trực quan các Lịch khởi hành (Departures), sắp xếp xe buýt, phân bổ Hướng Dẫn Viên.</li>
            <li><strong style={{ color: '#1e293b' }}>Dòng tiền & Đơn hàng:</strong> Quản lý minh bạch mọi đơn đặt chỗ (Booking), cấu trúc giá cost - lãi/lỗ tự động của từng Tour.</li>
            <li><strong style={{ color: '#1e293b' }}>Bảo mật & Quản lý nhân sự:</strong> Dữ liệu được bảo mật với phân quyền chặt chẽ. Chống sao chép hay tải xuống data trái phép.</li>
          </ul>
        </div>
      </section>

      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{ padding: '10px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px' }}>
            <Shield size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>2. Phân quyền hệ thống & Giải thích vai trò</h2>
        </div>
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          
          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b91c1c', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👑 Admin (Quản trị viên)
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Người nắm toàn quyền hệ thống. Được xoá dữ liệu vĩnh viễn, truy cập Cài đặt hệ thống (Settings), quản lý tài khoản nhân sự và cấu hình API Meta.
            </p>
          </div>

          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c2410c', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👨‍💼 Manager (Quản lý)
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Dành cho Trưởng phòng/Đội trưởng. Xem data Khách hàng của nhóm, đánh giá doanh số nhân viên. Có quyền tạo/sửa Tour, Lịch khởi hành và HDV.
            </p>
          </div>

          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0369a1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💰 Sales (Kinh doanh)
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Tương tác trực tiếp tạo đơn hàng. Chỉ xem Tệp khách hàng được giao cho bản thân. Không xem được "Costing" hoặc cấu trúc báo giá mảng Điều hành.
            </p>
          </div>

          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ Operations (Điều hành)
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Chuyên viên back-office. Ưu tiên tab Lịch khởi hành, quản lý Visa, điều phối Hướng dẫn viên, và nhập xuất các khoản chi phí Tour (Costing).
            </p>
          </div>

        </div>
      </section>
    </div>
  </>
);

const StepBadge = ({ num }) => (
  <div style={{ minWidth: '36px', height: '36px', borderRadius: '50%', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.4)', flexShrink: 0 }}>
    {num}
  </div>
);

const ManualLeadsSOP = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>Sổ tay Nghiệp Vụ: LEAD MARKETING</h1>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '650px', lineHeight: 1.6 }}>
        Tài liệu chuẩn hóa SOP (Standard Operating Procedure) bắt buộc đối với toàn bộ đội ngũ Sales. Quy trình này sẽ được bộ phận Quản lý kiểm duyệt chéo hàng ngày để đánh giá KPI.
      </p>
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* STEP 1 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="1" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Nguyên Tắc Đầu Vào & Tạo Lead Mới</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Khách hàng tiềm năng đổ về hệ thống sẽ qua 2 luồng chính:
        </p>

        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="#eab308" /> 1. Auto-Capture (Hệ thống tự động bắt)
          </h3>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
            Bất cứ vị khách nào nhắn tin thẳng vào <strong>Fanpage Facebook (Meta)</strong>, Capi của hệ thống sẽ TỰ ĐỘNG sinh ra 1 Lead với nhãn gốc màu xanh chữ <strong>MESSENGER</strong>. 
            <br /><em>Luật ngầm:</em> <strong>KHÔNG BAO GIỜ</strong> tạo thủ công Lead bằng tay nếu khách đến từ Facebook Message để tránh vỡ báo cáo luồng Ads của MKT.
          </p>
        </div>

        <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.75rem' }}>2. Tạo Lead Thủ Công (Click-by-Click)</h3>
          <p style={{ margin: 0, color: '#166534', lineHeight: 1.6, marginBottom: '1rem' }}>Sử dụng tính năng này KHI khách liên hệ qua Zalo cá nhân, Hotline, hoặc khách quen giới thiệu.</p>
          <ul style={{ paddingLeft: '1.2rem', color: '#15803d', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
            <li>Bấm nút <strong>[+ THÊM MỚI]</strong> màu xanh dương góc phải trên cùng.</li>
            <li><strong>Tên khách:</strong> Nhập chính xác tên Zalo/tên xưng hô.</li>
            <li><strong>Số điện thoại:</strong> <em>TRƯỜNG BẮT BUỘC</em>. Hệ thống sẽ check trùng SDT để chặn những case Sale khác đang chăm.</li>
            <li><strong>Nguồn (Source):</strong> Chọn đúng phễu (Zalo / Hotline / Tiktok...).</li>
          </ul>
        </div>
      </section>

      {/* STEP 2 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="2" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Chuẩn Hóa Phân Loại "Trạng Thái" Lead</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Để bộ lọc trên Bảng điều khiển hoạt động chính xác, Sale TỰ GIÁC cập nhật trạng thái ngay sau mỗi chu kỳ giao tiếp.
        </p>

        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Định nghĩa & Ngữ cảnh áp dụng</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#4338ca', fontSize: '0.85rem', fontWeight: 600 }}>Mới</span></td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Khách vừa vào hệ thống, chưa sale nào chạm mặt trả lời/chào hỏi.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fef08a', color: '#854d0e', fontSize: '0.85rem', fontWeight: 600 }}>Đang tư vấn</span></td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Đã nhắn tin qua lại, đã bốc máy gọi điện, đã gửi Brochure báo giá.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#ffedd5', color: '#c2410c', fontSize: '0.85rem', fontWeight: 600 }}>Đang Follow</span></td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Khách hẹn tháng sau đi, đợi xin nghỉ phép, đợi rủ bạn. Ngâm dài ngày.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#bbf7d0', color: '#166534', fontSize: '0.85rem', fontWeight: 600 }}>Sắp chốt</span></td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Khách đã hỏi phương thức thanh toán, xin Số tài khoản chuyển cọc.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#d1d5db', color: '#374151', fontSize: '0.85rem', fontWeight: 600 }}>Thất bại</span></td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Trượt giá, khách chê đắt, bom cuộc gọi nhiều lần, báo đi bên khác.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* STEP 3 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="3" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Nhật Ký "Take Notes" (BẮT BUỘC)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Tìm ở cột ngoài cùng bảng Lead, ấn vào biểu tượng 💬 <strong>(Chat/Note)</strong>. Mọi chẩn đoán bệnh đồ và deal với khách đều phải nằm ở đây. Giám đốc sẽ kiểm tra định kỳ bảng này.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ color: '#166534', fontWeight: 700, marginBottom: '1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <CheckCircle size={20} /> DO (Nên Làm)
            </h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#15803d', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
              <li>Ghi theo cấu trúc: <strong>[Tình trạng] - [Vấn đề mắc phải] - [Hành động tiếp theo]</strong>.</li>
              <li><em>Ví dụ: "Đã gọi. Khách ưng Tour Nhật nhưng cấn lịch bay con nhỏ. HẸN LẠI SÁNG THỨ 6 GỌI."</em></li>
            </ul>
          </div>

          <div style={{ flex: 1, minWidth: '250px', background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <h3 style={{ color: '#991b1b', fontWeight: 700, marginBottom: '1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <XCircle size={20} /> DON'T (Tuyệt Đối Cấm)
            </h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#b91c1c', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
              <li>Viết cẩu thả, vô hồn chỉ để lấy KPI.</li>
              <li><em>Ví dụ SAI: "Đã gọi", "Đang bận", "Có số điện thoại", "Zalo ko rep".</em> Mọi Note vô nghĩa sẽ bị hệ thống đánh dấu Zero Effort.</li>
              <li><strong>TUYỆT ĐỐI KHÔNG ẨN DATA:</strong> Khách bom hàng hoặc chê đắt, bạn phải chuyển trạng thái 'Thất Bại' và Note rõ 'Khách chê đắt mua bên cty A'. Không được tự ý xóa dòng Lead để phi tang.</li>
            </ul>
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px', color: '#92400e', marginTop: '1.5rem' }}>
          <strong>CASE DIỂN HÌNH (Sử Dụng Trạng Thái Kết Hợp Note):</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
            <li><strong>Khách im lặng (Zalo ko rep / Xem ko trả lời):</strong> Sau 3 ngày, chuyển trạng thái về <em>Đang Follow</em> và Ghi chú: <em>"Đã báo giá nhưng KH xem ko trả lời. Sẽ follow lại tháng sau."</em></li>
            <li><strong>Khách Gọi Hotline Đêm Khuya:</strong> Điền SDT vào sổ tay giấy, <strong>SÁNG HÔM SAU PHẢI LÊN CRM NHẬP BẰNG TAY NGAY LẬP TỨC.</strong> Mọi case chăm ngoài luồng không kê khai trên CRM sẽ bị tước doanh số.</li>
          </ul>
        </div>
      </section>

      {/* STEP 4 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="4" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Convert Chuyển Đổi (CHỐT ĐƠN)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Bước cuối cùng và quan trọng nhất của Sale. Nút Convert (Icon 👤+ Mũi tên chéo) là vạch đích của dây chuyền Lead.
        </p>

        <div style={{ padding: '1rem 1.5rem', background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '4px', color: '#1e3a8a', marginBottom: '1.5rem' }}>
          <strong>LƯU Ý NGHIÊM NGẶT:</strong> Chỉ BẤM Convert khi Khách chắc chắn đi và <strong>ĐÃ CHUYỂN KHOẢN CỌC</strong> hoặc xuất mã Pay. KHÔNG ĐƯỢC bấm Convert để "dọn dẹp" bảng Lead. Làm vậy Kế toán sẽ réo tên bạn.
        </div>

        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569', fontSize: '1.05rem' }}>
          <li>Khi bấm Convert, dữ kiện này ngay lập tức bắn tít sang CAPI của mạng Meta Facebook để <strong>máy học AI chạy Ads tìm người tương tự</strong>.</li>
          <li>Đồng thời, Lead sẽ bị Niêm Phong, không ai được chỉnh sửa nữa. Khách biến hình 100% sang <strong>Danh Mục Khách Hàng Cơ Sở</strong> cùng toàn bộ SĐT, Note, Facebook Link cũ. Dữ liệu trôi chảy hoàn hảo.</li>
        </ul>
      </section>

    </div>
  </>
);

const ManualLeadsGuide = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>HDSD: Tính Năng Lead Marketing</h1>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '650px', lineHeight: 1.6 }}>
        Cẩm nang khám phá mọi ngóc ngách tính năng của bảng Lead. Dành cho nhân viên mới để làm quen với giao diện, các bộ lọc, và thao tác nhanh (phím tắt, click inline).
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* PHẦN 1 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="1" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cách đọc Bảng Điều Khiển (Dashboard)</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={{ color: '#0f172a', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <BarChart2 size={20} color="#3b82f6" /> Biểu Đồ Phễu
            </h3>
            <p style={{ color: '#475569', lineHeight: 1.6 }}>
              Phía trên cùng màn hình là 4 hộp số liệu. Chúng hoạt động như một cái "Phễu Gà Đẻ Trứng Vàng":
              <br/><br/>
              - <strong>Tổng Lead:</strong> Đầu vào của phễu.<br/>
              - <strong>Mới & Đang tư vấn:</strong> Ruột phễu, nơi bạn đang gồng mình cày kéo.<br/>
              - <strong>Đã Chốt:</strong> Đầu ra của phễu (Tiền!). Cố gắng đẩy cái phễu này càng to càng tốt.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={{ color: '#0f172a', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Search size={20} color="#8b5cf6" /> Thanh Công Cụ (Toolbar)
            </h3>
            <p style={{ color: '#475569', lineHeight: 1.6 }}>
              Ngay dưới biểu đồ là dải Thanh công cụ. Ở đây bạn có nút Export Excel (Chỉ Quản lý mới dùng được) và ô Tìm kiếm thần tốc.<br/><br/>
              <strong>Mẹo tìm kiếm:</strong> Bạn có thể gõ lỳ số điện thoại (VD: 0988) hoặc gõ thẳng tên khách (VD: Chú Hoàng) vào để tra. Nó nhảy ra kết quả ngay lập tức không cần bấm nút Enter!
            </p>
          </div>
        </div>
      </section>

      {/* PHẦN 2 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="2" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Sức Mạnh Của "Bộ Lọc Đa Chiều"</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Tuyệt chiêu để lọc 1000 khách rác ra còn 10 khách ruột. Bấm vào nút <Filter size={18} style={{display: 'inline-block', verticalAlign: 'middle', margin: '0 4px'}} /> <strong>Bộ Lọc</strong> ở góc phải.
        </p>

        {/* MCP WebP Demo Embed 
        <div style={{ borderRadius: '12px', border: '2px solid #3b82f6', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)' }}>
          <div style={{ background: '#eff6ff', padding: '0.75rem 1rem', borderBottom: '1px solid #bfdbfe', color: '#1e3a8a', fontWeight: 600, fontSize: '0.9rem' }}>
            🎥 Màn Hình Minh Họa: Mở dropdown Bộ lọc
          </div>
          <img src="/manual_images/leads_filter_demo.webp" style={{ width: '100%', display: 'block' }} alt="Cận cảnh mở menu Filter" />
        </div> */}

        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
          <li><strong>Lọc theo Thời Khoảng (Date range):</strong> Mặc định nó chỉ hiện tháng này. Bạn dùng chức năng "Tùy chọn" để chọn lịch từ năm trước đến năm sau nếu muốn xới củ lại khách cũ.</li>
          <li><strong>Lọc theo Trạng thái:</strong> Rất hiệu quả! Bạn check vào "Đang tư vấn" và "Sắp chốt" để nó in ra cục tệp nóng nhất cần xử lý ngay hôm nay. Bỏ tích "Thất bại" để đỡ chướng mắt.</li>
          <li><strong>Lọc theo Sale chăm sóc:</strong> Trưởng phòng có thể vào xem trộm nhân viên của mình đang lưu những ai, gọi được mấy khách.</li>
        </ul>
      </section>

      {/* PHẦN 3 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="3" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Thao Tác Nhanh (Inline-Actions)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Dành riêng cho các Cỗ máy Sale múa phím. Không cần mở form điền nặng nề, bạn có thể:
        </p>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', background: '#eff6ff', padding: '1.5rem', borderRadius: '12px' }}>
            <h3 style={{ color: '#1e3a8a', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Edit3 size={18} color="#2563eb" /> Sửa Trực Tiếp (Inline Edit)
            </h3>
            <p style={{ color: '#1e40af', margin: 0, fontSize: '0.95rem', marginBottom: '1rem' }}>
              Bạn có thể nhấp đúp vào ô <strong>Số Điện Thoại</strong> hoặc dropdown <strong>Trạng thái</strong> ngay trên cái bảng (giống hệt xài Excel). Sửa xong nó hiện dấu tick xanh lưu luôn cái vèo!
            </p>
            <img src="/manual_images/create_lead_modal.png" style={{ width: '100%', borderRadius: '8px', border: '1px solid #bfdbfe' }} alt="Sửa trực tiếp bằng Inline Edit" />
          </div>
          <div style={{ flex: 1, minWidth: '300px', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#0f172a', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Copy size={18} color="#475569" /> Copy Nhanh Mọi Thứ
            </h3>
            <p style={{ color: '#475569', margin: 0, fontSize: '0.95rem' }}>
              Mỗi dòng Số điện thoại đều có icon vuông nhỏ bên cạnh. Bấm vào là máy tự động chép số người đó vào bộ nhớ. Bạn dán ra zalo search khách siêu tốc.
            </p>
          </div>
        </div>
      </section>

      {/* PHẦN 4 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="4" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Giải Nghĩa 4 Phím Ma Thuật (Cột Cuối)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Bên cột ngoài cùng là khu căn cứ điểm của Sale, nó gồm 4 chức năng chính:
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <strong>🖊️ (Chỉnh sửa Form)</strong><br/>
            Dùng khi bạn muốn vào hẳn hồ sơ to để sửa Email, Facebook URL, Cấp độ, Sản phẩm quan tâm, hoặc gán khách này cho sếp chăm.
          </div>
          <div style={{ background: '#fdf4ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
            <strong>💬 (Nhật Ký - Notes)</strong><br/>
            Dùng để bật nhanh Modal chat để viết ghi chú tình hình con bệnh. Lịch sử ko bị xóa bao giờ.
            {/* 
            <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f9a8d4' }}>
               <img src="/manual_images/leads_form_and_notes.webp" style={{ width: '100%', display: 'block' }} alt="Mở Chat Notes" />
            </div>
            */}
          </div>
          <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <strong>👤+ (Convert Chốt Đơn)</strong><br/>
            Nút NGUY HIỂM. Bấm vào là trôi mất dữ kiện bay thẳng sang Data Khách Hàng cho Kế toán bắt đầu thu cọc.
          </div>
          <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <strong>🗑️ (Xóa / Ẩn Vĩnh Viễn)</strong><br/>
            Nếu là Lead Rác (Khách mắng, Khách ảo nhắn sai số), bấm xóa cái rụp đi cho nhẹ bảng báo cáo.
          </div>
        </div>
      </section>

    </div>
  </>
);

const ManualCustomersSOP = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(185, 28, 28, 0.4)' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
        <Shield size={36} color="#fca5a5" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Khách Hàng: Quy Định (SOP)</h1>
      </div>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '650px', lineHeight: 1.6 }}>
        Bảng Khách Hàng (Customer) là "bất khả xâm phạm". Mọi hành vi làm bẩn dữ liệu tại đây sẽ dẫn tới hậu quả sai lệch Phễu Marketing năm sau. Tuyệt đối tuân thủ 3 thiết quân luật dưới đây!
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* LUẬT 1 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="1" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Luật Vàng: Chống Trùng Lặp 100% (Anti-Duplicate)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Dữ liệu tại bảng Khách hàng không giống như Lead (xóa đi bốc lại được). CRM dùng <strong>Số Điện Thoại (SĐT)</strong> làm định danh chốt sống.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '250px', background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <h3 style={{ color: '#991b1b', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} /> 🚨 NGHIÊM CẤM "MÁNH KHÓE"
            </h3>
            <p style={{ color: '#991b1b', margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
              Nếu hệ thống ném thẳng mặt cảnh báo: <strong>"Số điện thoại này đã tồn tại ở khách hàng ABC"</strong>. Lập tức dừng tay! <br/><br/>
              <b>Cấm tuyệt đối:</b> Cố tình chèn thêm số 0, hoặc đổi đầu số (+84 thành 0) để tạo thành 1 dòng data mới hòng cướp khách hoặc tính KPI ảo. Mọi hồ sơ có SĐT sai định dạng sẽ bị admin rà soát và phạt nặng.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '250px', background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} /> CÁCH XỬ LÝ (GỘP MERGE)
            </h3>
            <p style={{ color: '#15803d', margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
              Khi bị báo trùng, tức là khách đó đã là "Khách cũ" từng đi Tour với công ty. Bạn phải dùng công cụ <strong>TÌM KIẾM</strong> số điện thoại đó để xới lại hồ sơ gốc.<br/><br/>
              Khách mua thêm chuyến đi mới? Tuyệt vời, chỉ cần tạo Giao dịch (Booking) mới dán chung vào Hồ sơ cũ đó. Tiếng vang của khách này sẽ được cộng dồn (Trở thành Khách VVIP).
            </p>
          </div>
        </div>
      </section>

      {/* LUẬT 2 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="2" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Nguyên Tắc Bóc Tách Khách Nhóm (Group Bookings)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Một câu hỏi cực kỳ phổ biến của Sale khi xử lý Khách theo nhóm/gia đình lớn.
        </p>

        <div style={{ padding: '1.5rem', background: '#fffbeb', borderLeft: '5px solid #f59e0b', borderRadius: '4px', color: '#92400e' }}>
          <h3 style={{ fontWeight: 800, margin: '0 0 10px 0', fontSize: '1.1rem' }}>❓ Kịch Bản: 1 Người Đóng Tiền Cho 5 Người Đi</h3>
          <em>"Nếu ông Chú đại diện chuyển 50 triệu mua tour cho 5 người bạn, em mở 1 hồ sơ tên ông Chú rồi Note 'SL: 5' cho nhanh được không?"</em>
          
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px dashed #fbbf24' }}>
            <strong>✅ TRẢ LỜI CỦA CÔNG TY: TUYỆT ĐỐI KHÔNG! BẮT BUỘC NHẬP HẾT CẢ 5 HỒ SƠ KHÁCH HÀNG.</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li>Ông Chú trả tiền là <strong>Người thanh toán</strong>, nhưng 5 người kia MỚI LÀ CÁC THỰC THỂ đã trải nghiệm dịch vụ của công ty ta!</li>
              <li>Họ chính là đối tượng để phòng Marketing gửi Zalo/SMS chúc mừng sinh nhật, rủ đi Tour mùa thu năm sau!</li>
              <li>Việc gộp chung 5 người thành 1 hồ sơ nghĩa là bạn đã nhẫn tâm <strong>Vứt hẳn 4 Data Vàng</strong> của công ty vào sọt rác. Hành động này sẽ gây thiệt hại hệ thống cực lớn!</li>
            </ul>
          </div>
        </div>
      </section>

      {/* LUẬT 3 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="3" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Luật "Tiền Trảm Hậu Tấu" - Không Nút Xóa</h2>
        </div>
        
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Rất nhiều người rà tìm nút Thùng Rác (Xóa) Khách Hàng. Xin thưa: <strong>Nút đó không tồn tại ở bảng Khách hàng!</strong>
        </p>

        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569', fontSize: '1.05rem' }}>
          <li><strong>Vì sao?</strong> Khách hàng có liên kết rễ má chặt chẽ Mạng lưới Đơn hàng (Booking) và Dòng Tiền (Cọc, Thanh toán). Nếu bạn xóa 1 khách hàng, Kế toán sẽ không bao giờ biết khoản 20 triệu hôm qua là thanh toán cho ai (Dữ liệu bị Orphan/Bồ côi).</li>
          <li><strong>Giải pháp thay thế (XÓA MỀM - SOFT DELETE):</strong> Đổi trạng thái khách thành <strong>Khóa (Lock)</strong> bằng thao tác chỉnh sửa. Khách đó sẽ tàng hình khỏi các danh sách trỏ xuống khi Sales mới tạo Booking, nhưng toàn bộ Lịch sử quá khứ của Kế Toán xuất ra file Excel vẫn Giữ Nguyên Vẹn. An toàn 100%.</li>
        </ul>
      </section>

    </div>
  </>
);

const ManualCustomersGuide = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
        <Users size={36} color="#bae6fd" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Khách Hàng: Hướng Dẫn Sử Dụng</h1>
      </div>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '650px', lineHeight: 1.6 }}>
        Bảng điều khiển đỉnh cao lưu trữ <strong>Hồ Sơ 360 độ</strong> trọn đời của Khách Hàng. Trải nghiệm sự liên thông mượt mà giữa Các khối dữ liệu.
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* TÍNH NĂNG 1 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="1" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cơ Chế Khởi Tạo & Bơm Data (CAPI)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Bạn hiếm khi phải Bấm nút "Thêm Mới" Khách hàng theo cách nhập tay khổ sai như ngày xưa. CRM có cơ chế mớm data tự động (Pipeline):
        </p>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#0f172a', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ArrowUpRight size={18} color="#6366f1" /> Từ Mạng Luới Lead
            </h3>
            <p style={{ color: '#475569', margin: 0, fontSize: '0.95rem' }}>
              90% Hồ sơ khách hàng nằm ở đây được phôi thai từ danh sách bên bảng <strong>Lead Marketing</strong>. Ngay khi Sale bóp cò bấm nút Convert (Chuyển Đổi), hồ sơ sẽ nhảy sang bảng Khách hàng đầy đủ thông tin Tên, SĐT, Kênh tìm đến và Lịch sử Note.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '300px', background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <h3 style={{ color: '#1e3a8a', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Users size={18} color="#2563eb" /> Nhập thêm Người Nhà
            </h3>
            <p style={{ color: '#1e40af', margin: 0, fontSize: '0.95rem' }}>
              Ngõ thứ 2 là khi bạn trực tiếp tạo Đơn Booking (Tour). Sẽ có nút mở Popup Thêm Nhanh các thành viên (con cái, người già đi chung) vào hồ sơ mạng lưới Khách hàng. Nhập cái lưu liền cho nóng!
            </p>
          </div>
        </div>
      </section>

      {/* TÍNH NĂNG 2 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="2" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Hồ Sơ 360 Độ "Trọn Đời" (Lifetime Value)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Bạn thử Click thẳng vào tên màu xanh (hoặc icon Xem) của 1 Khách hàng bất kỳ trên bảng. Giao diện sụp xuống một Bảng thông tin Hồ sơ Chi tiết vô cùng đồ sộ.
        </p>

        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569', fontSize: '1.05rem' }}>
          <li><strong>Ngăn Dữ Liệu Chuyên Môn:</strong> Lưu trữ vô tận những thông tin tế nhị của khách: Dị ứng đậu phộng, bị say xe, Hộ chiếu sắp hết hạn (Upload cả ảnh lên mây AWS), Yêu cầu ăn kiêng. Giám đốc cực kỳ đánh giá cao Sale ghi chi tiết mục này.</li>
          <li><strong>Ngăn Bookings History (Xương sống):</strong> Nó sẽ liệt kê dọc TẤT CẢ các Tour mà Vị khách này đã từng đi cùng Công ty ta. Tổng giá trị họ đã đốt cho chúng ta là bao nhiêu. Bạn dựa vào ngăn này để xác định khách này VIP cỡ nào để mà dập đầu xin lỗi nếu có sai sót.</li>
        </ul>
      </section>

    </div>
  </>
);

const ManualBookings = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>Đơn hàng & Giao dịch</h1>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.6 }}>
        Quy trình tạo Đơn hàng (Booking), ghi nhận dòng tiền (Đặt cọc/Thanh toán) cho khách hàng đã chốt deal.
      </p>
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>A. Bộ lọc Đơn Hàng</h2>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Tại tab <strong>Đơn hàng/Booking</strong>, bạn có thể kiểm soát các giao dịch tài chính. Bạn có thể tra cứu mã Booking, tìm tên khách, hoặc lọc tình trạng Đã Thu Đủ / Còn Thiếu dễ dàng để nhắc nhở công nợ mùa cao điểm.
        </p>
        <img src="/manual_images/bookings_list_main_1775229118166.png" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} alt="Giao diện danh sách Booking" />
      </section>

      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>B. Lập Form Tạo Booking Mới</h2>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Nhấn nút <strong>"TẠO MỚI BOOKING"</strong> để mở cửa sổ lập giao dịch. Form chia thành ba phần rất rành mạch: Thông tin Khách hàng đại diện cọc tiền, Tour / Ngày Lịch đi đã mua, và chi tiết Hành Khách đi cùng đoàn để làm Visa.
        </p>
        <img src="/manual_images/add_booking_modal_1775229135599.png" style={{ width: '80%', display: 'block', margin: '0 auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} alt="Modal Add Booking" />
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', color: '#475569' }}>
          <li><strong>Người đại diện đặt tour:</strong> Bạn chỉ có thể chọn khách hàng đã nằm trong hệ thống từ bước Convert Lead.</li>
          <li><strong>Danh sách hành khách bay (Passengers):</strong> Hãy điền thông tin người bay thực tế đi theo đoàn, có cả Passport và ngày hết hạn hộ chiếu.</li>
          <li><strong>Thanh toán cọc:</strong> Điền chính xác số tiền khách đã cọc để hệ thống phân xuất công nợ, tính bù trừ tổng tiền tour.</li>
        </ul>
      </section>
    </div>
  </>
);

const ManualTours = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>Điều hành: Sản phẩm Tour & Lịch trình</h1>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.6 }}>
        Sử dụng hệ thống để thiết lập thư viện Sản phẩm Tour mẫu, quản lý danh sách Lịch trình bay chuyến và ghép Hướng Dẫn Viên.
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>A. Danh Mục Sản Phẩm Tour Mẫu</h2>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Menu <strong>Sản phẩm Tour</strong> giống như quyển Catalogue (Thư mục) chứa các lộ trình du lịch mà FIT TOUR đang kinh doanh. Nó giữ quy tắc chung chẳng hạn như mã code <em>(VD: HAN-BKK-01)</em>, địa điểm và thời lượng tour chuẩn. Bảng này quản trị các "Form mẫu" trước khi mở ngày bay thực tế.
        </p>
        <img src="/manual_images/tours_list_main_1775229170603.png" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} alt="Danh sách Tour Mẫu" />
      </section>

      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>B. Lịch Khởi Hành (Departures Timeline)</h2>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Được thiết kế cho phòng <strong>Điều hành (Operations)</strong>. Bạn sẽ bóc các mẫu Tour ra và chỉ định ngày khởi hành thực tế (VD: Tour BKK khởi hành từ ngày 10 tới ngày 14). Màn hình chia thành hai chế độ là <strong>Lịch (Calendar)</strong> (trực quan các chuyến đi trải dài theo tuần/tháng) và <strong>Bảng (List)</strong>.
        </p>
        <img src="/manual_images/departures_calendar_view_1775229184698.png" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} alt="Lịch Khởi Hành" />
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginTop: '1.5rem' }}>
          Cũng tại màn hình này, Điều hành viên có quyền Gán xe trung chuyển (Bus / Plane), gán Hướng dẫn Viên (Guides) dẫn đoàn chuyến đó. Lịch Departure sẽ cấm xóa/sửa đổi mạnh khi đoàn đã bắt đầu di chuyển để bảo vệ số đông hành khách.
        </p>
      </section>

      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>C. Quản lý Hồ sơ Hướng Dẫn Viên (Guides)</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              Menu Danh sách HDV lưu trữ lý lịch hợp tác của những người dẫn Tour, bao gồm chứng chỉ ngoại ngữ, trạng thái làm việc (Sẵn sàng/Đang bận), và số lượng tour đã giao phó.
            </p>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Bạn có thể dễ dàng khởi tạo Hồ sơ cho Tour Guide mới, ấn định Mức độ Ưu tiên để hệ thống dễ gợi ý trong Lịch khởi hành.
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <img src="/manual_images/guides_list_main_1775229241538.png" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '10px' }} alt="Danh sách Guide" />
            <img src="/manual_images/add_guide_modal_1775229258128.png" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} alt="Tạo Guide" />
          </div>
        </div>
      </section>
    </div>
  </>
);

const ManualTab = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const subtab = pathParts[1] || 'overview';

  const renderContent = () => {
    switch (subtab) {
      case 'leads':
      case 'leads-sop': return <ManualLeadsSOP />;
      case 'leads-guide': return <ManualLeadsGuide />;
      case 'customers-sop': return <ManualCustomersSOP />;
      case 'customers-guide': return <ManualCustomersGuide />;
      case 'bookings': return <ManualBookings />;
      case 'tours': return <ManualTours />;
      case 'overview':
      default: return <ManualOverview />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0', maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      {renderContent()}
    </div>
  );
};

export default ManualTab;
