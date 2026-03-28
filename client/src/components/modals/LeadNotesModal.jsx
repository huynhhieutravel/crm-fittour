import React from 'react';
import { X } from 'lucide-react';

const LeadNotesModal = ({
  selectedLeadForNotes,
  setSelectedLeadForNotes,
  handleAddNote,
  newNote,
  setNewNote,
  leadNotes
}) => {
  if (!selectedLeadForNotes) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelectedLeadForNotes(null)}>
      <div className="modal-content animate-fade-in" style={{ maxWidth: '600px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setSelectedLeadForNotes(null)}>
          <X size={18} strokeWidth={3} />
        </button>
        <h3 style={{ marginBottom: '1.5rem' }}>Timeline: {selectedLeadForNotes.name}</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
          <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input className="filter-input" style={{ flex: 1 }} placeholder="Ghi chú mới..." value={newNote} onChange={e => setNewNote(e.target.value)} />
            <button type="submit" className="login-btn" style={{ width: 'auto' }}>GỬI</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {leadNotes.map(note => (
              <div key={note.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', borderLeft: '4px solid #6366f1' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{note.creator_name}</strong>
                  <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                </div>
                <div style={{ fontSize: '0.9rem' }}>{note.content}</div>
              </div>
            ))}
            {leadNotes.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Chưa có lịch sử tư vấn.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadNotesModal;
