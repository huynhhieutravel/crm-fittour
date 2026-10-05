import React, { useState } from 'react';
import { 
  FileText, ExternalLink, Printer, Share2, Check, TrendingUp, 
  BarChart3, Eye, Users, ThumbsUp, MessageSquare, Bookmark, MousePointerClick, 
  Sparkles, AlertCircle, CheckCircle2, Video, Image, FileType
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FanpageReportSubTab() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/preview_bao_cao_fanpage_facebook_t9_2026.html`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Đã sao chép link báo cáo Fanpage!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '0 0 40px' }}>
      
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
              width: 36, height: 36, borderRadius: 8, 
              backgroundColor: '#eff6ff', color: '#1877f2', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <span style={{ fontSize: '18px' }}>📱</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Báo Cáo Hiệu Suất Facebook Fanpage — Tháng 09/2026
            </h2>
            <span style={{ 
              backgroundColor: '#dbeafe', color: '#1d4ed8', 
              fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px',
              border: '1px solid #bfdbfe'
            }}>
              FIT TOUR – Du lịch có Guu
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Phân tích 4 tuần nội dung chính (Organic) & Bóc tách riêng phân hệ Paid Media (Tuần 21/09–27/09)
          </p>
        </div>

        {/* Nút hành động */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyLink}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px',
              border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
              fontSize: '13px', fontWeight: 600, color: copied ? '#16a34a' : '#475569',
              cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            {copied ? <Check size={15} color="#16a34a" /> : <Share2 size={15} />}
            <span>{copied ? 'Đã chép link' : 'Sao chép link'}</span>
          </button>

          <a
            href="https://docs.google.com/document/d/1PXMgdklLImuMm3DB9bYOkN_n_sAOSI-zafud276UWRg/edit?usp=sharing"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px',
              border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
              fontSize: '13px', fontWeight: 600, color: '#0284c7',
              textDecoration: 'none', cursor: 'pointer'
            }}
          >
            <FileText size={15} />
            <span>Google Docs Gốc ↗</span>
          </a>

          <a
            href="/preview_bao_cao_fanpage_facebook_t9_2026.html"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              backgroundColor: '#1877f2', color: '#ffffff',
              fontSize: '13px', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(24, 119, 242, 0.25)', transition: 'background 0.15s'
            }}
          >
            <ExternalLink size={15} />
            <span>Mở Báo Cáo Toàn Màn Hình</span>
          </a>
        </div>
      </div>

      {/* 2. 4 THẺ METRICS NỔI BẬT */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '14px', 
        marginBottom: '20px' 
      }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e2e8f0', borderTop: '4px solid #1877f2' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TỔNG BÀI CHÍNH (ORGANIC)</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#1877f2', margin: '4px 0' }}>43 <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Bài</span></div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Chuẩn hóa 4 tuần không gồm Ads</div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e2e8f0', borderTop: '4px solid #0284c7' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TỔNG LƯỢT XEM NỘI DUNG</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0284c7', margin: '4px 0' }}>138,580</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>71,459 người xem duy nhất</div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TB XEM / BÀI VIẾT (KPI)</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669', margin: '4px 0' }}>3,223</div>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>Đỉnh: Tuần 3 đạt 4,562/bài</div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e2e8f0', borderTop: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>PAID ADS (THEO DÕI RIÊNG)</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#7c3aed', margin: '4px 0' }}>66,173</div>
          <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600 }}>6 bài Ads • 271 click link</div>
        </div>
      </div>

      {/* 3. KHUNG NHÚNG BÁO CÁO CHI TIẾT (IFRAME TIỆN DỤNG) */}
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0', 
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{ 
          padding: '12px 20px', 
          backgroundColor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
            📋 BẢN BÁO CÁO ĐIỀU HÀNH HOÀN CHỈNH (TRÌNH DUYỆT TRỰC TIẾP)
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Khớp 100% tài liệu điều hành & Google Sheet
          </span>
        </div>
        
        <iframe 
          src="/preview_bao_cao_fanpage_facebook_t9_2026.html" 
          title="Báo cáo Fanpage Facebook Tháng 09/2026"
          style={{ 
            width: '100%', 
            height: '920px', 
            border: 'none',
            display: 'block'
          }} 
        />
      </div>

    </div>
  );
}
