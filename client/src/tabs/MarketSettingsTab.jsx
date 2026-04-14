import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Info, Plus, Eye, EyeOff, Edit3, FolderPlus } from 'lucide-react';
import { invalidateMarketsCache } from '../hooks/useMarkets';

const MarketSettingsTab = () => {
  const [marketTree, setMarketTree] = useState([]);
  const [editingMarketId, setEditingMarketId] = useState(null);
  const [editingMarketName, setEditingMarketName] = useState('');
  const [editingMarketSort, setEditingMarketSort] = useState(0);
  const [addingChildTo, setAddingChildTo] = useState(null);
  const [newChildName, setNewChildName] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const fetchMarketTree = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/markets/all', { headers: { Authorization: `Bearer ${token}` } });
      setMarketTree(res.data);
    } catch (err) {
      console.error('Error fetching market tree:', err);
    }
  };

  useEffect(() => {
    fetchMarketTree();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/markets', { name: newGroupName.trim(), parent_id: null }, { headers: { Authorization: `Bearer ${token}` } });
      setNewGroupName('');
      setShowAddGroup(false);
      fetchMarketTree();
      invalidateMarketsCache();
    } catch (err) { console.error(err); }
  };

  const handleCreateChild = async (parentId) => {
    if (!newChildName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/markets', { name: newChildName.trim(), parent_id: parentId }, { headers: { Authorization: `Bearer ${token}` } });
      setNewChildName('');
      setAddingChildTo(null);
      fetchMarketTree();
      invalidateMarketsCache();
    } catch (err) { console.error(err); }
  };

  const handleUpdateMarketName = async (id) => {
    if (!editingMarketName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/markets/${id}`, { 
         name: editingMarketName.trim(),
         sort_order: parseFloat(editingMarketSort) || 0
      }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingMarketId(null);
      setEditingMarketName('');
      setEditingMarketSort(0);
      fetchMarketTree();
      invalidateMarketsCache();
    } catch (err) { console.error(err); }
  };

  const handleToggleMarket = async (id, currentActive) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/markets/${id}`, { is_active: !currentActive }, { headers: { Authorization: `Bearer ${token}` } });
      fetchMarketTree();
      invalidateMarketsCache();
    } catch (err) { console.error(err); }
  };

  const handleToggleGroup = async (group) => {
    try {
      const token = localStorage.getItem('token');
      const newActive = !group.is_active;
      await axios.put(`/api/markets/${group.id}`, { is_active: newActive }, { headers: { Authorization: `Bearer ${token}` } });
      for (const child of (group.children || [])) {
        await axios.put(`/api/markets/${child.id}`, { is_active: newActive }, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchMarketTree();
      invalidateMarketsCache();
    } catch (err) { console.error(err); }
  };

  const totalMarkets = marketTree.reduce((acc, g) => acc + (g.children || []).length, 0);
  const activeMarkets = marketTree.reduce((acc, g) => acc + (g.children || []).filter(c => c.is_active).length, 0);

  return (
    <div className="animate-fade-in" style={{ padding: '0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
        border: '1px solid #bbf7d0',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#166534' }}>
            <MapPin size={28} /> Quản lý Thị trường & Điểm đến
          </h2>
          <p style={{ color: '#15803d', margin: 0, fontSize: '0.9rem' }}>
            Quản lý tập trung toàn bộ thị trường/điểm đến trong hệ thống CRM. Thay đổi tại đây sẽ tự động cập nhật mọi dropdown.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#166534' }}>{marketTree.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>NHÓM</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: '#bbf7d0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#166534' }}>{activeMarkets}<span style={{ fontSize: '0.9rem', color: '#86efac' }}>/{totalMarkets}</span></div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>ĐIỂM ĐẾN</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: '#bbf7d0' }} />
          {!showAddGroup && (
            <button
              onClick={() => setShowAddGroup(true)}
              style={{
                background: '#16a34a', color: 'white', border: 'none',
                padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
              }}
            >
              <FolderPlus size={18} /> Thêm Nhóm mới
            </button>
          )}
        </div>
      </div>

      {/* Add New Group Form */}
      {showAddGroup && (
        <div style={{
          display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center',
          background: '#f0fdf4', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0'
        }}>
          <FolderPlus size={18} color="#16a34a" />
          <input
            className="modal-input"
            style={{ maxWidth: '350px', padding: '0.6rem 0.85rem' }}
            placeholder="Tên nhóm mới (VD: Châu Phi, Bắc Mỹ)..."
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
            autoFocus
          />
          <button onClick={handleCreateGroup} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Tạo nhóm</button>
          <button onClick={() => { setShowAddGroup(false); setNewGroupName(''); }} style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }}>Hủy</button>
        </div>
      )}

      {/* Market Tree */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {marketTree.map(group => (
          <div key={group.id} style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            overflow: 'hidden',
            opacity: group.is_active ? 1 : 0.5,
            transition: 'opacity 0.2s'
          }}>
            {/* Group Header */}
            <div style={{
              background: '#f8fafc',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📁</span>
                {editingMarketId === group.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      className="modal-input"
                      title="STT (Sắp xếp)"
                      style={{ padding: '0.35rem', fontSize: '0.90rem', width: '50px', textAlign: 'center' }}
                      type="number"
                      value={editingMarketSort}
                      onChange={e => setEditingMarketSort(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdateMarketName(group.id)}
                    />
                    <input
                      className="modal-input"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.95rem', width: '200px' }}
                      value={editingMarketName}
                      onChange={e => setEditingMarketName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdateMarketName(group.id)}
                      autoFocus
                    />
                    <button onClick={() => handleUpdateMarketName(group.id)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>✓ Lưu</button>
                    <button onClick={() => { setEditingMarketId(null); setEditingMarketSort(0); }} style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '13px' }}>✕</button>
                  </div>
                ) : (
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{group.name}</span>
                )}
                <span style={{
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                  background: '#94a3b8', borderRadius: '10px', padding: '2px 8px',
                  minWidth: '20px', textAlign: 'center'
                }}>
                  {(group.children || []).length}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => { setAddingChildTo(addingChildTo === group.id ? null : group.id); setNewChildName(''); }}
                  title="Thêm điểm đến"
                  style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Thêm
                </button>
                <button
                  onClick={() => { setEditingMarketId(group.id); setEditingMarketName(group.name); setEditingMarketSort(group.sort_order || 0); }}
                  title="Sửa tên nhóm"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '5px' }}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleToggleGroup(group)}
                  title={group.is_active ? 'Ẩn nhóm' : 'Hiện nhóm'}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: group.is_active ? '#10b981' : '#dc2626', padding: '5px' }}
                >
                  {group.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {/* Children */}
            <div style={{ padding: '0.75rem 1.25rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(group.children || []).map(child => (
                  <div key={child.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.65rem 0.35rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    background: child.is_active ? '#f0fdf4' : '#fef2f2',
                    color: child.is_active ? '#166534' : '#991b1b',
                    border: `1px solid ${child.is_active ? '#bbf7d0' : '#fecaca'}`,
                    opacity: child.is_active ? 1 : 0.6,
                    transition: 'all 0.2s'
                  }}>
                    {editingMarketId === child.id ? (
                      <>
                        <input
                          title="STT"
                          style={{ border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', outline: 'none', width: '35px', fontSize: '0.80rem', textAlign: 'center', padding: '2px' }}
                          type="number"
                          value={editingMarketSort}
                          onChange={e => setEditingMarketSort(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleUpdateMarketName(child.id)}
                        />
                        <input
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '130px', fontSize: '0.85rem', fontWeight: 600 }}
                          value={editingMarketName}
                          onChange={e => setEditingMarketName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleUpdateMarketName(child.id)}
                          autoFocus
                        />
                        <button onClick={() => handleUpdateMarketName(child.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#10b981', padding: 0 }}>✓</button>
                        <button onClick={() => { setEditingMarketId(null); setEditingMarketSort(0); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#94a3b8', padding: 0 }}>✕</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontWeight: 500 }}>{child.name}</span>
                        <button
                          onClick={() => { setEditingMarketId(child.id); setEditingMarketName(child.name); setEditingMarketSort(child.sort_order || 0); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 2px' }}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleToggleMarket(child.id, child.is_active)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: child.is_active ? '#10b981' : '#dc2626', padding: '0 2px' }}
                        >
                          {child.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Child Input */}
              {addingChildTo === group.id && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', alignItems: 'center' }}>
                  <input
                    className="modal-input"
                    style={{ maxWidth: '280px', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
                    placeholder="Tên điểm đến mới..."
                    value={newChildName}
                    onChange={e => setNewChildName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateChild(group.id)}
                    autoFocus
                  />
                  <button onClick={() => handleCreateChild(group.id)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Thêm</button>
                  <button onClick={() => { setAddingChildTo(null); setNewChildName(''); }} style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Hủy</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Help */}
      <div style={{
        marginTop: '1.5rem', padding: '1.25rem', background: '#f0fdf4',
        border: '1px solid #bbf7d0', borderRadius: '12px',
        display: 'flex', gap: '0.85rem', alignItems: 'flex-start'
      }}>
        <Info size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#166534', lineHeight: '1.6' }}>
          <strong>💡 Hướng dẫn sử dụng:</strong><br />
          • <strong>Thêm Nhóm:</strong> Tạo một khu vực/châu lục mới (VD: Châu Phi, Nam Mỹ)<br />
          • <strong>Thêm điểm đến:</strong> Bấm "+ Thêm" ở mỗi nhóm để thêm quốc gia/thành phố<br />
          • <strong>Ẩn/Hiện:</strong> Bấm icon 👁️ để ẩn/hiện thị trường khỏi dropdown mà không xóa dữ liệu<br />
          • <strong>Sửa tên:</strong> Bấm icon ✏️ để đổi tên trực tiếp
        </div>
      </div>
    </div>
  );
};

export default MarketSettingsTab;
