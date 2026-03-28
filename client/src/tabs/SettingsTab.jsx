import React from 'react';

const SettingsTab = ({ 
  metaSettings, 
  setMetaSettings, 
  handleUpdateSettings, 
  handleTestMeta 
}) => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <div className="stat-card" style={{ background: 'white', color: '#1e293b', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Cấu hình Meta Webhook</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="modal-form-group">
            <label>APP ID</label>
            <input 
              className="modal-input" 
              value={metaSettings.meta_app_id} 
              onChange={e => setMetaSettings({...metaSettings, meta_app_id: e.target.value})} 
            />
          </div>
          <div className="modal-form-group">
            <label>APP SECRET</label>
            <input 
              className="modal-input" 
              type="password" 
              value={metaSettings.meta_app_secret} 
              onChange={e => setMetaSettings({...metaSettings, meta_app_secret: e.target.value})} 
            />
          </div>
        </div>
        <div className="modal-form-group" style={{ marginBottom: '1.5rem' }}>
          <label>PAGE ACCESS TOKEN (LONGLIVED)</label>
          <textarea 
            className="modal-textarea" 
            style={{ height: '100px' }} 
            value={metaSettings.meta_page_access_token} 
            onChange={e => setMetaSettings({...metaSettings, meta_page_access_token: e.target.value})} 
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="login-btn" onClick={handleUpdateSettings}>LƯU CẤU HÌNH</button>
          <button 
            className="login-btn" 
            style={{ background: '#f8fafc', color: '#6366f1', border: '1px solid #6366f1' }} 
            onClick={handleTestMeta}
          >
            KÍCH HOẠT KẾT NỐI
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
