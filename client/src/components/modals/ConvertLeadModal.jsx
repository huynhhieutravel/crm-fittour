import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Building, User, ArrowRight, AlertTriangle } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

export default function ConvertLeadModal({ lead, onClose, onConverted, addToast }) {
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [leaders, setLeaders] = useState([]);

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedLeader, setSelectedLeader] = useState(null);

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const [compRes, leadRes] = await Promise.all([
                axios.get('/api/b2b-companies', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/group-leaders', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            const comps = compRes.data.map(c => ({ value: c.id, label: c.name, type: 'existing' }));
            const leds = leadRes.data.map(l => ({ value: l.id, label: `${l.name} (${l.phone || 'Chưa có SĐT'})`, phone: l.phone, type: 'existing' }));
            
            setCompanies(comps);
            setLeaders(leds);

            // Auto-detect matches for Company and Leader based on Lead data
            if (lead?.name) {
                // Try to find if it's a company name
                const matchedComp = comps.find(c => c.label.toLowerCase().includes(lead.name.toLowerCase()));
                if (matchedComp) setSelectedCompany(matchedComp);
                else setSelectedCompany({ value: lead.name, label: `Tạo Công ty mới: "${lead.name}"`, type: 'new', rawName: lead.name });
            }

            if (lead?.phone) {
                const matchedLead = leds.find(l => l.phone && l.phone.includes(lead.phone));
                if (matchedLead) setSelectedLeader(matchedLead);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleConvert = async () => {
        if (!selectedCompany) return alert('Vui lòng chọn hoặc nhập tên Công ty!');
        
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const payload = {
                companyId: selectedCompany.type === 'existing' ? selectedCompany.value : null,
                companyName: selectedCompany.type === 'new' ? selectedCompany.rawName : null,
                leaderId: selectedLeader?.type === 'existing' ? selectedLeader.value : null,
                leaderName: selectedLeader?.type === 'new' ? selectedLeader.rawName : null,
                leaderPhone: lead.phone
            };

            await axios.post(`/api/mice-leads/${lead.id}/convert`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (addToast) addToast('Chuyển đổi thành công! Đã tạo Dự án.', 'success');
            onConverted();
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const reactSelectStyles = {
        control: (base) => ({
            ...base, height: '44px', minHeight: '44px', borderRadius: '8px', 
            borderColor: '#cbd5e1', boxShadow: 'none'
        })
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
            <div style={{ background: 'white', width: '500px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ padding: '20px', background: '#10b981', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowRight size={20} /> Chuyển đổi Lead thành Dự án
                    </h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                
                <div style={{ padding: '24px' }}>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#64748b' }}>Bạn đang chuyển đổi Lead:</p>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{lead?.name}</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#475569' }}>SĐT: {lead?.phone || 'Chưa có'}</p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                            <Building size={16} color="#3b82f6" /> Chọn Công ty (B2B Company) *
                        </label>
                        <CreatableSelect 
                            options={companies}
                            value={selectedCompany}
                            onChange={o => setSelectedCompany(o)}
                            onCreateOption={v => setSelectedCompany({ value: v, label: `Tạo Công ty mới: "${v}"`, type: 'new', rawName: v })}
                            formatCreateLabel={v => `Tạo công ty mới: "${v}"`}
                            placeholder="Tìm tên công ty hoặc nhập mới..."
                            styles={reactSelectStyles}
                        />
                        {selectedCompany?.type === 'new' && (
                            <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: '8px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={14} /> Sẽ tạo mới Công ty này trong dữ liệu hệ thống.
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                            <User size={16} color="#3b82f6" /> Chọn Người đại diện (Group Leader)
                        </label>
                        <CreatableSelect 
                            options={leaders}
                            value={selectedLeader}
                            onChange={o => setSelectedLeader(o)}
                            onCreateOption={v => setSelectedLeader({ value: v, label: `Tạo Người đại diện mới: "${v}"`, type: 'new', rawName: v })}
                            formatCreateLabel={v => `Tạo đại diện mới: "${v}"`}
                            placeholder="Tìm theo SĐT/Tên hoặc nhập mới..."
                            styles={reactSelectStyles}
                            isClearable
                        />
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: 0, padding: '10px', background: '#f1f5f9', borderRadius: '8px' }}>
                        * Một Dự án MICE mới sẽ tự động được tạo và liên kết với Công ty & Đại diện trên. Bạn có thể cập nhật báo giá trong phần chi tiết Dự án sau.
                    </p>
                </div>

                <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', background: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
                    <button onClick={handleConvert} disabled={loading} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {loading ? 'Đang xử lý...' : 'Chuyển Đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}
