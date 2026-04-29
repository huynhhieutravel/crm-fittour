import React, { useState } from 'react';
import { Save, Globe, Info, Package, Plus, X, ChevronUp, ChevronDown, CheckCircle, Power } from 'lucide-react';

const SettingsTab = ({ 
  metaSettings, 
  setMetaSettings, 
  handleUpdateSettings, 
  handleTestMeta,
  bus,
  onUpdateBU,
  onReorderBUs,
  onCreateBU,
  onlyBU
}) => {
  const [editingBUs, setEditingBUs] = useState({});
  const [showAddBU, setShowAddBU] = useState(false);
  const [newBU, setNewBU] = useState({ id: '', label: '', countries: [], description: '' });

  const handleCreateBU = (e) => {
    e.preventDefault();
    if (!newBU.id || !newBU.label) return;
    if (onCreateBU) {
      onCreateBU(newBU);
      setNewBU({ id: '', label: '', countries: [], description: '' });
      setShowAddBU(false);
    }
  };

  const handleBUChange = (id, field, value) => {
    setEditingBUs(prev => ({
      ...prev,
      [id]: { 
        ...(prev[id] || bus.find(b => b.id === id)), 
        [field]: value 
      }
    }));
  };

  const addTag = (id, country) => {
    if (!country.trim()) return;
    const currentBU = editingBUs[id] || bus.find(b => b.id === id);
    if (currentBU.countries?.includes(country.trim())) return;
    const updatedCountries = [...(currentBU.countries || []), country.trim()];
    handleBUChange(id, 'countries', updatedCountries);
  };

  const removeTag = (id, countryToRemove) => {
    const currentBU = editingBUs[id] || bus.find(b => b.id === id);
    const updatedCountries = (currentBU.countries || []).filter(c => c !== countryToRemove);
    handleBUChange(id, 'countries', updatedCountries);
  };

  const moveBU = async (id, direction) => {
    const currentIndex = bus.findIndex(b => b.id === id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === bus.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentBU = bus[currentIndex];
    const targetBU = bus[targetIndex];

    // Create the batch reorder payload
    const orders = bus.map((b, i) => {
      if (i === currentIndex) return { id: b.id, sort_order: targetBU.sort_order };
      if (i === targetIndex) return { id: b.id, sort_order: currentBU.sort_order };
      return { id: b.id, sort_order: b.sort_order };
    });

    if (onReorderBUs) {
      onReorderBUs(orders);
    }
  };

  const toggleStatus = (bu) => {
    const currentStatus = bu.is_active !== false;
    onUpdateBU(bu.id, { ...bu, is_active: !currentStatus });
  };

  const handleSaveBU = (id) => {
    const payload = editingBUs[id];
    if (!payload) return;
    onUpdateBU(id, payload);
    const newEditing = { ...editingBUs };
    delete newEditing[id];
    setEditingBUs(newEditing);
  };

  const CountryTags = ({ countries = [], onRemove, onAdd, buId, disabled }) => {
    const [localInput, setLocalInput] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: disabled ? 0.6 : 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {countries.length > 0 ? countries.map((c, i) => (
            <span key={i} className="badge-pro" style={{ 
              background: '#eff6ff', 
              color: '#3b82f6', 
              border: '1px solid #dbeafe',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              {c}
              {!disabled && <X size={12} style={{ cursor: 'pointer' }} onClick={() => onRemove(c)} />}
            </span>
          )) : <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>Chưa có quốc gia nào</span>}
        </div>
        {!disabled && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              className="modal-input" 
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', maxWidth: '200px' }} 
              placeholder="Thêm quốc gia..." 
              value={localInput}
              onChange={e => setLocalInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(localInput); setLocalInput(''); } }}
            />
            <button 
              type="button"
              className="btn-pro-save" 
              style={{ width: 'auto', padding: '0 0.75rem', background: '#6366f1' }}
              onClick={() => { onAdd(localInput); setLocalInput(''); }}
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2rem', 
      paddingBottom: '3rem',
      width: '100%',
      maxWidth: '1200px'
    }}>
      {/* Meta Configuration area (Hidden in BU full view) */}
      {!onlyBU && (
        <div className="stat-card" style={{ 
          background: 'white', 
          color: '#1e293b', 
          border: '1px solid #e2e8f0', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          padding: '2rem'
        }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Globe size={20} color="#6366f1" /> Cấu hình Meta Webhook
          </h3>
          <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', width: '100%' }}>
            <div className="modal-form-group">
              <label>PIXEL ID (DATASET ID)</label>
              <input 
                className="modal-input" 
                placeholder="Ví dụ: 123456789012345"
                value={metaSettings?.meta_dataset_id || ''} 
                onChange={e => setMetaSettings({...metaSettings, meta_dataset_id: e.target.value})} 
              />
            </div>
            <div className="modal-form-group">
              <label>MÃ THỬ NGHIỆM (TEST EVENT CODE)</label>
              <input 
                className="modal-input" 
                placeholder="Ví dụ: TEST12345 (Nếu có)"
                value={metaSettings?.meta_test_event_code || ''} 
                onChange={e => setMetaSettings({...metaSettings, meta_test_event_code: e.target.value})} 
              />
            </div>
          </div>
          <div className="modal-form-group" style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label>ACCESS TOKEN (CONVERSIONS API)</label>
            <input 
              className="modal-input" 
              placeholder="Paste token dài được tạo từ Events Manager..."
              value={metaSettings?.meta_capi_access_token || ''} 
              onChange={e => setMetaSettings({...metaSettings, meta_capi_access_token: e.target.value})} 
            />
          </div>
          <div className="modal-form-group" style={{ marginBottom: '1.5rem', width: '100%', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ marginBottom: 0 }}>BẬT CONVERSIONS API (CAPI)</label>
            <div 
              onClick={() => setMetaSettings({...metaSettings, meta_capi_enabled: metaSettings?.meta_capi_enabled === 'true' ? 'false' : 'true'})}
              style={{ 
                width: '50px', 
                height: '24px', 
                background: metaSettings?.meta_capi_enabled === 'true' ? '#22c55e' : '#cbd5e1', 
                borderRadius: '12px', 
                position: 'relative', 
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ 
                width: '18px', 
                height: '18px', 
                background: 'white', 
                borderRadius: '50%', 
                position: 'absolute', 
                top: '3px', 
                left: metaSettings?.meta_capi_enabled === 'true' ? '29px' : '3px',
                transition: 'all 0.3s'
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="login-btn" onClick={handleUpdateSettings}>LƯU CẤU HÌNH</button>
            <button className="login-btn" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #16a34a' }} onClick={() => handleTestMeta('capi')}>KIỂM TRA CAPI</button>
          </div>
        </div>
      )}

      {/* Meta Webhook receiver area */}
      {!onlyBU && (
        <div className="stat-card" style={{ 
          background: 'white', 
          color: '#1e293b', 
          border: '1px solid #e2e8f0', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          padding: '2rem'
        }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Globe size={20} color="#0ea5e9" /> Nhận Khách & Tin nhắn từ Messenger
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Cấu hình Cổng nối (Webhook) để tự động đưa Lead mới (từ Quảng cáo/Tin nhắn) vào CRM.
          </p>
          <div className="modal-form-group" style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label>PAGE ACCESS TOKEN (MÃ TRUY CẬP TRANG)</label>
            <input 
              className="modal-input" 
              placeholder="Paste EAAP... token được tạo từ Graph API Explorer..."
              value={metaSettings?.meta_page_access_token || ''} 
              onChange={e => setMetaSettings({...metaSettings, meta_page_access_token: e.target.value})} 
            />
          </div>
          <div className="modal-form-group" style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label>VERIFY TOKEN (MÃ XÁC THỰC WEBHOOK)</label>
            <input 
              className="modal-input" 
              placeholder="Nhập mã bí mật tự chọn (VD: FITTOUR_SECURE_2026)"
              value={metaSettings?.meta_verify_token || ''} 
              onChange={e => setMetaSettings({...metaSettings, meta_verify_token: e.target.value})} 
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button className="login-btn" style={{ background: '#0ea5e9', width: 'auto', padding: '0 2rem' }} onClick={handleUpdateSettings}>LƯU CẤU HÌNH WEBHOOK</button>
            <button className="login-btn" style={{ background: '#f8fafc', color: '#0ea5e9', border: '1px solid #0ea5e9', width: 'auto', padding: '0 2rem' }} onClick={() => handleTestMeta('webhook')}>TEST KIỂM TRA QUYỀN</button>
          </div>
        </div>
      )}

      {/* Meta Commerce Catalog area */}
      {!onlyBU && (
        <div className="stat-card" style={{ 
          background: 'white', 
          color: '#1e293b', 
          border: '1px solid #e2e8f0', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          padding: '2rem'
        }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Package size={20} color="#f59e0b" /> Cấu hình Meta Commerce Catalog (Sản phẩm Tour)
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Tích hợp với dữ liệu Facebook qua Real-time Graph Batch API. (Lưu ý: Bạn vẫn có thể tải CSV ở màn hình Tour).
          </p>
          <div className="modal-form-group" style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label>DESTINATION CATALOG ID</label>
            <input 
              className="modal-input" 
              placeholder="Ví dụ: 9876543210"
              value={metaSettings?.meta_catalog_id || ''} 
              onChange={e => setMetaSettings({...metaSettings, meta_catalog_id: e.target.value})} 
            />
          </div>
          <div className="modal-form-group" style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label>META SYSTEM USER ACCESS TOKEN</label>
            <input 
              className="modal-input" 
              placeholder="Paste EAAP... token được tạo từ Graph API Explorer..."
              value={metaSettings?.meta_system_user_token || ''} 
              onChange={e => setMetaSettings({...metaSettings, meta_system_user_token: e.target.value})} 
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', width: '100%' }}>
            <button className="login-btn" style={{ background: '#f59e0b', width: 'auto', padding: '0 2rem' }} onClick={handleUpdateSettings}>LƯU CẤU HÌNH API</button>
            <button 
              className="login-btn" 
              style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #f59e0b', width: 'auto', padding: '0 2rem', textDecoration: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => {
                if(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    alert('Chức năng Đồng bộ API Meta bị khóa trên Localhost để tránh ghi đè dữ liệu thật. Vui lòng thao tác trên erp.fittour.vn.');
                    return;
                }
                handleTestMeta('catalog');
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⚡</span> ĐỒNG BỘ TOÀN BỘ (API)
            </button>
          </div>
        </div>
      )}


      {/* BU Management - Redesigned to be FULL WIDTH and VERTICAL STACK */}
      {onlyBU && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem', 
          width: '100%', 
          background: 'transparent'
        }}>
          <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Package size={28} color="#6366f1" /> Quản lý Khối Kinh doanh (BU)
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                Tùy chỉnh tên gọi của các BU và danh sách các quốc gia thuộc từng khối để phân bổ Lead và Sản phẩm chính xác.
              </p>
            </div>
            
            {!showAddBU && (
              <button 
                className="btn-pro-save" 
                style={{ width: 'auto', padding: '0.75rem 1.5rem', background: '#334155' }}
                onClick={() => setShowAddBU(true)}
              >
                <Plus size={18} /> THÊM KHỐI BU MỚI
              </button>
            )}
          </div>

          {showAddBU && (
            <div className="animate-slide-up" style={{ 
              background: 'white', 
              padding: '2rem', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>🆕 Tạo Khối BU mới</h3>
              <form onSubmit={handleCreateBU}>
                <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="modal-form-group">
                    <label>MÃ BU (Ví dụ: BU5)</label>
                    <input className="modal-input" required value={newBU.id} onChange={e => setNewBU({...newBU, id: e.target.value.toUpperCase()})} />
                  </div>
                  <div className="modal-form-group">
                    <label>TÊN HIỂN THỊ (Ví dụ: BU5 (Châu Phi))</label>
                    <input className="modal-input" required value={newBU.label} onChange={e => setNewBU({...newBU, label: e.target.value})} />
                  </div>
                </div>
                <div className="modal-form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>QUỐC GIA</label>
                  <CountryTags 
                    countries={newBU.countries} 
                    onAdd={val => {
                      if (val.trim() && !newBU.countries.includes(val.trim())) {
                        setNewBU({...newBU, countries: [...newBU.countries, val.trim()]});
                      }
                    }} 
                    onRemove={val => setNewBU({...newBU, countries: newBU.countries.filter(c => c !== val)})} 
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-pro-cancel" onClick={() => setShowAddBU(false)}>Hủy bỏ</button>
                  <button type="submit" className="btn-pro-save" style={{ padding: '0.75rem 2.5rem' }}>Xác nhận Tạo</button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
          {bus.map((bu, index) => {
            const isEditing = !!editingBUs[bu.id];
            const displayData = isEditing ? editingBUs[bu.id] : bu;
            const isActive = displayData.is_active !== false;

            return (
              <div 
                key={bu.id} 
                className="bu-config-row animate-fade-in mobile-stack-grid mobile-stack-grid" 
                style={{ 
                  padding: '1.5rem 2rem', 
                  borderRadius: '16px', 
                  background: isEditing ? '#fff' : (isActive ? 'white' : '#f8fafc'),
                  border: isEditing ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  boxShadow: isEditing ? '0 10px 15px -3px rgba(99, 102, 241, 0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'grid',
                  gridTemplateColumns: '120px 250px 1fr 180px',
                  gap: '2rem',
                  alignItems: 'center',
                  width: '100%',
                  opacity: isActive ? 1 : 0.7
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <button 
                        onClick={() => moveBU(bu.id, 'up')}
                        disabled={index === 0}
                        style={{ border: 'none', background: 'none', padding: 0, cursor: index === 0 ? 'default' : 'pointer', color: index === 0 ? '#cbd5e1' : '#64748b' }}
                      >
                        <ChevronUp size={20} />
                      </button>
                      <button 
                        onClick={() => moveBU(bu.id, 'down')}
                        disabled={index === bus.length - 1}
                        style={{ border: 'none', background: 'none', padding: 0, cursor: index === bus.length - 1 ? 'default' : 'pointer', color: index === bus.length - 1 ? '#cbd5e1' : '#64748b', marginTop: '-4px' }}
                      >
                        <ChevronDown size={20} />
                      </button>
                   </div>
                   <div style={{ fontWeight: 800, color: '#6366f1', fontSize: '1.25rem' }}>{bu.id}</div>
                </div>
                
                <div className="modal-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tên Hiển Thị</label>
                  <input 
                    className="modal-input"
                    style={{ padding: '0.6rem 0.75rem', fontWeight: 600, fontSize: '0.95rem' }}
                    value={displayData.label}
                    onChange={(e) => handleBUChange(bu.id, 'label', e.target.value)}
                  />
                </div>

                <div className="modal-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quốc Gia</label>
                  <CountryTags 
                    buId={bu.id}
                    countries={displayData.countries}
                    onAdd={val => addTag(bu.id, val)}
                    onRemove={val => removeTag(bu.id, val)}
                    disabled={!isActive}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                  <div 
                    onClick={() => toggleStatus(bu)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      cursor: 'pointer',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: isActive ? '#f0fdf4' : '#fef2f2',
                      color: isActive ? '#16a34a' : '#dc2626'
                    }}
                  >
                    {isActive ? <CheckCircle size={16} /> : <Power size={16} />}
                    {isActive ? 'ĐANG KÍCH HOẠT' : 'ĐÃ TẠM DỪNG'}
                  </div>

                  <button 
                    className="btn-pro-save"
                    disabled={!isEditing}
                    style={{ 
                      padding: '0.6rem 1.5rem', 
                      width: '100%',
                      fontSize: '0.85rem',
                      opacity: isEditing ? 1 : 0.4,
                      background: isEditing ? '#6366f1' : '#cbd5e1',
                      pointerEvents: isEditing ? 'auto' : 'none',
                      boxShadow: isEditing ? '0 10px 15px -3px rgba(99, 102, 241, 0.2)' : 'none'
                    }}
                    onClick={() => handleSaveBU(bu.id)}
                  >
                    <Save size={18} /> LƯU THAY ĐỔI
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Info size={24} color="#d97706" />
            <span style={{ fontSize: '0.95rem', color: '#92400e' }}>
              <strong>Quản lý:</strong> Di chuyển BU lên/xuống để thay đổi thứ tự hiển thị. Các BU "Đã tạm dừng" sẽ không xuất hiện trong bộ lọc của Sản phẩm và Lead.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
