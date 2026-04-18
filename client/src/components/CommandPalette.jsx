import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, LayoutTemplate, Briefcase, Users, Navigation, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const globalSearchData = [
    { id: 'dashboard', title: 'Dashboard Tổng quan', type: 'module', path: '/dashboard', icon: LayoutTemplate },
    { id: 'leads', title: 'Quản lý Nguồn cơ hội (Leads)', type: 'module', path: '/leads', icon: Users },
    { id: 'tours', title: 'Mẫu Chương trình (Tour Templates)', type: 'module', path: '/tours', icon: Briefcase },
    { id: 'departures', title: 'Bán Ngày Khởi Hành (Departures)', type: 'module', path: '/departures', icon: Navigation },
    { id: 'bookings', title: 'Đơn hàng Bán chạy (Bookings)', type: 'module', path: '/bookings', icon: Briefcase },
    { id: 'customers', title: 'Quản trị Khách hàng', type: 'module', path: '/customers', icon: Users },
    { id: 'internal-docs', title: 'Tài liệu: Quy chế lương HDV', type: 'doc', path: '/internal-docs', icon: FileText },
    { id: 'licenses', title: 'Tài liệu: Biểu mẫu Văn phòng', type: 'doc', path: '/licenses', icon: FileText },
    { id: 'leaves', title: 'Nhân sự: Quản lý Nghỉ phép', type: 'module', path: '/leaves', icon: Users },
    { id: 'staff-calendar', title: 'Nhân sự: Lịch làm việc', type: 'module', path: '/staff-calendar', icon: Users },
    { id: 'passport-ocr', title: 'Quét tự động Passport OCR', type: 'module', path: '/passport-ocr', icon: FileText },
    { id: 'costings', title: 'Bảng tính giá (Costings)', type: 'module', path: '/costings', icon: FileText },
    { id: 'op-tours', title: 'Điều hành Tour (OP)', type: 'module', path: '/op-tours', icon: Navigation },
    { id: 'vouchers', title: 'Ủy nhiệm chi (Vouchers)', type: 'module', path: '/vouchers', icon: FileText },
    { id: 'marketing-ads', title: 'Chi phí Marketing Ads', type: 'module', path: '/marketing-ads', icon: LayoutTemplate },
    { id: 'team-directory', title: 'Danh bạ FIT Tour', type: 'module', path: '/team-directory', icon: Users },
];

const removeVietnameseTones = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const CommandPalette = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [dynamicDocs, setDynamicDocs] = useState([]);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Fetch dynamic licenses directly into the search pool
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
                console.error('Failed to pre-fetch licenses for Command Palette', err);
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

    const combinedData = [...globalSearchData, ...dynamicDocs];
    const filteredData = combinedData.filter(item => {
        const searchRaw = removeVietnameseTones(query);
        const itemRaw = removeVietnameseTones(item.title);
        return itemRaw.includes(searchRaw) || item.id.includes(searchRaw);
    }).slice(0, 8); // Giới hạn 8 kết quả

    // Handle Keyboard navigation
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
                    handleSelect(filteredData[selectedIndex]);
                }
            }
        };
        window.addEventListener('keydown', handleNavigation);
        return () => window.removeEventListener('keydown', handleNavigation);
    }, [isOpen, filteredData, selectedIndex]);

    const handleSelect = (item) => {
        setIsOpen(false);
        setQuery('');
        
        if (item.type === 'doc-dynamic') {
            if (item.path !== '#') {
                window.open(item.path, '_blank');
            } else {
                navigate('/licenses');
                if (onNavigate) onNavigate('licenses');
            }
            return;
        }

        navigate(item.path);
        if (onNavigate) {
            onNavigate(item.id);
        }
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
                    animation: 'fadeIn 0.15s ease-out'
                }}
                onClick={(e) => e.stopPropagation()} // Chống đóng khi click vào trong modal
            >
                {/* Search Header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                    <Search color="#64748b" size={20} style={{ marginRight: '12px' }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Tìm kiếm tài liệu, mô-đun hoặc chức năng..."
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
                        fontSize: '12px', color: '#94a3b8', backgroundColor: '#f1f5f9', 
                        padding: '4px 8px', borderRadius: '6px', fontWeight: '500' 
                    }}>ESC</div>
                </div>

                {/* Results Area */}
                <div style={{ padding: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredData.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                            Không tìm thấy kết quả nào cho "{query}"
                        </div>
                    ) : (
                        filteredData.map((item, index) => {
                            const isSelected = index === selectedIndex;
                            const IconComponent = item.icon;
                            
                            return (
                                <div 
                                    key={item.id}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    onClick={() => handleSelect(item)}
                                    style={{
                                        display: 'flex', alignItems: 'center', padding: '12px 16px',
                                        backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                                        borderRadius: '8px', cursor: 'pointer',
                                        transition: 'background-color 0.1s'
                                    }}
                                >
                                    <div style={{ 
                                        backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                                        padding: '8px', borderRadius: '8px', marginRight: '16px'
                                    }}>
                                        <IconComponent size={18} color={isSelected ? '#3b82f6' : '#64748b'} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '15px', color: isSelected ? '#1e3a8a' : '#334155', fontWeight: '500' }}>
                                            {item.title}
                                        </h4>
                                        <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
                                            {item.type === 'doc' ? 'Tài liệu nội bộ' : 
                                             item.type === 'doc-dynamic' ? 'Tài liệu Động (Drive/URL)' : 'Mô-đun chức năng'}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>
                                            Nhấn Enter
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
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
