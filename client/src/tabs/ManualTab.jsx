import React from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Shield, Target, FileText, Users, Map, ShoppingCart } from 'lucide-react';

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

const ManualLeads = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>Nghiệp Vụ: Quản Lý Lead Marketing</h1>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '650px', lineHeight: 1.6 }}>
        Đây là quy trình chuẩn để các bạn Sale xử lý Data (Khách tiềm năng). Giúp bạn không bỏ sót bất kỳ ai, theo dõi được tiến độ chốt sale và tạo tệp khách hàng sạch sẽ.
      </p>
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* STEP 1 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="1" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Thêm mới Khách Tiềm Năng (Tạo Lead)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Ngay khi nhận được thông tin khách hàng (từ gọi điện thoại trực tiếp, nhắn tin Zalo cá nhân, v.v.), bạn cần mở tab <strong>Lead Marketing</strong> và nhấn nút <strong>"THÊM MỚI"</strong> ở góc phải màn hình.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>Các trường bắt buộc nhập:</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Tên khách hàng:</strong> Nhập tên thật để tiện giao tiếp.</li>
              <li><strong>Số điện thoại:</strong> Rất quan trọng để tránh trùng lặp.</li>
              <li><strong>Nguồn (Source):</strong> Chọn <em>Zalo</em>, <em>Hotline</em>, <em>Tiktok</em>... để đo lường.</li>
              <li><strong>Sản phẩm quan tâm:</strong> Chọn Tour mà khách đang hỏi.</li>
            </ul>
          </div>
          <div style={{ flex: 1, minWidth: '250px', background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>💡 Tính năng Auto-Capture:</h3>
            <p style={{ color: '#166534', fontSize: '0.95rem' }}>Hệ thống đã kết nối trực tiếp với <strong>Fanpage Meta</strong>. Bất cứ khi nào có khách hàng nhắn tin tới Fanpage, hệ thống sẽ <strong>tự động đẻ ra 1 dòng Lead mới</strong> với phân loại "MESSENGER". Bạn không cần nhập tay các khách này!</p>
          </div>
        </div>
      </section>

      {/* STEP 2 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="2" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cách đọc Bảng dữ liệu Lead</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Danh sách Lead đưa cho bạn cái nhìn tổng quan. Nếu ảnh chụp bên dưới quá nhỏ, bạn có thể cuộn trang ngay bên trong khung ảnh để xem.
        </p>

        {/* CROP ẢNH BẰNG OBJECT-FIT COVER THAY VÌ SCROLL BOX */}
        <div style={{ height: '550px', overflow: 'hidden', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <img src="/manual_images/leads_page_full_1775228553928.png" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} alt="Giao diện danh sách Lead" />
        </div>

        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#475569', fontSize: '1.05rem' }}>
          <li><strong>Trạng thái (Status):</strong> Bạn có thể đổi trạng thái nhanh trực tiếp trên bảng. Khách dạo hỏi giá {'->'} <em>Im Lặng</em>. Khách đang cấn tiền {'->'} <em>Đang Follow</em>.</li>
          <li><strong>Chấm đỏ thông báo:</strong> Khi khách Facebook nhắn tin lại cho bạn, hệ thống sẽ tự nổi nhãn <em>"Có thay đổi mới"</em> cho Lead đó để bạn biết đường vào tư vấn tiếp.</li>
        </ul>
      </section>

      {/* STEP 3 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="3" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Ghi chú Tư Vấn (Take Notes)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Ở cột ngoài cùng bên phải chữ <strong>Thao tác</strong>, hãy ấn vào biểu tượng 💬 (Hình tin nhắn) để mở Cửa sổ Ghi chú (Notes).
        </p>
        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderLeft: '4px solid #3b82f6', borderRadius: '4px', color: '#334155', marginBottom: '1.5rem' }}>
          <strong>Lệnh bắt buộc:</strong> Bất kể bạn tư vấn điện thoại hay Zalo, sau khi kết thúc bạn <strong>phải tóm tắt</strong> nhu cầu khách vào Note này. <em>Ví dụ: "Khách hỏi Tour Nhật, đang đợi rủ Theam building công ty, hẹn thứ 6 gọi lại"</em>. 
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>
          Quản lý sẽ xem lịch sử Notes để đánh giá độ nỗ lực của Sale. Lịch sử Notes sẽ không bao giờ bị xóa.
        </p>
      </section>

      {/* STEP 4 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="4" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Chốt Đơn & Chuyển đổi thành Khách Hàng</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Khi khách đồng ý chốt đi Tour và chuần bị chuyển khoản cọc, đây là lúc bạn <strong>Convert (Chuyển đổi)</strong> Lead này. 
        </p>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569', fontSize: '1.05rem' }}>
          <li>Nhấn vào biểu tượng <strong>👤+ (Hình người có dấu cộng)</strong> ở cột cuối cùng.</li>
          <li>Hệ thống khóa trạng thái Lead này vĩnh viễn hành <strong>"Chốt đơn"</strong>.</li>
          <li>Đồng thời, hệ thống tự động bốc tất cả dữ liệu (Số điện thoại, Notes, Profile Facebook) và đẻ ra 1 Hồ Sơ mới tại bảng <strong>Danh Mục Khách Hàng</strong>.</li>
          <li>Từ lúc này, bạn chuyển sang bộ phận Điều hành / Kế toán tạo Đơn hàng (Booking) mà hoàn toàn không cần phải nhập tay lại thông tin khách.</li>
        </ul>
      </section>

    </div>
  </>
);

const ManualCustomers = () => (
  <>
    <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '3rem 2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>Nghiệp Vụ: Danh Mục Khách Hàng</h1>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '650px', lineHeight: 1.6 }}>
        Trái tim của hệ thống CRM. Nơi quản lý dữ liệu vĩnh viễn của hành khách, tự động phát hiện số điện thoại trùng lặp và lưu vết lịch sử mọi giao dịch.
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* STEP 1 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="1" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Tạo Khách Hàng & Nguồn Gốc Dữ Liệu</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Khách hàng trong danh mục này xuất phát từ hai nguồn chính:
        </p>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#475569', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
          <li><strong>Thêm trực tiếp:</strong> Dùng cho người đại diện hoặc thành viên đoàn khi tạo Đơn hàng (Booking).</li>
          <li><strong>Chuyển đổi từ Lead:</strong> Nút Convert bên bảng Lead sẽ tự đẩy toàn bộ thông tin (Tên, SĐT, Ghi chú) sang đây, tiết kiệm 100% thời gian nhập liệu.</li>
        </ul>
        <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <h3 style={{ color: '#1e3a8a', fontWeight: 700, marginBottom: '0.5rem' }}>Hồ Sơ 360 Độ:</h3>
          <p style={{ color: '#1e40af', fontSize: '1rem', margin: 0 }}>
            Mỗi khách hàng mang một <strong>Hồ sơ trọn đời</strong>. Bạn có thể lưu Passport, Visa, Ghi chú y tế (Dị ứng, ăn dặm). Bất cứ Sale nào bấm vào khách hàng này đều thấy toàn bộ <strong>Lịch sử Đơn Hàng (Booking)</strong> mà họ từng tham gia trong quá khứ!
          </p>
        </div>
      </section>

      {/* STEP 2 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="2" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cơ Chế Chống Trùng Lặp (Anti-Duplicate)</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Đây là siêu năng lực của CRM giúp dẹp bỏ tình trạng "Một khách có 5 file Excel khác nhau". CRM lấy <strong>Số Điện Thoại (SĐT)</strong> làm định danh gốc.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <h3 style={{ color: '#991b1b', fontWeight: 700, marginBottom: '0.5rem' }}>🚨 Báo Động Đỏ:</h3>
            <p style={{ color: '#991b1b', margin: 0, fontSize: '0.95rem' }}>Hãy thử tạo một Khách hàng với SĐT đã có sẵn. Hệ thống sẽ cạch mặt bạn ngay lập tức với cảnh báo đỏ chót "Số điện thoại này đã tồn tại ở khách hàng ABC".</p>
          </div>
          <div style={{ flex: 1, minWidth: '250px', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>Tự Động Gộp (Merge):</h3>
            <p style={{ color: '#475569', margin: 0, fontSize: '0.95rem' }}>Thay vì tạo thùng rác data, bạn chọn chức năng <strong>Gộp (Merge)</strong>. Dữ liệu mới nhất sẽ được vá vào hồ sơ cũ, giữ cho data của công ty luôn sạch sẽ.</p>
          </div>
        </div>
      </section>

      {/* STEP 3 */}
      <section style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <StepBadge num="3" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Nguyên Tắc Dữ Liệu "Tiền Trảm Hậu Tấu"</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Rất nhiều người thắc mắc: <em>Tại sao tôi không thấy nút <strong>Xóa hẳn</strong> Khách hàng?</em>
        </p>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>
          Lý do là vì Khách hàng có liên kết rễ má với Đơn hàng và Lịch khởi hành. Nếu xóa mất, Kế toán sẽ không biết khoản tiền kia là của ai. <br/>
          Thay vào đó, FIT TOUR áp dụng cơ chế <strong>Xóa Mềm (Soft-delete)</strong>. Bạn bấm vào nút [Khóa] màu xám, khách hàng đó sẽ tàng hình khỏi danh sách chọn khi Sales tạo Booking, nhưng lịch sử dòng tiền Kế toán xuất ra vẫn giữ nguyên vẹn.
        </p>
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
      case 'leads': return <ManualLeads />;
      case 'customers': return <ManualCustomers />;
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
