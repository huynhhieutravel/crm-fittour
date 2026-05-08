import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, FileText, LayoutTemplate, Briefcase, Users, Navigation, ExternalLink, 
    MessageSquare, MapPin, UserCheck, CheckCircle, Building, Calendar, Clock, 
    UserPlus, DollarSign, Activity, BookOpen, Settings, Shield, Star, Mail, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ═══════════════════════════════════════════════════════
// DANH SÁCH TOÀN BỘ MODULE — Path khớp chính xác với VALID_TABS / sidebar navigate
// ═══════════════════════════════════════════════════════
const globalSearchData = [
    // Core
    { id: 'dashboard', title: 'Dashboard Tổng quan', path: '/dashboard', icon: LayoutTemplate },
    { id: 'workspace', title: 'Workspace: Khu vực làm việc', path: '/workspace', icon: LayoutTemplate },
    { id: 'leads', title: 'Quản lý Lead (Nguồn cơ hội)', path: '/leads', icon: Users },
    { id: 'leads-dashboard', title: 'Dashboard Lead & Hiệu suất', path: '/leads-dashboard', icon: LayoutTemplate },
    { id: 'staff-performance', title: 'Hiệu suất Nhân viên', path: '/staff-performance', icon: Activity },
    { id: 'customers', title: 'Danh sách Khách hàng', path: '/customers', icon: Users },
    { id: 'bookings', title: 'Quản lý Đơn hàng (Bookings)', path: '/bookings', icon: Briefcase },

    // Tours & Operations
    { id: 'tours', title: 'Mẫu Chương trình Tour (Templates)', path: '/tours', icon: MapPin },
    { id: 'departures', title: 'Ngày Khởi hành (Departures)', path: '/departures', icon: Navigation },
    { id: 'bus', title: 'Quản lý Xe Bus', path: '/bus', icon: Navigation },
    { id: 'guides', title: 'Danh sách Hướng dẫn viên', path: '/guides', icon: UserCheck },
    { id: 'op-tours', title: 'Điều hành Tour (OP)', path: '/op-tours', icon: Navigation },
    { id: 'costings', title: 'Bảng tính giá Tour (Costings)', path: '/costings', icon: DollarSign },
    { id: 'reminders', title: 'Nhắc nhở công việc (Reminders)', path: '/reminders', icon: Clock },

    // CSKH
    { id: 'cskh-board', title: 'Chăm sóc Khách hàng (CSKH Board)', path: '/cskh-board', icon: MessageSquare },
    { id: 'cskh-todo', title: 'Công việc CSKH (To-do)', path: '/cskh-todo', icon: CheckCircle },
    { id: 'cskh-search', title: 'Tra cứu CSKH', path: '/cskh-search', icon: Search },
    { id: 'customer-reviews', title: 'Đánh giá của Khách hàng', path: '/guides/reviews', icon: Star },

    // Tour Đoàn (Group) — paths dạng /group/xxx
    { id: 'group-dashboard', title: 'Dashboard MICE (Tour Đoàn)', path: '/group/dashboard', icon: LayoutTemplate },
    { id: 'b2b-companies', title: 'Công ty Đối tác (B2B)', path: '/group/companies', icon: Building },
    { id: 'group-leaders', title: 'Trưởng đoàn (Group Leaders)', path: '/group/leaders', icon: Users },
    { id: 'group-projects', title: 'Dự án Tour Đoàn (Projects)', path: '/group/projects', icon: Briefcase },
    { id: 'group-mice-leads', title: 'MICE Leads (Tour Đoàn)', path: '/group/mice-leads', icon: Users },

    // Suppliers (NCC)
    { id: 'hotels', title: 'NCC: Khách sạn (Hotels)', path: '/hotels', icon: Building },
    { id: 'restaurants', title: 'NCC: Nhà hàng', path: '/restaurants', icon: Building },
    { id: 'transports', title: 'NCC: Vận chuyển', path: '/transports', icon: Navigation },
    { id: 'airlines', title: 'NCC: Vé máy bay (Airlines)', path: '/airlines', icon: Navigation },
    { id: 'tickets', title: 'NCC: Vé tham quan (Tickets)', path: '/tickets', icon: FileText },
    { id: 'landtours', title: 'NCC: Land Tour', path: '/landtours', icon: MapPin },
    { id: 'insurances', title: 'NCC: Bảo hiểm', path: '/insurances', icon: Shield },
    { id: 'visas', title: 'Dịch vụ Visa', path: '/visas', icon: FileText },

    // Communication
    { id: 'email', title: 'Hộp thư Email', path: '/email', icon: Mail },
    { id: 'inbox', title: 'Messenger / Facebook Chat', path: '/inbox', icon: MessageSquare },
    { id: 'travel-support', title: 'Hỗ trợ Khách (Travel Support)', path: '/travel-support', icon: Phone },

    // Marketing
    { id: 'marketing-ads', title: 'Chi phí Marketing Ads', path: '/marketing-ads', icon: DollarSign },
    { id: 'management-dashboard', title: 'Dashboard Quản lý (CEO)', path: '/management-dashboard', icon: LayoutTemplate },

    // HR & Admin
    { id: 'staff-calendar', title: 'Lịch làm việc nhân viên', path: '/staff-calendar', icon: Calendar },
    { id: 'leaves', title: 'Quản lý Nghỉ phép', path: '/leaves', icon: Clock },
    { id: 'team-directory', title: 'Danh bạ nhân viên FIT Tour', path: '/team-directory', icon: Phone },
    { id: 'org-chart', title: 'Sơ đồ tổ chức (Org Chart)', path: '/org-chart', icon: LayoutTemplate },
    { id: 'users', title: 'Quản trị Người dùng (Users)', path: '/users', icon: UserPlus },
    { id: 'my-profile', title: 'Hồ sơ cá nhân', path: '/my-profile', icon: Users },

    // Finance
    { id: 'vouchers', title: 'Ủy nhiệm chi (Vouchers)', path: '/vouchers', icon: FileText },
    { id: 'payment-vouchers', title: 'Phiếu chi / Thanh toán', path: '/payment-vouchers', icon: FileText },
    { id: 'passport-ocr', title: 'Quét Passport (OCR)', path: '/passport-ocr', icon: FileText },

    // Docs & System
    { id: 'tai-lieu', title: 'Tài liệu nội bộ', path: '/tai-lieu', icon: BookOpen },
    { id: 'licenses', title: 'Biểu mẫu Văn phòng', path: '/licenses', icon: FileText },
    { id: 'manual', title: 'Sổ tay hướng dẫn (Manual)', path: '/manual/overview', icon: BookOpen },
    { id: 'workflow', title: 'Quy trình làm việc (Workflow)', path: '/workflow', icon: Activity },
    { id: 'bu-rules', title: 'Quy tắc Business Unit (BU)', path: '/bu-rules', icon: Shield },
    { id: 'brand', title: 'Cẩm nang Thương hiệu FIT Tour', path: '/cam-nang-thuong-hieu', icon: Star },
    { id: 'settings', title: 'Cấu hình Hệ thống', path: '/settings', icon: Settings },
    { id: 'market-settings', title: 'Cấu hình Thị trường (Markets)', path: '/market-settings', icon: Settings },
    { id: 'media-settings', title: 'Quản lý Media & Giao diện', path: '/media-settings', icon: Settings },
    { id: 'teams', title: 'Quản lý Nhóm (Teams)', path: '/teams', icon: Users },
    { id: 'audit-logs', title: 'Nhật ký hệ thống (Audit Logs)', path: '/audit-logs', icon: Activity },
    { id: 'agent-manager', title: 'Quản lý AI Agent', path: '/agent-manager', icon: Settings },
    { id: 'ceo-departures-dashboard', title: 'Dashboard Điều hành (CEO)', path: '/ceo-departures-dashboard', icon: LayoutTemplate },
    { id: 'email-mailboxes', title: 'Cấu hình Hộp thư', path: '/email/mailboxes', icon: Settings },
    { id: 'cskh-rules', title: 'Cấu hình Rules CSKH', path: '/customers/cskh-rules', icon: Settings },
];

const quickActions = [
    { id: 'go-leads', title: 'Đi tới Leads', type: 'action', action: 'open-add-lead-modal', icon: Users, subtitle: 'Mở trang Quản lý Lead' },
    { id: 'go-customers', title: 'Đi tới Khách hàng', type: 'action', action: 'open-add-customer-modal', icon: Users, subtitle: 'Mở trang Khách hàng' },
    { id: 'go-bookings', title: 'Đi tới Đơn hàng', type: 'action', action: 'open-add-booking-modal', icon: Briefcase, subtitle: 'Mở trang Đơn hàng' },
];

const removeVietnameseTones = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
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

    // Fetch dynamic licenses (biểu mẫu)
    useEffect(() => {
        const fetchRemoteDocs = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('/api/licenses', { headers: { Authorization: `Bearer ${token}` } });
                const docs = res.data.map(l => ({
                    id: `license-${l.id}`,
                    title: `Biểu mẫu: ${l.name}`,
                    type: 'doc-dynamic',
                    path: l.link || '#',
                    icon: ExternalLink
                }));
                setDynamicDocs(docs);
            } catch (err) {
                console.error('Failed to pre-fetch licenses', err);
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

    // Filter modules + quick actions + dynamic docs (pure frontend, instant)
    const allItems = [...globalSearchData, ...quickActions, ...dynamicDocs];
    const filteredData = query.length === 0 
        ? allItems.slice(0, 12)
        : allItems.filter(item => {
            const qNorm = removeVietnameseTones(query);
            const tNorm = removeVietnameseTones(item.title);
            return tNorm.includes(qNorm) || item.id.includes(qNorm);
        }).slice(0, 12);

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

        // Save to Recent
        const safeItem = { id: item.id, title: item.title, type: item.type, path: item.path };
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

        if (isNewTab) {
            window.open(item.path, '_blank');
        } else {
            navigate(item.path);
            if (onNavigate) onNavigate(item.id);
        }
    };

    const highlightMatch = (text, highlight) => {
        if (!highlight) return text;
        const nText = removeVietnameseTones(text);
        const nHighlight = removeVietnameseTones(highlight);
        const index = nText.indexOf(nHighlight);
        if (index === -1) return text;
        
        return (
            <>
                {text.substring(0, index)}
                <span style={{ fontWeight: '800', color: '#1d4ed8' }}>{text.substring(index, index + highlight.length)}</span>
                {text.substring(index + highlight.length)}
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
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex', justifyContent: 'center', paddingTop: '10vh'
        }} onClick={() => setIsOpen(false)}>
            <div 
                style={{
                    backgroundColor: '#ffffff',
                    width: '600px',
                    maxWidth: '90%',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    animation: 'fadeIn 0.15s ease-out',
                    maxHeight: '70vh'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                    <Search color="#64748b" size={20} style={{ marginRight: '12px' }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Tìm mô-đun, tài liệu hoặc phím tắt..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        style={{
                            flex: 1, border: 'none', outline: 'none',
                            fontSize: '18px', color: '#0f172a',
                            backgroundColor: 'transparent'
                        }}
                    />
                    <div style={{ 
                        fontSize: '11px', color: '#94a3b8', backgroundColor: '#f1f5f9', 
                        padding: '2px 6px', borderRadius: '4px', fontWeight: '600'
                    }}>
                        ESC
                    </div>
                </div>

                {/* Recent */}
                {query.length === 0 && recentSearches.length > 0 && (
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Truy cập gần đây</span>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                            {recentSearches.map(r => (
                                <div key={r.id} onClick={() => handleSelect(r)} style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#f8fafc', borderRadius: '20px', cursor: 'pointer', color: '#475569', border: '1px solid #e2e8f0' }}>
                                    {r.title}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results */}
                <div style={{ padding: '8px', maxHeight: '450px', overflowY: 'auto' }}>
                    {filteredData.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>Không tìm thấy mô-đun nào</div>
                            <div style={{ fontSize: '13px' }}>Thử gõ tên khác: "khách sạn", "đánh giá", "visa"...</div>
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
                                        display: 'flex', alignItems: 'center', padding: '10px 16px',
                                        backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                                        borderRadius: '8px', cursor: 'pointer',
                                        transition: 'all 0.1s ease'
                                    }}
                                >
                                    <div style={{ 
                                        backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                                        padding: '8px', borderRadius: '8px', marginRight: '16px',
                                        boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                    }}>
                                        <IconComponent size={18} color={isSelected ? '#3b82f6' : '#94a3b8'} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '14px', color: isSelected ? '#0f172a' : '#334155', fontWeight: '600' }}>
                                            {highlightMatch(item.title, query)}
                                        </h4>
                                        <span style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: '700', color: isSelected ? '#60a5fa' : '#cbd5e1' }}>
                                            {item.type === 'action' ? 'Hành động nhanh' : item.type === 'doc-dynamic' ? 'Biểu mẫu' : 'Mô-đun'}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <div style={{ fontSize: '10px', color: '#94a3b8', backgroundColor: '#ffffff', padding: '2px 4px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>↵ Enter</div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
                
                {/* Footer */}
                <div style={{ padding: '10px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '20px', fontSize: '11px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ backgroundColor: '#ffffff', padding: '1px 4px', borderRadius: '3px', border: '1px solid #e2e8f0', color: '#64748b' }}>↑↓</span> Điều hướng
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ backgroundColor: '#ffffff', padding: '1px 4px', borderRadius: '3px', border: '1px solid #e2e8f0', color: '#64748b' }}>↵</span> Chọn
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ backgroundColor: '#ffffff', padding: '1px 4px', borderRadius: '3px', border: '1px solid #e2e8f0', color: '#64748b' }}>⌘ ↵</span> Tab mới
                    </div>
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
