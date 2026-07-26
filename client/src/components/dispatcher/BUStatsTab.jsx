import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Users, ChevronUp, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BUStatsTab = ({ timeRange }) => {
    const [dashboardData, setDashboardData] = useState({ buCounts: [], workload: [] });
    const [loading, setLoading] = useState(true);
    const [expandedBU, setExpandedBU] = useState(null);

    const getTimeRangeDates = (range) => {
        const now = new Date();
        let startDate = '';
        let endDate = '';
        
        const toISOStringLocalDate = (d) => {
          const pad = (n) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        };
    
        if (range === 'today') {
          startDate = toISOStringLocalDate(now) + ' 00:00:00';
          endDate = toISOStringLocalDate(now) + ' 23:59:59';
        } else if (range === 'yesterday') {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = toISOStringLocalDate(yesterday) + ' 00:00:00';
          endDate = toISOStringLocalDate(yesterday) + ' 23:59:59';
        } else if (range === 'this_week' || range === 'week') {
          const day = now.getDay(), diff = now.getDate() - day + (day === 0 ? -6 : 1);
          const startOfWeek = new Date(now.setDate(diff));
          startDate = toISOStringLocalDate(startOfWeek) + ' 00:00:00';
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endDate = toISOStringLocalDate(endOfWeek) + ' 23:59:59';
        } else if (range === 'this_month' || range === 'month') {
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          startDate = toISOStringLocalDate(firstDay) + ' 00:00:00';
          endDate = toISOStringLocalDate(lastDay) + ' 23:59:59';
        }
        return { startDate, endDate };
    };

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const { startDate, endDate } = getTimeRangeDates(timeRange);
                let queryParams = '';
                if (startDate && endDate) {
                    queryParams = `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
                }
                const res = await axios.get(`/api/dispatch/dashboard${queryParams}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setDashboardData(res.data);
            } catch (err) {
                console.error('Lỗi tải Dispatch Dashboard:', err);
                toast.error('Không thể tải số liệu BU');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [timeRange]);

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải số liệu...</div>;
    }

    const totalLeadsCount = dashboardData.buCounts?.reduce((sum, bu) => sum + parseInt(bu.total_leads || 0), 0) || 0;

    return (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', margin: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={24} color="#3b82f6" />
                    Thống kê theo BU
                </h3>
                <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                    Tổng số Lead: <span style={{ color: '#0f172a', fontSize: '1rem', marginLeft: '4px' }}>{totalLeadsCount}</span>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Phòng Ban (BU)</th>
                        <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em', textAlign: 'center' }}>Tổng số</th>
                        <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Tỉ lệ xử lý</th>
                        <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em', textAlign: 'center' }}>SLA TB</th>
                        <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em', textAlign: 'right' }}>Chi tiết</th>
                    </tr>
                </thead>
                <tbody>
                {dashboardData.buCounts?.map(bu => {
                    const total = parseInt(bu.total_leads || 0);
                    const assigned = parseInt(bu.assigned_leads || 0);
                    const unassigned = parseInt(bu.unassigned_leads || 0);
                    const assignedPercent = total > 0 ? Math.round((assigned / total) * 100) : 0;
                    
                    const isExpanded = expandedBU === bu.bu_group;
                    const buWorkload = dashboardData.workload?.filter(w => w.bu_group === bu.bu_group) || [];
                    
                    return (
                        <React.Fragment key={bu.bu_group || 'Chưa xếp'}>
                        <tr 
                            onClick={() => bu.bu_group && setExpandedBU(isExpanded ? null : bu.bu_group)}
                            style={{ borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9', transition: 'background-color 0.2s', cursor: bu.bu_group ? 'pointer' : 'default' }} 
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} 
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <td style={{ padding: '16px 12px', fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                                            <Users size={16} />
                                        </div>
                                        {bu.bu_group || 'Chưa lựa chọn'}
                                    </div>
                                    {bu.bu_group && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: isExpanded ? '#3b82f6' : '#64748b', background: isExpanded ? '#eff6ff' : '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${isExpanded ? '#bfdbfe' : '#e2e8f0'}`, transition: 'all 0.2s' }}>
                                            <span style={{ fontWeight: 600 }}>Nhân sự</span>
                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#334155', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', fontSize: '0.9rem' }}>
                                    {total}
                                </span>
                            </td>
                            <td style={{ padding: '16px 12px', width: '30%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, height: '8px', background: '#fee2e2', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                                        <div style={{ width: `${assignedPercent}%`, background: '#10b981', height: '100%', transition: 'width 0.5s ease' }} />
                                    </div>
                                    <span style={{ fontWeight: 600, color: assignedPercent === 100 ? '#10b981' : '#64748b', fontSize: '0.85rem', width: '40px' }}>
                                        {assignedPercent}%
                                    </span>
                                </div>
                            </td>
                            <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>
                                    {bu.avg_sla_minutes ? `${bu.avg_sla_minutes}'` : '-'}
                                </span>
                            </td>
                            <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }} title="Đã phân bổ">
                                        <CheckCircle size={14} />
                                        {assigned}
                                    </div>
                                    <div style={{ width: '1px', height: '12px', background: '#cbd5e1' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: 600, fontSize: '0.85rem' }} title="Chưa phân bổ">
                                        <XCircle size={14} />
                                        {unassigned}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        {isExpanded && (
                            <tr>
                                <td colSpan="5" style={{ padding: 0, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <div style={{ padding: '16px 24px' }}>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hiệu suất nhân sự {bu.bu_group}</h4>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: '8px', color: '#64748b', borderBottom: '1px solid #cbd5e1', fontWeight: 600 }}>Nhân viên</th>
                                                    <th style={{ padding: '8px', color: '#64748b', borderBottom: '1px solid #cbd5e1', fontWeight: 600, textAlign: 'center' }}>Đã nhận</th>
                                                    <th style={{ padding: '8px', color: '#64748b', borderBottom: '1px solid #cbd5e1', fontWeight: 600, textAlign: 'center' }}>Đã xử lý (SLA)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {buWorkload.length === 0 ? (
                                                    <tr><td colSpan="3" style={{ padding: '12px', textAlign: 'center', color: '#94a3b8' }}>Chưa có dữ liệu</td></tr>
                                                ) : buWorkload.map(w => (
                                                    <tr key={w.full_name || w.username}>
                                                        <td style={{ padding: '8px', fontWeight: 500, color: '#1e293b' }}>{w.full_name || w.username}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center', color: '#334155' }}>{w.active_leads || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            <span style={{ color: '#10b981', fontWeight: 600 }}>{w.processed_leads}</span>
                                                            <span style={{ color: '#94a3b8', margin: '0 4px' }}>/</span>
                                                            <span style={{ color: '#f59e0b' }}>{w.avg_sla_minutes ? `${w.avg_sla_minutes}'` : '-'}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </React.Fragment>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default BUStatsTab;
