import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    startOfWeek, endOfWeek, addWeeks, subWeeks, format, 
    addDays, isSameDay, getWeek, getYear,
    startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, User, UserPlus, X } from 'lucide-react';
import Select from 'react-select';

const SHIFT_TYPES = [
    { id: 'morning', label: 'Ca Sáng (08:30 - 12:00)' },
    { id: 'afternoon', label: 'Ca Chiều (13:30 - 17:30)' },
    { id: 'evening', label: 'Ca Tối (17:30 - 22:00)' }
];

const BU_COLORS = [
    { bg: '#e0f2fe', text: '#0369a1', cellBg: '#f0f9ff', cellHover: '#e0f2fe' }, // Blue
    { bg: '#dcfce7', text: '#15803d', cellBg: '#f0fdf4', cellHover: '#dcfce7' }, // Green
    { bg: '#fef3c7', text: '#b45309', cellBg: '#fffbeb', cellHover: '#fef3c7' }, // Amber
    { bg: '#f3e8ff', text: '#7e22ce', cellBg: '#faf5ff', cellHover: '#f3e8ff' }, // Purple
    { bg: '#ffe4e6', text: '#be123c', cellBg: '#fff1f2', cellHover: '#ffe4e6' }, // Rose
    { bg: '#ffedd5', text: '#c2410c', cellBg: '#fff7ed', cellHover: '#ffedd5' }, // Orange
];

const getBuColor = (buName) => {
    if (!buName) return { bg: '#e5e7eb', text: '#374151', cellBg: '#f0f9ff', cellHover: '#e0f2fe' };
    let hash = 0;
    for (let i = 0; i < buName.length; i++) {
        hash = buName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return BU_COLORS[Math.abs(hash) % BU_COLORS.length];
};

const DispatchScheduleTab = ({ bus, users }) => {
    const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [responsibleBU, setResponsibleBU] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [editBuGroup, setEditBuGroup] = useState('');
    const [editUserIds, setEditUserIds] = useState([]);
    const [applyToWholeDay, setApplyToWholeDay] = useState(false);

    const startWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const endWeek = endOfWeek(currentDate, { weekStartsOn: 1 });

    const startMonth = startOfMonth(currentDate);
    const endMonth = endOfMonth(currentDate);
    const startMonthGrid = startOfWeek(startMonth, { weekStartsOn: 1 });
    const endMonthGrid = endOfWeek(endMonth, { weekStartsOn: 1 });

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startWeek, i));
    const monthDays = eachDayOfInterval({ start: startMonthGrid, end: endMonthGrid });

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const targetStart = viewMode === 'week' ? startWeek : startMonthGrid;
            const targetEnd = viewMode === 'week' ? endWeek : endMonthGrid;

            const res = await axios.get('/api/dispatch-schedules', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    year: getYear(targetStart),
                    weekNumber: getWeek(targetStart, { weekStartsOn: 1 }),
                    startDate: format(targetStart, 'yyyy-MM-dd'),
                    endDate: format(targetEnd, 'yyyy-MM-dd')
                }
            });
            setSchedules(res.data.schedules || []);
            setResponsibleBU(res.data.responsibleBU || '');
        } catch (error) {
            console.error('Lỗi tải lịch:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [currentDate, viewMode]);

    const handleSaveResponsibleBU = async (val) => {
        setResponsibleBU(val);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/dispatch-schedules/responsible-bu', {
                year: getYear(startWeek),
                weekNumber: getWeek(startWeek, { weekStartsOn: 1 }),
                buGroup: val
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Lỗi lưu BU chịu trách nhiệm:', err);
        }
    };

    const handleOpenModal = (day, shiftType) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const existing = schedules.find(s => s.date.substring(0,10) === dateStr && s.shift_type === shiftType);
        
        setSelectedSlot({ day, shiftType, dateStr });
        setEditBuGroup(existing?.bu_group || responsibleBU || '');
        
        if (existing?.user_ids && existing.user_ids.length > 0) {
            const selectedOptions = existing.user_ids.map(id => {
                const user = users.find(u => u.id === id);
                return user ? { value: user.id, label: user.full_name } : null;
            }).filter(Boolean);
            setEditUserIds(selectedOptions);
        } else {
            setEditUserIds([]);
        }
        
        setApplyToWholeDay(false);
        setIsModalOpen(true);
    };

    const handleSaveSlot = async () => {
        if (!selectedSlot) return;
        try {
            const token = localStorage.getItem('token');
            const userIdsToSave = editUserIds.map(opt => opt.value);
            
            await axios.post('/api/dispatch-schedules/save', {
                date: selectedSlot.dateStr,
                shiftType: selectedSlot.shiftType,
                buGroup: editBuGroup,
                userIds: userIdsToSave
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (applyToWholeDay) {
                const otherShifts = SHIFT_TYPES.filter(s => s.id !== selectedSlot.shiftType);
                for (const shift of otherShifts) {
                    const existing = schedules.find(s => s.date.substring(0,10) === selectedSlot.dateStr && s.shift_type === shift.id);
                    if (!existing || (!existing.bu_group && (!existing.user_ids || existing.user_ids.length === 0))) {
                        await axios.post('/api/dispatch-schedules/save', {
                            date: selectedSlot.dateStr,
                            shiftType: shift.id,
                            buGroup: editBuGroup,
                            userIds: userIdsToSave
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    }
                }
            }

            setIsModalOpen(false);
            fetchSchedule();
        } catch (err) {
            console.error('Lỗi lưu ca trực:', err);
            alert('Có lỗi xảy ra khi lưu ca trực.');
        }
    };

    const handleClearSlot = async () => {
        if (!selectedSlot) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/dispatch-schedules/save', {
                date: selectedSlot.dateStr,
                shiftType: selectedSlot.shiftType,
                buGroup: '',
                userIds: []
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            fetchSchedule();
        } catch (err) {
            console.error('Lỗi xóa ca trực:', err);
            alert('Có lỗi xảy ra khi xóa ca trực.');
        }
    };

    const getSlotData = (day, shiftType) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return schedules.find(s => s.date.substring(0,10) === dateStr && s.shift_type === shiftType);
    };

    const sortedUserOptions = [...users].sort((a, b) => {
        if (editBuGroup) {
            const aHasBU = (a.bus || []).includes(editBuGroup);
            const bHasBU = (b.bus || []).includes(editBuGroup);
            if (aHasBU && !bHasBU) return -1;
            if (!aHasBU && bHasBU) return 1;
        }
        return (a.full_name || '').localeCompare(b.full_name || '');
    }).map(u => ({
        value: u.id,
        label: `${u.full_name} ${(u.bus && u.bus.length > 0) ? `(${u.bus.join(', ')})` : ''}`
    }));

    return (
        <div className="dispatch-schedule-container" style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
            {/* Header / Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '6px', padding: '2px' }}>
                        <button onClick={() => setViewMode('week')} style={{ padding: '6px 16px', border: 'none', background: viewMode === 'week' ? '#fff' : 'transparent', borderRadius: '4px', boxShadow: viewMode === 'week' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontWeight: viewMode === 'week' ? '600' : '500', color: viewMode === 'week' ? '#2563eb' : '#6b7280', cursor: 'pointer', transition: 'all 0.2s' }}>
                            Tuần
                        </button>
                        <button onClick={() => setViewMode('month')} style={{ padding: '6px 16px', border: 'none', background: viewMode === 'month' ? '#fff' : 'transparent', borderRadius: '4px', boxShadow: viewMode === 'month' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontWeight: viewMode === 'month' ? '600' : '500', color: viewMode === 'month' ? '#2563eb' : '#6b7280', cursor: 'pointer', transition: 'all 0.2s' }}>
                            Tháng
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', padding: '6px 12px', borderRadius: '24px' }}>
                        <button onClick={() => setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                            <ChevronLeft size={20} />
                        </button>
                        <span style={{ fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={16} />
                            {viewMode === 'week' 
                                ? `Tuần ${format(startWeek, 'dd/MM')} - ${format(endWeek, 'dd/MM/yyyy')}`
                                : `Tháng ${format(currentDate, 'MM/yyyy')}`
                            }
                        </span>
                        <button onClick={() => setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <button onClick={() => { setCurrentDate(new Date()); setViewMode('week'); }} style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>
                        Hôm nay
                    </button>
                </div>
                
                {viewMode === 'week' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '500', color: '#4b5563' }}>BU Chịu Trách Nhiệm:</span>
                        <select 
                            value={responsibleBU}
                            onChange={(e) => handleSaveResponsibleBU(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '200px' }}
                        >
                            <option value="">-- Trống --</option>
                            {bus.map(bu => (
                                <option key={bu.id} value={bu.id}>{bu.id}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Calendar Grid */}
            {viewMode === 'week' ? (
                <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '8%', padding: '16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold', color: '#6b7280', fontSize: '13px' }}>Ca Trực</th>
                            {weekDays.map(day => (
                                <th key={day.toString()} style={{ 
                                    width: '13%', padding: '16px', background: '#f9fafb', 
                                    borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: isSameDay(day, new Date()) ? '#2563eb' : '#111827' }}>
                                        {format(day, 'EEEE', { locale: vi })}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                        {format(day, 'dd/MM')}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {SHIFT_TYPES.map((shift, sIdx) => (
                            <tr key={shift.id}>
                                <td style={{ padding: '12px 8px', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', fontWeight: 'bold', color: '#4b5563', fontSize: '12px', textAlign: 'center', lineHeight: '1.4' }}>
                                    {shift.label}
                                </td>
                                {weekDays.map((day, dIdx) => {
                                    const slot = getSlotData(day, shift.id);
                                    const buColor = slot && slot.bu_group ? getBuColor(slot.bu_group) : { cellBg: '#f0f9ff', cellHover: '#e0f2fe', bg: '#e0f2fe', text: '#0369a1' };
                                    return (
                                        <td 
                                            key={dIdx} 
                                            style={{ 
                                                padding: '12px', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb',
                                                verticalAlign: 'top', cursor: 'pointer',
                                                background: slot ? buColor.cellBg : 'transparent',
                                                transition: 'background 0.2s'
                                            }}
                                            onClick={() => handleOpenModal(day, shift.id)}
                                            onMouseEnter={(e) => e.currentTarget.style.background = slot ? buColor.cellHover : '#f9fafb'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = slot ? buColor.cellBg : 'transparent'}
                                        >
                                            {slot ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {slot.bu_group && (
                                                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: buColor.text, background: buColor.bg, padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                                                            {slot.bu_group}
                                                        </span>
                                                    )}
                                                    {slot.user_ids && slot.user_ids.length > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                                                            {slot.user_ids.map(id => {
                                                                const user = users.find(u => u.id === id);
                                                                if (!user) return null;
                                                                return (
                                                                    <span key={id} style={{ 
                                                                        fontSize: '12px', fontWeight: '500', color: '#1f2937', 
                                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                                        background: '#ffffff', border: '1px solid #e5e7eb', 
                                                                        padding: '4px 8px', borderRadius: '4px',
                                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                                    }}>
                                                                        <User size={12} style={{ color: '#9ca3af' }}/> {user.full_name}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '12px', color: '#ef4444', fontStyle: 'italic', marginTop: '4px' }}>Chưa chọn người</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '50px', color: '#9ca3af' }}>
                                                    <UserPlus size={20} style={{ opacity: 0.5 }} />
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
                    <div style={{ minWidth: '900px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                            {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map(d => (
                                <div key={d} style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#6b7280', fontSize: '14px' }}>{d}</div>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                        {monthDays.map((day, dIdx) => {
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const isToday = isSameDay(day, new Date());
                            return (
                                <div 
                                    key={dIdx} 
                                    onClick={() => { setCurrentDate(day); setViewMode('week'); }}
                                    style={{ 
                                        minHeight: '110px', padding: '8px', 
                                        borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', 
                                        background: isCurrentMonth ? '#fff' : '#f9fafb',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = isCurrentMonth ? '#fff' : '#f9fafb'}
                                >
                                    <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                                        <span style={{ 
                                            display: 'inline-block', width: '24px', height: '24px', lineHeight: '24px', textAlign: 'center', 
                                            borderRadius: '50%', background: isToday ? '#2563eb' : 'transparent', 
                                            color: isToday ? '#fff' : (isCurrentMonth ? '#111827' : '#9ca3af'),
                                            fontWeight: isToday ? 'bold' : 'normal', fontSize: '14px'
                                        }}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {SHIFT_TYPES.map(shift => {
                                            const slot = getSlotData(day, shift.id);
                                            if (!slot) return null;
                                            const buColor = slot.bu_group ? getBuColor(slot.bu_group) : { bg: '#fee2e2', text: '#ef4444' };
                                            const shiftIcon = shift.id === 'morning' ? '🌅' : (shift.id === 'afternoon' ? '🌇' : '🌙');
                                            
                                            const usersText = slot.user_ids && slot.user_ids.length > 0 
                                                ? slot.user_ids.map(id => users.find(u => u.id === id)?.full_name).filter(Boolean).join(' • ')
                                                : '';
                                                
                                            return (
                                                <div key={shift.id} style={{ 
                                                    fontSize: '11px', background: buColor.bg, color: buColor.text, 
                                                    padding: '4px 6px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                    display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500',
                                                    border: `1px solid ${buColor.text}20`
                                                }}>
                                                    <span style={{ fontSize: '10px' }}>{shiftIcon}</span>
                                                    <span style={{ fontWeight: 'bold' }}>{slot.bu_group ? slot.bu_group : 'Trống'}</span> {usersText ? `- ${usersText}` : ''}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    </div>
                </div>
            )}

            {/* Modal Edit Slot */}
            {isModalOpen && selectedSlot && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>
                                Phân ca trực
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '16px', background: '#f3f4f6', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
                            <p style={{ margin: '0 0 4px 0', color: '#4b5563' }}><strong>Ngày:</strong> {format(selectedSlot.day, 'EEEE, dd/MM/yyyy', { locale: vi })}</p>
                            <p style={{ margin: 0, color: '#4b5563' }}><strong>Ca:</strong> {SHIFT_TYPES.find(s => s.id === selectedSlot.shiftType)?.label}</p>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Phòng ban (BU)</label>
                            <select 
                                value={editBuGroup}
                                onChange={(e) => setEditBuGroup(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            >
                                <option value="">-- Chọn BU --</option>
                                {bus.map(bu => (
                                    <option key={bu.id} value={bu.id}>{bu.id}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Nhân viên trực</label>
                            <Select 
                                isMulti
                                options={sortedUserOptions}
                                value={editUserIds}
                                onChange={(val) => setEditUserIds(val)}
                                placeholder="-- Chọn Nhân viên --"
                                styles={{
                                    control: (base) => ({ ...base, minHeight: '40px', borderColor: '#d1d5db', borderRadius: '6px' }),
                                    menuPortal: base => ({ ...base, zIndex: 9999 })
                                }}
                                menuPortalTarget={document.body}
                                noOptionsMessage={() => "Không tìm thấy"}
                            />
                        </div>

                        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                                type="checkbox" 
                                id="applyToWholeDay"
                                checked={applyToWholeDay}
                                onChange={(e) => setApplyToWholeDay(e.target.checked)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <label htmlFor="applyToWholeDay" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer', userSelect: 'none' }}>
                                Điền cấu hình này cho các ca trống trong ngày
                            </label>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                            <button onClick={handleClearSlot} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: '500', cursor: 'pointer' }}>
                                Xóa ca trực
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: '500', cursor: 'pointer' }}>
                                    Hủy
                                </button>
                                <button onClick={handleSaveSlot} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '500', cursor: 'pointer' }}>
                                    Lưu ca trực
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DispatchScheduleTab;
