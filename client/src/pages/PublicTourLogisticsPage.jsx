import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, Smartphone, BedDouble, Calendar, Phone, 
  MapPin, CheckCircle, Search, ShieldCheck, AlertCircle, Compass 
} from 'lucide-react';

export default function PublicTourLogisticsPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get(`/api/departure-cashflow/public-share/${token}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching public share:', err);
        setError('Liên kết không tồn tại, đã bị hủy kích hoạt hoặc đã hết hạn.');
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#ff4b2b', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>Đang tải sổ tay đoàn khởi hành...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1.5rem' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '2.5rem 2rem', textAlign: 'center', border: '1px solid #fee2e2' }}>
          <div style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#ef4444' }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Không thể truy cập</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>{error}</p>
        </div>
      </div>
    );
  }

  const { tour, passengers, logistics } = data;

  const filteredPassengers = passengers.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term)) ||
      (p.room_type && p.room_type.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      color: '#0f172a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '1rem',
      paddingBottom: '3rem'
    }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        
        {/* Top Branding Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid #ff4b2b'
        }}>
          <div>
            <div style={{ display: 'inline-block', backgroundColor: '#ff4b2b', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              FIT TOUR
            </div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: '6px 0 0' }}>
              Sổ Tay Điều Hành & Dẫn Đoàn
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#ecfdf5', padding: '6px 10px', borderRadius: '20px' }}>
            <ShieldCheck size={16} /> Lưu hành nội bộ
          </div>
        </div>

        {/* Tour Information Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          marginBottom: '1rem'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Mã đoàn: {tour.tour_code}
          </span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 12px', lineHeight: 1.3 }}>
            {tour.tour_name}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
              <Calendar size={18} color="#ff4b2b" />
              <span>Khởi hành: <strong>{tour.start_date ? new Date(tour.start_date).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</strong></span>
            </div>
            {tour.guide?.name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                <Compass size={18} color="#0284c7" />
                <span>HDV: <strong>{tour.guide.name}</strong> {tour.guide.phone && <a href={`tel:${tour.guide.phone}`} style={{ color: '#0284c7', textDecoration: 'none' }}>({tour.guide.phone})</a>}</span>
              </div>
            )}
            {tour.operator?.name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                <Phone size={18} color="#10b981" />
                <span>Điều hành: <strong>{tour.operator.name}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Logistics Summary Badges */}
        {logistics && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
              Tóm Tắt Hậu Cần ({passengers.length} Khách)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              
              {/* SIM */}
              <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                  <Smartphone size={16} /> SIM Du Lịch
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1e3a8a' }}>
                  Vật lý: <strong>{logistics.sim_counts?.physical || 0}</strong> &bull; eSIM: <strong>{logistics.sim_counts?.esim || 0}</strong> &bull; Không: <strong>{logistics.sim_counts?.none || 0}</strong>
                </div>
              </div>

              {/* Phòng */}
              <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#065f46', marginBottom: '4px' }}>
                  <BedDouble size={16} /> Cơ Cấu Xếp Phòng
                </div>
                <div style={{ fontSize: '0.8rem', color: '#064e3b' }}>
                  DBL: <strong>{logistics.room_counts?.dbl || 0}</strong> &bull; TWIN: <strong>{logistics.room_counts?.twin || 0}</strong> &bull; SGL: <strong>{logistics.room_counts?.sgl || 0}</strong>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Passenger Manifest Table */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#ff4b2b" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                Danh Sách Khách Đoàn ({passengers.length})
              </h3>
            </div>

            {/* Quick Search Box */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tìm tên khách, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.825rem',
                  outline: 'none',
                  backgroundColor: '#f8fafc'
                }}
              />
            </div>
          </div>

          {filteredPassengers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              Không tìm thấy hành khách nào phù hợp.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 8px', width: '40px', textAlign: 'center' }}>STT</th>
                    <th style={{ padding: '10px 12px' }}>Họ Tên Khách</th>
                    <th style={{ padding: '10px 10px' }}>Điện thoại</th>
                    <th style={{ padding: '10px 10px' }}>Phòng</th>
                    <th style={{ padding: '10px 10px' }}>SIM</th>
                    <th style={{ padding: '10px 12px' }}>Ghi chú đặc biệt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPassengers.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                        {p.stt}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {p.name}
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        {p.phone ? (
                          <a href={`tel:${p.phone}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 500 }}>
                            {p.phone}
                          </a>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>---</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#334155'
                        }}>
                          {p.room_type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: p.sim_type?.toLowerCase().includes('esim') ? '#e0f2fe' : (p.sim_type?.toLowerCase().includes('vật lý') ? '#dcfce7' : '#f1f5f9'),
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: p.sim_type?.toLowerCase().includes('esim') ? '#0369a1' : (p.sim_type?.toLowerCase().includes('vật lý') ? '#15803d' : '#64748b')
                        }}>
                          {p.sim_type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.8rem' }}>
                        {p.note || '---'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
            FIT TOUR CRM &bull; Hỗ trợ dẫn đoàn &bull; Hotline điều hành 24/7
          </div>
        </div>

      </div>
    </div>
  );
}
