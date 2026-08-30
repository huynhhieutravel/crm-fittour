import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, User, Plane, Send, CheckCircle, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PublicVisaPortalPage = () => {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const memberIdParam = searchParams.get('memberId');
    const [visaData, setVisaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        purpose: 'Du lịch',
        job_type: 'Nhân viên hợp đồng',
        travel_history: '',
        itinerary: '',
        assets: '',
        finance: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`/api/public/visas/${token}`);
                setVisaData(res.data);
                if (res.data.members && res.data.members.length > 0) {
                    let targetMember = res.data.members[0];
                    if (memberIdParam) {
                        const found = res.data.members.find(m => m.id.toString() === memberIdParam.toString());
                        if (found) targetMember = found;
                    }
                    setSelectedMember(targetMember);
                    const templateFields = res.data.template?.fields || [];
                    const initialFormData = {};
                    templateFields.forEach(field => {
                        const val = targetMember.evaluation_data?.[field.name] || '';
                        if (field.type === 'select' && field.allow_custom && val && !field.options.includes(val)) {
                            initialFormData[field.name] = 'Khác';
                            initialFormData[`${field.name}_other`] = val;
                        } else {
                            initialFormData[field.name] = val;
                        }
                    });
                    setFormData(initialFormData);
                }
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Không thể tải thông tin hồ sơ.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const handleMemberSelect = (member) => {
        setSelectedMember(member);
        setSubmitted(false);
        const templateFields = visaData?.template?.fields || [];
        
        const newFormData = {};
        if (templateFields.length > 0) {
            templateFields.forEach(field => {
                const val = member.evaluation_data?.[field.name] || '';
                if (field.type === 'select' && field.allow_custom && val && !field.options.includes(val)) {
                    newFormData[field.name] = 'Khác';
                    newFormData[`${field.name}_other`] = val;
                } else {
                    newFormData[field.name] = val;
                }
            });
        }
        setFormData(newFormData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMember) return;
        try {
            toast.loading('Đang gửi thông tin...', { id: 'submit' });
            
            const finalData = { ...formData };
            const templateFields = visaData?.template?.fields || [];
            
            templateFields.forEach(field => {
                if (field.type === 'select' && field.allow_custom && finalData[field.name] === 'Khác') {
                    finalData[field.name] = finalData[`${field.name}_other`] || 'Khác';
                }
                delete finalData[`${field.name}_other`];
            });

            await axios.post(`/api/public/visas/${token}/assessment`, {
                memberId: selectedMember.id,
                evaluationData: finalData
            });
            
            // Cập nhật lại state nội bộ để giữ UI
            const newMembers = visaData.members.map(m => {
                if (m.id === selectedMember.id) {
                    return { ...m, evaluation_data: finalData };
                }
                return m;
            });
            setVisaData({ ...visaData, members: newMembers });
            
            toast.success('Gửi thông tin thành công!', { id: 'submit' });
            setSubmitted(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra', { id: 'submit' });
        }
    };

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Đang tải hồ sơ...</div>;
    }

    if (!visaData) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'red' }}>Hồ sơ không tồn tại hoặc link đã hết hạn.</div>;
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1rem', fontFamily: 'Inter, sans-serif' }}>
            <Toaster position="top-right" />
            
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', marginBottom: '1rem' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Cổng Thông Tin Hồ Sơ Visa</h1>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Hồ sơ: <strong>{visaData.code}</strong> - Khách hàng: {visaData.customer_name}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: memberIdParam ? '1fr' : '250px 1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* Left Sidebar: Members (Hidden in Single Mode) */}
                    {!memberIdParam && (
                        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>Danh sách khách</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {visaData.members && visaData.members.map(member => (
                                    <button
                                        key={member.id}
                                        onClick={() => handleMemberSelect(member)}
                                        style={{
                                            textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid',
                                            borderColor: selectedMember?.id === member.id ? '#3b82f6' : '#e2e8f0',
                                            backgroundColor: selectedMember?.id === member.id ? '#eff6ff' : 'white',
                                            color: selectedMember?.id === member.id ? '#1d4ed8' : '#475569',
                                            cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
                                        }}
                                    >
                                        {member.fullname}
                                        {member.evaluation_data && Object.keys(member.evaluation_data).length > 0 && (
                                            <CheckCircle size={14} color="#10b981" style={{ float: 'right', marginTop: '3px' }} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Right Content: Form */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        {selectedMember ? (
                            <>
                                <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                                    Thông tin Thẩm định: <span style={{ color: '#2563eb' }}>{selectedMember.fullname}</span>
                                </h2>
                                
                                {submitted ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                        <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Cảm ơn quý khách!</h3>
                                        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Thông tin đã được gửi. Chuyên viên Visa của FIT Tour sẽ dựa vào thông tin này để lên danh mục Checklist Hồ Sơ chi tiết nhất cho quý khách.</p>
                                        <button 
                                            onClick={() => setSubmitted(false)}
                                            style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Chỉnh sửa lại thông tin
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        
                                        {!visaData.template?.fields || visaData.template.fields.length === 0 ? (
                                            <div style={{ textAlign: 'center', color: '#64748b' }}>Biểu mẫu này chưa có câu hỏi khảo sát nào.</div>
                                        ) : (
                                            visaData.template.fields.map((field, index) => (
                                                <div key={field.name}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                                        <FileText size={18} color="#3b82f6"/> {index + 1}. {field.label}
                                                    </label>
                                                    
                                                    {field.type === 'text' && (
                                                        <input type="text" name={field.name} value={formData[field.name] || ''} onChange={handleChange} placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                                                    )}
                                                    
                                                    {field.type === 'textarea' && (
                                                        <textarea name={field.name} value={formData[field.name] || ''} onChange={handleChange} placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}></textarea>
                                                    )}
                                                    
                                                    {field.type === 'select' && (
                                                        <>
                                                            <select name={field.name} value={formData[field.name] || ''} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                                                                <option value="">-- Chọn --</option>
                                                                {field.options.map((opt, i) => (
                                                                    <option key={i} value={opt}>{opt}</option>
                                                                ))}
                                                                {field.allow_custom && <option value="Khác">Khác (Nhập tay)</option>}
                                                            </select>
                                                            {formData[field.name] === 'Khác' && (
                                                                <input type="text" name={`${field.name}_other`} value={formData[`${field.name}_other`] || ''} onChange={handleChange} placeholder={`Nhập thông tin ${field.label.toLowerCase()} khác...`} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', marginTop: '0.5rem' }} required />
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))
                                        )}

                                        <button type="submit" style={{ marginTop: '1rem', width: '100%', padding: '1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                            <Send size={20} />
                                            Gửi Thông Tin Thẩm Định
                                        </button>
                                    </form>
                                )}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
                                Vui lòng chọn một khách hàng ở danh sách bên trái để nhập thông tin.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicVisaPortalPage;
