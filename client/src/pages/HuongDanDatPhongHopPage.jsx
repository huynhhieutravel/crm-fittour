import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, CheckCircle, 
  ChevronLeft, ChevronRight, Maximize2, X, Share2, Printer, 
  HelpCircle, AlertTriangle, ShieldCheck, Users, FileText,
  Sparkles, Check, ChevronDown, ChevronUp, Laptop, Coffee
} from 'lucide-react';
import toast from 'react-hot-toast';
import ErpGuideLayout from '../components/ErpGuideLayout';
import '../styles/erp-guide.css';

const STEPS_DATA = [
  {
    step: 1,
    title: 'Mở Menu Tài Khoản & Chọn "Xem Phòng Họp"',
    shortTitle: 'Bước 1: Mở Menu',
    badgeText: 'Thao tác nhanh • 10 giây',
    image: '/images/huong-dan/dat-phong-hop/step1-menu-phong-hop.png',
    caption: 'Giao diện Header ERP FIT Tour: Nhấp vào Avatar góc trên bên phải để chọn "Xem Phòng Họp"',
    desc: 'Từ bất kỳ màn hình nào trong ERP FIT Tour, bạn đều có thể truy cập nhanh vào bàn làm việc Lịch Phòng Họp công ty.',
    actions: [
      {
        icon: '1',
        title: 'Nhấp vào ảnh đại diện (Avatar)',
        detail: 'Tại góc trên bên phải thanh điều hướng Header, nhấp vào ảnh đại diện hoặc tên tài khoản của bạn.'
      },
      {
        icon: '2',
        title: 'Chọn mục "🏢 Xem Phòng Họp"',
        detail: 'Trong danh sách menu thả xuống, nhấp chọn dòng chữ mang tên "🏢 Xem Phòng Họp" (hoặc truy cập trực tiếp link /meeting-rooms).'
      },
      {
        icon: '3',
        title: 'Chuyển đến màn hình Lịch Phòng Họp',
        detail: 'Hệ thống sẽ chuyển bạn đến giao diện quản lý lịch phòng họp trực quan hiển thị theo lịch biểu tháng.'
      }
    ],
    tip: 'Mẹo: Bạn có thể lưu lối tắt trang /meeting-rooms vào mục "Lối Tắt Làm Việc" ở thanh sidebar bên trái để truy cập mỗi ngày.',
    highlightTag: 'Menu Profile > 🏢 Xem Phòng Họp'
  },
  {
    step: 2,
    title: 'Xem Lịch Tổng Quan & Bấm "+ New Booking"',
    shortTitle: 'Bước 2: Xem Lịch & Bấm Đặt',
    badgeText: 'Trực quan • Xem theo Ngày / Tuần / Tháng',
    image: '/images/huong-dan/dat-phong-hop/step2-xem-lich-va-bam-dat.png',
    caption: 'Giao diện Lịch Phòng Họp: Xem các khung giờ đã có lịch và bấm nút "+ New Booking"',
    desc: 'Quan sát tình trạng sử dụng phòng họp để chọn khung giờ trống phù hợp, tránh xung đột lịch với các BU khác.',
    actions: [
      {
        icon: '1',
        title: 'Quan sát các cuộc họp đã lên lịch',
        detail: 'Các cuộc họp đã được đặt sẽ hiển thị thẻ màu đại diện theo từng phòng ban/BU (Họp khách, Họp sale BU3, Tiếp đối tác Tropicana, Họp Marketing...).'
      },
      {
        icon: '2',
        title: 'Chuyển đổi chế độ xem (Day / Week / Month)',
        detail: 'Bạn có thể chọn xem theo Ngày (Day), Tuần (Week) hoặc Tháng (Month) ở góc phải trên để xem chi tiết từng khung giờ.'
      },
      {
        icon: '3',
        title: 'Bấm nút "+ New Booking"',
        detail: 'Nhấp vào nút màu đen "+ New Booking" ở góc trên bên phải màn hình (hoặc bấm trực tiếp vào ô ngày cần họp trên lịch).'
      },
      {
        icon: '4',
        title: 'Kiểm tra trạng thái phòng',
        detail: 'Huy hiệu xanh lá "Available all day" cho biết phòng họp đang mở và sẵn sàng tiếp nhận lịch mới.'
      }
    ],
    tip: 'Lưu ý: Nếu cần xem ai là người chủ trì cuộc họp, bạn chỉ cần rê chuột (hover) vào thẻ cuộc họp trên lịch để xem popup thông tin.',
    highlightTag: 'Bấm nút "+ New Booking"'
  },
  {
    step: 3,
    title: 'Điền Thông Tin Cuộc Họp & Bấm "Đặt Phòng"',
    shortTitle: 'Bước 3: Điền & Xác Nhận',
    badgeText: 'Lưu tức thì • Cập nhật lịch toàn công ty',
    image: '/images/huong-dan/dat-phong-hop/step3-dien-thong-tin-va-xac-nhan.png',
    caption: 'Modal Đặt phòng họp mới: Điền tiêu đề, chọn BU, khung giờ và bấm "Đặt phòng"',
    desc: 'Hoàn thiện thông tin cuộc họp trong pop-up và bấm xác nhận để hệ thống lưu lịch họp vào cơ sở dữ liệu chung.',
    actions: [
      {
        icon: '1',
        title: 'Tiêu đề cuộc họp (*)',
        detail: 'Nhập tên cuộc họp ngắn gọn, rõ ràng (Ví dụ: Họp phòng Marketing, Phỏng vấn nhân viên, Họp khách hàng BU1...).'
      },
      {
        icon: '2',
        title: 'Chọn Ngày họp & Đơn vị Business Unit (BU)',
        detail: 'Chọn ngày diễn ra cuộc họp trên bộ lịch và chọn BU phụ trách (BU1, BU2, BU3, BU4, BU5 hoặc Khác).'
      },
      {
        icon: '3',
        title: 'Chọn Khung giờ (Từ giờ ➔ Đến giờ)',
        detail: 'Thiết lập giờ bắt đầu và giờ kết thúc cuộc họp. Đảm bảo thời gian kết thúc phải sau thời gian bắt đầu.'
      },
      {
        icon: '4',
        title: 'Mô tả / Ghi chú (Thành viên & Thiết bị)',
        detail: 'Ghi chú tóm tắt nội dung, danh sách người tham gia hoặc yêu cầu chuẩn bị máy chiếu, micro, bảng viết nếu cần.'
      },
      {
        icon: '5',
        title: 'Bấm nút "Đặt phòng" màu xanh',
        detail: 'Bấm Đặt phòng để hoàn tất. Cuộc họp sẽ lập tức hiển thị trên màn hình lịch chung của toàn công ty.'
      }
    ],
    tip: 'Mẹo: Sau khi đặt, bạn có thể bấm trực tiếp vào thẻ cuộc họp đó để sửa thông tin hoặc xóa lịch nếu kế hoạch thay đổi.',
    highlightTag: 'Bấm nút "Đặt phòng"'
  }
];

const DATA_FIELDS = [
  {
    name: 'Tiêu đề cuộc họp',
    required: true,
    type: 'Văn bản (Text input)',
    desc: 'Tên cuộc họp để toàn công ty nhận biết nội dung (Ví dụ: Họp team Marketing, Tiếp đối tác, Phỏng vấn ứng viên...).'
  },
  {
    name: 'Ngày họp',
    required: true,
    type: 'Bộ chọn ngày (Date input)',
    desc: 'Ngày tổ chức cuộc họp. Mặc định là ngày hôm nay hoặc ngày bạn đã nhấp chọn trên lịch biểu.'
  },
  {
    name: 'Business Unit (BU)',
    required: true,
    type: 'Dropdown danh sách BU',
    desc: 'Chọn BU phụ trách (BU1, BU2, BU3, BU4, BU5 hoặc Khác). Màu sắc thẻ cuộc họp trên lịch sẽ đổi theo BU tương ứng.'
  },
  {
    name: 'Từ giờ (Start Time)',
    required: true,
    type: 'Giờ:Phút (Time picker)',
    desc: 'Thời điểm bắt đầu sử dụng phòng họp (Ví dụ: 09:00, 14:30).'
  },
  {
    name: 'Đến giờ (End Time)',
    required: true,
    type: 'Giờ:Phút (Time picker)',
    desc: 'Thời điểm kết thúc cuộc họp và trả lại phòng. Bắt buộc phải sau thời điểm bắt đầu.'
  },
  {
    name: 'Mô tả / Ghi chú',
    required: false,
    type: 'Đoạn văn (Textarea)',
    desc: 'Ghi chú danh sách thành viên tham dự, tài liệu cuộc họp hoặc các thiết bị cần sử dụng (máy chiếu, micro, bảng viết...).'
  }
];

const FAQS = [
  {
    q: 'Sau khi đặt phòng xong, tôi có thể sửa giờ hoặc hủy cuộc họp được không?',
    a: 'Được. Bạn chỉ cần nhấp trực tiếp vào thẻ cuộc họp của mình trên lịch biểu, cửa sổ "Chi tiết lịch họp" sẽ xuất hiện kèm các nút "Chỉnh sửa" hoặc "Xóa lịch họp".'
  },
  {
    q: 'Hệ thống có cảnh báo nếu bị trùng khung giờ phòng họp không?',
    a: 'Có. Khi bạn chọn khung giờ đã có BU khác đăng ký trước đó, hệ thống sẽ kiểm tra và hiển thị thông báo để bạn chọn khung giờ khác phù hợp hơn.'
  },
  {
    q: 'Ai có quyền đặt phòng họp trên hệ thống ERP FIT Tour?',
    a: 'Toàn thể Cán bộ – Nhân viên có tài khoản đăng nhập ERP FIT Tour đều có thể chủ động đặt phòng họp phục vụ công việc.'
  },
  {
    q: 'Nếu cuộc họp có khách VIP hoặc đối tác cần máy chiếu thì ghi chú ở đâu?',
    a: 'Bạn hãy ghi rõ yêu cầu thiết bị (Ví dụ: "Cần máy chiếu, micro, phòng tiếp khách VIP") vào ô "Mô tả / Ghi chú" để bộ phận hành chính hỗ trợ chuẩn bị chu đáo trước giờ họp.'
  }
];

export default function HuongDanDatPhongHopPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  const activeStep = STEPS_DATA[currentStepIndex];

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') {
      setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS_DATA.length - 1));
    } else if (e.key === 'ArrowLeft') {
      setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setLightboxImage(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const openLightbox = (imgSrc, title) => {
    setLightboxImage(imgSrc);
    setLightboxTitle(title);
  };

  return (
    <ErpGuideLayout currentGuideId="dat-phong-hop">
      {/* ── Hero Section ── */}
      <header className="erp-guide-hero" style={{ paddingBottom: '24px' }}>
        <div className="erp-hero-inner">
          <div className="erp-breadcrumbs">
            <Link to="/">Trang chủ CRM</Link>
            <span>/</span>
            <Link to="/huong-dan-erp">Hướng dẫn ERP</Link>
            <span>/</span>
            <span className="active">Đặt phòng họp</span>
          </div>

          <div className="erp-hero-header-row">
            <div className="erp-hero-title-group">
              <h1>Hướng Dẫn Sử Dụng ERP: Đăng Ký & Đặt Phòng Họp</h1>
              <p className="erp-hero-desc">
                Cẩm nang hướng dẫn thao tác kiểm tra lịch trống, đăng ký phòng họp nội bộ và tiếp khách trên hệ thống ERP FIT Tour. Trực quan theo lịch biểu Ngày / Tuần / Tháng, tránh xung đột khung giờ giữa các BU.
              </p>

              <div className="erp-hero-meta-tags">
                <span className="erp-meta-tag">
                  <CheckCircle size={14} color="#10b981" /> Phiên bản ERP 2026
                </span>
                <span className="erp-meta-tag">
                  <Clock size={14} color="#3b82f6" /> 1 phút thực hiện
                </span>
                <span className="erp-meta-tag">
                  <Users size={14} color="#8b5cf6" /> Toàn thể CBNV
                </span>
                <span className="erp-meta-tag">
                  <ShieldCheck size={14} color="#f59e0b" /> Quy định sử dụng phòng họp
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="erp-guide-main">
        {/* ── SECTION 1: INTERACTIVE SLIDER ── */}
        <section className="erp-slider-section" id="slider-section">
          {/* Stepper Tab Bar */}
          <div className="erp-slider-stepper">
            {STEPS_DATA.map((st, idx) => {
              const isActive = idx === currentStepIndex;
              return (
                <button
                  key={st.step}
                  className={`erp-step-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentStepIndex(idx)}
                >
                  <div className="erp-step-tab-badge">{st.step}</div>
                  <div className="erp-step-tab-info">
                    <h4>{st.shortTitle}</h4>
                    <p>{st.badgeText}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Slide Content Grid */}
          <div className="erp-slide-body">
            {/* Left Column: Detailed Instructions */}
            <div className="erp-slide-instruction">
              <div>
                <span className="erp-slide-step-badge">
                  <Sparkles size={13} /> {activeStep.badgeText}
                </span>
                <h3 className="erp-slide-title">{activeStep.title}</h3>
                <p className="erp-slide-desc">{activeStep.desc}</p>

                {/* Step Actions Checklist */}
                <ul className="erp-step-action-list">
                  {activeStep.actions.map((act, actIdx) => (
                    <li key={actIdx} className="erp-step-action-item">
                      <div className="erp-item-icon">{act.icon}</div>
                      <div>
                        <strong style={{ color: '#0f172a' }}>{act.title}: </strong>
                        <span>{act.detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Callout Tip Box */}
                <div className="erp-slider-tip">
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong>Mẹo / Lưu ý: </strong>
                    <span>{activeStep.tip}</span>
                  </div>
                </div>
              </div>

              {/* Slider Bottom Controls */}
              <div className="erp-slider-controls">
                <div className="erp-slider-dots">
                  {STEPS_DATA.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      className={`erp-dot ${dotIdx === currentStepIndex ? 'active' : ''}`}
                      onClick={() => setCurrentStepIndex(dotIdx)}
                      title={`Đến bước ${dotIdx + 1}`}
                    />
                  ))}
                  <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                    Bước {currentStepIndex + 1} / {STEPS_DATA.length}
                  </span>
                </div>

                <div className="erp-slider-btn-group">
                  <button
                    className="erp-ctrl-btn"
                    onClick={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentStepIndex === 0}
                  >
                    <ChevronLeft size={16} /> Quay lại
                  </button>

                  {currentStepIndex < STEPS_DATA.length - 1 ? (
                    <button
                      className="erp-ctrl-btn primary-ctrl"
                      onClick={() => setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS_DATA.length - 1))}
                    >
                      Bước tiếp theo <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      className="erp-ctrl-btn primary-ctrl"
                      onClick={() => {
                        toast.success('Bạn đã xem hết các bước hướng dẫn!');
                        setIsTableExpanded(true);
                        const el = document.getElementById('field-reference');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Xem chi tiết các trường <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview with Mockup Frame */}
            <div className="erp-slide-visual">
              <div className="erp-mockup-frame">
                <div className="erp-mockup-header">
                  <div className="erp-mockup-dots">
                    <span className="mockup-dot red"></span>
                    <span className="mockup-dot yellow"></span>
                    <span className="mockup-dot green"></span>
                  </div>
                  <div className="erp-mockup-url">
                    https://erp.fittour.vn/meeting-rooms
                  </div>
                </div>

                <div 
                  className="erp-mockup-body"
                  onClick={() => openLightbox(activeStep.image, activeStep.title)}
                  title="Nhấp để phóng to ảnh xem chi tiết"
                >
                  <img src={activeStep.image} alt={activeStep.title} />
                  <div className="erp-mockup-zoom-overlay">
                    <div className="erp-zoom-pill">
                      <Maximize2 size={14} /> Bấm để phóng to xem chi tiết
                    </div>
                  </div>
                </div>
              </div>

              <div className="erp-mockup-caption">
                <Maximize2 size={13} /> {activeStep.caption}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: FIELD REFERENCE TABLE (FOLDABLE / UNFOLDABLE) ── */}
        <section className="erp-section-block" id="field-reference">
          <div className="erp-foldable-card">
            <button
              type="button"
              className="erp-fold-header"
              onClick={() => setIsTableExpanded(!isTableExpanded)}
              title={isTableExpanded ? 'Nhấn để thu gọn bảng' : 'Nhấn để mở rộng bảng'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="erp-fold-icon">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    Bảng Giải Thích Chi Tiết 6 Trường Thông Tin Đặt Phòng
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                    {isTableExpanded 
                      ? 'Nhấn vào đây để thu gọn bảng' 
                      : 'Bao gồm: Tiêu đề cuộc họp, Ngày họp, BU, Từ giờ, Đến giờ, Ghi chú... (Nhấn để xem chi tiết)'}
                  </p>
                </div>
              </div>
              <div className="erp-fold-status">
                <span className="erp-fold-badge">
                  {isTableExpanded ? 'Thu gọn bảng' : 'Xem 6 trường thông tin'}
                </span>
                {isTableExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {isTableExpanded && (
              <div className="erp-fold-body">
                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th style={{ width: '22%' }}>Trường Thông Tin</th>
                        <th style={{ width: '15%' }}>Định Dạng</th>
                        <th style={{ width: '12%' }}>Bắt Buộc?</th>
                        <th style={{ width: '51%' }}>Mô Tả Chi Tiết & Lưu Ý Nghiệp Vụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DATA_FIELDS.map((f, i) => (
                        <tr key={i}>
                          <td>
                            <span className="erp-field-name">{f.name}</span>
                          </td>
                          <td>
                            <code style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                              {f.type}
                            </code>
                          </td>
                          <td>
                            {f.required ? (
                              <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12px' }}>
                                ● Bắt buộc
                              </span>
                            ) : (
                              <span className="badge-optional">Tùy chọn</span>
                            )}
                          </td>
                          <td>{f.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 3: MEETING ROOM RULES & ETIQUETTE ── */}
        <section className="erp-section-block">
          <div className="erp-section-title-wrap">
            <div className="erp-section-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2>4 Quy Định & Văn Hóa Sử Dụng Phòng Họp FIT Tour</h2>
              <p>Tuân thủ chuẩn mực chuyên nghiệp để tạo môi trường làm việc văn minh, hiệu quả</p>
            </div>
          </div>

          <div className="erp-notice-grid">
            <div className="erp-notice-box">
              <div className="erp-notice-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                ⏱️
              </div>
              <div className="erp-notice-content">
                <h4>Đúng Giờ & Trả Phòng Đúng Khung Đã Đăng Ký</h4>
                <p>
                  Bắt đầu và kết thúc cuộc họp đúng khung giờ đã đặt trên hệ thống. Tránh họp quá giờ gây ảnh hưởng đến lịch trình làm việc của BU tiếp theo.
                </p>
              </div>
            </div>

            <div className="erp-notice-box">
              <div className="erp-notice-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                🧹
              </div>
              <div className="erp-notice-content">
                <h4>Giữ Gìn Vệ Sinh & Thiết Bị Phòng Họp</h4>
                <p>
                  Sau khi họp xong, vui lòng xóa bảng viết, dọn sạch ly nước/rác, xếp lại bàn ghế ngay ngắn, tắt máy chiếu và tắt máy lạnh trước khi rời khỏi phòng.
                </p>
              </div>
            </div>

            <div className="erp-notice-box">
              <div className="erp-notice-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                🔔
              </div>
              <div className="erp-notice-content">
                <h4>Chủ Động Hủy Lịch Khi Cuộc Họp Bị Hoãn</h4>
                <p>
                  Nếu cuộc họp bị dời ngày hoặc hủy bỏ, nhân viên chủ trì cần bấm vào thẻ họp trên lịch để xóa ngay lập tức, nhường khung giờ cho đồng nghiệp khác sử dụng.
                </p>
              </div>
            </div>

            <div className="erp-notice-box">
              <div className="erp-notice-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                🤝
              </div>
              <div className="erp-notice-content">
                <h4>Ưu Tiên Cuộc Họp Đối Tác & Khách Hàng</h4>
                <p>
                  Các cuộc họp tiếp đón khách hàng VIP, đối tác chiến lược hoặc cuộc họp đột xuất của Ban Giám Đốc sẽ được ưu tiên phòng họp; các team họp nội bộ linh hoạt nhường phòng khi có yêu cầu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: FAQS ACCORDION ── */}
        <section className="erp-section-block">
          <div className="erp-section-title-wrap">
            <div className="erp-section-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h2>Câu Hỏi Thường Gặp (FAQ)</h2>
              <p>Giải đáp thắc mắc thường gặp của CBNV khi sử dụng phòng họp</p>
            </div>
          </div>

          <div className="erp-faq-list">
            {FAQS.map((faq, fIdx) => {
              const isOpen = openFaqIndex === fIdx;
              return (
                <div key={fIdx} className="erp-faq-item">
                  <button
                    className="erp-faq-question"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : fIdx)}
                  >
                    <span>{faq.q}</span>
                    <span style={{ color: '#64748b', fontSize: '18px', fontWeight: 'bold' }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="erp-faq-answer">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 5: CTA BANNER ── */}
        <section className="erp-cta-banner">
          <div className="erp-cta-text">
            <h3>Cần đặt lịch phòng họp ngay bây giờ?</h3>
            <p>
              Truy cập ngay bàn làm việc Meeting Room để kiểm tra lịch trống và tạo booking mới chỉ trong 30 giây.
            </p>
          </div>
          <div className="erp-cta-actions">
            <Link to="/meeting-rooms" className="erp-btn-white">
              Vào Lịch Phòng Họp Ngay
            </Link>
            <Link to="/huong-dan-erp/tao-nghi-phep" className="erp-btn-ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Xem bài Tạo Nghỉ Phép
            </Link>
          </div>
        </section>
      </main>

      {/* ── Lightbox Modal for Image Zoom ── */}
      {lightboxImage && (
        <div className="erp-lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="erp-lightbox-header" onClick={(e) => e.stopPropagation()}>
            <div className="erp-lightbox-title">
              <Maximize2 size={18} /> {lightboxTitle}
            </div>
            <button className="erp-lightbox-close" onClick={() => setLightboxImage(null)}>
              <X size={20} />
            </button>
          </div>
          <div className="erp-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage} alt={lightboxTitle} />
          </div>
        </div>
      )}
    </ErpGuideLayout>
  );
}
