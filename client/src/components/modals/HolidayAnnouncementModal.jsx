import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, CheckCircle, Sparkles } from 'lucide-react';

const HolidayAnnouncementModal = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Key định danh popup (hỗ trợ cả Global, Guest và User ID để không bao giờ bị hiện lại 2 lần)
  const GLOBAL_KEY = 'popup_seen_holiday_2_9_2026';
  const USER_KEY = currentUser?.id ? `popup_seen_holiday_2_9_2026_${currentUser.id}` : null;
  // Hết hạn sau ngày 03/09/2026
  const EXPIRE_DATE = new Date('2026-09-04T00:00:00+07:00');

  const checkAndShowPopup = useCallback(() => {
    try {
      const now = new Date();
      if (now < EXPIRE_DATE) {
        const hasSeenGlobal = localStorage.getItem(GLOBAL_KEY);
        const hasSeenGuest = localStorage.getItem('popup_seen_holiday_2_9_2026_guest');
        const hasSeenUser = USER_KEY ? localStorage.getItem(USER_KEY) : null;

        // Nếu đã từng đóng ở bất kỳ trạng thái nào (guest, user, global) -> KHÔNG HIỆN LẠI
        if (hasSeenGlobal === 'true' || hasSeenGuest === 'true' || hasSeenUser === 'true') {
          return;
        }

        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error('Error checking holiday popup status:', e);
    }
  }, [USER_KEY]);

  useEffect(() => {
    // Tự động kiểm tra khi load hoặc đăng nhập
    checkAndShowPopup();

    // Lắng nghe sự kiện toàn cục để mở lại popup khi user muốn tra cứu
    const handleManualOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-holiday-popup', handleManualOpen);
    return () => {
      window.removeEventListener('open-holiday-popup', handleManualOpen);
    };
  }, [checkAndShowPopup]);

  const handleClose = () => {
    try {
      localStorage.setItem(GLOBAL_KEY, 'true');
      localStorage.setItem('popup_seen_holiday_2_9_2026_guest', 'true');
      if (USER_KEY) {
        localStorage.setItem(USER_KEY, 'true');
      }
    } catch (e) {
      console.error('Error saving holiday popup status:', e);
    }
    setIsOpen(false);
  };

  // Đóng bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'holidayBackdropFadeIn 0.3s ease-out'
      }}
      onClick={handleClose}
    >
      <style>{`
        @keyframes holidayBackdropFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes holidayModalSlideUp {
          from { 
            opacity: 0; 
            transform: translateY(28px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 20px 50px -10px rgba(229, 94, 32, 0.35); }
          50% { box-shadow: 0 25px 60px -8px rgba(229, 94, 32, 0.55); }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          animation: 'holidayModalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* Nút đóng nổi bật góc trên bên phải */}
        <button
          onClick={handleClose}
          aria-label="Đóng thông báo"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(229, 94, 32, 0.9)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.55)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Khung chứa ảnh cuộn mượt nếu màn hình nhỏ */}
        <div
          style={{
            width: '100%',
            overflowY: 'auto',
            maxHeight: 'calc(94vh - 84px)',
            display: 'flex',
            justifyContent: 'center',
            background: '#fafafa',
            scrollbarWidth: 'thin'
          }}
        >
          <img
            src="/thu-vien-input/lich-nghi-le-fittour.png"
            alt="Thông Báo Nghỉ Lễ Quốc Khánh 2/9/2026 - FIT TOUR"
            onLoad={() => setImageLoaded(true)}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
              transition: 'opacity 0.3s ease',
              opacity: imageLoaded ? 1 : 0.85
            }}
          />
        </div>

        {/* Thanh tác vụ phía dưới */}
        <div
          style={{
            width: '100%',
            padding: '12px 18px',
            background: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8rem' }}>
            <Sparkles size={15} color="#e55e20" />
            <span style={{ fontWeight: 500 }}>Chỉ hiển thị 1 lần</span>
          </div>

          <button
            onClick={handleClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #e55e20 0%, #ea580c 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(229, 94, 32, 0.35)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(229, 94, 32, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(229, 94, 32, 0.35)';
            }}
          >
            <CheckCircle size={17} strokeWidth={2.5} />
            <span>Đã Nắm Lịch Nghỉ • Đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HolidayAnnouncementModal;
