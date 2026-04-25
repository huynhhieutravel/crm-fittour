import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Save, Plus, Trash2, Link as LinkIcon, Paperclip, ChevronDown, ChevronRight, User, FileText, CheckCircle, AlertTriangle, ScanText } from 'lucide-react';
import { canEdit, canDelete } from '../../utils/permissions';
import { VISA_CHECKLIST_TEMPLATE } from './VisaChecklistTemplate';
import { scanPassportImage } from '../../utils/passportOcr';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

export default function VisaDetailDrawer({ visaId, onClose, refreshList, currentUser, addToast }) {
    const isNew = !visaId;
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    
    const [activeTab, setActiveTab] = useState('info');

    const [form, setForm] = useState({
        code: '', name: '', customer_name: '', customer_phone: '', customer_type: 'Cá nhân',
        status: 'Tạo mới', market: '', visa_type: 'Du lịch',
        receipt_date: '', result_date: '', fingerprint_date: '', stamp_date: '', return_date: '',
        quantity: 1, service_package: '', is_urgent: false, is_evisa: false,
        exchange_rate: 1, notes: '',
        members: [], finance_data: [], finance_commissions: []
    });
    const [showDeleteSupplier, setShowDeleteSupplier] = useState(null); // custom confirm modal
    const [usersList, setUsersList] = useState([]);
    const [vouchersList, setVouchersList] = useState([]);
    const [showVoucherForm, setShowVoucherForm] = useState(false);
    const [voucherForm, setVoucherForm] = useState({ title: 'Thu tiền Visa', amount: '', payment_method: 'Chuyển khoản', payer_name: '', payer_phone: '', notes: '' });

    useEffect(() => {
        // Load users list for commission dropdown
        axios.get('/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(res => setUsersList(res.data || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!isNew) {
            fetchDetail();
            fetchVouchers();
        } else {
            // Generate basic code for New Visa
            setForm(f => ({ ...f, code: `VISA-${Date.now().toString().slice(-6)}` }));
            setVouchersList([]);
        }
    }, [visaId]);

    const fetchVouchers = async () => {
        try {
            const res = await axios.get(`/api/vouchers/visa/${visaId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setVouchersList(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateVoucher = async () => {
        try {
            if (!voucherForm.amount || !voucherForm.title) {
                if(addToast) addToast('Vui lòng nhập Số tiền và Nội dung', 'error');
                return;
            }
            if (isNew) {
                if(addToast) addToast('Vui lòng Lưu Hồ Sơ trước khi lập Phiếu Thu', 'error');
                return;
            }
            await axios.post('/api/vouchers', {
                ...voucherForm,
                amount: Number(voucherForm.amount),
                visa_id: visaId
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
            
            if(addToast) addToast('Tạo phiếu thu thành công', 'success');
            setShowVoucherForm(false);
            setVoucherForm({ title: 'Thu tiền Visa', amount: '', payment_method: 'Chuyển khoản', payer_name: '', payer_phone: '', notes: '' });
            fetchVouchers();
            fetchDetail(); // Refresh total collected
            refreshList(); // Refresh list to update total
        } catch(err) {
            if(addToast) addToast(err.response?.data?.message || 'Lỗi tạo phiếu thu', 'error');
        }
    };

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/visas/${visaId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const d = res.data;
            d.receipt_date = d.receipt_date ? d.receipt_date.split('T')[0] : '';
            d.result_date = d.result_date ? d.result_date.split('T')[0] : '';
            d.fingerprint_date = d.fingerprint_date ? d.fingerprint_date.split('T')[0] : '';
            d.stamp_date = d.stamp_date ? d.stamp_date.split('T')[0] : '';
            d.return_date = d.return_date ? d.return_date.split('T')[0] : '';
            if (!d.members) d.members = [];
            else {
                d.members = d.members.map(m => ({
                    ...m,
                    checklist_data: typeof m.checklist_data === 'string' ? JSON.parse(m.checklist_data || '[]') : (m.checklist_data || [])
                }));
            }
            if (typeof d.finance_data === 'string') {
                try { 
                    const parsed = JSON.parse(d.finance_data || '[]'); 
                    if (Array.isArray(parsed)) {
                        d.finance_data = parsed;
                        d.finance_commissions = [];
                    } else {
                        d.finance_data = parsed.suppliers || [];
                        d.finance_commissions = parsed.commissions || [];
                    }
                } catch { 
                    d.finance_data = []; 
                    d.finance_commissions = [];
                }
            } else if (!d.finance_data) {
                d.finance_data = [];
                d.finance_commissions = [];
            } else if (Array.isArray(d.finance_data)) {
                d.finance_commissions = [];
            } else {
                d.finance_commissions = d.finance_data.commissions || [];
                d.finance_data = d.finance_data.suppliers || [];
            }
            setForm(d);
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.name || !form.code) {
            if(addToast) addToast('Vui lòng nhập Mã và Tên Đơn', 'error');
            return;
        }

        try {
            setSaving(true);
            const payload = { ...form };
            payload.finance_data = {
                suppliers: form.finance_data || [],
                commissions: form.finance_commissions || []
            };
            delete payload.finance_commissions;
            
            if (isNew) {
                await axios.post('/api/visas', payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if(addToast) addToast('Tạo mới thành công', 'success');
            } else {
                await axios.put(`/api/visas/${visaId}`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if(addToast) addToast('Cập nhật thành công', 'success');
            }
            refreshList();
            onClose();
        } catch (err) {
            console.error(err);
            if(addToast) addToast(err.response?.data?.message || 'Lỗi lưu dữ liệu', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, val) => {
        setForm(prev => ({ ...prev, [field]: val }));
    };

    // --- OCR MANAGEMENT ---
    const fileInputRef = useRef(null);
    const [scanningOCR, setScanningOCR] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);

    const handleOCRUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setScanningOCR(true);
        setScanProgress(0);
        if (addToast) addToast('Đang nhận diện Hộ chiếu bằng AI...', 'info');

        try {
            const result = await scanPassportImage(file, (progress) => {
                setScanProgress(progress);
            });
            if (result && result.valid) {
                // Auto inject new member
                setForm(prev => {
                    const fullName = result.surname && result.givenName ? `${result.surname} ${result.givenName}` : '';
                    
                    const newMember = {
                        id: 'new_' + Date.now(),
                        fullname: fullName,
                        passport_number: result.docId || '',
                        phone: '',
                        dob: result.dobDisplay ? result.dobDisplay.split('/').reverse().join('-') : '', // assuming YYYY-MM-DD
                        age_type: 'Người lớn',
                        checklist_data: JSON.parse(JSON.stringify(VISA_CHECKLIST_TEMPLATE))
                    };

                    const isFirst = prev.members.length === 0;
                    return { 
                        ...prev, 
                        customer_name: (isFirst && !prev.customer_name) ? fullName : prev.customer_name,
                        name: (isFirst && !prev.name && fullName) ? `HỒ SƠ VISA: ${fullName}` : prev.name,
                        members: [...prev.members, newMember] 
                    };
                });
                if (addToast) addToast('Quét thành công! Đã tự động điền thông tin.', 'success');
            } else {
                if (addToast) addToast('Không nhận diện được Hộ chiếu.', 'error');
            }
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi khi quét ảnh.', 'error');
        } finally {
            setScanningOCR(false);
            if (fileInputRef.current) fileInputRef.current.value = null;
        }
    };

    // --- FINANCE MANAGEMENT ---
    const toNum = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };
    const calculateServiceRevenue = (svc) => {
        const base = toNum(svc.sale_price) * toNum(svc.fx || 1) * toNum(svc.quantity || 1);
        return base + toNum(svc.surcharge) + toNum(svc.vat);
    };
    const calculateServiceCostBase = (svc) => toNum(svc.net_price) * toNum(svc.fx || 1) * toNum(svc.quantity || 1);
    const calculateSupplierCost = (sup) => {
        const baseCost = (sup.services || []).reduce((sum, svc) => sum + calculateServiceCostBase(svc), 0);
        return baseCost + toNum(sup.cost_surcharge) + (baseCost * toNum(sup.cost_vat) / 100);
    };

    const financeTotals = React.useMemo(() => {
        const data = form.finance_data || [];
        const tRev = data.reduce((sum, sup) => sum + (sup.services || []).reduce((s2, svc) => s2 + calculateServiceRevenue(svc), 0), 0);
        const tCost = data.reduce((sum, sup) => sum + calculateSupplierCost(sup), 0);
        return { totalRevenue: tRev, totalCost: tCost, expectedProfit: tRev - tCost };
    }, [form.finance_data]);

    const handleAddSupplier = () => {
        const newSup = {
            id: Date.now(), supplier_code: '', supplier_name: '', supplier_type: 'Visa',
            services: [{ id: Date.now(), name: '', date_submit: '', date_return: '', quantity: 1, net_price: 0, fx: 1, sale_price: 0, surcharge: 0, vat: 0 }],
            cost_surcharge: 0, cost_vat: 0
        };
        handleChange('finance_data', [...(form.finance_data || []), newSup]);
    };
    const updateSupplier = (sIdx, field, val) => {
        const newData = JSON.parse(JSON.stringify(form.finance_data));
        newData[sIdx][field] = val;
        handleChange('finance_data', newData);
    };
    const confirmRemoveSupplier = () => {
        if (showDeleteSupplier !== null) {
            const newData = [...form.finance_data];
            newData.splice(showDeleteSupplier, 1);
            handleChange('finance_data', newData);
            setShowDeleteSupplier(null);
        }
    };
    const handleAddService = (sIdx) => {
        const newData = JSON.parse(JSON.stringify(form.finance_data));
        newData[sIdx].services.push({ id: Date.now(), name: '', date_submit: '', date_return: '', quantity: 1, net_price: 0, fx: 1, sale_price: 0, surcharge: 0, vat: 0 });
        handleChange('finance_data', newData);
    };
    const updateService = (sIdx, svcIdx, field, val) => {
        const newData = JSON.parse(JSON.stringify(form.finance_data));
        newData[sIdx].services[svcIdx][field] = val;
        handleChange('finance_data', newData);
    };
    const removeService = (sIdx, svcIdx) => {
        const newData = JSON.parse(JSON.stringify(form.finance_data));
        if (newData[sIdx].services.length <= 1) return; // giữ tối thiểu 1 dòng
        newData[sIdx].services.splice(svcIdx, 1);
        handleChange('finance_data', newData);
    };

    const handleAddCommission = () => {
        const newCom = { id: Date.now(), sales_name: '', percent: 100 };
        handleChange('finance_commissions', [...(form.finance_commissions || []), newCom]);
    };
    const updateCommission = (cIdx, field, val) => {
        const newData = JSON.parse(JSON.stringify(form.finance_commissions));
        newData[cIdx][field] = val;
        handleChange('finance_commissions', newData);
    };
    const removeCommission = (cIdx) => {
        const newData = [...form.finance_commissions];
        newData.splice(cIdx, 1);
        handleChange('finance_commissions', newData);
    };

    // --- MEMBER MANAGEMENT ---
    const addMember = () => {
        setForm(prev => {
            const newMember = {
                id: 'new_' + Date.now(),
                fullname: '',
                passport_number: '',
                phone: '',
                dob: '',
                age_type: 'Người lớn',
                checklist_data: JSON.parse(JSON.stringify(VISA_CHECKLIST_TEMPLATE)) // Inject template
            };
            return { ...prev, members: [...prev.members, newMember] };
        });
    };

    const removeMember = (mId) => {
        setForm(prev => {
            if (String(mId).startsWith('new_')) {
                return { ...prev, members: prev.members.filter(m => m.id !== mId) };
            }
            const deleted = prev.deleted_member_ids || [];
            return { 
                ...prev, 
                members: prev.members.filter(m => m.id !== mId),
                deleted_member_ids: [...deleted, mId]
            };
        });
    };

    const updateMemberInfo = (mId, field, val) => {
        setForm(prev => ({
            ...prev,
            members: prev.members.map(m => m.id === mId ? { ...m, [field]: val } : m)
        }));
    };

    // --- CHECKLIST MANAGEMENT ---
    const [selectedMemberForChecklist, setSelectedMemberForChecklist] = useState(null);

    const updateChecklistStatus = (mId, catIndex, itemIndex, newStatus) => {
        setForm(prev => ({
            ...prev,
            members: prev.members.map(m => {
                if (m.id === mId) {
                    const newChecklist = [...m.checklist_data];
                    newChecklist[catIndex].items[itemIndex].status = newStatus;
                    return { ...m, checklist_data: newChecklist };
                }
                return m;
            })
        }));
    };

    const updateChecklistFile = (mId, catIndex, itemIndex, link) => {
         setForm(prev => ({
            ...prev,
            members: prev.members.map(m => {
                if (m.id === mId) {
                    const newChecklist = [...m.checklist_data];
                    newChecklist[catIndex].items[itemIndex].file_link = link;
                    return { ...m, checklist_data: newChecklist };
                }
                return m;
            })
        }));
    };

    if (loading) {
        return (
            <div className="drawer-overlay" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
                <div className="drawer" style={{ width: 'calc(100vw - var(--sidebar-width, 260px))', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    const currentMemberForChecklist = form.members.find(m => m.id === selectedMemberForChecklist) || form.members[0];

    return (
        <div className="drawer-overlay" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(4px)' }}>
            <div className="drawer" style={{ width: 'calc(100vw - var(--sidebar-width, 260px))', backgroundColor: '#f8fafc', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease' }}>
                
                {/* HEAD */}
                <div style={{ padding: '1.5rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#eff6ff', color: '#2563eb', padding: '12px', borderRadius: '12px' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                {isNew ? 'THÊM MỚI HỒ SƠ VISA' : `HỒ SƠ: ${form.code}`}
                            </h2>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>{form.name || 'Chưa có tên đơn'}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* GLOBAL SCAN BUTTON IN HEADER */}
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            disabled={scanningOCR} 
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '6px', 
                                background: scanningOCR ? '#f1f5f9' : '#eff6ff', color: scanningOCR ? '#94a3b8' : '#2563eb', border: `1px solid ${scanningOCR ? '#cbd5e1' : '#bfdbfe'}`, 
                                padding: '8px 16px', borderRadius: '8px', cursor: scanningOCR ? 'wait' : 'pointer', fontWeight: 700,
                                position: 'relative', overflow: 'hidden'
                            }}
                        >
                            {/* PROGRESS BAR BACKGROUND */}
                            {scanningOCR && (
                                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: '#dbeafe', width: `${scanProgress}%`, transition: 'width 0.2s', zIndex: 0 }} />
                            )}
                            
                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ScanText size={18} /> 
                                {scanningOCR ? `Đang nhận diện... ${scanProgress}%` : 'Quét Passport AI'}
                            </div>
                        </button>
                        {/* Hidden input for the global scan button */}
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleOCRUpload} style={{ display: 'none' }} />

                        <button onClick={onClose} style={{ width: '36px', height: '36px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 2rem' }}>
                    {[
                        { id: 'info', label: '1. Thông tin Visa' },
                        { id: 'members', label: '2. Danh sách khách' },
                        { id: 'checklist', label: '3. CheckList Hồ Sơ' },
                        { id: 'finance', label: '4. Thu Chi' },
                        { id: 'notes', label: '5. Ghi chú' }
                    ].map(t => (
                        <div 
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            style={{
                                padding: '1rem 1.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                                borderBottom: activeTab === t.id ? '3px solid #2563eb' : '3px solid transparent',
                                color: activeTab === t.id ? '#2563eb' : '#64748b',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t.label}
                        </div>
                    ))}
                </div>

                {/* CONTENT */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    
                    {/* TAB: INFO */}
                    {activeTab === 'info' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ background: 'white', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>Mã & Trạng Thái</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Mã hệ thống</label>
                                        <input type="text" className="form-control" value={form.code} onChange={e => handleChange('code', e.target.value)} readOnly style={{ background: '#f1f5f9', color: '#64748b' }} />
                                    </div>
                                    <div className="form-group">
                                        <label>Trạng thái</label>
                                        <select className="form-control" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                                            {['Tạo mới', 'Đã duyệt', 'Không duyệt', 'Chờ xin', 'Đến hạn xin', 'Quá hạn xin', 'Thành công', 'Rớt Visa'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Thị trường Quốc gia</label>
                                        <input type="text" className="form-control" placeholder="Úc, Châu Âu, Mỹ..." value={form.market} onChange={e => handleChange('market', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'white', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Thông tin Khách liên hệ</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                                    <div className="form-group">
                                        <label>Tên Đơn (Diễn giải)</label>
                                        <input type="text" className="form-control" placeholder="VD: GIA DÌNH ANH TUẤN - VISA ÚC" value={form.name} onChange={e => handleChange('name', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phân loại khách</label>
                                        <select className="form-control" value={form.customer_type} onChange={e => handleChange('customer_type', e.target.value)}>
                                            {['Cá nhân', 'Khách Cty', 'Cộng tác viên'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Họ tên người liên hệ</label>
                                        <input type="text" className="form-control" placeholder="Tên khách hàng đại diện" value={form.customer_name} onChange={e => handleChange('customer_name', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input type="text" className="form-control" placeholder="Số điện thoại liên hệ" value={form.customer_phone} onChange={e => handleChange('customer_phone', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'white', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Tiến độ & Dịch vụ</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Loại hình</label>
                                        <input type="text" className="form-control" placeholder="Du lịch, Thăm thân..." value={form.visa_type} onChange={e => handleChange('visa_type', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Số lượng (Pax)</label>
                                        <input type="number" className="form-control" value={form.quantity} onChange={e => handleChange('quantity', e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Gói dịch vụ</label>
                                        <input type="text" className="form-control" placeholder="Bao đậu, Dịch vụ thường..." value={form.service_package} onChange={e => handleChange('service_package', e.target.value)} />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Ngày nộp / Lấy vân tay</label>
                                        <input type="date" className="form-control" value={form.fingerprint_date} onChange={e => handleChange('fingerprint_date', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày báo kết quả</label>
                                        <input type="date" className="form-control" value={form.result_date} onChange={e => handleChange('result_date', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Giờ có kết quả / Trả khách</label>
                                        <input type="date" className="form-control" value={form.return_date} onChange={e => handleChange('return_date', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày nhận hồ sơ</label>
                                        <input type="date" className="form-control" value={form.receipt_date} onChange={e => handleChange('receipt_date', e.target.value)} />
                                    </div>
                                    
                                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2rem', gridColumn: 'span 4', marginTop: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0, fontWeight: 700, color: '#1e293b' }}>
                                            <input type="checkbox" checked={form.is_urgent} onChange={e => handleChange('is_urgent', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#2563eb' }} />
                                            NỘP KHẨN / GẤP
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0, fontWeight: 700, color: '#1e293b' }}>
                                            <input type="checkbox" checked={form.is_evisa} onChange={e => handleChange('is_evisa', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#2563eb' }} />
                                            E-VISA (ĐIỆN TỬ)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: MEMBERS */}
                    {activeTab === 'members' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Danh sách Khách hàng ({form.members.length})</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn btn-primary" onClick={addMember} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                                        <Plus size={16} /> Thêm khách hàng thủ công
                                    </button>
                                </div>
                            </div>
                            
                            {form.members.length === 0 ? (
                                <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                    <User size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
                                    <p style={{ color: '#64748b' }}>Chưa có thành viên nào.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {form.members.map((m, i) => (
                                        <div key={m.id} style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'min-content 1fr 1fr 1.2fr min-content', gap: '1.25rem', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.85rem', width: '55px', textTransform: 'uppercase' }}>Khách {i+1}</div>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label style={{ fontSize: '0.75rem' }}>Họ Tên</label>
                                                <input type="text" className="form-control" style={{ background: '#f8fafc' }} value={m.fullname} onChange={e => updateMemberInfo(m.id, 'fullname', e.target.value)} placeholder="Tên khách..." />
                                            </div>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label style={{ fontSize: '0.75rem' }}>Số Hộ Chiếu</label>
                                                <input type="text" className="form-control" style={{ background: '#f8fafc' }} value={m.passport_number} onChange={e => updateMemberInfo(m.id, 'passport_number', e.target.value)} placeholder="B..." />
                                            </div>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label style={{ fontSize: '0.75rem' }}>Số ĐT / Ngày Sinh</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input type="text" className="form-control" style={{ background: '#f8fafc', flex: 1 }} value={m.phone} onChange={e => updateMemberInfo(m.id, 'phone', e.target.value)} placeholder="SĐT..." />
                                                    <DatePicker
                                                        selected={m.dob ? new Date(m.dob) : null}
                                                        onChange={date => updateMemberInfo(m.id, 'dob', date ? format(date, 'yyyy-MM-dd') : '')}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText="Ngày sinh"
                                                        className="form-control"
                                                        showYearDropdown
                                                        showMonthDropdown
                                                        dropdownMode="select"
                                                        isClearable
                                                        autoComplete="off"
                                                        wrapperClassName="datepicker-visa-dob"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <button onClick={() => removeMember(m.id)} style={{ color: '#ef4444', background: '#fef2f2', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: CHECKLIST */}
                    {activeTab === 'checklist' && (
                        <div>
                            {form.members.length === 0 ? (
                                <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
                                    <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: '12px' }} />
                                    <p style={{ color: '#d97706', fontWeight: 600 }}>Vui lòng thêm Danh sách khách ở mục 2 trước.</p>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '10px' }}>
                                        {form.members.map((m, i) => (
                                            <button 
                                                key={m.id}
                                                onClick={() => setSelectedMemberForChecklist(m.id)}
                                                style={{ 
                                                    padding: '10px 16px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                                                    background: (selectedMemberForChecklist === m.id || (!selectedMemberForChecklist && i===0)) ? '#3b82f6' : '#e2e8f0',
                                                    color: (selectedMemberForChecklist === m.id || (!selectedMemberForChecklist && i===0)) ? 'white' : '#475569',
                                                }}
                                            >
                                                <User size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }}/>
                                                {m.fullname || `Khách #${i+1}`}
                                            </button>
                                        ))}
                                    </div>

                                    {currentMemberForChecklist && currentMemberForChecklist.checklist_data && currentMemberForChecklist.checklist_data.map((category, catIndex) => (
                                        <div key={catIndex} style={{ marginBottom: category.group ? '2rem' : '1.5rem' }}>
                                            {category.group && (
                                                <h3 style={{ textAlign: 'center', fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', marginTop: catIndex > 0 ? '1rem' : 0 }}>
                                                    {category.group}
                                                </h3>
                                            )}
                                            
                                            <div style={{ background: 'white', borderRadius: '12px', border: 'none', marginBottom: '0.5rem', overflow: 'hidden' }}>
                                                {category.subgroup && (
                                                    <div style={{ padding: '8px 0 12px 10px', fontWeight: 800, fontStyle: 'italic', fontSize: '0.95rem', color: '#334155' }}>
                                                        {category.subgroup}
                                                    </div>
                                                )}
                                                
                                                <div style={{ padding: '0' }}>
                                                    {category.items.map((item, itemIndex) => (
                                                        <div key={itemIndex} style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
                                                            {/* CHECKBOX AND NAME */}
                                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                                                <button 
                                                                    title="Đính kèm Link Drive"
                                                                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', padding: 0 }}
                                                                    onClick={() => {
                                                                        const link = window.prompt('Nhập link đính kèm:');
                                                                        if (link) updateChecklistFile(currentMemberForChecklist.id, catIndex, itemIndex, link);
                                                                    }}
                                                                >
                                                                    <Paperclip size={16} />
                                                                </button>
                                                                <button title="Xóa" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', padding: 0 }} onClick={() => {
                                                                    // Optional feature: remove from array
                                                                    if(window.confirm('Xóa mục này?')) {
                                                                        setForm(prev => {
                                                                            const members = [...prev.members];
                                                                            const mIdx = members.findIndex(m => m.id === currentMemberForChecklist.id);
                                                                            if(mIdx > -1) {
                                                                               members[mIdx].checklist_data[catIndex].items.splice(itemIndex, 1);
                                                                            }
                                                                            return {...prev, members};
                                                                        })
                                                                    }
                                                                }}>
                                                                    <Trash2 size={16} />
                                                                </button>
                                                                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>{item.name}</span>
                                                                {item.file_link && (
                                                                    <a href={item.file_link} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: '0.75rem', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', textDecoration: 'none' }}>
                                                                        Xem file
                                                                    </a>
                                                                )}
                                                            </div>

                                                            {/* RADIO GROUP */}
                                                            <div style={{ display: 'flex', gap: '20px' }}>
                                                                {['Chờ bổ sung', 'Gốc', 'Sao y', 'Photo'].map(opt => (
                                                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer', margin: 0 }}>
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`chk_${currentMemberForChecklist.id}_${catIndex}_${itemIndex}`} 
                                                                            checked={item.status === opt}
                                                                            onChange={() => updateChecklistStatus(currentMemberForChecklist.id, catIndex, itemIndex, opt)}
                                                                            style={{ accentColor: '#64748b', width: '14px', height: '14px' }}
                                                                        />
                                                                        {opt}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button style={{ background: 'none', border: 'none', padding: '10px', paddingLeft: '11px', cursor: 'pointer', display: 'block', marginTop: '4px' }} onClick={() => {
                                                    const name = window.prompt('Nhập tên giấy tờ muốn thêm:');
                                                    if(name) {
                                                        setForm(prev => {
                                                            const members = [...prev.members];
                                                            const mIdx = members.findIndex(m => m.id === currentMemberForChecklist.id);
                                                            if(mIdx > -1) {
                                                                members[mIdx].checklist_data[catIndex].items.push({ name, status: 'Chờ bổ sung', file_link: '' });
                                                            }
                                                            return {...prev, members};
                                                        })
                                                    }
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ea580c', color: 'white', borderRadius: '50%', width: '16px', height: '16px' }}><Plus size={12} strokeWidth={4} /></div>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: NOTES */}
                    {activeTab === 'notes' && (
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Ghi chú nội bộ</label>
                                <textarea 
                                    className="form-control" 
                                    rows="10" 
                                    placeholder="Ghi chú các lưu ý đặc biệt về hồ sơ này..."
                                    value={form.notes}
                                    onChange={e => handleChange('notes', e.target.value)}
                                    style={{ background: '#f8fafc' }}
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* TAB: FINANCE */}
                    {activeTab === 'finance' && (
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>

                            {/* Custom Delete Confirm Modal */}
                            {showDeleteSupplier !== null && (
                                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                                        <AlertTriangle size={40} color="#f59e0b" style={{ marginBottom: '12px' }} />
                                        <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>Xóa nhà cung cấp?</h3>
                                        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>Toàn bộ dịch vụ trong NCC này sẽ bị xóa. Không thể hoàn tác.</p>
                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                            <button onClick={() => setShowDeleteSupplier(null)} style={{ padding: '8px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Hủy</button>
                                            <button onClick={confirmRemoveSupplier} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Xóa</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ color: '#ea580c', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Dịch Vụ Điều Hành <ChevronDown size={18} />
                                </h3>
                            </div>

                            {/* SUPPLIERS LIST */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                {(form.finance_data || []).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                                        <FileText size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                        <p style={{ margin: 0 }}>Chưa có dịch vụ điều hành. Bấm <b>"+ Thêm nhà cung cấp"</b> để bắt đầu.</p>
                                    </div>
                                )}
                                {(form.finance_data || []).map((sup, sIdx) => {
                                    const supBaseCost = (sup.services || []).reduce((sum, svc) => sum + calculateServiceCostBase(svc), 0);
                                    const supTotalCost = calculateSupplierCost(sup);
                                    
                                    return (
                                        <div key={sup.id || sIdx} style={{ position: 'relative', borderBottom: sIdx !== form.finance_data.length - 1 ? '1px solid #e2e8f0' : 'none', paddingBottom: sIdx !== form.finance_data.length - 1 ? '2rem' : '0' }}>
                                            <button onClick={() => setShowDeleteSupplier(sIdx)} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Xóa NCC"><Trash2 size={16} /></button>
                                            
                                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginTop: '0.5rem' }}>
                                                
                                                {/* Left Panel: Supplier Info */}
                                                <div style={{ width: '200px', flexShrink: 0 }}>
                                                    <div style={{ marginBottom: '10px' }}>
                                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Dịch vụ</label>
                                                        <select className="form-control" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} onChange={(e) => updateSupplier(sIdx, 'supplier_type', e.target.value)} value={sup.supplier_type || 'Visa'}>
                                                            <option value="Visa">Visa</option>
                                                            <option value="Khách sạn">Khách sạn</option>
                                                            <option value="Vé máy bay">Vé máy bay</option>
                                                            <option value="Bảo hiểm">Bảo hiểm</option>
                                                            <option value="Land tour">Land tour</option>
                                                        </select>
                                                    </div>
                                                    <div style={{ marginBottom: '10px' }}>
                                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Mã NCC</label>
                                                        <input type="text" className="form-control" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} placeholder="VD: VisaHQ_Multi" value={sup.supplier_code || ''} onChange={e => updateSupplier(sIdx, 'supplier_code', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tên NCC</label>
                                                        <input type="text" className="form-control" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} placeholder="VD: Korea Ambasy" value={sup.supplier_name || ''} onChange={e => updateSupplier(sIdx, 'supplier_name', e.target.value)} />
                                                    </div>
                                                </div>

                                                {/* Right Panel: Services Grid */}
                                                <div style={{ flex: 1, minWidth: 0, overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                        <thead>
                                                            <tr style={{ fontSize: '0.8rem', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                                                                <th style={{ padding: '6px 4px', fontWeight: 600 }}>Tên</th>
                                                                <th style={{ padding: '6px 4px', fontWeight: 600 }}>Ngày nộp</th>
                                                                <th style={{ padding: '6px 4px', fontWeight: 600 }}>Ngày trả</th>
                                                                <th style={{ padding: '6px 4px', fontWeight: 600, whiteSpace: 'nowrap' }}>Số lượng</th>
                                                                <th style={{ padding: '6px 4px', fontWeight: 600 }}>Giá NET</th>
                                                                <th style={{ padding: '6px 4px', fontWeight: 600 }}>Tỉ giá</th>
                                                                <th style={{ padding: '6px 4px', fontWeight: 600 }}>Giá bán</th>
                                                                <th style={{ padding: '6px 4px', fontWeight: 600 }}>Phụ thu</th>
                                                                <th style={{ padding: '6px 4px', fontWeight: 600 }}>VAT</th>
                                                                <th style={{ padding: '6px 4px', fontWeight: 600, textAlign: 'right' }}>Tổng thu</th>
                                                                <th style={{ padding: '6px 4px', width: '28px' }}></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(sup.services || []).map((svc, svcIdx) => {
                                                                const rowRev = calculateServiceRevenue(svc);
                                                                return (
                                                                    <tr key={svc.id || svcIdx}>
                                                                        <td style={{ padding: '3px 2px' }}><input type="text" className="form-control" style={{ width: '100%', padding: '5px 6px', fontSize: '0.85rem' }} value={svc.name} onChange={e => updateService(sIdx, svcIdx, 'name', e.target.value)} placeholder="Phí..." /></td>
                                                                        <td style={{ padding: '3px 2px' }}><input type="text" className="form-control" style={{ width: '75px', padding: '5px 6px', fontSize: '0.85rem' }} placeholder="Ngày nộp" value={svc.date_submit || ''} onChange={e => updateService(sIdx, svcIdx, 'date_submit', e.target.value)} /></td>
                                                                        <td style={{ padding: '3px 2px' }}><input type="text" className="form-control" style={{ width: '75px', padding: '5px 6px', fontSize: '0.85rem' }} placeholder="Ngày trả" value={svc.date_return || ''} onChange={e => updateService(sIdx, svcIdx, 'date_return', e.target.value)} /></td>
                                                                        <td style={{ padding: '3px 2px' }}><input type="number" className="form-control" style={{ width: '50px', padding: '5px 6px', fontSize: '0.85rem', textAlign: 'center' }} value={svc.quantity} onChange={e => updateService(sIdx, svcIdx, 'quantity', e.target.value)} min="1" /></td>
                                                                        <td style={{ padding: '3px 2px' }}><input type="text" className="form-control" style={{ width: '100%', padding: '5px 6px', fontSize: '0.85rem' }} value={svc.net_price} onChange={e => updateService(sIdx, svcIdx, 'net_price', e.target.value)} placeholder="0" /></td>
                                                                        <td style={{ padding: '3px 2px' }}><input type="number" className="form-control" style={{ width: '50px', padding: '5px 6px', fontSize: '0.85rem', textAlign: 'center' }} value={svc.fx} onChange={e => updateService(sIdx, svcIdx, 'fx', e.target.value)} step="0.01" /></td>
                                                                        <td style={{ padding: '3px 2px' }}><input type="text" className="form-control" style={{ width: '100%', padding: '5px 6px', fontSize: '0.85rem' }} value={svc.sale_price} onChange={e => updateService(sIdx, svcIdx, 'sale_price', e.target.value)} placeholder="0" /></td>
                                                                        <td style={{ padding: '3px 2px' }}><input type="text" className="form-control" style={{ width: '70px', padding: '5px 6px', fontSize: '0.85rem' }} value={svc.surcharge} onChange={e => updateService(sIdx, svcIdx, 'surcharge', e.target.value)} placeholder="0" /></td>
                                                                        <td style={{ padding: '3px 2px' }}><input type="text" className="form-control" style={{ width: '60px', padding: '5px 6px', fontSize: '0.85rem' }} value={svc.vat} onChange={e => updateService(sIdx, svcIdx, 'vat', e.target.value)} placeholder="0" /></td>
                                                                        <td style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', whiteSpace: 'nowrap' }}>{rowRev.toLocaleString()}</td>
                                                                        <td style={{ padding: '3px 2px', textAlign: 'center' }}>
                                                                            {(sup.services || []).length > 1 && (
                                                                                <button onClick={() => removeService(sIdx, svcIdx)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}><Trash2 size={14} /></button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                                                        <span onClick={() => handleAddService(sIdx)} style={{ color: '#0ea5e9', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}>+ Phụ thu</span>
                                                        <button onClick={() => handleAddService(sIdx)} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                            <Plus size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>

                                                    {/* Expected Cost Row */}
                                                    <div style={{ borderTop: '2px solid #f59e0b', marginTop: '16px', paddingTop: '16px', display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Chi dự kiến</label>
                                                            <input type="text" className="form-control" style={{ width: '100%', padding: '7px 10px', fontWeight: 700, color: '#0f172a', background: '#f8fafc', fontSize: '0.85rem' }} value={supBaseCost.toLocaleString()} readOnly />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Phụ thu</label>
                                                            <input type="number" className="form-control" style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem' }} value={sup.cost_surcharge} onChange={e => updateSupplier(sIdx, 'cost_surcharge', e.target.value)} />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>VAT %</label>
                                                            <input type="number" className="form-control" style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem' }} value={sup.cost_vat} onChange={e => updateSupplier(sIdx, 'cost_vat', e.target.value)} />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Tổng chi</label>
                                                            <input type="text" className="form-control" style={{ width: '100%', padding: '7px 10px', fontWeight: 700, color: '#c2410c', background: '#f8fafc', fontSize: '0.85rem' }} value={supTotalCost.toLocaleString()} readOnly />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Hạn thanh toán - TODO: implement deadline tracker */}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* add supplier button */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button onClick={handleAddSupplier} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    <Plus size={16} strokeWidth={3} /> Thêm nhà cung cấp
                                </button>
                            </div>

                            {/* COMMISSIONS TABLE */}
                            <div style={{ marginTop: '2rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ padding: '12px 1.5rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    PHÂN CHIA LỢI NHUẬN <ChevronDown size={16} />
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    {(form.finance_commissions || []).length === 0 && (
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 12px' }}>Chưa có phân chia. Bấm <b>"+"</b> để thêm nhân viên Sales.</p>
                                    )}
                                    {(form.finance_commissions || []).length > 0 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '1rem' }}>
                                            <thead>
                                                <tr style={{ fontSize: '0.8rem', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                                                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Nhân viên Sales</th>
                                                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Lợi nhuận</th>
                                                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Tỉ lệ %</th>
                                                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Tổng thu</th>
                                                    <th style={{ padding: '8px 4px', width: '30px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(form.finance_commissions || []).map((com, cIdx) => {
                                                    const comProfit = Math.round(financeTotals.expectedProfit * toNum(com.percent) / 100);
                                                    return (
                                                        <tr key={com.id || cIdx}>
                                                            <td style={{ padding: '4px 2px' }}>
                                                                <select className="form-control" style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem' }} value={com.sales_name || ''} onChange={e => updateCommission(cIdx, 'sales_name', e.target.value)}>
                                                                    <option value="">Chọn nhân viên...</option>
                                                                    {usersList.map(u => (
                                                                        <option key={u.id} value={u.full_name}>{u.full_name}{u.role ? ` (${u.role})` : ''}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td style={{ padding: '4px 2px' }}>
                                                                <input type="text" className="form-control" style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem', background: '#f8fafc', fontWeight: 600 }} value={comProfit.toLocaleString()} readOnly />
                                                            </td>
                                                            <td style={{ padding: '4px 2px' }}>
                                                                <input type="number" className="form-control" style={{ width: '80px', padding: '7px 10px', fontSize: '0.85rem', textAlign: 'center' }} value={com.percent} onChange={e => updateCommission(cIdx, 'percent', e.target.value)} min="0" max="100" />
                                                            </td>
                                                            <td style={{ padding: '4px 2px' }}>
                                                                <input type="text" className="form-control" style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem', background: '#f8fafc', fontWeight: 600 }} value={financeTotals.totalRevenue.toLocaleString()} readOnly />
                                                            </td>
                                                            <td style={{ padding: '4px 2px', textAlign: 'center' }}>
                                                                <button onClick={() => removeCommission(cIdx)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} /></button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={handleAddCommission} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* TIỀN THU DỰ KIẾN */}
                            <div style={{ marginTop: '2rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ padding: '10px 1.5rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#ea580c', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                    Tiền thu dự kiến
                                </div>
                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ width: '160px', color: '#475569', fontWeight: 500, fontSize: '0.85rem' }}>Tổng thu dự kiến</span>
                                        <input type="text" className="form-control" style={{ width: '250px', padding: '7px 10px', fontSize: '0.85rem', fontWeight: 600 }} value={financeTotals.totalRevenue.toLocaleString()} readOnly />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ width: '160px', color: '#475569', fontWeight: 500, fontSize: '0.85rem' }}>Tổng chi dự kiến</span>
                                        <input type="text" className="form-control" style={{ width: '250px', padding: '7px 10px', fontSize: '0.85rem', fontWeight: 600 }} value={financeTotals.totalCost.toLocaleString()} readOnly />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                        <span style={{ width: '160px', color: '#1e293b', fontWeight: 700, fontSize: '0.85rem' }}>Lợi nhuận dự kiến</span>
                                        <input type="text" className="form-control" style={{ width: '250px', padding: '7px 10px', fontSize: '0.9rem', fontWeight: 800, color: financeTotals.expectedProfit >= 0 ? '#059669' : '#dc2626', background: financeTotals.expectedProfit >= 0 ? '#ecfdf5' : '#fef2f2', borderColor: financeTotals.expectedProfit >= 0 ? '#a7f3d0' : '#fecaca' }} value={financeTotals.expectedProfit.toLocaleString()} readOnly />
                                    </div>
                                </div>
                            </div>

                            {/* VOUCHERS LIST */}
                            {!isNew && (
                            <div style={{ marginTop: '2rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ padding: '10px 1.5rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#16a34a', fontSize: '0.8rem', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Lịch sử Phiếu Thu (Đã thu: {Number(form.total_collected || 0).toLocaleString()}đ)</span>
                                    <button onClick={() => setShowVoucherForm(!showVoucherForm)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 16px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Plus size={14} /> Lập Phiếu Thu
                                    </button>
                                </div>
                                
                                {showVoucherForm && (
                                    <div style={{ padding: '1.5rem', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group" style={{ margin: 0 }}>
                                            <label style={{ fontSize: '0.8rem', color: '#166534' }}>Nội dung thu *</label>
                                            <input type="text" className="form-control" value={voucherForm.title} onChange={e => setVoucherForm(f => ({...f, title: e.target.value}))} />
                                        </div>
                                        <div className="form-group" style={{ margin: 0 }}>
                                            <label style={{ fontSize: '0.8rem', color: '#166534' }}>Số tiền (VNĐ) *</label>
                                            <input type="number" className="form-control" value={voucherForm.amount} onChange={e => setVoucherForm(f => ({...f, amount: e.target.value}))} />
                                        </div>
                                        <div className="form-group" style={{ margin: 0 }}>
                                            <label style={{ fontSize: '0.8rem', color: '#166534' }}>Hình thức</label>
                                            <select className="form-control" value={voucherForm.payment_method} onChange={e => setVoucherForm(f => ({...f, payment_method: e.target.value}))}>
                                                <option value="Chuyển khoản">Chuyển khoản</option>
                                                <option value="Tiền mặt">Tiền mặt</option>
                                                <option value="Quẹt thẻ">Quẹt thẻ</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ margin: 0 }}>
                                            <label style={{ fontSize: '0.8rem', color: '#166534' }}>Người nộp (Optional)</label>
                                            <input type="text" className="form-control" value={voucherForm.payer_name} onChange={e => setVoucherForm(f => ({...f, payer_name: e.target.value}))} />
                                        </div>
                                        <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#166534' }}>Ghi chú thêm</label>
                                            <input type="text" className="form-control" value={voucherForm.notes} onChange={e => setVoucherForm(f => ({...f, notes: e.target.value}))} />
                                        </div>
                                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                            <button onClick={() => setShowVoucherForm(false)} className="btn" style={{ background: 'white', border: '1px solid #cbd5e1' }}>Hủy bỏ</button>
                                            <button onClick={handleCreateVoucher} className="btn" style={{ background: '#16a34a', color: 'white', border: 'none', fontWeight: 600 }}>Tạo Phiếu Ngay</button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ padding: '0' }}>
                                    {vouchersList.length === 0 ? (
                                        <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Chưa có phiếu thu nào được tạo cho hồ sơ này.</p>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
                                                    <th style={{ padding: '10px 1rem' }}>Mã PT</th>
                                                    <th style={{ padding: '10px 1rem' }}>Ngày lập</th>
                                                    <th style={{ padding: '10px 1rem' }}>Số tiền</th>
                                                    <th style={{ padding: '10px 1rem' }}>HTTT</th>
                                                    <th style={{ padding: '10px 1rem' }}>Người lập</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {vouchersList.map(v => (
                                                    <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: v.status === 'Đã hủy' ? 0.5 : 1 }}>
                                                        <td style={{ padding: '12px 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#2563eb' }}>{v.voucher_code} {v.status === 'Đã hủy' && '(Đã hủy)'}</td>
                                                        <td style={{ padding: '12px 1rem', fontSize: '0.85rem' }}>{new Date(v.created_at).toLocaleString('vi-VN')}</td>
                                                        <td style={{ padding: '12px 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>{Number(v.amount).toLocaleString('vi-VN')}đ</td>
                                                        <td style={{ padding: '12px 1rem', fontSize: '0.85rem' }}>{v.payment_method}</td>
                                                        <td style={{ padding: '12px 1rem', fontSize: '0.85rem' }}>{v.created_by_name}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                            )}

                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <div style={{ padding: '1rem 2rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600, background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer' }}>
                        Hủy
                    </button>
                    {(canEdit(currentUser?.role, 'visas') || isNew) && (
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600, background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
