import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Phone, CheckCircle, Clock, 
  ChevronLeft, ChevronRight, Maximize2, X, Share2, Printer, 
  HelpCircle, AlertTriangle, ShieldCheck, Mail, Users, FileText,
  ExternalLink, Sparkles, Check, Play, Pause, Bookmark,
  ChevronDown, ChevronUp, Calculator, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/erp-guide.css';

const STEPS_DATA = [
  {
    step: 1,
    title: 'Mở Menu Tài Khoản & Chọn "Xin nghỉ phép"',
    shortTitle: 'Bước 1: Mở Menu',
    badgeText: 'Thao tác nhanh • 10 giây',
    image: '/images/huong-dan/tao-nghi-phep/step1-menu-xin-nghi-phep.png',
    caption: 'Giao diện Header ERP FIT Tour: Nhấp vào Avatar góc trên bên phải để mở Menu tài khoản',
    desc: 'Trên bất kỳ màn hình nào của ERP FIT Tour, bạn đều có thể mở nhanh form xin nghỉ phép chỉ với 2 lần nhấp chuột.',
    actions: [
      {
        icon: '1',
        title: 'Nhấp vào ảnh đại diện (Avatar)',
        detail: 'Tại góc trên bên phải thanh điều hướng Header, nhấp vào ảnh đại diện hoặc tên tài khoản của bạn.'
      },
      {
        icon: '2',
        title: 'Chọn mục "🌴 Xin nghỉ phép"',
        detail: 'Menu thả xuống sẽ hiển thị danh sách tiện ích cá nhân. Nhấp chọn dòng chữ màu tím nổi bật mang tên "🌴 Xin nghỉ phép".'
      },
      {
        icon: '3',
        title: 'Màn hình hiển thị form tạo đơn',
        detail: 'Ngay lập tức, cửa sổ pop-up "Tạo Đơn Xin Nghỉ Phép" sẽ xuất hiện trên màn hình mà không cần chuyển trang.'
      }
    ],
    tip: 'Mẹo: Bạn có thể mở form này từ bất kỳ đâu (Dashboard, Lead Marketing, Báo cáo...) mà không làm gián đoạn công việc đang dở dang.',
    highlightTag: 'Menu Profile > 🌴 Xin nghỉ phép'
  },
  {
    step: 2,
    title: 'Điền Thông Tin Cơ Bản & Chọn Ngày Nghỉ Trên Lịch',
    shortTitle: 'Bước 2: Chọn Ngày & Phép',
    badgeText: 'Tính năng thông minh • Tự động trừ T7, CN',
    image: '/images/huong-dan/tao-nghi-phep/step2-thong-tin-va-chon-ngay.png',
    caption: 'Giao diện chọn ngày nghỉ trên lịch tương tác và hiển thị số ngày phép dư thực tế',
    desc: 'Thiết lập loại phép nghỉ, kiểm tra thông tin liên lạc và chọn các ngày cần nghỉ trên bộ lịch thông minh.',
    actions: [
      {
        icon: '1',
        title: 'Nhân viên xin phép & Người duyệt',
        detail: 'Mặc định hiển thị tên bạn. Nếu bạn là Leader/Admin tạo hộ nhân sự khác, hãy chọn tên đồng nghiệp. Mục "Người duyệt" có thể chọn Leader/PGĐ/GĐ phụ trách.'
      },
      {
        icon: '2',
        title: 'Chọn Loại nghỉ phép & Nhập SĐT liên hệ',
        detail: 'Chọn "Nghỉ phép năm (trừ vào quỹ phép)", "Nghỉ không lương" hoặc "Nghỉ ốm/chế độ". Điền số điện thoại để công ty liên hệ khẩn cấp khi cần.'
      },
      {
        icon: '3',
        title: 'Nhấp chọn ngày trên Lịch tương tác',
        detail: 'Bấm trực tiếp vào các ngày dự kiến nghỉ. Hệ thống tự động khóa và bỏ qua Thứ 7, Chủ Nhật. Tổng số ngày nghỉ sẽ được tính tự động.'
      },
      {
        icon: '4',
        title: 'Kiểm tra Huy hiệu Phép Dư',
        detail: 'Quan sát huy hiệu màu xanh lá "Phép dư: XX ngày". Đảm bảo bạn còn đủ số ngày phép năm trước khi gửi đơn.'
      }
    ],
    tip: 'Lưu ý: Nếu cần nghỉ nửa ngày (0.5 ngày), bạn có thể chọn phân bổ buổi Sáng hoặc Chiều sau khi chọn ngày.',
    highlightTag: 'Lịch tự động trừ Thứ 7 & CN'
  },
  {
    step: 3,
    title: 'Nhập Lý Do, Bàn Giao Công Việc & Gửi Duyệt',
    shortTitle: 'Bước 3: Bàn Giao & Gửi Đơn',
    badgeText: 'Tự động gửi Email • Ban Giám Đốc & BU',
    image: '/images/huong-dan/tao-nghi-phep/step3-ly-do-va-ban-giao.png',
    caption: 'Phần dưới của modal: Nhập lý do, chọn nhân sự nhận bàn giao và đối tượng nhận email thông báo',
    desc: 'Cuộn xuống phần dưới form để bàn giao công việc dở dang, đảm bảo tiến độ phòng ban không bị gián đoạn.',
    actions: [
      {
        icon: '1',
        title: 'Trình bày Lý do xin nghỉ (*)',
        detail: 'Nhập lý do nghỉ phép rõ ràng và trung thực (việc gia đình, du lịch, nghỉ ngơi, ốm đau...). Tối đa 500 ký tự.'
      },
      {
        icon: '2',
        title: 'Bàn giao công việc cho đồng nghiệp',
        detail: 'Tại ô "Người nhận bàn giao", gõ tên đồng nghiệp sẽ thay bạn hỗ trợ xử lý task/khách hàng. Tại ô "Ghi chú bàn giao", liệt kê ngắn gọn các đầu việc quan trọng.'
      },
      {
        icon: '3',
        title: 'Xác nhận Đối tượng nhận Email',
        detail: 'Hệ thống mặc định bắt buộc gửi email thông báo đến Ban Giám Đốc và Thành viên cùng phòng ban (BU). Bạn có thể tick chọn gửi đến Toàn bộ nhân viên công ty.'
      },
      {
        icon: '4',
        title: 'Bấm nút "Gửi đơn xin nghỉ phép"',
        detail: 'Kiểm tra lại toàn bộ thông tin và bấm nút Gửi. Hệ thống sẽ lưu đơn vào cơ sở dữ liệu và gửi email thông báo tự động ngay lập tức.'
      }
    ],
    tip: 'Bắt buộc: Hãy chủ động trao đổi trước với người nhận bàn giao để đồng nghiệp nắm thông tin trước khi gửi đơn.',
    highlightTag: 'Gửi duyệt & Bắn Email tự động'
  }
];

const DATA_FIELDS = [
  {
    name: 'Nhân viên xin phép',
    required: true,
    type: 'Dropdown chọn nhân sự',
    desc: 'Mặc định là tài khoản đang đăng nhập. Leader hoặc Admin có thể chọn nhân sự khác nếu làm đơn xin nghỉ hộ.'
  },
  {
    name: 'Người duyệt (Leader, GĐ, PGĐ)',
    required: false,
    type: 'Dropdown chọn cấp duyệt',
    desc: 'Chọn Leader phòng ban hoặc Ban Giám Đốc trực tiếp quản lý. Nếu không chọn, hệ thống tự động gán theo quy tắc luồng phê duyệt mặc định.'
  },
  {
    name: 'Loại nghỉ phép',
    required: true,
    type: 'Dropdown phân loại',
    desc: 'Gồm: Nghỉ phép năm (trừ vào quỹ 12 ngày phép), Nghỉ không hưởng lương, Nghỉ ốm / thai sản / chế độ BHXH, Nghỉ việc riêng có hưởng lương (hiếu, hỉ theo luật).'
  },
  {
    name: 'Số điện thoại liên hệ',
    required: false,
    type: 'Số điện thoại',
    desc: 'Số điện thoại đang hoạt động của bạn để Ban Giám Đốc hoặc đồng nghiệp liên hệ trong các trường hợp tour hoặc khách hàng phát sinh khẩn cấp.'
  },
  {
    name: 'Chọn ngày nghỉ & Buổi',
    required: true,
    type: 'Lịch tương tác (Interactive DatePicker)',
    desc: 'Click để chọn hoặc bỏ chọn ngày. Hệ thống tự động khóa Thứ 7 và Chủ Nhật. Hỗ trợ chọn nghỉ cả ngày (1 ngày) hoặc nửa ngày Sáng/Chiều (0.5 ngày).'
  },
  {
    name: 'Lý do nghỉ',
    required: true,
    type: 'Văn bản (Tối đa 500 ký tự)',
    desc: 'Trình bày lý do xin nghỉ phép để cấp quản lý nắm tình hình xét duyệt.'
  },
  {
    name: 'Người nhận bàn giao',
    required: false,
    type: 'Tìm kiếm nhân sự',
    desc: 'Đồng nghiệp trong cùng BU hoặc cùng khối vận hành sẽ phụ trách chăm sóc khách hàng, trả lời tin nhắn hoặc xử lý hồ sơ tour trong lúc bạn vắng mặt.'
  },
  {
    name: 'Ghi chú bàn giao',
    required: false,
    type: 'Văn bản (Tối đa 500 ký tự)',
    desc: 'Tóm tắt các task đang chạy, mã hợp đồng/booking, link tài liệu hoặc lưu ý đặc biệt dành cho người nhận bàn giao.'
  },
  {
    name: 'Đối tượng nhận Email',
    required: true,
    type: 'Checklist gửi tự động',
    desc: 'Hệ thống tự động kích hoạt gửi Email HTML chuẩn hóa đến Ban Giám Đốc và Thành viên cùng BU (bắt buộc). Tùy chọn gửi toàn thể công ty nếu muốn thông báo rộng rãi.'
  }
];

const FAQS = [
  {
    q: 'Quy định 12 ngày phép năm và cách tính cho nhân viên mới vào làm giữa năm?',
    a: 'Mỗi năm làm việc trọn vẹn, nhân viên chính thức được hưởng 12 ngày phép năm có lương (1 tháng tích lũy 1 ngày). Nếu bạn là nhân viên mới gia nhập công ty vào tháng đột xuất giữa năm, số ngày phép năm đầu tiên sẽ tính tỷ lệ theo số tháng làm việc thực tế còn lại trong năm đó (ví dụ vào làm ngày 01/05 -> còn 8 tháng trong năm 2026 -> quỹ phép là 8 ngày).'
  },
  {
    q: 'Thời gian thử việc có được tính phép năm và sử dụng ngay không?',
    a: 'Trong thời gian 2 tháng thử việc, nhân sự chưa được sử dụng phép năm. Tuy nhiên ngay khi ký Hợp đồng lao động chính thức, 2 tháng thử việc này sẽ được tính gộp hồi tố vào quỹ phép năm của bạn (ví dụ thử việc xong ký HĐLĐ là bạn đã có sẵn 2 ngày phép tích lũy).'
  },
  {
    q: 'Nếu vào làm giữa tháng (sau ngày 15) thì tháng đó có được tính phép không?',
    a: 'Theo quy chế nhân sự: Nếu bạn vào làm từ ngày 01 đến ngày 15 trong tháng, tháng đó được tính trọn 1 ngày phép. Nếu vào làm sau ngày 15, việc tích lũy phép năm sẽ bắt đầu tính từ tháng kế tiếp.'
  },
  {
    q: 'Tôi có thể xin nghỉ phép nửa ngày (0.5 ngày) được không?',
    a: 'Hoàn toàn được! Sau khi bạn bấm chọn ngày trên lịch, tại danh sách ngày đã chọn, bạn có thể chọn phân bổ buổi "Cả ngày", "Buổi sáng" hoặc "Buổi chiều". Hệ thống sẽ tự động tính 0.5 ngày cho mỗi buổi sáng hoặc chiều.'
  },
  {
    q: 'Hệ thống có tự động trừ ngày Thứ 7 và Chủ Nhật không?',
    a: 'Có. Lịch chọn ngày trên ERP FIT Tour được tích hợp thuật toán tự động khóa các ngày Thứ 7 và Chủ Nhật. Nếu bạn bấm vào cuối tuần, hệ thống sẽ cảnh báo và không tính vào tổng số ngày nghỉ.'
  },
  {
    q: 'Nếu tôi đã dùng hết quỹ phép năm (phép dư = 0) thì gửi đơn như thế nào?',
    a: 'Nếu số ngày phép dư của bạn không còn đủ cho đợt nghỉ dự kiến, tại mục "Loại nghỉ phép" bạn vui lòng chọn "Nghỉ không hưởng lương" hoặc trao đổi trước với Leader/Nhân sự trước khi gửi đơn.'
  },
  {
    q: 'Phép năm của năm cũ chưa dùng hết có được chuyển sang năm sau không?',
    a: 'Có, nhân sự được hỗ trợ gia hạn sử dụng phép năm cũ đến hết ngày 31/03 của năm kế tiếp. Sau ngày 31/03, hệ thống sẽ chốt và reset số phép cũ chưa dùng về 0.'
  },
  {
    q: 'Sau khi gửi đơn, tôi có thể xem lại hoặc hủy đơn được không?',
    a: 'Được. Tại góc trên bên phải của modal tạo đơn, bạn có nút "Quản lý nghỉ phép" (hoặc truy cập mục Quản lý nghỉ phép trong CRM) để theo dõi trạng thái đơn (Chờ duyệt / Đã duyệt / Từ chối) và gửi yêu cầu hủy nếu kế hoạch thay đổi.'
  }
];

import ErpGuideLayout from '../components/ErpGuideLayout';

export default function HuongDanTaoNghiPhepPage() {
  const navigate = useNavigate();
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
    <ErpGuideLayout currentGuideId="tao-nghi-phep">
      {/* ── Hero Section ── */}
      <header className="erp-guide-hero" style={{ paddingBottom: '24px' }}>
        <div className="erp-hero-inner">
          <div className="erp-breadcrumbs">
            <Link to="/">Trang chủ CRM</Link>
            <span>/</span>
            <Link to="/huong-dan-erp">Hướng dẫn ERP</Link>
            <span>/</span>
            <span className="active">Tạo đơn xin nghỉ phép</span>
          </div>

          <div className="erp-hero-header-row">
            <div className="erp-hero-title-group">
              <h1>Hướng Dẫn Sử Dụng ERP: Tạo Đơn Xin Nghỉ Phép</h1>
              <p className="erp-hero-desc">
                Cẩm nang chuẩn hóa thao tác gửi đơn xin nghỉ phép trên hệ thống ERP FIT Tour dành cho toàn thể Cán bộ – Nhân viên. Tự động kiểm tra số ngày phép dư, loại trừ cuối tuần, bàn giao công việc và thông báo qua Email.
              </p>

              <div className="erp-hero-meta-tags">
                <span className="erp-meta-tag">
                  <CheckCircle size={14} color="#10b981" /> Phiên bản ERP 2026
                </span>
                <span className="erp-meta-tag">
                  <Clock size={14} color="#3b82f6" /> 2 phút thực hiện
                </span>
                <span className="erp-meta-tag">
                  <Users size={14} color="#8b5cf6" /> Toàn thể CBNV
                </span>
                <span className="erp-meta-tag">
                  <ShieldCheck size={14} color="#f59e0b" /> Quy định nội bộ FIT Tour
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
                    https://erp.fittour.vn
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
                    Bảng Giải Thích Chi Tiết 9 Trường Thông Tin Trong Đơn
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                    {isTableExpanded 
                      ? 'Nhấn vào đây để thu gọn bảng' 
                      : 'Bao gồm: Nhân viên xin phép, Người duyệt, Loại phép, Ngày nghỉ, SĐT, Lý do, Bàn giao... (Nhấn để xem chi tiết)'}
                  </p>
                </div>
              </div>
              <div className="erp-fold-status">
                <span className="erp-fold-badge">
                  {isTableExpanded ? 'Thu gọn bảng' : 'Xem 9 trường thông tin'}
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

        {/* ── SECTION 3: LEAVE POLICY & CALCULATION FOR NEW EMPLOYEES ── */}
        <section className="erp-section-block">
          <div className="erp-section-title-wrap">
            <div className="erp-section-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Calculator size={20} />
            </div>
            <div>
              <h2>Chính Sách Phép Năm & Quy Tắc Tính Cho Nhân Sự Mới</h2>
              <p>Quy định 12 ngày phép/năm và công thức tính ngày phép khi vào làm việc giữa năm (tháng đột xuất)</p>
            </div>
          </div>

          <div className="erp-policy-special-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className="erp-formula-tag">Quy tắc chuẩn</span>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                1 Năm Có 12 Ngày Nghỉ Phép • Mỗi Tháng Tích Lũy 1 Ngày
              </h3>
            </div>
            
            <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
              Theo Bộ luật Lao động và Quy chế nhân sự FIT Tour, nhân sự làm việc đủ 12 tháng tại công ty sẽ có quỹ <strong>12 ngày phép năm</strong> hưởng nguyên 100% lương. Hệ thống ERP tính tích lũy đều đặn theo tỷ lệ: <strong>Cứ làm việc đủ 1 tháng thực tế = tích lũy được 1 ngày phép năm</strong>.
            </p>

            <div className="erp-policy-formula-bar">
              <span className="erp-formula-tag" style={{ background: '#059669' }}>Công thức Nhân Viên Mới</span>
              <div className="erp-formula-text">
                Quỹ phép năm đầu tiên = Số tháng làm việc thực tế còn lại trong năm (tính từ tháng vào làm đến hết tháng 12)
              </div>
            </div>

            <div style={{ fontSize: '13.5px', color: '#475569', margin: '14px 0 6px 0', lineHeight: '1.6' }}>
              <strong>📌 Quy tắc xác định ngày vào làm trong tháng:</strong>
              <ul style={{ margin: '6px 0 14px 20px', padding: 0 }}>
                <li><strong>Vào làm từ ngày 01 đến ngày 15 trong tháng:</strong> Được tính trọn vẹn <strong>1 ngày phép</strong> cho tháng đó.</li>
                <li><strong>Vào làm sau ngày 15 trong tháng:</strong> Bắt đầu tính tích lũy phép từ tháng kế tiếp.</li>
                <li><strong>Thời gian thử việc:</strong> Trong 2 tháng thử việc, nhân sự chưa được sử dụng phép năm. Sau khi ký Hợp đồng lao động chính thức, số tháng thử việc sẽ được <em>tính gộp hồi tố</em> vào quỹ phép năm để bạn sử dụng.</li>
              </ul>
            </div>

            <h4 style={{ margin: '18px 0 10px 0', fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>
              💡 Các ví dụ tính phép thực tế cho nhân sự mới:
            </h4>

            <div className="erp-examples-grid">
              <div className="erp-example-card">
                <div className="erp-example-header">
                  <span>🌱 Vào làm ngày 05/04</span>
                  <span className="erp-example-badge">Trước ngày 15</span>
                </div>
                <div className="erp-example-result">
                  Tính từ Tháng 4 đến Tháng 12 = <strong>9 tháng</strong>.<br />
                  Quỹ phép năm đầu tiên: <strong>9 ngày phép</strong>.
                </div>
              </div>

              <div className="erp-example-card">
                <div className="erp-example-header">
                  <span>🍁 Vào làm ngày 01/07</span>
                  <span className="erp-example-badge">Giữa năm</span>
                </div>
                <div className="erp-example-result">
                  Tính từ Tháng 7 đến Tháng 12 = <strong>6 tháng</strong>.<br />
                  Quỹ phép năm đầu tiên: <strong>6 ngày phép</strong>.
                </div>
              </div>

              <div className="erp-example-card">
                <div className="erp-example-header">
                  <span>❄️ Vào làm ngày 22/10</span>
                  <span className="erp-example-badge">Sau ngày 15</span>
                </div>
                <div className="erp-example-result">
                  Không tính T10, tính T11 và T12 = <strong>2 tháng</strong>.<br />
                  Quỹ phép năm đầu tiên: <strong>2 ngày phép</strong>.
                </div>
              </div>
            </div>
          </div>

          <div className="erp-notice-grid">
            <div className="erp-notice-box">
              <div className="erp-notice-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                🌴
              </div>
              <div className="erp-notice-content">
                <h4>Nghỉ Vượt Quá Số Phép Tích Lũy</h4>
                <p>
                  Nếu bạn xin nghỉ nhiều hơn số ngày phép đã tích lũy tính đến thời điểm hiện tại, phần ngày nghỉ vượt trội sẽ tự động tính sang <strong>Nghỉ không hưởng lương</strong> và trừ vào kỳ lương tháng đó.
                </p>
              </div>
            </div>

            <div className="erp-notice-box">
              <div className="erp-notice-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                📅
              </div>
              <div className="erp-notice-content">
                <h4>Hạn Sử Dụng & Chuyển Phép Năm</h4>
                <p>
                  Toàn bộ phép năm được khuyến khích sử dụng trong năm. Số phép năm chưa dùng hết được hỗ trợ gia hạn sử dụng đến hết ngày <strong>31/03 của năm kế tiếp</strong> (sau ngày 31/03, số phép cũ chưa dùng sẽ tự động hủy).
                </p>
              </div>
            </div>

            <div className="erp-notice-box">
              <div className="erp-notice-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                🛡️
              </div>
              <div className="erp-notice-content">
                <h4>Tự Động Loại Trừ Cuối Tuần (T7 & CN)</h4>
                <p>
                  Hệ thống thông minh tự động loại trừ Thứ 7 và Chủ Nhật khi bạn bấm chọn khoảng ngày trên lịch. Số ngày nghỉ chỉ tính các ngày làm việc thực tế (Thứ 2 đến Thứ 6), đảm bảo không bao giờ bị trừ oan phép.
                </p>
              </div>
            </div>

            <div className="erp-notice-box">
              <div className="erp-notice-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                ✉️
              </div>
              <div className="erp-notice-content">
                <h4>Bàn Giao & Thông Báo Tự Động Đến BGĐ</h4>
                <p>
                  Bắt buộc chọn người nhận bàn giao công việc và ghi chú task cần hỗ trợ. Ngay khi bấm gửi, ERP tự động gửi Email thông báo đến Ban Giám Đốc và đồng đội cùng phòng ban (BU).
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
              <p>Giải đáp thắc mắc thường gặp của CBNV khi tạo đơn xin nghỉ phép</p>
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
            <h3>Sẵn sàng tạo đơn xin nghỉ phép?</h3>
            <p>
              Hệ thống ERP FIT Tour đã sẵn sàng. Truy cập ngay trang chủ để trải nghiệm luồng tạo đơn nhanh chóng chỉ với 3 bước đơn giản.
            </p>
          </div>
          <div className="erp-cta-actions">
            <Link to="/" className="erp-btn-white">
              Vào CRM FIT Tour Ngay
            </Link>
            <Link to="/huong-dan-erp" className="erp-btn-ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Xem thêm hướng dẫn khác
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

