import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Bell, Plus, Home, BookOpen, BarChart2, FileText, 
  LayoutTemplate, Star, Image as ImageIcon, MessageSquare, 
  ChevronDown, ArrowRight, ArrowLeft, TrendingUp, ClipboardList,
  Calendar, Clock, ExternalLink, Copy, Check, FileSpreadsheet, Share2, Video,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const MarketingHub = () => {
  const [activeMenu, setActiveMenu] = useState('Tài liệu Marketing');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');
  const navigate = useNavigate();

  // Lấy thông tin user thật từ localStorage
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const userName = currentUser?.full_name || currentUser?.username || 'Người dùng';
  const userRole = currentUser?.role ? currentUser.role.toUpperCase() : 'NHÂN VIÊN';
  
  // Lấy chữ cái đầu của tên
  const initial = userName.charAt(0).toUpperCase();

  // Danh sách Báo Cáo & Lịch Biểu Bắt Buộc (3 ô section: Facebook, TikTok, Website)
  const recurringReports = [
    {
      id: 'fb-fanpage-reach',
      title: 'Báo cáo Facebook Fanpage Reach Tự Nhiên',
      platform: 'Facebook Fanpage',
      platformIcon: <Share2 size={14} color="#1877f2" />,
      platformColor: '#1877f2',
      platformBg: '#eff6ff',
      platformBorder: '#dbeafe',
      deadline: 'Sáng ngày 1 đầu tháng',
      cycle: 'Hàng tháng',
      cycleColor: '#b45309',
      cycleBg: '#fef3c7',
      cycleBorder: '#fde68a',
      desc: 'Báo cáo tổng hợp số liệu tiếp cận tự nhiên (Organic Reach), tương tác Fanpage và đo lường hiệu quả bài viết định kỳ tháng.',
      url: 'https://docs.google.com/spreadsheets/d/1F7FX-2AtT89U4W4uCoq-fcpILDHYUtbvIW9SLenBCOg/edit?gid=480259893#gid=480259893',
      kpi: {
        target: '40 bài / 100k view',
        actual: '138.6k view (43 bài)',
        percent: 100,
        percentLabel: '138.6%',
        barGradient: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
        badgeColor: '#1d4ed8',
        badgeBg: '#eff6ff',
        badgeBorder: '#bfdbfe'
      }
    },
    {
      id: 'tiktok-schedule',
      title: 'Lịch đăng Tiktok phân bổ',
      platform: 'TikTok Channel',
      platformIcon: <Video size={14} color="#0f172a" />,
      platformColor: '#0f172a',
      platformBg: '#f1f5f9',
      platformBorder: '#e2e8f0',
      deadline: 'Daily (Cập nhật hàng ngày)',
      cycle: 'Hàng ngày (Daily)',
      cycleColor: '#047857',
      cycleBg: '#ecfdf5',
      cycleBorder: '#a7f3d0',
      desc: 'Kế hoạch phân bổ khung giờ phát sóng, chủ đề kịch bản và theo dõi tiến độ đăng video TikTok cho toàn bộ các kênh.',
      url: 'https://docs.google.com/spreadsheets/d/1i7ERk50GH4Yr_wnbvp3pqlYd0J9FOvTUzlY_TZ0A6fc/edit?usp=sharing',
      kpi: {
        target: '30 video / 20k view',
        actual: '30 clip lên lịch',
        percent: 100,
        percentLabel: '100% Lịch',
        barGradient: 'linear-gradient(90deg, #6366f1, #4f46e5)',
        badgeColor: '#4f46e5',
        badgeBg: '#eef2ff',
        badgeBorder: '#c7d2fe'
      }
    },
    {
      id: 'website-fittour',
      title: 'Báo cáo Bài viết Website fittour.vn',
      platform: 'Website fittour.vn',
      platformIcon: <Globe size={14} color="#059669" />,
      platformColor: '#059669',
      platformBg: '#ecfdf5',
      platformBorder: '#a7f3d0',
      deadline: 'Sáng ngày 1 đầu tháng',
      cycle: 'Hàng tháng',
      cycleColor: '#b45309',
      cycleBg: '#fef3c7',
      cycleBorder: '#fde68a',
      desc: 'Theo dõi tiến độ sản xuất bài viết tour độc bản, cẩm nang SEO, hình ảnh showroom và tối ưu tốc độ Astro.',
      isInternal: true,
      docUrl: '/tai-lieu/bao-cao-website-thang-9-2026',
      siteUrl: 'https://fittour.vn',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1dr95yLvqX_WfucYrruugkKXns8L0WDP5/edit?usp=sharing&ouid=107203445454776991915&rtpof=true&sd=true',
      url: '/tai-lieu/bao-cao-website-thang-9-2026',
      kpi: {
        target: '30 bài viết',
        actual: '125 bài/trang',
        percent: 100,
        percentLabel: '416.7%',
        barGradient: 'linear-gradient(90deg, #10b981, #059669)',
        badgeColor: '#047857',
        badgeBg: '#ecfdf5',
        badgeBorder: '#a7f3d0'
      }
    }
  ];

  // Danh mục Lưu Trữ Báo Cáo Định Kỳ Theo Tháng
  const monthlyArchives = [
    {
      monthKey: '2026-09',
      title: 'Kỳ Báo Cáo Tháng 09/2026',
      period: '01/09/2026 – 30/09/2026',
      deadline: 'Sáng ngày 01/10/2026',
      status: 'completed',
      statusLabel: 'Đã hoàn thành',
      statusBg: '#ecfdf5',
      statusColor: '#059669',
      statusBorder: '#a7f3d0',
      reports: [
        {
          id: 'web-t9',
          channel: 'Website Astro',
          channelIcon: <Globe size={14} color="#059669" />,
          channelBg: '#ecfdf5',
          channelBorder: '#a7f3d0',
          channelColor: '#059669',
          name: 'Báo Cáo Bài Viết Website Astro (125 Bài/Trang)',
          kpiBadge: '416.7% KPI',
          summary: '21 Tour độc bản, 63 Cẩm nang SEO, 29 Showroom ảnh 16:9, 12 Page. Tải trang cực nhanh <0.8s, Astro Native.',
          docUrl: '/tai-lieu/bao-cao-website-thang-9-2026',
          siteUrl: 'https://fittour.vn',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/1dr95yLvqX_WfucYrruugkKXns8L0WDP5/edit?usp=sharing&ouid=107203445454776991915&rtpof=true&sd=true',
          htmlUrl: '/email_preview_bao_cao_website_t9_2026.html',
          kpi: {
            target: '30 bài viết',
            actual: '125 bài/trang',
            percent: 100,
            percentLabel: '416.7%',
            barGradient: 'linear-gradient(90deg, #10b981, #059669)',
            badgeColor: '#047857',
            badgeBg: '#ecfdf5',
            badgeBorder: '#a7f3d0'
          }
        },
        {
          id: 'fb-t9',
          channel: 'Facebook Fanpage',
          channelIcon: <Share2 size={14} color="#1877f2" />,
          channelBg: '#eff6ff',
          channelBorder: '#dbeafe',
          channelColor: '#1877f2',
          name: 'Báo Cáo Facebook Fanpage Reach (138k View)',
          kpiBadge: '+38.6% KPI',
          summary: '43 bài Organic (35 Album, 6 Reels), đạt 138,580 lượt xem, 1,096 tương tác, tuần 3 bứt phá 54.7k view.',
          docUrl: '/tai-lieu/bao-cao-facebook-thang-9-2026',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/1F7FX-2AtT89U4W4uCoq-fcpILDHYUtbvIW9SLenBCOg/edit?usp=sharing',
          htmlUrl: '/preview_bao_cao_fanpage_facebook_t9_2026.html',
          kpi: {
            target: '100k view (40 bài)',
            actual: '138.6k view (43 bài)',
            percent: 100,
            percentLabel: '+38.6%',
            barGradient: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            badgeColor: '#1d4ed8',
            badgeBg: '#eff6ff',
            badgeBorder: '#bfdbfe'
          }
        },
        {
          id: 'tiktok-t9',
          channel: 'TikTok Studio',
          channelIcon: <Video size={14} color="#0f172a" />,
          channelBg: '#f1f5f9',
          channelBorder: '#e2e8f0',
          channelColor: '#0f172a',
          name: 'Lịch Đăng TikTok Phân Bổ & Báo Cáo Studio',
          kpiBadge: '113.5% KPI View',
          summary: '30 video, đạt 22,700 views (113.5% KPI, +12.7% MoM), 533 thích (+36.7%), 155 share, 633 profile views. TikTok Search chiếm 32.2%.',
          docUrl: '/tai-lieu/bao-cao-tiktok-thang-9-2026',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/1i7ERk50GH4Yr_wnbvp3pqlYd0J9FOvTUzlY_TZ0A6fc/edit?usp=sharing',
          htmlUrl: '/preview_bao_cao_tiktok_studio_t9_2026.html',
          emailUrl: '/email_preview_bao_cao_tiktok_studio_t9_2026.html',
          kpi: {
            target: '30 clip / 20k view',
            actual: '22.7k view (113.5%)',
            percent: 100,
            percentLabel: 'Vượt KPI +13.5%',
            barGradient: 'linear-gradient(90deg, #10b981, #059669)',
            badgeColor: '#059669',
            badgeBg: '#ecfdf5',
            badgeBorder: '#a7f3d0'
          }
        },
        {
          id: 'overview-t9',
          channel: 'Tổng Hợp Đa Kênh',
          channelIcon: <TrendingUp size={14} color="#2563eb" />,
          channelBg: '#eff6ff',
          channelBorder: '#bfdbfe',
          channelColor: '#2563eb',
          name: 'Báo Cáo Tổng Hợp & Đối Soát KPI Đa Kênh MXH',
          kpiBadge: 'Đối Soát 3 Kênh',
          summary: 'Bảng đối chiếu minh bạch chỉ tiêu KPI vs thực tế Website, Fanpage, TikTok và đề xuất chỉ tiêu T10.',
          docUrl: '/tai-lieu/bao-cao-tong-hop-mxh-thang-9-2026',
          htmlUrl: '/preview_bao_cao_tong_hop_mxh_t9_2026.html',
          emailUrl: '/email_preview_bao_cao_tong_hop_mxh_t9_2026.html',
          kpi: {
            target: '3/3 kênh (Web, FB, TikTok)',
            actual: 'Đối soát 100%',
            percent: 100,
            percentLabel: 'Hoàn tất',
            barGradient: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
            badgeColor: '#1d4ed8',
            badgeBg: '#eff6ff',
            badgeBorder: '#bfdbfe'
          }
        }
      ]
    },
    {
      monthKey: '2026-10',
      title: 'Kỳ Báo Cáo Tháng 10/2026',
      period: '01/10/2026 – 31/10/2026',
      deadline: 'Sáng ngày 01/11/2026',
      status: 'in_progress',
      statusLabel: 'Đang triển khai',
      statusBg: '#fef3c7',
      statusColor: '#b45309',
      statusBorder: '#fde68a',
      note: 'Đang ghi nhận số liệu thực tế. Chỉ tiêu: Website 40 bài | Fanpage 40 bài, >120k view (TB >3k/bài) | TikTok 30 video, >25k view. Báo cáo hoàn tất sẽ được cập nhật vào sáng ngày 01/11/2026.',
      reports: [
        {
          id: 'web-t10',
          channel: 'Website Astro',
          channelIcon: <Globe size={14} color="#059669" />,
          channelBg: '#ecfdf5',
          channelBorder: '#a7f3d0',
          channelColor: '#059669',
          name: 'Báo Cáo Bài Viết Website Astro T10',
          kpiBadge: 'Chỉ tiêu 40 bài',
          summary: 'Tập trung sản xuất cẩm nang tuyến mới thu đông, tối ưu schema SEO bài viết tour.',
          siteUrl: 'https://fittour.vn',
          inProgress: true,
          kpi: {
            target: '40 bài viết',
            actual: 'Đang triển khai',
            percent: 15,
            percentLabel: 'Khởi động T10',
            barGradient: 'linear-gradient(90deg, #10b981, #059669)',
            badgeColor: '#b45309',
            badgeBg: '#fef3c7',
            badgeBorder: '#fde68a'
          }
        },
        {
          id: 'fb-t10',
          channel: 'Facebook Fanpage',
          channelIcon: <Share2 size={14} color="#1877f2" />,
          channelBg: '#eff6ff',
          channelBorder: '#dbeafe',
          channelColor: '#1877f2',
          name: 'Báo Cáo Facebook Fanpage Reach T10',
          kpiBadge: 'Chỉ tiêu 40 bài, >120k view (TB >3k/bài)',
          summary: 'Triển khai 40 bài Organic theo khung giờ vàng và album hình ảnh chân thực hành trình. Mục tiêu TB >3,000 view/bài.',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/1F7FX-2AtT89U4W4uCoq-fcpILDHYUtbvIW9SLenBCOg/edit?gid=480259893#gid=480259893',
          inProgress: true,
          kpi: {
            target: '40 bài • >120k view (>3k/bài)',
            actual: 'Đang triển khai',
            percent: 15,
            percentLabel: 'Khởi động T10',
            barGradient: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            badgeColor: '#1d4ed8',
            badgeBg: '#eff6ff',
            badgeBorder: '#bfdbfe'
          }
        },
        {
          id: 'tiktok-t10',
          channel: 'TikTok Studio',
          channelIcon: <Video size={14} color="#0f172a" />,
          channelBg: '#f1f5f9',
          channelBorder: '#e2e8f0',
          channelColor: '#0f172a',
          name: 'Kế Hoạch & Chỉ Tiêu TikTok Studio T10',
          kpiBadge: 'Mục tiêu >25k view',
          summary: 'Kế hoạch 30 video Thu Đông (Cửu Trại Câu, Ladakh, Bhutan), đẩy mạnh SEO TikTok (32.2% search) & chuyển đổi qua Profile Visit.',
          docUrl: '/tai-lieu/bao-cao-tiktok-thang-10-2026',
          htmlUrl: '/preview_bao_cao_tiktok_studio_t10_2026.html',
          emailUrl: '/email_preview_bao_cao_tiktok_studio_t9_2026.html',
          inProgress: false,
          kpi: {
            target: '30 video • >25k view',
            actual: 'Kế hoạch T10',
            percent: 100,
            percentLabel: 'Kế hoạch sẵn sàng',
            barGradient: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
            badgeColor: '#6d28d9',
            badgeBg: '#f5f3ff',
            badgeBorder: '#ddd6fe'
          }
        }
      ]
    },
    {
      monthKey: '2026-11',
      title: 'Kỳ Báo Cáo Tháng 11/2026',
      period: '01/11/2026 – 30/11/2026',
      deadline: 'Sáng ngày 01/12/2026',
      status: 'upcoming',
      statusLabel: 'Dự kiến',
      statusBg: '#f8fafc',
      statusColor: '#64748b',
      statusBorder: '#e2e8f0',
      note: 'Kỳ báo cáo chuẩn bị cho đợt cao điểm bán tour Tết 2027 và chiến dịch mùa đông. Xuất bản vào sáng 01/12/2026.',
      reports: []
    }
  ];

  // Dữ liệu mẫu (Mock Data)
  const menuItems = [
    { section: 'TỔNG QUAN', items: [{ name: 'Tổng quan', icon: <Home size={18} /> }] },
    { 
      section: 'NHIỆM VỤ & CÔNG VIỆC', 
      items: [
        { name: 'Tasks & SOP', icon: <ClipboardList size={18} />, url: '/tai-lieu/marketing/tasks' },
        { name: 'Báo cáo định kỳ', icon: <FileSpreadsheet size={18} />, url: '#bao-cao-dinh-ky' },
      ] 
    },
    { 
      section: 'TÀI LIỆU MARKETING', 
      items: [
        { name: 'Tài liệu Marketing', icon: <BookOpen size={18} /> },
        { name: 'Log AI Agent', icon: <FileText size={18} />, url: 'https://docs.google.com/spreadsheets/d/1sSlrtJz6TANIU3Z-dXABE3iXFOkpEOUXD5QHIIb2pok/edit?usp=sharing', external: true }
      ] 
    },
    { 
      section: 'DANH MỤC TÀI LIỆU', 
      items: [
        { name: 'Guideline', icon: <FileText size={18} />, url: '/cam-nang-thuong-hieu' },
        { name: 'Logo', icon: <ImageIcon size={18} />, url: 'https://drive.google.com/drive/folders/1KcLWiW6mMnLjxw-xXbiOwmR6Qn9tSs6g?usp=sharing', external: true },
        { name: 'Blueprint & SOP Ads', icon: <Star size={18} />, submenu: [
            { name: 'Xem Blueprint', url: '/tai-lieu/blueprint-meta-ads' },
            { name: 'SOP Đặt Tên', url: '/tai-lieu/quy-tac-dat-ten-quang-cao-meta' },
            { name: 'Quản lý Ads', url: 'https://docs.google.com/spreadsheets/d/15O9hrCdZvVoLwC8fRQCYm5nxs0WGL9s8RQ3XScj0jQo/edit?usp=sharing', external: true }
          ]
        },
        { name: 'Asset', icon: <ImageIcon size={18} />, url: '#' },
        { name: 'Báo Cáo Ads', icon: <BarChart2 size={18} />, url: '/q2-report/index.html', external: true }
      ] 
    }
  ];

  const recentUpdates = [
    { title: 'Cách viết caption Facebook hiệu quả', category: 'Guideline', author: 'Nguyễn Anh', time: '2 giờ trước', color: '#3b82f6', bg: '#eff6ff', icon: <FileText size={16} color="#3b82f6"/> },
    { title: 'Logo FIT Tour (Cập nhật 2026)', category: 'Logo', author: 'Phạm Hà', time: '5 giờ trước', color: '#16a34a', bg: '#f0fdf4', icon: <ImageIcon size={16} color="#16a34a"/> },
    { title: 'Video Review Tứ Xuyên đạt 1M views', category: 'Best Content', author: 'Trần Minh', time: '1 ngày trước', color: '#f59e0b', bg: '#fef3c7', icon: <Star size={16} color="#f59e0b"/> },
    { title: 'Bộ ảnh mùa thu Nhật Bản 2024', category: 'Asset', author: 'Lê Phương', time: '2 ngày trước', color: '#9333ea', bg: '#faf5ff', icon: <ImageIcon size={16} color="#9333ea"/> },
    { title: 'Quy chuẩn hình ảnh thương hiệu FIT Tour', category: 'Guideline', author: 'Nguyễn Anh', time: '3 ngày trước', color: '#3b82f6', bg: '#eff6ff', icon: <FileText size={16} color="#3b82f6"/> },
  ];

  const quickLinks = [
    { name: 'Báo cáo Fanpage Reach', url: 'https://docs.google.com/spreadsheets/d/1F7FX-2AtT89U4W4uCoq-fcpILDHYUtbvIW9SLenBCOg/edit?gid=480259893#gid=480259893', external: true, icon: <Share2 size={16} color="#1877f2" /> },
    { name: 'Lịch đăng TikTok Daily', url: 'https://docs.google.com/spreadsheets/d/1i7ERk50GH4Yr_wnbvp3pqlYd0J9FOvTUzlY_TZ0A6fc/edit?usp=sharing', external: true, icon: <Video size={16} color="#0f172a" /> },
    { name: 'Brand Guidelines', url: '/cam-nang-thuong-hieu', icon: <BookOpen size={16} /> },
    { name: 'Giọng văn & Tone of voice (chưa có)', icon: <MessageSquare size={16} /> },
    { name: 'Quy chuẩn hình ảnh (chưa có)', icon: <ImageIcon size={16} /> },
    { name: 'Mẫu hashtag theo chủ đề (chưa có)', icon: <FileText size={16} /> },
    { name: 'Template video TikTok (chưa có)', icon: <LayoutTemplate size={16} /> },
  ];

  const bestContents = [
    { title: 'Review Cửu Trại Câu mùa...', img: 'https://images.unsplash.com/photo-1542880941-197171ea7eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', reach: '1M', lead: '230' },
    { title: 'Thượng Hải – Nơi quá khứ...', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', reach: '850K', lead: '180' },
    { title: 'Mùa hoa anh đào Nhật Bản...', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', reach: '620K', lead: '120' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflow: 'hidden', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* =========================================================
          SIDEBAR
          ========================================================= */}
      <div style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/tai-lieu')}>
            <div style={{ width: 32, height: 32, backgroundColor: '#2563eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="white" /> {/* Tạm thay logo FIT TOUR */}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>FIT TOUR®</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Marketing Hub</div>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          {menuItems.map((block, idx) => (
            <div key={idx} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: 8, paddingLeft: 12, letterSpacing: '0.5px' }}>
                {block.section}
              </div>
              {block.items.map(item => {
                const isActive = activeMenu === item.name;
                
                const handleClick = () => {
                  if (item.external && item.url && item.url !== '#') {
                    window.open(item.url, '_blank', 'noopener,noreferrer');
                  } else if (item.url && item.url.startsWith('#')) {
                    const el = document.getElementById(item.url.substring(1));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    setActiveMenu(item.name);
                  } else if (item.url && item.url !== '#') {
                    navigate(item.url);
                  } else if (!item.submenu) {
                    setActiveMenu(item.name);
                  }
                };

                return (
                  <div key={item.name}>
                    <div 
                      onClick={handleClick}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8,
                        cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s',
                        backgroundColor: isActive ? '#eff6ff' : 'transparent',
                        color: isActive ? '#2563eb' : '#475569',
                        fontWeight: isActive ? 600 : 500
                      }}
                    >
                      <span style={{ color: isActive ? '#2563eb' : '#64748b' }}>{item.icon}</span>
                      <span style={{ fontSize: '14px', flex: 1 }}>{item.name}</span>
                      {item.submenu && <ChevronDown size={14} color="#94a3b8" />}
                    </div>
                    {item.submenu && (
                      <div style={{ paddingLeft: 34, marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {item.submenu.map(sub => {
                          const isSubActive = activeMenu === sub.name;
                          return (
                            <div
                              key={sub.name}
                              onClick={() => {
                                setActiveMenu(sub.name);
                                if (sub.external && sub.url) {
                                  window.open(sub.url, '_blank', 'noopener,noreferrer');
                                } else if (sub.url && sub.url !== '#') {
                                  navigate(sub.url);
                                }
                              }}
                              style={{
                                fontSize: '13px',
                                color: isSubActive ? '#2563eb' : '#64748b',
                                fontWeight: isSubActive ? 600 : 400,
                                padding: '6px 8px',
                                borderRadius: 6,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: isSubActive ? '#eff6ff' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: isSubActive ? '#2563eb' : '#cbd5e1' }} />
                              {sub.name}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer Góp ý */}
        <div style={{ padding: '20px' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ backgroundColor: '#eff6ff', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <MessageSquare size={24} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Góp ý tài liệu</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: 12 }}>Bạn có tài liệu hay muốn chia sẻ với team?</div>
            <button style={{ width: '100%', padding: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>Gửi góp ý</button>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN CONTENT AREA
          ========================================================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header Bar */}
        <header style={{ height: 72, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          
          {/* Nút Back về tài liệu chung (thay cho Search fake) */}
          <div 
            onClick={() => navigate('/tai-lieu')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', color: '#475569', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}
            className="hover:bg-slate-200"
          >
            <ArrowLeft size={18} /> Về lại kho Tài Liệu chung
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* User Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 4px 4px 16px', borderRadius: 50, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>{userName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>{userRole}</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>
                {initial}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            
            {/* Title & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Tài liệu Marketing</h1>
                <p style={{ margin: 0, fontSize: '15px', color: '#64748b' }}>Kho tài liệu, guideline và template giúp team Marketing làm việc hiệu quả và thống nhất.</p>
              </div>
            </div>

            {/* =========================================================
                KHUNG TÀI LIỆU BÁO CÁO & LỊCH BIỂU CẦN LÀM
                ========================================================= */}
            <div 
              id="bao-cao-dinh-ky"
              style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: 16, 
                border: '1px solid #e2e8f0', 
                padding: '24px', 
                marginBottom: 32,
                boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.04)',
                position: 'relative'
              }}
            >
              {/* Header của Khung */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ 
                    width: 44, 
                    height: 44, 
                    borderRadius: 12, 
                    backgroundColor: '#eff6ff', 
                    border: '1px solid #dbeafe',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#2563eb' 
                  }}>
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                        Tài liệu Báo Cáo & Lịch Biểu Cần Làm
                      </h2>
                      <span style={{ 
                        backgroundColor: '#eff6ff', 
                        color: '#2563eb', 
                        border: '1px solid #dbeafe',
                        fontSize: '11px', 
                        fontWeight: 700, 
                        padding: '2px 8px', 
                        borderRadius: 12,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px'
                      }}>
                        Định kỳ & Deadline
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                      Nơi tổng hợp các bảng tính Google Sheets báo cáo số liệu và lịch phân bổ nội dung bắt buộc của team Marketing.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#475569', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: 20, border: '1px solid #e2e8f0', fontWeight: 500 }}>
                  <Clock size={14} color="#f59e0b" />
                  <span>Tuân thủ hạn nộp báo cáo</span>
                </div>
              </div>

              {/* Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
                {recurringReports.map((report) => (
                  <div 
                    key={report.id}
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 14, 
                      border: '1px solid #e2e8f0', 
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 16,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}
                    className="hover:border-blue-300 hover:shadow-md hover:bg-white"
                  >
                    <div>
                      {/* Top Badges: Platform + Deadline */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                        {/* Platform Badge */}
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 6, 
                          backgroundColor: report.platformBg, 
                          border: `1px solid ${report.platformBorder}`, 
                          borderRadius: 8, 
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: report.platformColor
                        }}>
                          {report.platformIcon}
                          <span>{report.platform}</span>
                        </div>

                        {/* Deadline Pill */}
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 5, 
                          backgroundColor: report.cycleBg, 
                          border: `1px solid ${report.cycleBorder}`, 
                          borderRadius: 8, 
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: report.cycleColor
                        }}>
                          <Clock size={13} />
                          <span>Hạn: {report.deadline}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.45 }}>
                        {report.title}
                      </h3>

                      {/* KPI Progress Bar */}
                      {report.kpi && (
                        <div style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          padding: '8px 10px',
                          marginTop: 6
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            fontSize: '11px', 
                            marginBottom: 6,
                            gap: 6,
                            flexWrap: 'wrap'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontWeight: 600 }}>
                              <span>🎯 KPI:</span>
                              <span style={{ color: '#0f172a', fontWeight: 700 }}>{report.kpi.target}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ color: '#64748b' }}>Đạt:</span>
                              <span style={{ fontWeight: 800, color: '#0f172a' }}>{report.kpi.actual}</span>
                              <span style={{ 
                                fontSize: '10px', 
                                fontWeight: 800, 
                                color: report.kpi.badgeColor || '#059669',
                                backgroundColor: report.kpi.badgeBg || '#ecfdf5',
                                border: `1px solid ${report.kpi.badgeBorder || '#a7f3d0'}`,
                                padding: '1px 6px',
                                borderRadius: 4
                              }}>
                                {report.kpi.percentLabel}
                              </span>
                            </div>
                          </div>

                          <div style={{ 
                            height: 6, 
                            width: '100%', 
                            backgroundColor: '#e2e8f0', 
                            borderRadius: 999, 
                            overflow: 'hidden'
                          }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                width: `${Math.min(report.kpi.percent, 100)}%`, 
                                background: report.kpi.barGradient || '#10b981', 
                                borderRadius: 999,
                                transition: 'width 0.4s ease'
                              }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: Full-width balanced button bar */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      paddingTop: 14, 
                      borderTop: '1px solid #e2e8f0',
                      width: '100%'
                    }}>
                      {report.siteUrl && (
                        <a
                          href={report.siteUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            padding: '8px 14px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#0f172a',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            flex: 1,
                            minWidth: 0
                          }}
                          className="hover:border-slate-400 hover:bg-slate-50"
                        >
                          <Globe size={14} color="#059669" />
                          <span>fittour.vn</span>
                          <ExternalLink size={12} color="#64748b" />
                        </a>
                      )}

                      {report.isInternal ? (
                        <button
                          type="button"
                          onClick={() => navigate(report.docUrl)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            backgroundColor: '#0f172a',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.15)',
                            flex: report.siteUrl ? 1 : '1 1 100%',
                            width: report.siteUrl ? 'auto' : '100%',
                            minWidth: 0
                          }}
                          className="hover:bg-slate-800"
                        >
                          <span>Xem Báo Cáo</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <a
                          href={report.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 7,
                            backgroundColor: '#2563eb',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#ffffff',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
                            width: '100%',
                            flex: 1
                          }}
                          className="hover:bg-blue-700"
                        >
                          <FileSpreadsheet size={15} />
                          <span>Mở Trang Tính</span>
                          <ExternalLink size={13} style={{ opacity: 0.8 }} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* =========================================================
                  DANH MỤC BÁO CÁO ĐỊNH KỲ THEO THÁNG (LƯU TRỮ T9, T10, T11...)
                  ========================================================= */}
              <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid #e2e8f0' }}>
                
                {/* Header danh mục */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={18} color="#2563eb" />
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Danh Mục Báo Cáo Định Kỳ Theo Tháng
                      </h3>
                      <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 12, border: '1px solid #dbeafe' }}>
                        Kho Lưu Trữ
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                      Danh sách đối soát số liệu đa kênh theo từng kỳ tháng (Website, Fanpage, TikTok). Hạn nộp định kỳ: Sáng ngày 1 đầu tháng.
                    </p>
                  </div>

                  {/* Filter tabs theo tháng */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', padding: '4px', borderRadius: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedMonthFilter('all')}
                      style={{
                        border: 'none',
                        borderRadius: 7,
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: selectedMonthFilter === 'all' ? '#ffffff' : 'transparent',
                        color: selectedMonthFilter === 'all' ? '#0f172a' : '#64748b',
                        boxShadow: selectedMonthFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      Tất cả các kỳ
                    </button>
                    {monthlyArchives.map(m => (
                      <button
                        key={m.monthKey}
                        type="button"
                        onClick={() => setSelectedMonthFilter(m.monthKey)}
                        style={{
                          border: 'none',
                          borderRadius: 7,
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: selectedMonthFilter === m.monthKey ? '#ffffff' : 'transparent',
                          color: selectedMonthFilter === m.monthKey ? '#2563eb' : '#64748b',
                          boxShadow: selectedMonthFilter === m.monthKey ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                          transition: 'all 0.15s'
                        }}
                      >
                        {m.title.replace('Kỳ Báo Cáo ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Danh sách các tháng */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {monthlyArchives
                    .filter(m => selectedMonthFilter === 'all' || selectedMonthFilter === m.monthKey)
                    .map((month) => (
                      <div 
                        key={month.monthKey}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 14,
                          border: '1px solid #e2e8f0',
                          padding: '18px 20px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}
                      >
                        {/* Month Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: month.reports?.length > 0 ? 14 : 0, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: month.status === 'completed' ? '#10b981' : (month.status === 'in_progress' ? '#f59e0b' : '#94a3b8') }} />
                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                              {month.title}
                            </h4>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>({month.period})</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: 700, 
                              backgroundColor: month.statusBg, 
                              color: month.statusColor, 
                              border: `1px solid ${month.statusBorder}`,
                              padding: '3px 10px', 
                              borderRadius: 12 
                            }}>
                              {month.statusLabel}
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={13} color="#f59e0b" /> Hạn: {month.deadline}
                            </span>
                          </div>
                        </div>

                        {/* Ghi chú kỳ */}
                        {month.note && (
                          <div style={{ fontSize: '13px', color: '#475569', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9', marginBottom: month.reports?.length > 0 ? 14 : 0 }}>
                            {month.note}
                          </div>
                        )}

                        {/* Danh sách báo cáo trong kỳ */}
                        {month.reports?.length > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 12 }}>
                            {month.reports.map((rpt) => (
                              <div 
                                key={rpt.id}
                                style={{
                                  backgroundColor: '#f8fafc',
                                  borderRadius: 10,
                                  border: '1px solid #e2e8f0',
                                  padding: '14px 16px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  gap: 10,
                                  transition: 'border-color 0.15s'
                                }}
                                className="hover:border-slate-300"
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 6, flexWrap: 'wrap' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 600, color: rpt.channelColor, backgroundColor: rpt.channelBg, border: `1px solid ${rpt.channelBorder}`, padding: '2px 8px', borderRadius: 6 }}>
                                      {rpt.channelIcon}
                                      <span>{rpt.channel}</span>
                                    </div>
                                    {rpt.kpiBadge && (
                                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 6, border: '1px solid #a7f3d0' }}>
                                        {rpt.kpiBadge}
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                                    {rpt.name}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                                    {rpt.summary}
                                  </div>

                                  {/* KPI Progress Bar */}
                                  {rpt.kpi && (
                                    <div style={{
                                      backgroundColor: '#ffffff',
                                      borderRadius: 8,
                                      border: '1px solid #e2e8f0',
                                      padding: '8px 10px',
                                      marginTop: 8
                                    }}>
                                      <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        fontSize: '11px', 
                                        marginBottom: 6,
                                        gap: 6,
                                        flexWrap: 'wrap'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontWeight: 600 }}>
                                          <span>🎯 KPI:</span>
                                          <span style={{ color: '#0f172a', fontWeight: 700 }}>{rpt.kpi.target}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                          <span style={{ color: '#64748b' }}>Đạt:</span>
                                          <span style={{ fontWeight: 800, color: '#0f172a' }}>{rpt.kpi.actual}</span>
                                          <span style={{ 
                                            fontSize: '10px', 
                                            fontWeight: 800, 
                                            color: rpt.kpi.badgeColor || '#059669',
                                            backgroundColor: rpt.kpi.badgeBg || '#ecfdf5',
                                            border: `1px solid ${rpt.kpi.badgeBorder || '#a7f3d0'}`,
                                            padding: '1px 6px',
                                            borderRadius: 4
                                          }}>
                                            {rpt.kpi.percentLabel}
                                          </span>
                                        </div>
                                      </div>

                                      <div style={{ 
                                        height: 6, 
                                        width: '100%', 
                                        backgroundColor: '#e2e8f0', 
                                        borderRadius: 999, 
                                        overflow: 'hidden'
                                      }}>
                                        <div 
                                          style={{ 
                                            height: '100%', 
                                            width: `${Math.min(rpt.kpi.percent, 100)}%`, 
                                            background: rpt.kpi.barGradient || '#10b981', 
                                            borderRadius: 999,
                                            transition: 'width 0.4s ease'
                                          }} 
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, paddingTop: 8, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                                  {rpt.inProgress ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '12px', color: '#b45309', fontStyle: 'italic', fontWeight: 500 }}>
                                        ⏳ Đang thu thập số liệu...
                                      </span>
                                      {rpt.siteUrl && (
                                        <a
                                          href={rpt.siteUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            backgroundColor: '#16a34a',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: 6,
                                            padding: '4px 10px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            cursor: 'pointer'
                                          }}
                                          className="hover:bg-green-700"
                                        >
                                          <Globe size={11} />
                                          <span>Trang Chính Thức</span>
                                          <ExternalLink size={10} />
                                        </a>
                                      )}
                                      {rpt.sheetUrl && (
                                        <a
                                          href={rpt.sheetUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            backgroundColor: '#2563eb',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: 6,
                                            padding: '4px 10px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            cursor: 'pointer'
                                          }}
                                          className="hover:bg-blue-700"
                                        >
                                          <FileSpreadsheet size={11} />
                                          <span>Trang Tính T10</span>
                                          <ExternalLink size={10} />
                                        </a>
                                      )}
                                    </div>
                                  ) : (
                                    <>
                                      {rpt.docUrl && (
                                        <button
                                          type="button"
                                          onClick={() => navigate(rpt.docUrl)}
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            backgroundColor: '#0f172a',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: 6,
                                            padding: '5px 12px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                          }}
                                          className="hover:bg-slate-800"
                                        >
                                          <FileText size={12} />
                                          <span>Đọc Báo Cáo</span>
                                        </button>
                                      )}

                                      {rpt.siteUrl && (
                                        <a
                                          href={rpt.siteUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            backgroundColor: '#16a34a',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: 6,
                                            padding: '5px 12px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            cursor: 'pointer'
                                          }}
                                          className="hover:bg-green-700"
                                        >
                                          <Globe size={12} />
                                          <span>Trang Chính Thức</span>
                                          <ExternalLink size={12} />
                                        </a>
                                      )}

                                      {rpt.sheetUrl && (
                                        <a
                                          href={rpt.sheetUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            backgroundColor: '#2563eb',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: 6,
                                            padding: '5px 12px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            cursor: 'pointer'
                                          }}
                                          className="hover:bg-blue-700"
                                        >
                                          <span>Trang Tính</span>
                                          <ExternalLink size={12} />
                                        </a>
                                      )}

                                      {rpt.htmlUrl && (
                                        <a
                                          href={rpt.htmlUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            backgroundColor: '#0284c7',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: 6,
                                            padding: '5px 12px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            cursor: 'pointer'
                                          }}
                                          className="hover:bg-sky-700"
                                        >
                                          <span>Bản HTML</span>
                                          <ExternalLink size={12} />
                                        </a>
                                      )}

                                      {rpt.emailUrl && (
                                        <a
                                          href={rpt.emailUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            backgroundColor: '#be185d',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: 6,
                                            padding: '5px 12px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            cursor: 'pointer'
                                          }}
                                          className="hover:bg-pink-800"
                                        >
                                          <span>Email Preview</span>
                                          <ExternalLink size={12} />
                                        </a>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

              </div>
            </div>

            {/* 4 Category Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24, marginBottom: 32 }}>
              {[
                { 
                  title: 'Guideline', 
                  desc: 'Quy chuẩn thương hiệu, định dạng nội dung...', 
                  icon: <FileText size={24} color="#3b82f6" />, 
                  bg: '#eff6ff', 
                  links: [
                    { label: 'Đọc Guideline', url: '/cam-nang-thuong-hieu', internal: true }
                  ] 
                },
                { 
                  title: 'Logo', 
                  desc: 'Logo gốc FIT Tour & Elite BU3 (PNG, Vector, AI, SVG...)', 
                  icon: <ImageIcon size={24} color="#16a34a" />, 
                  bg: '#f0fdf4', 
                  links: [
                    { label: 'Mở Google Drive', url: 'https://drive.google.com/drive/folders/1KcLWiW6mMnLjxw-xXbiOwmR6Qn9tSs6g?usp=sharing', internal: false, blank: true }
                  ] 
                },
                { 
                  title: 'Blueprint & SOP Ads', 
                  desc: 'Quy tắc target, lên content, đặt tên chiến dịch Meta Ads...', 
                  icon: <Star size={24} color="#f59e0b" />, 
                  bg: '#fef3c7', 
                  links: [
                    { label: 'Xem Blueprint', url: '/tai-lieu/blueprint-meta-ads', internal: true },
                    { label: 'SOP Đặt Tên', url: '/tai-lieu/quy-tac-dat-ten-quang-cao-meta', internal: true },
                    { label: 'Quản lý Ads', url: 'https://docs.google.com/spreadsheets/d/15O9hrCdZvVoLwC8fRQCYm5nxs0WGL9s8RQ3XScj0jQo/edit?usp=sharing', internal: false, blank: true }
                  ] 
                },
                { 
                  title: 'Asset', 
                  desc: 'Hình ảnh, video, template thiết kế, tài nguyên...', 
                  icon: <ImageIcon size={24} color="#9333ea" />, 
                  bg: '#faf5ff', 
                  links: [
                    { label: 'Xem tất cả (chưa có)', url: '#', internal: false, preventDefault: true }
                  ] 
                },
                { 
                  title: 'Báo Cáo Ads', 
                  desc: 'Báo cáo phân tích hiệu suất Ads Q2/2026', 
                  icon: <Star size={24} color="#ec4899" />, 
                  bg: '#fdf2f8', 
                  links: [
                    { label: 'Xem Báo Cáo', url: '/q2-report/index.html', internal: false, blank: true }
                  ] 
                },
              ].map((card, idx) => (
                <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ backgroundColor: card.bg, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 16px' }}>
                    {card.icon}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 12px' }}>{card.title}</h3>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px', flex: 1 }}>{card.desc}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {card.links.map((linkItem, lIdx) => (
                      linkItem.internal ? (
                        <Link key={lIdx} to={linkItem.url} style={{ fontSize: '14px', fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {linkItem.label} <ArrowRight size={16} />
                        </Link>
                      ) : (
                        <a key={lIdx} href={linkItem.url} onClick={linkItem.preventDefault ? (e) => e.preventDefault() : undefined} target={linkItem.blank ? "_blank" : "_self"} rel="noreferrer" style={{ fontSize: '14px', fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {linkItem.label} <ArrowRight size={16} />
                        </a>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Main Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              
              {/* Left Column: Cập nhật mới nhất */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>Cập nhật mới nhất</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentUpdates.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: 12, border: '1px solid #f1f5f9', transition: 'background 0.2s', cursor: 'pointer' }} className="hover:bg-slate-50">
                      <div style={{ backgroundColor: item.bg, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 16 }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{item.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: item.color, backgroundColor: item.bg, padding: '2px 8px', borderRadius: 6 }}>{item.category}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: '#64748b' }}>
                            <img src={`https://ui-avatars.com/api/?name=${item.author.replace(' ','+')}&background=e2e8f0&color=475569`} style={{ width: 16, height: 16, borderRadius: '50%' }} /> {item.author}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{item.time}</div>
                    </div>
                  ))}
                </div>
                
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <a href="#!" onClick={(e) => e.preventDefault()} style={{ fontSize: '14px', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>Xem tất cả bài viết (chưa có) →</a>
                </div>
              </div>

              {/* Right Column: Truy cập nhanh & Best Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Truy cập nhanh */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Truy cập nhanh</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {quickLinks.map((link, idx) => {
                      if (link.external && link.url) {
                        return (
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            key={idx} 
                            style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px', borderRadius: 8 }} 
                            className="hover:bg-slate-50 hover:text-blue-600"
                          >
                            <span style={{ color: '#94a3b8' }}>{link.icon}</span> 
                            <span style={{ flex: 1 }}>{link.name}</span>
                            <ExternalLink size={13} style={{ color: '#94a3b8' }} />
                          </a>
                        );
                      }
                      if (link.url) {
                        return (
                          <Link to={link.url} key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px', borderRadius: 8 }} className="hover:bg-slate-50 hover:text-blue-600">
                            <span style={{ color: '#94a3b8' }}>{link.icon}</span> {link.name}
                          </Link>
                        );
                      }
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#94a3b8', fontSize: '14px', fontWeight: 500, padding: '8px', borderRadius: 8, cursor: 'not-allowed' }}>
                          <span style={{ color: '#cbd5e1' }}>{link.icon}</span> {link.name}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Best Content nổi bật */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Best Content nổi bật</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {bestContents.map((content, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 12, cursor: 'pointer' }}>
                        <img src={content.img} alt="Thumbnail" style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: 4, lineHeight: 1.4 }}>{content.title}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Reach: <strong style={{ color: '#0f172a' }}>{content.reach}</strong> • Lead: <strong style={{ color: '#0f172a' }}>{content.lead}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                    <a href="#!" onClick={(e) => e.preventDefault()} style={{ fontSize: '14px', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>Xem tất cả (chưa có) →</a>
                  </div>
                </div>

              </div>

            </div>
          </div>
          
          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 40, paddingBottom: 20, fontSize: '13px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', maxWidth: 1200, margin: '40px auto 0' }}>
            <span>© 2026 FIT Tour. All rights reserved.</span>
            <span>Phiên bản 1.0.0</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default MarketingHub;
