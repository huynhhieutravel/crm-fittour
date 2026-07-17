import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Link as LinkIcon, ExternalLink, Copy } from 'lucide-react';
import { CKEditor } from 'ckeditor4-react';

const DepartureCardEditor = ({ departure, onUpdate, savedGuides = [] }) => {
  const [data, setData] = useState({
    guides: [],
    flights: [],
    notes: [],
    itinerary_link: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (departure && departure.departure_card_data) {
      const cardData = departure.departure_card_data;
      let groups = Array.isArray(cardData.flight_groups) ? cardData.flight_groups : [];
      if (groups.length === 0 && (cardData.flight_outbound || cardData.flight_inbound)) {
        groups = [{ label: 'Khởi hành mặc định', outbound: cardData.flight_outbound || '', inbound: cardData.flight_inbound || '' }];
      } else if (groups.length === 0) {
        groups = [{ label: 'Khởi hành từ TPHCM', outbound: '', inbound: '' }];
      }
      
      setData({
        guides: Array.isArray(cardData.guides) ? cardData.guides : [],
        flight_groups: groups,
        special_notes: cardData.special_notes || '',
        itinerary_link: cardData.itinerary_link || ''
      });
    }
  }, [departure]);

  const handleAdd = (field, defaultObj) => {
    setData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultObj]
    }));
  };

  const handleRemove = (field, index) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleChangeArray = (field, index, key, value) => {
    setData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = { ...newArray[index], [key]: value };
      
      // Auto-fill logic for guides
      if (field === 'guides' && key === 'name') {
        const foundGuide = savedGuides.find(g => g.name === value);
        if (foundGuide) {
          newArray[index].phone = foundGuide.phone || '';
          newArray[index].profile_link = foundGuide.profile_link || '';
          newArray[index].avatar_url = foundGuide.avatar_url || '';
          newArray[index].description = foundGuide.description || '';
        }
      }
      
      return { ...prev, [field]: newArray };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/departures/${departure.id}`, {
        departure_card_data: data
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onUpdate) onUpdate(res.data);
      alert('Đã lưu Thẻ Hướng Dẫn thành công vào Database!');
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu Thẻ Hướng Dẫn: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const publicLink = `https://fittour.vn/trip/${departure.code}`;

  const styles = {
    card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' },
    h2: { fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' },
    btnGhost: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', color: '#475569', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '14px' },
    btnPrimary: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '14px', textDecoration: 'none' },
    section: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#f8fafc', marginBottom: '24px' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    h3: { fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 },
    btnAdd: { display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#2563eb', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' },
    row: { display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px', backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' },
    input: { flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' },
    select: { padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '150px' },
    btnDelete: { padding: '10px', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    saveBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#16a34a', color: '#fff', padding: '12px 32px', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)' }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.h2}>Thẻ Hướng Dẫn (Departure Card)</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Dữ liệu này sẽ được hiển thị công khai trên link Khách Hàng</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(publicLink);
              alert('Đã copy link: ' + publicLink);
            }}
            style={styles.btnGhost}
          >
            <Copy size={16} /> Copy Link
          </button>
          <a href={publicLink} target="_blank" rel="noreferrer" style={styles.btnPrimary}>
            <ExternalLink size={16} /> Xem trước
          </a>
        </div>
      </div>

      <div style={{ paddingBottom: '24px' }}>
        {/* GUIDES */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.h3}>Nhân sự / HDV</h3>
            <button onClick={() => handleAdd('guides', { type: 'Hướng Dẫn Viên', name: '', phone: '' })} style={styles.btnAdd}>
              <Plus size={14} /> Thêm HDV
            </button>
          </div>
          {data.guides.map((g, idx) => (
            <div key={idx} style={{ ...styles.row, flexDirection: 'column' }}>
              <div style={{ display: 'flex', width: '100%', gap: '12px', alignItems: 'flex-start' }}>
                <select 
                  value={g.type} 
                  onChange={e => handleChangeArray('guides', idx, 'type', e.target.value)}
                  style={styles.select}
                >
                  <option value="Hướng Dẫn Viên">Hướng Dẫn Viên</option>
                  <option value="Trưởng Đoàn">Trưởng Đoàn</option>
                  <option value="Local Guide">Local Guide</option>
                  <option value="Điều Hành">Điều Hành</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Họ tên" 
                  value={g.name} 
                  onChange={e => handleChangeArray('guides', idx, 'name', e.target.value)}
                  style={styles.input}
                  list={`guide-list-${idx}`}
                />
                <datalist id={`guide-list-${idx}`}>
                  {savedGuides.map(sg => (
                    <option key={sg.id} value={sg.name} />
                  ))}
                </datalist>
                <input 
                  type="text" 
                  placeholder="Số ĐT / Zalo" 
                  value={g.phone} 
                  onChange={e => handleChangeArray('guides', idx, 'phone', e.target.value)}
                  style={styles.input}
                />
                <button onClick={() => handleRemove('guides', idx)} style={styles.btnDelete}>
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Airtable-like info card */}
              {(g.avatar_url || g.description) && (
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' }}>
                  {g.avatar_url ? (
                    <img src={g.avatar_url} alt={g.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                      {g.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{g.name}</div>
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px', lineHeight: '1.4' }}>{g.description}</div>
                    {g.profile_link && (
                      <a href={g.profile_link} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontWeight: 600 }}>
                        Xem Profile <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {data.guides.length === 0 && <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Chưa có HDV nào được thêm.</p>}
        </div>

        {/* FLIGHTS */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.h3}>Chuyến bay / Vận chuyển</h3>
            <button onClick={() => handleAdd('flight_groups', { label: 'Chuyến bay khác', outbound: '', inbound: '' })} style={styles.btnAdd}>
              <Plus size={14} /> Thêm Chuyến Bay
            </button>
          </div>
          
          {data.flight_groups && data.flight_groups.map((fg, idx) => (
             <div key={idx} style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#334155' }}>Điểm khởi hành:</span>
                    <input 
                      type="text"
                      value={fg.label}
                      onChange={e => handleChangeArray('flight_groups', idx, 'label', e.target.value)}
                      style={{ ...styles.input, fontWeight: 'bold', maxWidth: '300px', margin: 0 }}
                      placeholder="VD: Khởi hành từ TPHCM"
                    />
                  </div>
                  {data.flight_groups.length > 1 && (
                    <button onClick={() => handleRemove('flight_groups', idx)} style={styles.btnDelete}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '20px', flexDirection: 'row' }}>
                  {/* Outbound */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '14px' }}>✈️ Chiều Đi (Outbound)</label>
                    <div className="ckeditor-wrapper" style={{ zIndex: 0 }}>
                      <CKEditor 
                        initData={fg.outbound || ''} 
                        onChange={(evt) => handleChangeArray('flight_groups', idx, 'outbound', evt.editor.getData())} 
                        config={{ 
                          height: 200, 
                          toolbar: [
                            ['Bold', 'Italic', 'Underline', 'Strike'],
                            ['NumberedList', 'BulletedList'],
                            ['JustifyLeft', 'JustifyCenter', 'JustifyRight'],
                            ['TextColor', 'BGColor'],
                            ['Link', 'Unlink', 'RemoveFormat'],
                            ['Maximize']
                          ],
                          extraPlugins: 'justify,colorbutton,panelbutton,pastefromword', 
                          versionCheck: false,
                          allowedContent: true
                        }}
                        editorUrl="https://cdn.ckeditor.com/4.22.1/full/ckeditor.js"
                      />
                    </div>
                  </div>
                  {/* Inbound */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '14px' }}>✈️ Chiều Về (Inbound)</label>
                    <div className="ckeditor-wrapper" style={{ zIndex: 0 }}>
                      <CKEditor 
                        initData={fg.inbound || ''} 
                        onChange={(evt) => handleChangeArray('flight_groups', idx, 'inbound', evt.editor.getData())} 
                        config={{ 
                          height: 200, 
                          toolbar: [
                            ['Bold', 'Italic', 'Underline', 'Strike'],
                            ['NumberedList', 'BulletedList'],
                            ['JustifyLeft', 'JustifyCenter', 'JustifyRight'],
                            ['TextColor', 'BGColor'],
                            ['Link', 'Unlink', 'RemoveFormat'],
                            ['Maximize']
                          ],
                          extraPlugins: 'justify,colorbutton,panelbutton,pastefromword', 
                          versionCheck: false,
                          allowedContent: true
                        }}
                        editorUrl="https://cdn.ckeditor.com/4.22.1/full/ckeditor.js"
                      />
                    </div>
                  </div>
                </div>
             </div>
          ))}
        </div>

        {/* ITINERARY LINK */}
        <div style={styles.section}>
           <h3 style={{ ...styles.h3, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <LinkIcon size={18} color="#64748b" /> Link Lịch Trình (PDF / Web)
           </h3>
           <input 
             type="text" 
             placeholder="Nhập đường link Google Drive PDF hoặc Website chương trình..." 
             value={data.itinerary_link} 
             onChange={e => setData({...data, itinerary_link: e.target.value})}
             style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
           />
           <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', marginBottom: 0 }}>Thay vì nhập tay chi tiết từng ngày, hãy cung cấp link để khách tải/xem lịch trình chuẩn xác nhất.</p>
        </div>

        {/* SPECIAL NOTES */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.h3}>Lưu ý đặc biệt cho đoàn này</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: 0, marginBottom: '12px' }}>
            Không cần nhập lại các FAQ chung của Tour. Chỉ nhập những lưu ý dành riêng cho chuyến đi này (nếu có).
          </p>
          <div className="ckeditor-wrapper" style={{ zIndex: 0 }}>
            <CKEditor 
              initData={data.special_notes || ''} 
              onChange={(evt) => setData({...data, special_notes: evt.editor.getData()})} 
              config={{ 
                height: 150, 
                toolbar: [
                  ['Bold', 'Italic', 'Underline', 'Strike'],
                  ['NumberedList', 'BulletedList'],
                  ['JustifyLeft', 'JustifyCenter', 'JustifyRight'],
                  ['TextColor', 'BGColor'],
                  ['Link', 'Unlink', 'RemoveFormat'],
                  ['Maximize']
                ],
                extraPlugins: 'justify,colorbutton,panelbutton,pastefromword', 
                versionCheck: false,
                allowedContent: true
              }}
              editorUrl="https://cdn.ckeditor.com/4.22.1/full/ckeditor.js"
            />
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleSave}
          disabled={loading}
          style={styles.saveBtn}
        >
          {loading ? 'Đang lưu...' : 'Lưu Thẻ Hướng Dẫn'}
        </button>
      </div>
    </div>
  );
};

export default DepartureCardEditor;
