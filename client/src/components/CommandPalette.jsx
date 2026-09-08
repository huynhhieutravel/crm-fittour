import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, FileText, LayoutTemplate, Briefcase, Users, Navigation, ExternalLink, 
    MessageSquare, MapPin, UserCheck, CheckCircle, Building, Calendar, Clock, 
    UserPlus, DollarSign, Activity, BookOpen, Settings, Shield, Star, Mail, Phone,
    Sparkles, HelpCircle, Bot, Megaphone, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ═══════════════════════════════════════════════════════
// DANH SÁCH TOÀN BỘ MODULE & TÀI LIỆU — Khớp chính xác VALID_TABS & Tài liệu nội bộ
// ═══════════════════════════════════════════════════════
const globalSearchData = [
    // ── 1. LIÊN KẾT NGOÀI & HƯỚNG DẪN ĐẶC BIỆT ──
    {
        id: 'ext-huong-dan-danh-gia',
        title: 'Hướng Dẫn Đánh Giá FIT TOUR Trên Google Maps',
        subtitle: 'fittour.vn/huong-dan-danh-gia-fit-tour • Hướng dẫn khách hàng đánh giá 5 sao kèm hình ảnh',
        path: 'https://fittour.vn/huong-dan-danh-gia-fit-tour',
        type: 'external',
        icon: Star,
        keywords: 'huong dan danh gia google maps review 5 sao fit tour hdv tour leader khach hang viet nhan xet link guide map'
    },
    {
        id: 'ext-google-maps-fit-tour',
        title: 'Link Google Maps FIT TOUR (Gửi khách đánh giá)',
        subtitle: 'Trang Google Maps chính thức của FIT TOUR để khách hàng để lại Review 5 sao',
        path: 'https://maps.app.goo.gl/wJkP1N3yqP1M3zQ66',
        type: 'external',
        icon: MapPin,
        keywords: 'link google maps fit tour cham sao review viet danh gia truc tiep dia diem'
    },
    {
        id: 'ext-website-fittour',
        title: 'Website FIT TOUR Chính Thức',
        subtitle: 'fittour.vn • Du lịch trải nghiệm có Guu',
        path: 'https://fittour.vn',
        type: 'external',
        icon: Navigation,
        keywords: 'website fittour trang chu web fit tour'
    },
    {
        id: 'ext-checklist-thiet-ke-tour',
        title: 'Checklist Thiết Kế Tour Mới (Google Sheets)',
        subtitle: 'Bảng checklist thiết kế và chuẩn bị sản phẩm tour mới của phòng Điều Hành',
        path: 'https://docs.google.com/spreadsheets/d/1GcDo5omS19co79Gv3vQ-Naf9v2TudWf9LmMr_w8LFvQ/edit?gid=0#gid=0',
        type: 'external',
        icon: FileText,
        keywords: 'checklist thiet ke tour san pham moi dieu hanh google sheet'
    },

    // ── 2. CORE & DASHBOARD ──
    { id: 'dashboard', title: 'Dashboard Tổng quan', path: '/dashboard', icon: LayoutTemplate, keywords: 'dashboard tong quan bao cao thong ke kpi doanh thu crm' },
    { id: 'workspace', title: 'Workspace: Khu vực làm việc', path: '/workspace', icon: LayoutTemplate, keywords: 'workspace ban lam viec todo viec can lam nhiem vu ca nhan' },
    { id: 'leads', title: 'Quản lý Lead (Nguồn cơ hội)', path: '/leads', icon: Users, keywords: 'quan ly lead nguon co hoi khach tiem nang sdt so dien thoai inbox' },
    { id: 'leads-dashboard', title: 'Dashboard Lead & Hiệu suất', path: '/leads-dashboard', icon: LayoutTemplate, keywords: 'dashboard lead ty le chuyen doi conversion phan bo lead' },
    { id: 'staff-performance', title: 'Hiệu suất Nhân viên', path: '/staff-performance', icon: Activity, keywords: 'hieu suat nhan vien kpi nang suat doanh so sale' },
    { id: 'customers', title: 'Danh sách Khách hàng', path: '/customers', icon: Users, keywords: 'danh sach khach hang crm thong tin khach cskh tra cuu' },
    { id: 'bookings', title: 'Quản lý Đơn hàng (Bookings)', path: '/bookings', icon: Briefcase, keywords: 'quan ly don hang bookings dat tour hop dong thanh toan' },

    // ── 3. TOURS & OPERATIONS (ĐIỀU HÀNH) ──
    { id: 'tours', title: 'Mẫu Chương trình Tour (Templates)', path: '/tours', icon: MapPin, keywords: 'mau chuong trinh tour templates lich trinh tuyen diem' },
    { id: 'departures', title: 'Ngày Khởi hành (Departures)', path: '/departures', icon: Navigation, keywords: 'ngay khoi hanh departures lich tour lich khoi hanh open tour' },
    { id: 'dispatch-schedule', title: 'Lịch Điều phối Tour (Dispatch)', path: '/dispatch-schedule', icon: Calendar, keywords: 'lich dieu phoi dispatch tour phan bo tour leader hdv' },
    { id: 'bus', title: 'Quản lý Xe Bus', path: '/bus', icon: Navigation, keywords: 'quan ly xe bus van chuyen tuyen xe so do ghe' },
    { id: 'guides', title: 'Danh sách Hướng dẫn viên', path: '/guides', icon: UserCheck, keywords: 'danh sach huong dan vien hdv tour leader' },
    { id: 'customer-reviews', title: 'Đánh giá của Khách hàng (Reviews)', path: '/guides/reviews', icon: Star, keywords: 'danh gia khach hang reviews feedback google maps star sao chat luong' },
    { id: 'op-tours', title: 'Điều hành Tour (OP)', path: '/op-tours', icon: Navigation, keywords: 'dieu hanh op tour van hanh dich vu tour leader ncc cong no' },
    { id: 'costings', title: 'Bảng tính giá Tour (Costings)', path: '/costings', icon: DollarSign, keywords: 'bang tinh gia tour costings chi phi gia loi nhuan budget' },
    { id: 'reminders', title: 'Nhắc nhở công việc (Reminders)', path: '/reminders', icon: Clock, keywords: 'nhac nho cong viec reminders deadline lich hen task' },

    // ── 4. CSKH ──
    { id: 'cskh-board', title: 'Chăm sóc Khách hàng (CSKH Board)', path: '/cskh-board', icon: MessageSquare, keywords: 'cskh board cham soc khach hang sau tour truoc tour khao sat' },
    { id: 'cskh-todo', title: 'Công việc CSKH (To-do)', path: '/cskh-todo', icon: CheckCircle, keywords: 'cong viec cskh todo viec can lam cham soc khach' },
    { id: 'cskh-search', title: 'Tra cứu CSKH', path: '/cskh-search', icon: Search, keywords: 'tra cuu cskh tim kiem khach hang lich su cham soc' },
    { id: 'cskh-rules', title: 'Cấu hình Rules CSKH', path: '/customers/cskh-rules', icon: Settings, keywords: 'cau hinh rules cskh quy tac cham soc tu dong' },

    // ── 5. TOUR ĐOÀN (MICE & B2B) ──
    { id: 'group-dashboard', title: 'Dashboard MICE (Tour Đoàn)', path: '/group/dashboard', icon: LayoutTemplate, keywords: 'dashboard mice tour doan doanh nghiep cong ty' },
    { id: 'b2b-companies', title: 'Công ty Đối tác (B2B)', path: '/group/companies', icon: Building, keywords: 'cong ty doi tac b2b dai ly doanh nghiep to chuc' },
    { id: 'companies', title: 'Doanh nghiệp & Công ty', path: '/companies', icon: Building, keywords: 'doanh nghiep cong ty b2b khach hang to chuc' },
    { id: 'group-leaders', title: 'Trưởng đoàn (Group Leaders)', path: '/group/leaders', icon: Users, keywords: 'truong doan group leaders dai dien doan' },
    { id: 'group-projects', title: 'Dự án Tour Đoàn (Projects)', path: '/group/projects', icon: Briefcase, keywords: 'du an tour doan group projects dau thau bao gia' },
    { id: 'group-mice-leads', title: 'MICE Leads (Tour Đoàn)', path: '/group/mice-leads', icon: Users, keywords: 'mice leads tour doan yeu cau co hoi' },
    { id: 'marketing-google-ads', title: 'Báo Cáo Google Ads (BU3 B2B)', path: '/group/google-ads', icon: Search, keywords: 'google ads search quang cao bu3 b2b tour doan doanh nghiep ga4 tuong tac zalo hotline' },

    // ── 6. SUPPLIERS (NHÀ CUNG CẤP - NCC) ──
    { id: 'hotels', title: 'NCC: Khách sạn (Hotels)', path: '/hotels', icon: Building, keywords: 'ncc khach san hotels resort phong nghi luu tru' },
    { id: 'restaurants', title: 'NCC: Nhà hàng (Restaurants)', path: '/restaurants', icon: Building, keywords: 'ncc nha hang restaurants an uong dat ban buffet am thuc' },
    { id: 'transports', title: 'NCC: Vận chuyển (Transports)', path: '/transports', icon: Navigation, keywords: 'ncc van chuyen transports xe thue xe oto xe du lich' },
    { id: 'airlines', title: 'NCC: Vé máy bay (Airlines)', path: '/airlines', icon: Navigation, keywords: 'ncc ve may bay airlines hang khong booking ve' },
    { id: 'tickets', title: 'NCC: Vé tham quan (Tickets)', path: '/tickets', icon: FileText, keywords: 'ncc ve tham quan tickets voucher ve vao cong' },
    { id: 'landtours', title: 'NCC: Land Tour', path: '/landtours', icon: MapPin, keywords: 'ncc land tour landtour doi tac dia phuong' },
    { id: 'insurances', title: 'NCC: Bảo hiểm (Insurances)', path: '/insurances', icon: Shield, keywords: 'ncc bao hiem insurances bao hiem du lich quyen loi' },
    { id: 'visas', title: 'Dịch vụ Visa', path: '/visas', icon: FileText, keywords: 'dich vu visa thi thuc ho chieu lam visa bao gia' },
    { id: 'visa-providers', title: 'NCC: Dịch vụ Visa', path: '/visa-providers', icon: Building, keywords: 'ncc visa nha cung cap doi tac dich vu visa' },
    { id: 'visa-products', title: 'Sản phẩm Visa', path: '/visa-products', icon: MapPin, keywords: 'san pham visa cac loai visa bang gia' },
    { id: 'visa-form-templates', title: 'Mẫu khai Visa (Form Templates)', path: '/visa-form-templates', icon: FileText, keywords: 'mau khai visa to khai form template don xin visa' },

    // ── 7. GIAO TIẾP & MARKETING ──
    { id: 'email', title: 'Hộp thư Email', path: '/email', icon: Mail, keywords: 'email mail hop thu outlook zoho thu den thu di' },
    { id: 'email-groups', title: 'Nhóm Email (Email Groups)', path: '/email-groups', icon: Mail, keywords: 'nhom email email groups danh sach mail hop thu chung' },
    { id: 'email-rules', title: 'Cấu hình Rules Email', path: '/email-rules', icon: Settings, keywords: 'cau hinh rules email quy tac mail tu dong' },
    { id: 'inbox', title: 'Messenger / Facebook Chat', path: '/inbox', icon: MessageSquare, keywords: 'messenger facebook chat inbox tin nhan fanpage fb' },
    { id: 'zalo-sandbox', title: 'Zalo Sandbox (Chat OA & Test)', path: '/zalo-sandbox', icon: MessageSquare, keywords: 'zalo sandbox chat oa tin nhan bot webhook test' },
    { id: 'zalo-ai-settings', title: 'Cấu hình Zalo AI Bot', path: '/zalo-ai-settings', icon: Bot, keywords: 'zalo ai bot cau hinh chatgpt tro ly tu dong tin nhan' },
    { id: 'message-templates', title: 'Mẫu tin nhắn (Templates)', path: '/message-templates', icon: MessageSquare, keywords: 'mau tin nhan message templates tra loi nhanh sms zalo' },
    { id: 'marketing-ads', title: 'Quản trị Meta Ads (Data/KPI)', path: '/marketing-ads', icon: DollarSign, keywords: 'chi phi marketing ads bao cao quang cao facebook meta ngan sach cpa cpl' },
    { id: 'travel-support', title: 'Hỗ trợ Khách (Travel Support)', path: '/travel-support', icon: Phone, keywords: 'ho tro khach travel support cskh hotline cap cuu 24/7' },

    // ── 8. NHÂN SỰ & HÀNH CHÍNH (HR & ADMIN) ──
    { id: 'staff-calendar', title: 'Lịch làm việc nhân viên', path: '/staff-calendar', icon: Calendar, keywords: 'lich lam viec nhan vien staff calendar ca lam truc' },
    { id: 'leaves', title: 'Quản lý Nghỉ phép (Leaves)', path: '/leaves', icon: Clock, keywords: 'quan ly nghi phep leaves don xin phep ngay nghi phep nam' },
    { id: 'team-directory', title: 'Danh bạ nhân viên FIT Tour', path: '/team-directory', icon: Phone, keywords: 'danh ba nhan vien fit tour so dien thoai email lien he' },
    { id: 'org-chart', title: 'Sơ đồ tổ chức (Org Chart)', path: '/org-chart', icon: LayoutTemplate, keywords: 'so do to chuc org chart phong ban co cau nhan su' },
    { id: 'meeting-rooms', title: 'Phòng họp (Meeting Rooms)', path: '/meeting-rooms', icon: Building, keywords: 'phong hop meeting rooms dat phong lich hop' },
    { id: 'users', title: 'Quản trị Người dùng (Users)', path: '/users', icon: UserPlus, keywords: 'quan tri nguoi dung users tai khoan phan quyen admin' },
    { id: 'my-profile', title: 'Hồ sơ cá nhân', path: '/my-profile', icon: Users, keywords: 'ho so ca nhan my profile thong tin doi mat khau' },
    { id: 'notification-center', title: 'Trung tâm Thông báo', path: '/notification-center', icon: Bell, keywords: 'trung tam thong bao notification center tin moi chuong alerts' },
    { id: 'notification-dashboard', title: 'Dashboard Thông báo', path: '/notification-dashboard', icon: LayoutTemplate, keywords: 'dashboard thong bao notification metrics thong ke' },

    // ── 9. TÀI CHÍNH & KẾ TOÁN ──
    { id: 'accountants', title: 'Quản trị Kế toán', path: '/accountants', icon: DollarSign, keywords: 'quan tri ke toan accountants so sach thu chi' },
    { id: 'vouchers', title: 'Ủy nhiệm chi (Vouchers)', path: '/vouchers', icon: FileText, keywords: 'uy nhiem chi vouchers ngan hang unc chuyen khoan' },
    { id: 'payment-vouchers', title: 'Phiếu chi / Thanh toán', path: '/payment-vouchers', icon: FileText, keywords: 'phieu chi thanh toan payment vouchers chung tu tien mat' },
    { id: 'passport-ocr', title: 'Quét Passport (OCR)', path: '/passport-ocr', icon: FileText, keywords: 'quet passport ocr ho chieu scan quet anh tu dong' },

    // ── 10. HỆ THỐNG & CẤU HÌNH ──
    { id: 'settings', title: 'Cấu hình Hệ thống', path: '/settings', icon: Settings, keywords: 'cau hinh he thong settings cai dat chung' },
    { id: 'market-settings', title: 'Cấu hình Thị trường (Markets)', path: '/market-settings', icon: Settings, keywords: 'cau hinh thi truong markets bu tuyen tour dia ban' },
    { id: 'media-settings', title: 'Quản lý Media & Giao diện', path: '/media-settings', icon: Settings, keywords: 'quan ly media giao dien banner thu vien anh' },
    { id: 'teams', title: 'Quản lý Nhóm (Teams)', path: '/teams', icon: Users, keywords: 'quan ly nhom teams phong ban phan nhom' },
    { id: 'audit-logs', title: 'Nhật ký hệ thống (Audit Logs)', path: '/audit-logs', icon: Activity, keywords: 'nhat ky he thong audit logs lich su truy vet thao tac' },
    { id: 'agent-manager', title: 'Quản lý AI Agent', path: '/agent-manager', icon: Bot, keywords: 'quan ly ai agent tro ly thong minh bot' },
    { id: 'bu-rules', title: 'Quy tắc Business Unit (BU)', path: '/bu-rules', icon: Shield, keywords: 'quy tac business unit bu rules phan bo lead tu khoa marketing' },
    { id: 'management-dashboard', title: 'Dashboard Quản lý (CEO)', path: '/management-dashboard', icon: LayoutTemplate, keywords: 'dashboard quan ly ceo giam doc tong quan doanh nghiep' },
    { id: 'ceo-departures-dashboard', title: 'Dashboard Điều hành (CEO)', path: '/ceo-departures-dashboard', icon: LayoutTemplate, keywords: 'dashboard dieu hanh ceo giam doc khoi hanh tong quan' },

    // ── 11. TÀI LIỆU NỘI BỘ, SOP & CẨM NANG (/tai-lieu) ──
    {
        id: 'doc-chinh-sach-danh-gia',
        title: 'SOP Chính Sách Đánh Giá (Review HDV)',
        subtitle: 'SOP-MKT-006 • Thưởng review 5 sao Google 100k - 150k cho Tour Leader & HDV',
        type: 'doc',
        path: '/tai-lieu/chinh-sach-danh-gia',
        icon: Star,
        keywords: 'sop chinh sach danh gia review google maps hdv thuong 100k 150k marketing cskh quy che'
    },
    {
        id: 'doc-tai-lieu',
        title: 'Trang Chủ Trung Tâm Tài Liệu (/tai-lieu)',
        subtitle: 'Thư viện SOP, cẩm nang bán hàng, biểu mẫu và quy trình công ty',
        type: 'doc',
        path: '/tai-lieu',
        icon: BookOpen,
        keywords: 'trang chu tai lieu noi bo sop cam nang hub huong dan quy trinh'
    },
    {
        id: 'doc-hub-hdv',
        title: 'HUB Hướng Dẫn Viên',
        subtitle: 'Bàn làm việc của HDV — checklist, review đánh giá, SOP xử lý sự cố',
        type: 'doc',
        path: '/hdv',
        icon: UserCheck,
        keywords: 'hub hdv huong dan vien ban lam viec danh gia review checklist tour leader'
    },
    {
        id: 'doc-quy-che-hdv',
        title: 'Quy Chế Lương Hướng Dẫn Viên',
        subtitle: 'Chính sách lương, thưởng, công tác phí, phụ cấp cho HDV FIT Tour',
        type: 'doc',
        path: '/tai-lieu/quy-che-luong-hdv',
        icon: DollarSign,
        keywords: 'quy che luong hdv thuong cong tac phi phu cap huong dan vien'
    },
    {
        id: 'doc-sop-sales',
        title: 'SOP Sales & Quy Trình Workplace',
        subtitle: 'Hướng dẫn Sales nhận Lead, cập nhật ERP và tối ưu Workplace',
        type: 'doc',
        path: '/tai-lieu/sop-sales',
        icon: Briefcase,
        keywords: 'sop sales ban hang quy trinh lead workplace chot deal'
    },
    {
        id: 'doc-sop-dieu-phoi',
        title: 'SOP Điều Phối Lead',
        subtitle: 'Quy trình tiếp nhận và phân bổ Lead dành cho Trung tâm Điều phối',
        type: 'doc',
        path: '/tai-lieu/sop-dieu-phoi',
        icon: Navigation,
        keywords: 'sop dieu phoi lead tiep nhan chia lead phan bo sale'
    },
    {
        id: 'doc-tong-quan-lead',
        title: 'Tổng Quan Quy Trình Xử Lý Lead',
        subtitle: 'Bức tranh toàn cảnh về quy trình xử lý Lead từ Marketing đến Sales',
        type: 'doc',
        path: '/tai-lieu/tong-quan-lead',
        icon: LayoutTemplate,
        keywords: 'tong quan quy trinh lead dieu phoi sale buc tranh toan canh'
    },
    {
        id: 'doc-quy-trinh-sale-op',
        title: 'Quy Trình Phối Hợp Sale & Điều Hành',
        subtitle: 'Nhắc nhở quy trình làm việc giữa Sale & Điều Hành và các lỗi sai thường gặp',
        type: 'doc',
        path: '/tai-lieu/quy-trinh-sale-dieu-hanh',
        icon: Activity,
        keywords: 'quy trinh sale dieu hanh op phoi hop ban giao tour loi sai'
    },
    {
        id: 'doc-quy-trinh-thanh-toan',
        title: 'Quy Trình Thanh Toán & Quyết Toán Tour',
        subtitle: 'Quy trình thanh toán, bàn giao, quyết toán tour cho Kế toán & OP',
        type: 'doc',
        path: '/tai-lieu/quy-trinh-thanh-toan-ban-giao-quyet-toan-tour',
        icon: DollarSign,
        keywords: 'quy trinh thanh toan ban giao quyet toan tour ke toan op chung tu'
    },
    {
        id: 'doc-co-che-kpi',
        title: 'Cơ Chế Lương – KPI – Thưởng FIT Tour',
        subtitle: 'Quyết định ban hành cơ chế lương – KPI – thưởng và phúc lợi nhân sự',
        type: 'doc',
        path: '/tai-lieu/co-che-kpi',
        icon: DollarSign,
        keywords: 'co che kpi luong thuong phuc loi nhan su ban giam doc'
    },
    {
        id: 'doc-dat-ten-tour',
        title: 'SOP Chuẩn Hóa Tên Tour',
        subtitle: 'Quy chuẩn đặt tên tour trên ERP, Website và Social Media',
        type: 'doc',
        path: '/tai-lieu/dat-ten-tour',
        icon: BookOpen,
        keywords: 'sop chuan hoa dat ten tour erp website social media quy chuan'
    },
    {
        id: 'doc-zoho-email',
        title: 'Hướng Dẫn Cài Đặt Zoho Mail',
        subtitle: 'Hướng dẫn cài đặt Zoho Mail với Outlook, Apple Mail, Spark (IMAP)',
        type: 'doc',
        path: '/tai-lieu/zoho-email',
        icon: Mail,
        keywords: 'huong dan cai dat zoho mail outlook apple mail spark imap ket noi'
    },
    {
        id: 'doc-bo-nguyen-tac',
        title: 'Bộ Nguyên Tắc Hành Xử Nhân Viên Văn Phòng',
        subtitle: 'Quy tắc ứng xử, giao tiếp, ra quyết định, xử lý sự cố',
        type: 'doc',
        path: '/tai-lieu/bo-nguyen-tac-hanh-xu-nhan-vien',
        icon: BookOpen,
        keywords: 'bo nguyen tac hanh xu nhan vien van phong quy tac ung xu giao tiep van hoa'
    },
    {
        id: 'doc-rule-meta-ads',
        title: 'Rule Meta Ads FIT Tour',
        subtitle: 'Các quy tắc bắt buộc và khuyến nghị khi thiết lập chiến dịch Meta Ads',
        type: 'doc',
        path: '/tai-lieu/rule-meta-ads',
        icon: Shield,
        keywords: 'rule meta ads facebook quang cao quy tac marketing'
    },
    {
        id: 'doc-blueprint-meta-ads',
        title: 'Blueprint Meta Ads',
        subtitle: 'Hướng dẫn chạy quảng cáo Meta chuẩn FIT Tour - Quy tắc đặt tên, target, content',
        type: 'doc',
        path: '/tai-lieu/blueprint-meta-ads',
        icon: LayoutTemplate,
        keywords: 'blueprint meta ads facebook quang cao marketing target content'
    },
    {
        id: 'doc-sop-meta-ads',
        title: 'SOP Quy Ước Đặt Tên Meta Ads',
        subtitle: 'Quy chuẩn đặt tên chiến dịch, nhóm quảng cáo và mẫu quảng cáo',
        type: 'doc',
        path: '/tai-lieu/sop-meta-ads',
        icon: BookOpen,
        keywords: 'sop quy uoc dat ten meta ads campaign adset naming convention'
    },
    {
        id: 'doc-lead-marketing-rules',
        title: 'Quy Tắc Phân Loại Lead Marketing',
        subtitle: 'Quy tắc dọn dẹp Auto-Fail và Re-open cho Lead Marketing',
        type: 'doc',
        path: '/tai-lieu/marketing/quy-tac-phan-loai',
        icon: Shield,
        keywords: 'quy tac phan loai lead marketing auto fail reopen don dep'
    },
    {
        id: 'doc-brand-guideline',
        title: 'Brand Identity Guideline',
        subtitle: 'Tài liệu hướng dẫn nhận diện thương hiệu FIT Tour (logo, màu sắc, font chữ...)',
        type: 'doc',
        path: '/tai-lieu/brand-guideline',
        icon: BookOpen,
        keywords: 'brand identity guideline nhan dien thuong hieu logo font mau sac'
    },
    {
        id: 'doc-cam-nang-thuong-hieu',
        title: 'Cẩm Nang Thương Hiệu FIT Tour',
        subtitle: 'Truly Experiences • Giá trị cốt lõi và định vị thương hiệu',
        type: 'doc',
        path: '/cam-nang-thuong-hieu',
        icon: Star,
        keywords: 'cam nang thuong hieu truly experiences fit tour phong cach'
    },
    {
        id: 'doc-tu-van-cuu-trai-cau',
        title: 'Cẩm Nang Chốt Sale Cửu Trại Câu (BU1)',
        subtitle: 'Kịch bản chat, FAQ cọc 50/50, visa đoàn, SIM data và cẩm nang tư vấn',
        type: 'doc',
        path: '/tai-lieu/tu-van-cuu-trai-cau',
        icon: BookOpen,
        keywords: 'cam nang chot sale cuu trai cau bu1 trung quoc thanh do tu van khach hang'
    },
    {
        id: 'doc-tu-van-ladakh',
        title: 'Cẩm Nang Chốt Sale Ladakh (BU4)',
        subtitle: 'Cẩm nang tư vấn và chốt sale tuyến tour Ladakh Ấn Độ',
        type: 'doc',
        path: '/tai-lieu/tu-van-ladakh-bu4',
        icon: BookOpen,
        keywords: 'cam nang chot sale ladakh bu4 an do tu van khach hang'
    },
    {
        id: 'doc-tu-van-bhutan',
        title: 'Cẩm Nang Chốt Sale Bhutan (5N4Đ)',
        subtitle: 'Cẩm nang tư vấn và chốt sale tuyến tour vương quốc hạnh phúc Bhutan',
        type: 'doc',
        path: '/tai-lieu/tu-van-bhutan-5n4d',
        icon: BookOpen,
        keywords: 'cam nang chot sale bhutan 5n4d tu van tour'
    },
    {
        id: 'doc-hub-marketing',
        title: 'HUB Marketing (Tài Liệu & Chiến Lược)',
        subtitle: 'Tài liệu Marketing, format bài đăng & báo cáo hiệu suất team',
        type: 'doc',
        path: '/tai-lieu/marketing',
        icon: Activity,
        keywords: 'hub marketing chien luoc content pr quang cao'
    },
    {
        id: 'doc-hub-sale',
        title: 'HUB Kinh Doanh (Sale)',
        subtitle: 'Tài liệu dành cho phòng kinh doanh, quy trình bán hàng',
        type: 'doc',
        path: '/tai-lieu/sale',
        icon: Briefcase,
        keywords: 'hub kinh doanh sale ban hang chot tour khach hang'
    },
    {
        id: 'doc-hub-dieu-hanh',
        title: 'HUB Điều Hành (OP)',
        subtitle: 'Quy trình điều hành tour, vận hành dịch vụ và hồ sơ nhà cung cấp',
        type: 'doc',
        path: '/tai-lieu/dieu-hanh',
        icon: Navigation,
        keywords: 'hub dieu hanh op van hanh dich vu quy trinh'
    },
    {
        id: 'doc-hub-ke-toan',
        title: 'HUB Kế Toán (Tài Chính & Kế Toán)',
        subtitle: 'Nghiệp vụ kế toán, quy trình tài chính nội bộ',
        type: 'doc',
        path: '/tai-lieu/ke-toan',
        icon: DollarSign,
        keywords: 'hub ke toan tai chinh chung tu so sach thu chi'
    },
    {
        id: 'doc-bieu-mau',
        title: 'Biểu Mẫu Hành Chính & Giấy Phép',
        subtitle: 'Giấy phép kinh doanh, GPLH quốc tế, biểu mẫu nội bộ',
        type: 'doc',
        path: '/tai-lieu/bieu-mau',
        icon: FileText,
        keywords: 'bieu mau hanh chinh giay phep kinh doanh gpkd gplh quoc te'
    },
    {
        id: 'doc-manual',
        title: 'Sổ Tay Hướng Dẫn Sử Dụng ERP (Manual)',
        subtitle: 'Sổ tay hướng dẫn chi tiết các tính năng trên hệ thống FIT Tour CRM',
        type: 'doc',
        path: '/manual/overview',
        icon: BookOpen,
        keywords: 'so tay huong dan su dung erp manual crm tinh nang'
    }
];

const quickActions = [
    { id: 'go-leads', title: 'Đi tới Leads (Khách tiềm năng)', type: 'action', action: 'open-add-lead-modal', icon: Users, subtitle: 'Mở trang Quản lý Lead', keywords: 'di toi lead khach tiem nang them moi lead' },
    { id: 'go-customers', title: 'Đi tới Khách hàng', type: 'action', action: 'open-add-customer-modal', icon: Users, subtitle: 'Mở trang Khách hàng', keywords: 'di toi khach hang them moi khach' },
    { id: 'go-bookings', title: 'Đi tới Đơn hàng (Bookings)', type: 'action', action: 'open-add-booking-modal', icon: Briefcase, subtitle: 'Mở trang Đơn hàng', keywords: 'di toi don hang booking dat tour' },
];

// Chuẩn hóa tiếng Việt bỏ dấu (hỗ trợ cả chữ đ/Đ)
const removeVietnameseTones = (str) => {
    if (!str) return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .toLowerCase()
        .trim();
};

const CommandPalette = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [dynamicDocs, setDynamicDocs] = useState([]);
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cmdPaletteRecent') || '[]');
        } catch { return []; }
    });
    
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Fetch dynamic licenses & announcements
    useEffect(() => {
        const fetchRemoteDocs = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const [licRes, annRes] = await Promise.allSettled([
                    axios.get('/api/licenses', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/api/announcements', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                const docs = [];
                if (licRes.status === 'fulfilled' && Array.isArray(licRes.value.data)) {
                    licRes.value.data.forEach(l => {
                        docs.push({
                            id: `license-${l.id}`,
                            title: `Biểu mẫu: ${l.name}`,
                            subtitle: l.description || 'Biểu mẫu hành chính công ty',
                            type: 'doc-dynamic',
                            path: l.link || '/licenses?tab=licenses',
                            icon: ExternalLink,
                            keywords: `bieu mau ${l.name} ${l.description || ''}`
                        });
                    });
                }

                if (annRes.status === 'fulfilled' && Array.isArray(annRes.value.data)) {
                    annRes.value.data.forEach(a => {
                        docs.push({
                            id: `announcement-${a.id}`,
                            title: `[${a.code}] ${a.title}`,
                            subtitle: a.summary || 'Thông báo văn bản nội bộ',
                            type: 'doc-dynamic',
                            path: `/licenses?tab=announcements&id=${a.id}`,
                            icon: FileText,
                            keywords: `thong bao van ban ${a.code} ${a.title}`
                        });
                    });
                }

                setDynamicDocs(docs);
            } catch (err) {
                console.error('Failed to pre-fetch licenses & announcements', err);
            }
        };
        fetchRemoteDocs();
    }, []);

    // Toggle Modal on Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        const handleCustomOpen = () => setIsOpen(true);
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-command-palette', handleCustomOpen);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-command-palette', handleCustomOpen);
        };
    }, [isOpen]);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Tìm kiếm thông minh: Multi-token + Ranking Score
    const allItems = [...globalSearchData, ...quickActions, ...dynamicDocs];
    const qTrim = query.trim();
    const qNorm = removeVietnameseTones(qTrim);
    const qTokens = qNorm.split(/\s+/).filter(Boolean);

    const filteredData = qTokens.length === 0 
        ? allItems.slice(0, 15)
        : allItems
            .map(item => {
                const tNorm = removeVietnameseTones(item.title);
                const sNorm = removeVietnameseTones(item.subtitle || '');
                const kNorm = removeVietnameseTones(item.keywords || '');
                const idNorm = item.id.toLowerCase();
                const pathNorm = (item.path || '').toLowerCase();
                const fullSearchText = `${tNorm} ${sNorm} ${kNorm} ${idNorm} ${pathNorm}`;

                // Tất cả từ khóa trong ô tìm kiếm phải có mặt trong văn bản
                const matchesAll = qTokens.every(token => fullSearchText.includes(token));
                if (!matchesAll) return null;

                // Tính điểm xếp hạng (Relevance Scoring)
                let score = 0;
                if (tNorm === qNorm) score += 120;
                else if (tNorm.startsWith(qNorm)) score += 80;
                else if (tNorm.includes(qNorm)) score += 50;
                else if (kNorm.includes(qNorm)) score += 35;
                else if (sNorm.includes(qNorm)) score += 25;

                // Cộng điểm theo từng token
                qTokens.forEach(token => {
                    if (tNorm.includes(token)) score += 15;
                    if (kNorm.includes(token)) score += 8;
                    if (sNorm.includes(token)) score += 4;
                });

                return { item, score };
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score)
            .map(res => res.item)
            .slice(0, 15);

    // Keyboard navigation
    useEffect(() => {
        const handleNavigation = (e) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < filteredData.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredData[selectedIndex]) {
                    handleSelect(filteredData[selectedIndex], e.metaKey || e.ctrlKey);
                }
            }
        };
        window.addEventListener('keydown', handleNavigation);
        return () => window.removeEventListener('keydown', handleNavigation);
    }, [isOpen, filteredData, selectedIndex]);

    const handleSelect = (item, isNewTab = false) => {
        setIsOpen(false);
        setQuery('');

        // Lưu vào truy cập gần đây
        const safeItem = { 
            id: item.id, 
            title: item.title, 
            type: item.type, 
            path: item.path, 
            subtitle: item.subtitle 
        };
        const newRecent = [safeItem, ...recentSearches.filter(r => r.id !== item.id)].slice(0, 5);
        setRecentSearches(newRecent);
        try { localStorage.setItem('cmdPaletteRecent', JSON.stringify(newRecent)); } catch {}

        if (item.type === 'action') {
            window.dispatchEvent(new CustomEvent(item.action));
            return;
        }

        if (item.type === 'doc-dynamic' && item.path !== '#') {
            window.open(item.path, '_blank');
            return;
        }

        if (isNewTab || item.type === 'external' || (item.path && item.path.startsWith('http'))) {
            window.open(item.path, '_blank');
        } else {
            navigate(item.path);
            if (onNavigate) onNavigate(item.id);
        }
    };

    const highlightMatch = (text, highlight) => {
        if (!highlight || !text) return text;
        const nText = removeVietnameseTones(text);
        const nHighlight = removeVietnameseTones(highlight);
        const index = nText.indexOf(nHighlight);
        if (index === -1) return text;
        
        const matchLen = Math.min(highlight.length, text.length - index);
        return (
            <>
                {text.substring(0, index)}
                <span style={{ backgroundColor: '#fed7aa', color: '#9a3412', padding: '0 2px', borderRadius: '3px', fontWeight: '700' }}>
                    {text.substring(index, index + matchLen)}
                </span>
                {text.substring(index + matchLen)}
            </>
        );
    };

    // Resolve icon from recent (which doesn't store icon component)
    const getIcon = (item) => {
        if (item.icon) return item.icon;
        const found = allItems.find(i => i.id === item.id);
        return found?.icon || Search;
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex', justifyContent: 'center', paddingTop: '10vh'
        }} onClick={() => setIsOpen(false)}>
            <div 
                style={{
                    backgroundColor: '#ffffff',
                    width: '640px',
                    maxWidth: '92%',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                    overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    animation: 'fadeIn 0.15s ease-out',
                    maxHeight: '75vh',
                    border: '1px solid #e2e8f0'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#fafaf9' }}>
                    <Search color="#e55e20" size={22} style={{ marginRight: '14px', flexShrink: 0 }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Tìm mô-đun, tài liệu, SOP, link đánh giá, biểu mẫu..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        style={{
                            flex: 1, border: 'none', outline: 'none',
                            fontSize: '16px', color: '#0f172a',
                            backgroundColor: 'transparent', fontWeight: '500'
                        }}
                    />
                    <div style={{ 
                        fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', 
                        padding: '3px 7px', borderRadius: '5px', fontWeight: '700',
                        border: '1px solid #cbd5e1'
                    }}>
                        ESC
                    </div>
                </div>

                {/* Recent */}
                {query.length === 0 && recentSearches.length > 0 && (
                    <div style={{ padding: '10px 18px', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Truy cập gần đây</span>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {recentSearches.map(r => (
                                <div key={r.id} onClick={() => handleSelect(r)} style={{ fontSize: '12px', padding: '5px 12px', backgroundColor: '#f8fafc', borderRadius: '20px', cursor: 'pointer', color: '#334155', border: '1px solid #e2e8f0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>{r.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results List */}
                <div style={{ padding: '8px', maxHeight: '480px', overflowY: 'auto' }}>
                    {filteredData.length === 0 ? (
                        <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px', color: '#1e293b' }}>Không tìm thấy kết quả phù hợp</div>
                            <div style={{ fontSize: '13px' }}>Thử tìm từ khóa khác: "đánh giá", "google maps", "review", "khách sạn", "visa", "sop"...</div>
                        </div>
                    ) : (
                        filteredData.map((item, index) => {
                            const isSelected = index === selectedIndex;
                            const IconComponent = getIcon(item);
                            
                            return (
                                <div 
                                    key={item.id}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    onClick={(e) => handleSelect(item, e.metaKey || e.ctrlKey)}
                                    style={{
                                        display: 'flex', alignItems: 'center', padding: '10px 14px',
                                        backgroundColor: isSelected ? '#fff7ed' : 'transparent',
                                        borderRadius: '10px', cursor: 'pointer',
                                        transition: 'all 0.1s ease', gap: '14px'
                                    }}
                                >
                                    <div style={{ 
                                        backgroundColor: isSelected ? '#ffedd5' : '#f8fafc',
                                        padding: '9px', borderRadius: '10px', flexShrink: 0,
                                        boxShadow: isSelected ? '0 2px 5px rgba(229, 94, 32, 0.15)' : 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <IconComponent size={18} color={isSelected ? '#e55e20' : '#64748b'} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h4 style={{ margin: 0, fontSize: '14px', color: isSelected ? '#9a3412' : '#1e293b', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {highlightMatch(item.title, query)}
                                            </h4>
                                            {item.badge && (
                                                <span style={{ fontSize: '10px', background: '#eff6ff', color: '#2563eb', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, flexShrink: 0 }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        {item.subtitle && (
                                            <div style={{ fontSize: '12px', color: isSelected ? '#7c2d12' : '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {highlightMatch(item.subtitle, query)}
                                            </div>
                                        )}
                                        <div style={{ marginTop: '2px' }}>
                                            <span style={{ textTransform: 'uppercase', fontSize: '9.5px', fontWeight: '700', color: isSelected ? '#ea580c' : '#94a3b8' }}>
                                                {item.type === 'action' ? '⚡ Hành động nhanh' : item.type === 'doc-dynamic' ? '📋 Biểu mẫu' : item.type === 'doc' ? '📖 Tài liệu / SOP' : item.type === 'external' ? '🔗 Liên kết ngoài' : '📦 Mô-đun'}
                                            </span>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div style={{ fontSize: '11px', color: '#ea580c', backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '6px', border: '1px solid #fed7aa', fontWeight: '600', flexShrink: 0 }}>
                                            {item.type === 'external' ? 'Mở tab ↗' : '↵ Enter'}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                
                {/* Footer */}
                <div style={{ padding: '10px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ backgroundColor: '#ffffff', padding: '1px 5px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600' }}>↑↓</span> Điều hướng
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ backgroundColor: '#ffffff', padding: '1px 5px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600' }}>↵</span> Chọn
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ backgroundColor: '#ffffff', padding: '1px 5px', borderRadius: '3px', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600' }}>⌘ ↵</span> Mở Tab mới
                        </div>
                    </div>
                    <span style={{ color: '#cbd5e1' }}>FIT TOUR ERP Quick Search</span>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default CommandPalette;
