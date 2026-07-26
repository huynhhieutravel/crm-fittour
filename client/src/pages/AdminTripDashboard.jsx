import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Search, Map, ChevronRight, LayoutTemplate, Users, Plus, Trash2, Edit2, Check, X, PlaneTakeoff, Contact } from 'lucide-react';
import DepartureCardEditor from '../components/DepartureCardEditor';
import { swalConfirmDelete } from '../utils/swalHelpers';

const AdminTripDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeMainTab = location.pathname.includes('/guides') ? 'guides' : 'tours';
  const [departures, setDepartures] = useState([]);
  const [savedGuides, setSavedGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeparture, setSelectedDeparture] = useState(null);

  // States cho QL HDV
  const [editingGuide, setEditingGuide] = useState(null);

  useEffect(() => {
    fetchDepartures();
    fetchSavedGuides();
  }, []);

  const fetchSavedGuides = async () => {
    try {
      const res = await axios.get('/api/departure-card-guides');
      setSavedGuides(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGuide = async (guide) => {
    try {
      if (guide.id) {
        await axios.put(`/api/departure-card-guides/${guide.id}`, guide);
      } else {
        await axios.post('/api/departure-card-guides', guide);
      }
      setEditingGuide(null);
      fetchSavedGuides();
    } catch (err) {
      alert('Lỗi lưu HDV: ' + err.message);
    }
  };

  const handleDeleteGuide = async (id) => {
    const ok = await swalConfirmDelete('Bạn có chắc chắn muốn xóa Hướng Dẫn Viên này khỏi danh bạ?');
    if (!ok) return;
    try {
      await axios.delete(`/api/departure-card-guides/${id}`);
      fetchSavedGuides();
    } catch (err) {
      alert('Lỗi xóa HDV');
    }
  };

  const fetchDepartures = async () => {
    try {
      const token = localStorage.getItem('token');
      // Tạm dùng dữ liệu thật nếu có token, nếu không thì dùng mock
      if (token) {
        const res = await axios.get('/api/departures', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let dataToSet = [];
        if (res.data && res.data.data) {
          dataToSet = res.data.data;
        } else if (Array.isArray(res.data)) {
          dataToSet = res.data;
        }

        // 1. Chỉ lấy các tour chưa kết thúc khởi hành (>= today)
        // 2. Sắp xếp tăng dần theo ngày (sắp khởi hành lên trên cùng)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingDepartures = dataToSet
          .filter(dep => {
            if (!dep.start_date) return false;
            return new Date(dep.start_date) >= today;
          })
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        setDepartures(upcomingDepartures);
      } else {
        setDepartures([
          { id: 1, code: 'TEST-1234', tour_name: 'Tour Du Lịch Nhật Bản 5 Ngày 4 Đêm', start_date: '2026-08-15T00:00:00.000Z', departure_card_data: {} },
          { id: 2, code: 'TEST-5678', tour_name: 'Tour Thái Lan Siêu Tiết Kiệm', start_date: '2026-08-20T00:00:00.000Z', departure_card_data: {} },
          { id: 3, code: 'TEST-9999', tour_name: 'Khám phá Châu Âu Mùa Thu', start_date: '2026-09-01T00:00:00.000Z', departure_card_data: {} }
        ]);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách khởi hành:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartures = departures.filter(dep => {
    const term = searchTerm.toLowerCase();
    const tourName = dep.template_name?.toLowerCase() || '';
    const depCode = dep.code?.toLowerCase() || '';
    return tourName.includes(term) || depCode.includes(term) || String(dep.id).includes(term);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HEADER TABS / MENU */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '60px', backgroundColor: '#1e293b', color: '#fff', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PlaneTakeoff size={24} color="#38bdf8" />
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>FIT TOUR / TRIP ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => navigate('/admin-trip')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, borderRadius: '6px', backgroundColor: activeMainTab === 'tours' ? '#334155' : 'transparent', color: activeMainTab === 'tours' ? '#38bdf8' : '#cbd5e1', border: 'none', transition: 'all 0.2s' }}
          >
            <LayoutTemplate size={18} /> Quản lý Thẻ Lịch Trình
          </button>
          <button 
            onClick={() => navigate('/admin-trip/guides')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, borderRadius: '6px', backgroundColor: activeMainTab === 'guides' ? '#334155' : 'transparent', color: activeMainTab === 'guides' ? '#34d399' : '#cbd5e1', border: 'none', transition: 'all 0.2s' }}
          >
            <Contact size={18} /> Module HDV
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {activeMainTab === 'tours' ? (
        <>
          {/* CỘT TRÁI - TOURS */}
          <div style={{ width: '350px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '1px 0 5px rgba(0,0,0,0.05)', zIndex: 10 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
            Lịch Khởi Hành
          </h1>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo ID hoặc Tên tour..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredDepartures.map(dep => (
            <div 
              key={dep.id} 
              onClick={() => setSelectedDeparture(dep)}
              style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', backgroundColor: selectedDeparture?.id === dep.id ? '#eff6ff' : '#fff', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontWeight: 700, color: selectedDeparture?.id === dep.id ? '#1d4ed8' : '#334155', marginBottom: '4px', fontSize: '15px' }}>{dep.id} - {dep.template_name || 'Chưa có tên'}</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {dep.start_date ? new Date(dep.start_date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', }) : 'N/A'}</span>
                  {dep.destination && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Map size={14} /> {dep.destination}</span>}
                </div>
              </div>
              <ChevronRight size={18} color={selectedDeparture?.id === dep.id ? '#2563eb' : '#cbd5e1'} />
            </div>
          ))}
          {filteredDepartures.length === 0 && (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Không tìm thấy tour.</div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI - EDITOR */}
      <div style={{ flex: 1, backgroundColor: '#f8fafc', overflowY: 'auto', position: 'relative' }}>
        {!selectedDeparture ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8' }}>
            <LayoutTemplate size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Chọn một tour khởi hành để thiết kế Thẻ (Departure Card)</div>
          </div>
        ) : (
          <div style={{ padding: '32px', animation: 'fadeIn 0.3s ease-out' }}>
            <DepartureCardEditor 
              departure={selectedDeparture} 
              onUpdate={(updated) => {
                setSelectedDeparture(updated);
              }} 
              savedGuides={savedGuides}
            />
          </div>
        )}
      </div>
      </>) : (
        /* TAB DANH BẠ HDV */
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users color="#10b981" /> Quản Lý Dữ Liệu Hướng Dẫn Viên
              </h2>
              <button 
                onClick={() => setEditingGuide({ name: '', phone: '', profile_link: '', avatar_url: '', description: '' })}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
              >
                <Plus size={18} /> Thêm Mới Hướng Dẫn Viên
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Họ Tên / Chuyên môn</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Liên hệ</th>
                  <th style={{ padding: '12px 8px', color: '#64748b', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {savedGuides.map(guide => (
                  <tr key={guide.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px 8px', fontWeight: 600, color: '#1e293b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {guide.avatar_url ? (
                          <img src={guide.avatar_url} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#64748b', fontWeight: 'bold' }}>{guide.name.charAt(0)}</div>
                        )}
                        <div>
                          <div style={{ fontSize: '16px' }}>{guide.name}</div>
                          {guide.description && <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 400, marginTop: '4px', maxWidth: '400px', lineHeight: '1.4' }}>{guide.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 8px', color: '#475569' }}>
                      <div style={{ fontWeight: 600 }}>{guide.phone}</div>
                      {guide.profile_link && <a href={guide.profile_link} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '13px', display: 'inline-block', marginTop: '4px' }}>Mở Profile ↗</a>}
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right', verticalAlign: 'middle' }}>
                      <button onClick={() => setEditingGuide(guide)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '8px', borderRadius: '6px', marginRight: '8px', transition: 'background 0.2s' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteGuide(guide.id)} style={{ background: '#fef2f2', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px', borderRadius: '6px', transition: 'background 0.2s' }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {savedGuides.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '64px 32px', color: '#94a3b8', fontSize: '15px' }}>Chưa có danh bạ HDV nào. Hãy thêm mới để tự động điền thẻ.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* POPUP MODAL THÊM/SỬA HDV */}
      {editingGuide && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '600px', maxWidth: '90%', padding: '0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                {editingGuide.id ? 'Sửa Thông Tin HDV' : 'Thêm Mới Hướng Dẫn Viên'}
              </h3>
              <button onClick={() => setEditingGuide(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Họ Tên *</label>
                  <input type="text" placeholder="VD: Nguyễn Văn A" value={editingGuide.name} onChange={e => setEditingGuide({...editingGuide, name: e.target.value})} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '15px' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>SĐT / Zalo liên hệ</label>
                  <input type="text" placeholder="VD: 0987654321" value={editingGuide.phone} onChange={e => setEditingGuide({...editingGuide, phone: e.target.value})} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '15px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Link Ảnh Đại Diện (Avatar URL)</label>
                  <input type="text" placeholder="https://..." value={editingGuide.avatar_url || ''} onChange={e => setEditingGuide({...editingGuide, avatar_url: e.target.value})} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '15px' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Link Profile (FB/Web)</label>
                  <input type="text" placeholder="https://facebook.com/..." value={editingGuide.profile_link} onChange={e => setEditingGuide({...editingGuide, profile_link: e.target.value})} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '15px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Mô tả ngắn / Ghi chú (Kinh nghiệm, chuyên tuyến...)</label>
                <textarea 
                  placeholder="Nhập thông tin giới thiệu ngắn về HDV..." 
                  value={editingGuide.description || ''} 
                  onChange={e => setEditingGuide({...editingGuide, description: e.target.value})} 
                  style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '15px', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }} 
                />
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setEditingGuide(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Hủy Bỏ</button>
              <button onClick={() => handleSaveGuide(editingGuide)} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}>Lưu Thông Tin</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default AdminTripDashboard;
