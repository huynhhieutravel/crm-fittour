import React, { useState, useEffect } from 'react';
import { FileText, Image, ExternalLink, FolderOpen, X } from 'lucide-react';

const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getItemStyle = (type) => {
    switch (type) {
        case 'pdf':
            return {
                bg: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                iconBoxBg: '#fee2e2'
            };
        case 'image':
            return {
                bg: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#16a34a',
                iconBoxBg: '#dcfce7'
            };
        case 'doc':
            return {
                bg: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#2563eb',
                iconBoxBg: '#dbeafe'
            };
        case 'drive':
            return {
                bg: '#f0f9ff',
                border: '1px solid #bae6fd',
                color: '#0284c7',
                iconBoxBg: '#e0f2fe'
            };
        default:
            return {
                bg: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                iconBoxBg: '#f1f5f9'
            };
    }
};

const getItemIcon = (type, size = 13) => {
    switch (type) {
        case 'pdf':
            return <FileText size={size} color="#dc2626" />;
        case 'image':
            return <Image size={size} color="#16a34a" />;
        case 'doc':
            return <FileText size={size} color="#2563eb" />;
        case 'drive':
            return <ExternalLink size={size} color="#0284c7" />;
        default:
            return <FileText size={size} color="#64748b" />;
    }
};

export default function SupplierFilesCell({ mediaFiles = [], driveLink = '', title = '', customSingleLabel = '' }) {
    const [isOpen, setIsOpen] = useState(false);

    // Normalize all files + drive_link
    const items = [];
    if (Array.isArray(mediaFiles)) {
        mediaFiles.forEach((f, idx) => {
            if (f && f.file_url) {
                const ext = (f.file_url.split('.').pop() || '').toLowerCase();
                const isPdf = f.file_type === 'pdf' || ext === 'pdf';
                const isDoc = f.file_type === 'doc' || ext === 'doc' || ext === 'docx';
                const isImg = f.file_type === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);
                items.push({
                    id: f.id || `file_${idx}`,
                    name: f.file_name || (isPdf ? 'Tài liệu PDF' : isImg ? 'Hình ảnh' : 'Tệp đính kèm'),
                    url: f.file_url,
                    type: isPdf ? 'pdf' : isDoc ? 'doc' : isImg ? 'image' : 'file',
                    size: f.file_size
                });
            }
        });
    }

    if (driveLink && driveLink.trim()) {
        items.push({
            id: 'drive_link',
            name: 'Thư mục / Tài liệu Google Drive',
            url: driveLink.trim(),
            type: 'drive',
            size: null
        });
    }

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Case 0: No files
    if (items.length === 0) {
        return <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>—</span>;
    }

    // Case 1: Exactly 1 file / link
    if (items.length === 1) {
        const item = items[0];
        const style = getItemStyle(item.type);
        let label = customSingleLabel;
        if (!label) {
            if (item.type === 'pdf') {
                label = item.name.toLowerCase().includes('menu') ? 'Menu (PDF)' : 'Xem PDF';
            } else if (item.type === 'image') {
                label = 'Xem ảnh';
            } else if (item.type === 'doc') {
                label = 'Word';
            } else if (item.type === 'drive') {
                label = 'Drive';
            } else {
                label = 'Xem tệp';
            }
        }

        return (
            <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${item.name}${item.size ? ` (${formatFileSize(item.size)})` : ''}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    background: style.bg,
                    color: style.color,
                    border: style.border,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
                {getItemIcon(item.type, 12)}
                <span>{label}</span>
            </a>
        );
    }

    // Case >= 2: Multiple files
    return (
        <>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                title={`Có ${items.length} tệp tài liệu - Nhấp để mở danh sách`}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#dbeafe')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#eff6ff')}
            >
                <FolderOpen size={13} color="#2563eb" />
                <span>{items.length} tệp</span>
            </button>

            {isOpen && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99999,
                        backgroundColor: 'rgba(15, 23, 42, 0.55)',
                        backdropFilter: 'blur(3px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        cursor: 'default'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '500px',
                            maxWidth: '100%',
                            background: 'white',
                            borderRadius: '14px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: '85vh'
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#f8fafc'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: '#eff6ff',
                                        border: '1px solid #bfdbfe',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <FolderOpen size={18} color="#2563eb" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                                        Tài liệu & Tệp đính kèm
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                        {title || 'Nhà cung cấp'} • {items.length} tệp
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: '#f1f5f9',
                                    border: 'none',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                                onMouseOut={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* List */}
                        <div
                            style={{
                                padding: '16px 20px',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                maxHeight: '380px'
                            }}
                        >
                            {items.map((item, idx) => {
                                const style = getItemStyle(item.type);
                                return (
                                    <div
                                        key={item.id || idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                            padding: '10px 14px',
                                            background: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.borderColor = '#93c5fd';
                                            e.currentTarget.style.background = '#f8fafc';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.background = '#ffffff';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                            <div
                                                style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '8px',
                                                    background: style.iconBoxBg,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}
                                            >
                                                {getItemIcon(item.type, 16)}
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div
                                                    title={item.name}
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: '0.86rem',
                                                        color: '#1e293b',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {item.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: '0.74rem',
                                                        color: '#64748b',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        marginTop: '2px'
                                                    }}
                                                >
                                                    <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                                                        {item.type === 'drive' ? 'Google Drive' : item.type}
                                                    </span>
                                                    {item.size && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{formatFileSize(item.size)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                padding: '6px 12px',
                                                background: '#2563eb',
                                                color: 'white',
                                                borderRadius: '6px',
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                textDecoration: 'none',
                                                flexShrink: 0,
                                                transition: 'background 0.15s ease'
                                            }}
                                            onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                                            onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
                                        >
                                            <span>Mở xem</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                padding: '12px 20px',
                                borderTop: '1px solid #f1f5f9',
                                background: '#f8fafc',
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                style={{
                                    padding: '6px 16px',
                                    background: 'white',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    color: '#475569',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                                onMouseOut={(e) => (e.currentTarget.style.background = 'white')}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
