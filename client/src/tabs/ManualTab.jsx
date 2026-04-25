import React from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Shield, Target, FileText, Users, Map, ShoppingCart, CheckCircle, XCircle, AlertTriangle, Filter, BarChart2, Search, Edit3, Copy, ArrowUpRight, Calendar, DollarSign } from 'lucide-react';

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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>2. Ma Trận Phân Quyền Đầy Đủ Hiện Tại (V2)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          Bảng phân quyền thực tế mới nhất cho thiết kế Đa Đội Nhóm (Multi-Team). Dấu <strong style={{ color: '#166534' }}>[✓]</strong> là được cấp quyền. Dấu <strong style={{ color: '#94a3b8' }}>[-]</strong> là không có quyền.
        </p>

        {/* BẢNG 1: SALE & MKT */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '1rem', borderBottom: '2px solid #bfdbfe', paddingBottom: '0.5rem' }}>1. Khối Marketing & Sales</h3>
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, width: '22%' }}>Module</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, width: '38%' }}>Hành động (Action)</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>MKT Lead</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>MKT (NV)</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>Sale Lead</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>Sale (NV)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td rowSpan={4} style={{ padding: '12px 16px', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Leads & Messenger</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Xem Lead Cá nhân / Của Team</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Team)</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Own)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Tạo Lead, Sửa Lead, Chat Messenger</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Phân Lead cho NV khác, Xuất File</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Xóa Lead vĩnh viễn</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
              </tr>
              
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td rowSpan={2} style={{ padding: '12px 16px', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Booking & Khách HCM</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Xem Team/Cá nhân, Tạo, Sửa của mình</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Team)</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Own)</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Team)</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Own)</td>
              </tr>
              <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Sửa của lính, Nhận / Chuyển khoản, Xuất file</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BẢNG 2: OPERATIONS & MICE */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '1rem', borderBottom: '2px solid #bfdbfe', paddingBottom: '0.5rem' }}>2. Khối Điều Hành, NCC & Tour Đoàn</h3>
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, width: '22%' }}>Module</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, width: '45%' }}>Hành động (Action)</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>Ops Lead</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>Ops (NV)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Sản phẩm Tour & Lịch KH</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Xem Toàn bộ / Cá nhân, Tạo, Sửa, Xuất File, Nhân bản</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Full)</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
              </tr>
              <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>HDV & Tất cả NCC</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Xem, Thêm Mới, Cập nhật thông tin (Khách sạn, Xe, Vé...)</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Có Xóa)</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Hông Xóa)</td>
              </tr>
            </tbody>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', borderTop: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Module MICE</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Hành động (Action)</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>Group Manager</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>Group Staff</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td rowSpan={2} style={{ padding: '12px 16px', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Khách B2B & Dự Án</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Xem, Quản lý toàn bộ Doanh Nghiệp, Lịch KH, Bookings Group</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (All & Full)</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Chỉ xem Khách của mình (Own), Cập nhật Dự án phụ trách</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Own)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BẢNG 3: TÀI CHÍNH KẾ TOÁN & SYSTEM */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '1rem', borderBottom: '2px solid #bfdbfe', paddingBottom: '0.5rem' }}>3. Tài Chính (Vouchers) & Đặc Quyền Manager</h3>
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, width: '22%' }}>Nhóm Quyền</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, width: '38%' }}>Hành động (Action)</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>Accountant</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>Các Leader</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>Các Staff</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td rowSpan={2} style={{ padding: '12px 16px', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Tài chính (Voucher)</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Xem Tất Cả Các Thu Chi, Duyệt, Hủy, Kiểm Ngân Costings</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Full)</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Tùy role)</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Xem Của Mình, Tạo Phiếu Mới</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓ (Own)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td rowSpan={2} style={{ padding: '12px 16px', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Đặc Quyền Manager & Admin</td>
                <td style={{ padding: '12px 16px', color: '#991b1b', fontWeight: 'bold' }}>Quản lý Nhân sự Trong Team & Reset Pass lính mới</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>✓</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', color: '#991b1b', fontWeight: 'bold' }}>Cấu hình Role, Cài Đặt Hệ Thống, Quản lý Toàn Công Ty</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>-</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>- (Chỉ Admin)</td>
              </tr>
            </tbody>
          </table>
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
        
        <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
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

      {/* TÍNH NĂNG 3 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="3" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Hệ Thống Phân Hạng VIP (VIP Segmentation)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Hệ thống sẽ <strong>tự động đếm tổng số chuyến đi (Lịch sử Booking thành công + Số liệu nhập gốc)</strong> để thăng hạng cho Khách hàng. Sales tuyệt đối không tự sửa hạng VIP tay.
        </p>

        <div style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Shield size={18} color="#3b82f6" /> Quy tắc đếm và Phân hạng (Logic)
          </h3>
          <ul style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
             <li><strong>Công thức:</strong> Tổng chuyến = (Số chuyến quá khứ nhập tay) + (Số đơn Tour thực tế trên CRM).</li>
             <li><strong>Điều kiện đếm:</strong> Hệ thống đếm tất cả Booking có trạng thái <strong>KHÁC</strong> "Mặc định/Mới" và <strong>KHÁC</strong> "Huỷ". Nghĩa là ngay khi khách <strong>Giữ chỗ chắc chắn hoặc Đặt cọc</strong>, hệ thống đã ghi nhận 1 lần đi.</li>
             <li><strong>Cơ chế Recalculate (An toàn):</strong> Mỗi khi có thay đổi, hệ thống sẽ <strong>quét lại toàn bộ danh sách từ đầu</strong> để tính tổng mới, chứ không phải cộng dồn dồn. Việc này đảm bảo không bao giờ bị đếm trùng (dupe) dù sếp có đổi trạng thái tour nhiều lần.</li>
             <li><strong>Thời điểm tính:</strong> Tính ngay lập tức khi tạo Booking mới hoặc khi đổi trạng thái của Booking cũ.</li>
          </ul>
        </div>

        <ul style={{ paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', margin: 0 }}>
          <li style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⭐⭐⭐</span>
            <div><strong style={{ color: '#dc2626', fontSize: '1.1rem' }}>VIP 1:</strong> <span style={{ color: '#475569' }}>Khách đã đi từ <strong>7 chuyến</strong> trở lên. Bậc siêu quyền lực.</span></div>
          </li>
          <li style={{ padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⭐⭐</span>
            <div><strong style={{ color: '#d97706', fontSize: '1.1rem' }}>VIP 2:</strong> <span style={{ color: '#475569' }}>Khách đã đi từ <strong>4 đến 6 chuyến</strong>. Tập khách trung thành trọn đời.</span></div>
          </li>
          <li style={{ padding: '1rem', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⭐</span>
            <div><strong style={{ color: '#7c3aed', fontSize: '1.1rem' }}>VIP 3:</strong> <span style={{ color: '#475569' }}>Khách đã đi <strong>3 chuyến</strong>. Bắt đầu có dấu hiệu gắn bó với công ty.</span></div>
          </li>
          <li style={{ padding: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏅</span>
            <div><strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>Khách cũ (Repeat Customer):</strong> <span style={{ color: '#475569' }}>Khách đã đi <strong>2 chuyến</strong>. Điểm chạm tỷ lệ chốt cực cao.</span></div>
          </li>
          <li style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🆕</span>
            <div><strong style={{ color: '#64748b', fontSize: '1.1rem' }}>Khách mới (New Customer):</strong> <span style={{ color: '#475569' }}>Khách chưa đi hoặc mới đi <strong>1 chuyến</strong>.</span></div>
          </li>
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

const ManualToursSOP = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(185, 28, 28, 0.4)' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
        <Shield size={36} color="#fca5a5" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Sản Phẩm Tour: Quy Định (SOP)</h1>
      </div>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '650px', lineHeight: 1.6 }}>
        Đây là bộ cốt lõi định hình mọi Sản Phẩm Tour Mẫu của FIT TOUR. Các quy trình này bắt buộc đối với phòng Product/Điều Hành để đảm bảo dữ liệu không bị gãy khi liên thông với Kế toán và Facebook Catalog.
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="1" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cú Pháp Đặt Mã SKU Bất Di Bất Dịch</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          <strong>Mã Tour (SKU Code)</strong> không chỉ là mã bề nổi. Nó là móc nối linh hồn vào Meta Catalog API. Nhập sai mã là rơi thẳng tiền quảng cáo xuống biển!
        </p>

        <div style={{ padding: '1.5rem', background: '#fef2f2', borderLeft: '5px solid #ef4444', borderRadius: '4px', color: '#991b1b', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, margin: '0 0 10px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> NGHIÊM CẤM TÊN CẢM TÍNH
          </h3>
          Cấm tuyệt đối đặt mã kiểu: <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>Tour-Thái-Rẻ</span>, <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>Thai2024</span>.<br/>
          Bắt buộc sử dụng cú pháp chuẩn: <strong>[MÃ ĐIỂM ĐI]-[MÃ ĐIỂM ĐẾN]-[THỜI LƯỢNG]</strong><br/>
          Ví dụ chuẩn: <strong style={{ color: '#dc2626' }}>HAN-BKK-05D4N</strong> (Từ Hà Nội - Đến Bangkok - 5 Ngày 4 Đêm).
        </div>
      </section>

      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="2" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Trạng Thái Ẩn/Hiện Chứ Không Xóa</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Khi một sản phẩm Tour "hết thời" hoặc đóng tuyến, Điều hành viên thường có thói quen xóa cho sạch kho. CRM cấm điều này.
        </p>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569', fontSize: '1.05rem' }}>
          <li>Hãy dùng chức năng <strong>Tắt trạng thái Active (Hiệu Lực)</strong>.</li>
          <li>Lịch khởi hành cũ của tour đó ở năm ngoái vẫn sẽ được lưu trữ nguyên vẹn để đối chiếu sổ sách. Vị khách đi tour đó năm ngoái vẫn sẽ còn Lịch sử trong Hồ sơ của họ.</li>
        </ul>
      </section>

      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="3" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Chặn Xóa Khi Đã Co Booking</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>
          Một khi Tour đã được bung ra thành "Lịch Khởi Hành" và Sales đã nhét khách thu tiền cọc vào chuyến đó: <strong>Lịch khởi hành đó bị khóa sống</strong>. Ngay lập tức, bạn không được phép thay đổi Lộ Trình Cốt Lõi (Số Ngày) của Tour mẫu nữa vì nó sẽ phá vỡ khế ước với những khách đã nạp tiền.
        </p>
      </section>
    </div>
  </>
);

const ManualToursGuide = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
        <Map size={36} color="#a7f3d0" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Tour & Lịch Trình: Hướng Dẫn Sử Dụng</h1>
      </div>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.6 }}>
        Trạm không lưu của phòng Điều hành: Tổ chức thư viện Sản phẩm, rải Lịch bay chuyến trên Calendar và rải Hướng Dẫn Viên.
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>A. Danh Mục Sản Phẩm Tour Mẫu (Sản phẩm Form)</h2>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Menu <strong>Sản phẩm Tour</strong> giống như Khuôn đúc mẫu. Nó giữ quy tắc chung chẳng hạn như mã code <em>(VD: HAN-BKK-01)</em>, hình đại diện và thời lượng tour. Bạn chỉ cần tạo khuôn 1 lần là có thể rải hàng chục Lịch khởi hành cho tháng đó.
        </p>
        <img src="/manual_images/tours_list_main_1775229170603.png" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} alt="Danh sách Tour Mẫu" />
      </section>

      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>B. Khai Phóng Lịch Khởi Hành (Departures Timeline)</h2>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Bạn sẽ bóc các mẫu Tour ra và chỉ định ngày khởi hành thực tế (VD: Tour BKK khởi hành từ ngày 10 tới ngày 14). Có 2 chế độ hiển thị: <strong>Lịch (Calendar)</strong> (trực quan theo ô Ngày) và <strong>Bảng (List)</strong> (thuận tiện để lọc sửa nháp).
        </p>
        <img src="/manual_images/departures_calendar_view_1775229184698.png" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} alt="Lịch Khởi Hành" />
        <div style={{ padding: '1rem 1.5rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '1.5rem' }}>
          <strong>💡 Tips Gán Xe & HDV:</strong> Ngay tại màn hình này, nhấp vào một lịch ban hành, bạn có quyền ốp ngay Hướng Dẫn Viên (Guides) sẽ tiếp nhận đoàn. Giao dịch này kết nối trực tiếp đến Lịch công tác của HDV.
        </div>
      </section>

      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>C. Quản lý Hồ sơ Hướng Dẫn Viên (Guides)</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              Menu Danh sách HDV lưu trữ lý lịch hợp tác: từ chứng chỉ ngoại ngữ, trạng thái làm việc (Rảnh/Bận), cho đến kinh nghiệm tác chiến tuyến đường đó.
            </p>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Bạn có quyền ấn định Mức độ Ưu tiên cho các Guide "Ruột" để vinh danh họ đẩy lên đầu danh sách chọn lựa khi có Lịch khởi hành mới.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '350px' }}>
            <img src="/manual_images/guides_list_main_1775229241538.png" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '10px' }} alt="Danh sách Guide" />
            <img src="/manual_images/add_guide_modal_1775229258128.png" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} alt="Tạo Guide" />
          </div>
        </div>
      </section>
    </div>
  </>
);

const ManualDeparturesSOP = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(185, 28, 28, 0.4)' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
        <Shield size={36} color="#fca5a5" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Lịch Khởi Hành: Quy Định (SOP)</h1>
      </div>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '650px', lineHeight: 1.6 }}>
        Đây là xương sống của lợi nhuận. Mọi tác vụ ở Lịch Khởi Hành ảnh hưởng trực tiếp đến BCTC (Báo Cáo Tài Chính) và Doanh thu thực nhận. Đề nghị tuân thủ quy tắc 100%.
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* CẤU TRÚC DỮ LIỆU */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="1" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cấu Trúc Dữ Liệu Master-Detail</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Hệ thống hoạt động theo mô hình <strong>2 cấp (Master → Detail)</strong>. Hiểu đúng cấu trúc này là nền tảng sống còn:
        </p>
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Cấp</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Chức năng</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Ví dụ</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontSize: '0.85rem', fontWeight: 600 }}>Sản phẩm Tour</span></td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Chứa thông tin cố định: Mã tour, Tên, BU, Thời lượng, Giá niêm yết. <strong>Không chứa ngày tháng.</strong></td>
                <td style={{ padding: '12px 16px', color: '#475569', fontStyle: 'italic' }}>SGN-BKK-05D4N (Tour Bangkok 5N4Đ)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontSize: '0.85rem', fontWeight: 600 }}>Lịch Khởi Hành</span></td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Một chuyến đi cụ thể: Ngày đi/về, Market, Số chỗ, HDV, Hành trình bay... Luôn gắn với 1 Sản phẩm Tour.</td>
                <td style={{ padding: '12px 16px', color: '#475569', fontStyle: 'italic' }}>Khởi hành 15/06, Về 19/06, 30 chỗ</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fef08a', color: '#854d0e', fontSize: '0.85rem', fontWeight: 600 }}>Booking</span></td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Đơn đặt chỗ: Số lượng pax, Giá, Đã cọc, Trạng thái, Danh sách thành viên đi kèm.</td>
                <td style={{ padding: '12px 16px', color: '#475569', fontStyle: 'italic' }}>BK-M8FG2: Chú Hoàng, 3 khách, 45tr</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fecaca', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600 }}>Phiếu Thu</span></td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Chứng từ thanh toán gắn với Booking. Tự động cộng/trừ tiền khi tạo/huỷ phiếu.</td>
                <td style={{ padding: '12px 16px', color: '#475569', fontStyle: 'italic' }}>PT-M8FG2-080426-A3: Thu 15tr cọc</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ padding: '1rem 1.5rem', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px', color: '#92400e', marginTop: '1.5rem' }}>
          <strong>QUY TẮC LIÊN KẾT:</strong> 1 Sản phẩm → Nhiều Lịch KH → Nhiều Booking → Nhiều Phiếu Thu. <strong>Xoá ngược lại cấm tuyệt đối</strong> khi đã có dữ liệu con.
        </div>
      </section>

      {/* VÒNG ĐỜI TRẠNG THÁI */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="2" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Vòng Đời Trạng Thái Tour (THỦ CÔNG)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Mỗi Lịch khởi hành có <strong>1 trong 5 trạng thái</strong>. Nhân viên vận hành (Operator) phải <strong>tự tay chuyển</strong> — hệ thống KHÔNG tự động:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', background: '#e0f2fe', borderRadius: '8px', flex: '1 1 180px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🔵</div>
            <strong style={{ color: '#0369a1' }}>Mở bán</strong>
            <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>Đang nhận đăng ký</p>
          </div>
          <div style={{ padding: '1rem', background: '#fce7f3', borderRadius: '8px', flex: '1 1 180px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🩷</div>
            <strong style={{ color: '#be185d' }}>Chắc chắn đi</strong>
            <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>Đủ khách, chốt bay/KS</p>
          </div>
          <div style={{ padding: '1rem', background: '#f3e8ff', borderRadius: '8px', flex: '1 1 180px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🟣</div>
            <strong style={{ color: '#7c3aed' }}>Đã đầy</strong>
            <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>Hết chỗ hoàn toàn</p>
          </div>
          <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '8px', flex: '1 1 180px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🟢</div>
            <strong style={{ color: '#166534' }}>Hoàn thành</strong>
            <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>Tour kết thúc, chốt sổ</p>
          </div>
          <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', flex: '1 1 180px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🔴</div>
            <strong style={{ color: '#991b1b' }}>Huỷ</strong>
            <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>Thiếu khách / Sự cố</p>
          </div>
        </div>
        <div style={{ padding: '1rem 1.5rem', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '4px', color: '#991b1b' }}>
          <strong>⚠️ NGHIÊM CẤM:</strong> Không được chuyển Tour về "Mở bán" hoặc "Giữ chỗ" nếu đã có khách cọc tiền. Kế toán sẽ không khớp được sổ.
        </div>
      </section>

      {/* OVERBOOKING */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="3" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Nguyên Tắc "Quỹ Chỗ" & Chống Bán Vượt (Overbooking Guard)</h2>
        </div>
        <div style={{ padding: '1.5rem', background: '#fef2f2', borderLeft: '5px solid #ef4444', borderRadius: '4px', color: '#991b1b', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, margin: '0 0 10px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> HỆ THỐNG TỰ ĐỘNG CHẶN
          </h3>
          Mỗi khi Sale tạo hoặc sửa Booking, hệ thống sẽ:<br/>
          1. Cộng tổng pax_count của mọi booking hiện có (trừ booking Huỷ và booking đang sửa)<br/>
          2. Nếu <strong>(đã bán + mới) {'>'} Tổng chỗ</strong> → <strong>TỪ CHỐI</strong> kèm thông báo:<br/>
          <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '4px', marginTop: '0.75rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            "QUÁ SỐ CHỖ: Tour chỉ còn X chỗ. Vui lòng bật 'Cho bán quá chỗ' trong cài đặt Tour."
          </div>
        </div>
        <div style={{ padding: '1rem 1.5rem', background: '#f0fdf4', borderLeft: '4px solid #22c55e', borderRadius: '4px', color: '#166534' }}>
          <strong>💡 NGOẠI LỆ:</strong> Nếu Điều hành viên BẬT tùy chọn <strong>"Cho bán quá chỗ" (allow_overbooking)</strong> trong cài đặt Tour → hệ thống sẽ bỏ qua kiểm tra, cho booking vượt. Chỉ dùng khi đã thương lượng thêm xe/ghế.
        </div>
      </section>

      {/* COSTING */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="4" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Bảng Dự Toán (Costing): Lập Trước, Bán Sau</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Việc ban hành Lịch khởi hành mà không có Bảng Dự Toán (Land Tour, Khách Sạn, Xe, Máy bay) là <strong>tối kỵ</strong>. Bộ phận Sales cần nhìn vào Bảng Costing để biết giá Sàn được phép bán bao nhiêu để không âm vốn.
        </p>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569', fontSize: '1.05rem' }}>
          <li>Điều hành viên BẮT BUỘC lên Dự Toán (Costings) trước khi bật trạng thái ACTIVE (Cho bán) cho Lịch Khởi Hành.</li>
          <li>Tuyệt đối không chốt đoàn khi chưa cập nhật Chi phí Phụ khoản (bảo hiểm, hoa hồng tài xế).</li>
        </ul>
      </section>

      {/* LƯU Ý VẬN HÀNH */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="5" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Lưu Ý Vận Hành Quan Trọng</h2>
        </div>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569', fontSize: '1.05rem' }}>
          <li><strong>Không bao giờ xoá Sản phẩm Tour</strong> nếu đang có Lịch khởi hành gắn liền — sẽ mất toàn bộ liên kết lịch sử.</li>
          <li><strong>Luôn kiểm tra "Cho bán quá chỗ"</strong> trước khi mở bán tour cận ngày — tránh bị hệ thống chặn booking.</li>
          <li><strong>Huỷ Phiếu Thu</strong> sẽ tự động trừ tiền — không cần chỉnh tay số tiền "Đã cọc" của Booking.</li>
          <li><strong>Export Excel</strong> chỉ xuất thành viên của Booking chưa huỷ (tự động bỏ qua booking "Huỷ/Hủy").</li>
          <li><strong>Xoá Tour</strong> chỉ được phép khi Tour đó chưa có booking nào. Hệ thống sẽ từ chối kèm thông báo số lượng booking hiện có.</li>
        </ul>
      </section>

    </div>
  </>
);

const ManualDeparturesGuide = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
        <Calendar size={36} color="#bfdbfe" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Lịch Khởi Hành: HDSD & Hệ Thống Tự Động</h1>
      </div>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.6 }}>
        Khám phá 5 động cơ bán tự động (Auto-Engine) vận hành ngầm giúp hệ thống thông minh hóa toàn bộ quy trình từ đặt chỗ đến thanh toán.
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* BỘ LỌC */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="1" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Bộ Lọc Đa Chiều (9 Bộ Lọc)</h2>
        </div>
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Bộ lọc</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Cách hoạt động</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>🔍 Tìm kiếm</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Lọc theo Mã tour hoặc Tên tour (không phân biệt hoa thường)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>📦 Sản phẩm Tour</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Dropdown chọn Template gốc — chỉ hiển thị Departure thuộc template đó</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>📅 Ngày Khởi hành</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Chỉ hiển thị tour có start_date ≥ ngày chọn</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>📅 Ngày Kết thúc</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Chỉ hiển thị tour có end_date ≤ ngày chọn</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>🕐 Ngày tạo</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Lọc tour tạo từ ngày chọn trở đi</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>🏷️ Tình trạng</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Mở bán / Chắc chắn đi / Đã đầy / Hoàn thành / Huỷ</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>💰 TT Thanh toán</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Chưa thanh toán / Đã cọc</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>🌏 Market (Pills)</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Nút bo tròn lọc nhanh theo khu vực: Đông Á, ASEAN, Trung Á...</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>👤 NVĐH / Duyệt</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>Lọc theo tên nhân viên điều hành ghi trong tour_info</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* AUTO-CONVERT */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="2" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>🤖 Auto-Convert: Hành Khách → Khách Hàng</h2>
        </div>
        <div style={{ padding: '1rem 1.5rem', background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '4px', color: '#1e3a8a', marginBottom: '1.5rem' }}>
          <strong>KHI NÀO CHẠY:</strong> Tự động mỗi khi tạo Booking MỚI (không chạy khi sửa).
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1rem' }}>
          Hệ thống quét danh sách thành viên (members) trong Booking và xử lý từng người:
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>✅ SĐT đã tồn tại</h3>
            <p style={{ color: '#15803d', margin: 0, fontSize: '0.95rem' }}>Cập nhật bổ sung CMND, DOB. Tăng past_trip_count +1. Tái tính hạng VIP.</p>
          </div>
          <div style={{ flex: 1, minWidth: '250px', background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <h3 style={{ color: '#1e3a8a', fontWeight: 700, marginBottom: '0.5rem' }}>🆕 SĐT chưa có</h3>
            <p style={{ color: '#1e40af', margin: 0, fontSize: '0.95rem' }}>Tạo Customer mới với role = 'passenger'. Gán hạng VIP theo số chuyến.</p>
          </div>
          <div style={{ flex: 1, minWidth: '250px', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>🚫 Bỏ qua khi</h3>
            <p style={{ color: '#475569', margin: 0, fontSize: '0.95rem' }}>SĐT trùng với Booker, Tên mặc định "Khách ...", hoặc không có SĐT.</p>
          </div>
        </div>
      </section>

      {/* VIP ENGINE */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="3" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>🤖 VIP Engine: Phân Hạng Tự Động</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Chạy song song với Auto-Convert. Hệ thống <strong>tự động quét sạch danh sách (Recalculate)</strong> mỗi khi có biến động để đảm bảo hạng VIP luôn chính xác 100%.
        </p>
        <div style={{ padding: '1rem', background: '#f0f9ff', borderLeft: '4px solid #0284c7', color: '#0369a1', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <strong>CƠ CHẾ:</strong> Tổng số chuyến = past_trip_count (nhập gốc) + crm_trip_count (đếm tất cả bookings KHÁC 'Mới' và 'Huỷ').
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.3rem' }}>⭐⭐⭐</span>
            <div><strong style={{ color: '#dc2626' }}>VIP 1:</strong> <span style={{ color: '#475569' }}>≥ 7 chuyến</span></div>
          </div>
          <div style={{ padding: '0.75rem 1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.3rem' }}>⭐⭐</span>
            <div><strong style={{ color: '#d97706' }}>VIP 2:</strong> <span style={{ color: '#475569' }}>≥ 4 chuyến</span></div>
          </div>
          <div style={{ padding: '0.75rem 1rem', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.3rem' }}>⭐</span>
            <div><strong style={{ color: '#7c3aed' }}>VIP 3:</strong> <span style={{ color: '#475569' }}>≥ 3 chuyến</span></div>
          </div>
          <div style={{ padding: '0.75rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🏅</span>
            <div><strong style={{ color: '#2563eb' }}>Repeat Customer:</strong> <span style={{ color: '#475569' }}>≥ 2 chuyến</span></div>
          </div>
          <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🆕</span>
            <div><strong style={{ color: '#64748b' }}>New Customer:</strong> <span style={{ color: '#475569' }}>1 chuyến</span></div>
          </div>
        </div>
      </section>

      {/* AUTO PAYMENT STATUS */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="4" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>🤖 Auto Payment Status: Trạng Thái Booking Theo Tiền</h2>
        </div>
        <div style={{ padding: '1rem 1.5rem', background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '4px', color: '#1e3a8a', marginBottom: '1.5rem' }}>
          <strong>KHI NÀO CHẠY:</strong> Mỗi khi tạo hoặc huỷ <strong>Phiếu Thu</strong> (Payment Voucher). Không cần Sale chỉnh tay.
        </div>
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Điều kiện</th>
                <th style={{ padding: '12px 16px', color: '#334155', fontWeight: 700 }}>Trạng thái Booking tự chuyển thành</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', color: '#475569' }}>paid ≥ total_price (và total_price {'>'} 0)</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontWeight: 600 }}>Đã thanh toán</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', color: '#475569' }}>0 {'<'} paid {'<'} total_price</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fef08a', color: '#854d0e', fontWeight: 600 }}>Đã đặt cọc</span></td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', color: '#475569' }}>paid = 0 (sau khi huỷ phiếu)</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}>Giữ chỗ</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ padding: '1rem 1.5rem', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px', color: '#92400e', marginTop: '1.5rem' }}>
          <strong>KHI HUỶ PHIẾU THU:</strong> Hệ thống tự động trừ ngược số tiền trong phiếu ra khỏi booking.paid, sau đó tái tính trạng thái booking theo bảng trên. Kế toán không cần chỉnh tay.
        </div>
      </section>

      {/* PERMISSION GUARD */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="5" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>🤖 Permission Guard: Phân Quyền Chỉnh Sửa Booking</h2>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>✅ Admin / Manager / Operator</h3>
            <p style={{ color: '#15803d', margin: 0, fontSize: '0.95rem' }}>Có quyền sửa/huỷ MỌI Booking trong hệ thống, bất kể ai tạo.</p>
          </div>
          <div style={{ flex: 1, minWidth: '250px', background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <h3 style={{ color: '#991b1b', fontWeight: 700, marginBottom: '0.5rem' }}>🔒 Sales / Staff</h3>
            <p style={{ color: '#b91c1c', margin: 0, fontSize: '0.95rem' }}>Chỉ được sửa Booking do chính mình tạo (created_by). Vi phạm → <strong>HTTP 403 Lỗi Phân Quyền.</strong></p>
          </div>
        </div>
      </section>

      {/* LIÊN KẾT SẢN PHẨM */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="6" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Liên kết Sản phẩm Tour ↔ Lịch Khởi Hành</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Hai tab <strong>Sản phẩm Tour</strong> và <strong>Lịch Khởi Hành</strong> liên thông 2 chiều:
        </p>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569', fontSize: '1.05rem' }}>
          <li><strong>Từ Sản phẩm → Lịch sử:</strong> Click icon 👁️ trên hàng Sản phẩm Tour → Modal hiện tab "LỊCH SỬ KHỞI HÀNH" liệt kê mọi chuyến đi của template đó.</li>
          <li><strong>Nhảy nhanh sang chi tiết:</strong> Trong tab Lịch sử, click 👁️ trên bất kỳ chuyến nào → Hệ thống tự động navigate sang tab Lịch Khởi Hành và mở Drawer chi tiết chuyến đó ngay lập tức.</li>
          <li><strong>Export toàn bộ khách:</strong> Nút Export trên thanh công cụ xuất file .xlsx chuẩn FIT Tour bao gồm toàn bộ thành viên, Hộ chiếu, Giá, Cọc, Trạng thái thanh toán.</li>
        </ul>
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
      case 'departures-sop': return <ManualDeparturesSOP />;
      case 'departures-guide': return <ManualDeparturesGuide />;
      case 'tours-sop': return <ManualToursSOP />;
      case 'tours-guide': return <ManualToursGuide />;
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
