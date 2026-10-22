import React, { useState } from 'react';
import axios from 'axios';
import { X, Copy, Check, ExternalLink, ShieldCheck, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DepartureShareModal({ isOpen, onClose, tour }) {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen && tour?.id) {
      generateOrFetchLink();
    }
  }, [isOpen, tour?.id]);

  const generateOrFetchLink = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/departure-cashflow/departures/${tour.id}/share-link`, {
        title: `Sổ tay đoàn: ${tour.tour_name || tour.code}`
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShareData(res.data);
    } catch (err) {
      console.error('Error generating share link:', err);
      toast.error('Không thể tạo liên kết chia sẻ');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareData?.url) return;
    navigator.clipboard.writeText(shareData.url);
    setCopied(true);
    toast.success('Đã sao chép link chia sẻ vào bộ nhớ tạm!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: 'var(--card-bg, #ffffff)',
        color: 'var(--text, #0f172a)',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        border: '1px solid var(--border, #e2e8f0)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={20} color="#ff4b2b" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Link Chia Sẻ Sổ Tay Đoàn
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-light, #64748b)',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: '#ecfdf5',
            borderRadius: '10px',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.825rem', color: '#065f46', lineHeight: 1.4 }}>
              <strong>Bảo mật tài chính 100%:</strong> Đường link này cho phép Hướng Dẫn Viên và Đối Tác Landtour xem danh sách đoàn, xếp phòng, SIM và lưu ý dẫn đoàn trên điện thoại mà <strong>không cần đăng nhập</strong> và <strong>hoàn toàn ẩn giá tour, doanh thu và công nợ</strong>.
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light, #64748b)', display: 'block', marginBottom: '6px' }}>
              Đường dẫn công khai cho chuyến đi:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={shareData?.url || (loading ? 'Đang khởi tạo liên kết...' : '')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #cbd5e1)',
                  backgroundColor: 'var(--bg, #f8fbfd)',
                  color: 'var(--text, #0f172a)',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              />
              <button
                onClick={handleCopy}
                disabled={!shareData?.url}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  backgroundColor: copied ? '#10b981' : '#1e293b',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Đã chép' : 'Sao chép'}
              </button>
            </div>
          </div>

          {shareData?.url && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <a
                href={shareData.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#2563eb',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Mở thử trang xem trước <ExternalLink size={14} />
              </a>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border, #cbd5e1)',
              backgroundColor: 'transparent',
              color: 'var(--text, #0f172a)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
