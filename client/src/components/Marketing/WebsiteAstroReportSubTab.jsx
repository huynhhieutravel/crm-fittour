import React, { useState, useMemo } from 'react';
import { 
  ExternalLink, Globe, Search, ArrowUpRight, FileText
} from 'lucide-react';
import { WEBSITE_ASTRO_T9_ITEMS } from '../../data/websiteAstroT9Data';

export default function WebsiteAstroReportSubTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = WEBSITE_ASTRO_T9_ITEMS.length;
    const newItems = WEBSITE_ASTRO_T9_ITEMS.filter(i => i.act.includes('Nội dung mới')).length;
    const migrated = WEBSITE_ASTRO_T9_ITEMS.filter(i => i.act.includes('Tạo mới Astro')).length;
    const upgraded = WEBSITE_ASTRO_T9_ITEMS.filter(i => i.act.includes('Sửa & Nâng cấp')).length;
    return { total, newItems, migrated, upgraded };
  }, []);

  // Lọc dữ liệu bảng
  const filteredItems = useMemo(() => {
    return WEBSITE_ASTRO_T9_ITEMS.filter(item => {
      const matchSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === 'All' || item.cat.includes(categoryFilter);
      const matchAction = actionFilter === 'All' || item.act.includes(actionFilter);

      return matchSearch && matchCategory && matchAction;
    });
  }, [searchTerm, categoryFilter, actionFilter]);

  return (
    <div style={{ padding: '0 0 32px' }}>
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0', 
        padding: '20px 24px', 
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ 
              width: 34, height: 34, borderRadius: 8, 
              backgroundColor: '#ecfdf5', color: '#059669', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <Globe size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Báo Cáo Bài Viết & Xuất Bản Website Native Astro — Tháng 09/2026
            </h2>
            <span style={{ 
              backgroundColor: '#dcfce7', color: '#16a34a', 
              fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px',
              border: '1px solid #bbf7d0'
            }}>
              125 Trang Hoàn Tất
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Tổng hợp dữ liệu bài viết, sản phẩm tour và showroom ảnh xuất bản trên <strong>fittour.vn</strong> trong Tháng 09/2026.
          </p>
        </div>

        {/* Nút hành động */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="https://fittour.vn"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '8px',
              backgroundColor: '#0f172a', color: '#ffffff',
              fontSize: '13px', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)', transition: 'background 0.15s'
            }}
            className="hover:bg-slate-800"
          >
            <Globe size={15} />
            <span>Xem Website Chính Thức (fittour.vn)</span>
            <ArrowUpRight size={14} />
          </a>

          <a
            href="https://docs.google.com/spreadsheets/d/1dr95yLvqX_WfucYrruugkKXns8L0WDP5/edit?usp=sharing&ouid=107203445454776991915&rtpof=true&sd=true"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              backgroundColor: '#059669', color: '#ffffff',
              fontSize: '13px', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)', transition: 'background 0.15s'
            }}
            className="hover:bg-emerald-700"
          >
            <FileText size={15} />
            <span>Mở Trang Tính 125 Bài (Google Drive)</span>
            <ArrowUpRight size={14} />
          </a>

          <a
            href="/email_preview_bao_cao_website_t9_2026.html"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              backgroundColor: '#0284c7', color: '#ffffff',
              fontSize: '13px', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)', transition: 'background 0.15s'
            }}
            className="hover:bg-sky-700"
          >
            <FileText size={15} />
            <span>Bản Báo Cáo Gửi BOD (HTML)</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* 2. 4 THẺ CHỈ SỐ KPI TỔNG THỂ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        
        {/* Thẻ 1: Tổng số trang */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #bbf7d0', padding: '16px', background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>TỔNG TRANG XUẤT BẢN</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', margin: '4px 0 2px' }}>
            {stats.total} Trang
          </div>
          <div style={{ fontSize: '12px', color: '#166534' }}>
            Full tháng 01/09 – 30/09/2026
          </div>
        </div>

        {/* Thẻ 2: Bài mới 100% */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #bfdbfe', padding: '16px', background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>NỘI DUNG MỚI 100%</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', margin: '4px 0 2px' }}>
            {stats.newItems} Bài Viết
          </div>
          <div style={{ fontSize: '12px', color: '#1e40af' }}>
            Chiếm 44.8% sản lượng tháng
          </div>
        </div>

        {/* Thẻ 3: Chuyển đổi Astro */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e9d5ff', padding: '16px', background: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase' }}>CHUYỂN ĐỔI NATIVE ASTRO</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#9333ea', margin: '4px 0 2px' }}>
            {stats.migrated} Trang
          </div>
          <div style={{ fontSize: '12px', color: '#6b21a8' }}>
            Xóa bỏ Elementor cũ, tải &lt; 0.8s
          </div>
        </div>

        {/* Thẻ 4: Nâng cấp lớn */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #fed7aa', padding: '16px', background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>SỬA & NÂNG CẤP LỚN</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c', margin: '4px 0 2px' }}>
            {stats.upgraded} Trang
          </div>
          <div style={{ fontSize: '12px', color: '#9a3412' }}>
            Nâng cấp giao diện, SEO & bảng giá
          </div>
        </div>
      </div>

      {/* 3. BẢNG MA TRẬN PHÂN BỔ (TỔNG HỢP SỐ LIỆU) */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0', 
        padding: '20px 24px', 
        marginBottom: '20px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
            📊 Ma Trận Tổng Hợp Phân Bổ (125 Bài & Trang)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Đồng bộ 100% dữ liệu xuất bản chính thức fittour.vn</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569', fontWeight: 700 }}>Phân Loại Chuyên Mục</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', color: '#1d4ed8', fontWeight: 700 }}>Nội dung mới 100%</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', color: '#7e22ce', fontWeight: 700 }}>Tạo mới Astro từ bài cũ</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', color: '#c2410c', fontWeight: 700 }}>Sửa & Nâng cấp lớn</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', color: '#15803d', fontWeight: 800 }}>Tổng Cộng</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>🗺️ Tour (Sản phẩm lữ hành)</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>0</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#7e22ce' }}>5</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#c2410c' }}>16</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>21</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fcfcfc' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>📝 Post (Cẩm nang, E-Magazine, Case Study)</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#1d4ed8' }}>53</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#7e22ce' }}>10</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>0</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>63</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>📸 Gallery Showroom (Kho ảnh 16:9 Masonry)</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#1d4ed8' }}>1</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#7e22ce' }}>25</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#c2410c' }}>3</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>29</td>
            </tr>
            <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#fcfcfc' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>🏢 Page (Doanh nghiệp & Dịch vụ MICE)</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#1d4ed8' }}>2</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#7e22ce' }}>2</td>
              <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#c2410c' }}>8</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>12</td>
            </tr>
            <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 800 }}>
              <td style={{ padding: '12px 14px', color: '#0f172a' }}>⭐ TỔNG CỘNG TOÀN BỘ HỆ THỐNG</td>
              <td style={{ padding: '12px 14px', textAlign: 'center', color: '#1d4ed8', fontSize: '14px' }}>56</td>
              <td style={{ padding: '12px 14px', textAlign: 'center', color: '#7e22ce', fontSize: '14px' }}>42</td>
              <td style={{ padding: '12px 14px', textAlign: 'center', color: '#c2410c', fontSize: '14px' }}>27</td>
              <td style={{ padding: '12px 14px', textAlign: 'right', color: '#15803d', fontSize: '15px' }}>125 TRANG</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. DANH SÁCH CHI TIẾT 125 TRANG (TÌM KIẾM & BỘ LỌC) */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0', 
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Filter Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
              Danh Sách Chi Tiết 125 URL Đã Xuất Bản
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Hiển thị <strong>{filteredItems.length}</strong> / {stats.total} bài viết
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm tên bài, URL, mô tả..."
                style={{
                  padding: '6px 12px 6px 32px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  width: '240px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filter Chuyên Mục */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                outline: 'none'
              }}
            >
              <option value="All">Chuyên mục: Tất cả</option>
              <option value="Post">Post (Cẩm nang & E-Mag)</option>
              <option value="Tour">Tour (Sản phẩm)</option>
              <option value="Gallery">Gallery Showroom</option>
              <option value="Page">Page (Doanh nghiệp & MICE)</option>
            </select>

            {/* Filter Hành Động */}
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                outline: 'none'
              }}
            >
              <option value="All">Bản chất: Tất cả</option>
              <option value="Nội dung mới">Nội dung mới 100%</option>
              <option value="Tạo mới Astro">Tạo mới Astro từ cũ</option>
              <option value="Sửa & Nâng cấp">Sửa & Nâng cấp lớn</option>
            </select>
          </div>
        </div>

        {/* Table Chi Tiết */}
        <div style={{ overflowX: 'auto', maxHeight: '540px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1, borderBottom: '1px solid #cbd5e1' }}>
              <tr>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: '50px', color: '#475569' }}>STT</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569' }}>Tên Trang / Bài Viết</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', width: '160px', color: '#475569' }}>Phân Loại</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', width: '170px', color: '#475569' }}>Bản Chất / Thao Tác</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569' }}>Mô Tả Nâng Cấp</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: '80px', color: '#475569' }}>Xem Trang</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => {
                const isNew = item.act.includes('Nội dung mới');
                const isMigrated = item.act.includes('Tạo mới Astro');
                const isUpgraded = item.act.includes('Sửa & Nâng cấp');

                return (
                  <tr 
                    key={item.stt}
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                    }}
                  >
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                      {item.stt}
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>
                      <span style={{ 
                        fontSize: '11px', padding: '2px 7px', borderRadius: '4px',
                        backgroundColor: item.cat.includes('Tour') ? '#fef3c7' : item.cat.includes('Post') ? '#eff6ff' : item.cat.includes('Gallery') ? '#faf5ff' : '#f1f5f9',
                        color: item.cat.includes('Tour') ? '#b45309' : item.cat.includes('Post') ? '#1d4ed8' : item.cat.includes('Gallery') ? '#7e22ce' : '#334155',
                        fontWeight: 600
                      }}>
                        {item.cat}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ 
                        fontSize: '11px', padding: '2px 7px', borderRadius: '4px',
                        backgroundColor: isNew ? '#ecfdf5' : isMigrated ? '#faf5ff' : '#fff7ed',
                        color: isNew ? '#047857' : isMigrated ? '#6b21a8' : '#c2410c',
                        fontWeight: 700, border: `1px solid ${isNew ? '#a7f3d0' : isMigrated ? '#e9d5ff' : '#fed7aa'}`
                      }}>
                        {item.act}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#64748b', fontSize: '12px', maxWidth: '300px' }}>
                      {item.desc}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        title={item.url}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 28, height: 28, borderRadius: 6,
                          backgroundColor: '#f1f5f9', color: '#2563eb',
                          textDecoration: 'none'
                        }}
                        className="hover:bg-blue-100"
                      >
                        <ArrowUpRight size={14} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
