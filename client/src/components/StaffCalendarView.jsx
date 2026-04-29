import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Cake, Award, Phone, Plane } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const StaffCalendarView = ({ users = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState('all'); // 'all', 'birthday', 'anniversary', 'leave'
  const [leaves, setLeaves] = useState([]);

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const prevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // Fetch Leaves
  useEffect(() => {
    const fetchMonthLeaves = async () => {
      try {
        const token = localStorage.getItem('token');
        const m = currentDate.getMonth() + 1;
        const y = currentDate.getFullYear();
        const res = await axios.get('/api/leaves', {
          params: { month: m, year: y, status: 'approved', limit: 1000 },
          headers: { Authorization: `Bearer ${token}` }
        });
        setLeaves(res.data.data || []);
      } catch (err) {
        console.error('Error fetching leaves', err);
      }
    };
    fetchMonthLeaves();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  // Build events from users data
  const events = useMemo(() => {
    const evList = [];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    users.forEach(u => {
      if (!u.is_active) return;

      // Birthday
      if (u.birth_date) {
        const bd = new Date(u.birth_date);
        if (bd.getMonth() === currentMonth) {
          const age = currentYear - bd.getFullYear();
          evList.push({
            user_id: u.id,
            type: 'birthday',
            day: bd.getDate(),
            label: `🎂 ${u.full_name}`,
            sub: '',
            phone: u.phone,
            email: u.email,
            role: u.role_name,
            position: u.position,
            user: u
          });
        }
      }

      // Anniversary (join date = created_at)
      if (u.created_at) {
        const jd = new Date(u.created_at);
        if (jd.getMonth() === currentMonth) {
          const years = currentYear - jd.getFullYear();
          if (years > 0) {
            evList.push({
              user_id: u.id,
              type: 'anniversary',
              day: jd.getDate(),
              label: `🏅 ${u.full_name}`,
              sub: `${years} năm gắn bó`,
              phone: u.phone,
              email: u.email,
              role: u.role_name,
              position: u.position,
              user: u
            });
          }
        }
      }
    });

    // Merge leaves
    leaves.forEach(l => {
        const start = new Date(l.start_date);
        const end = new Date(l.end_date);
        
        let cur = new Date(start);
        while(cur <= end) {
            if (cur.getMonth() === currentMonth && cur.getFullYear() === currentYear) {
                evList.push({
                    user_id: l.user_id,
                    type: 'leave',
                    day: cur.getDate(),
                    label: `🏖️ ${l.user_name || l.full_name}`,
                    sub: l.reason || 'Nghỉ phép',
                    phone: '',
                    role: l.leave_type === 'annual' ? 'Nghỉ năm' : (l.leave_type === 'sick' ? 'Nghỉ ốm' : 'Nghỉ thai sản/khác'),
                    leave_details: l
                });
            }
            cur.setDate(cur.getDate() + 1);
        }
    });

    return evList;
  }, [users, leaves, currentDate]);

  const filteredEvents = events.filter(e => {
    if (filterType === 'birthday') return e.type === 'birthday';
    if (filterType === 'anniversary') return e.type === 'anniversary';
    if (filterType === 'leave') return e.type === 'leave';
    return true;
  });

  // Summary counts
  const birthdayCount = events.filter(e => e.type === 'birthday').length;
  const anniversaryCount = events.filter(e => e.type === 'anniversary').length;
  const leaveCount = Array.from(new Set(events.filter(e => e.type === 'leave').map(e => `${e.day}-${e.user_id}`))).length;

  const renderEventChip = (ev, index) => {
    let bgColor = '#f8fafc', color = '#475569', borderColor = '#e2e8f0';
    if (ev.type === 'birthday') {
        bgColor = '#fef3c7'; color = '#92400e'; borderColor = '#fde68a';
    } else if (ev.type === 'anniversary') {
        bgColor = '#dbeafe'; color = '#1e40af'; borderColor = '#93c5fd';
    } else if (ev.type === 'leave') {
        bgColor = '#fae8ff'; color = '#86198f'; borderColor = '#f5d0fe';
    }

    const handleClick = () => {
        if (ev.type === 'leave') {
            const l = ev.leave_details;
            Swal.fire({
                title: `🏖️ Đơn nghỉ phép của ${ev.label.replace('🏖️ ', '')}`,
                html: `
                    <div style="text-align: left; font-size: 14px; line-height: 1.6;">
                        <p><b>⏱️ Loại nghỉ:</b> ${ev.role}</p>
                        <p><b>📅 Thời gian gốc:</b> ${new Date(l.start_date).toLocaleDateString('vi-VN')} đến ${new Date(l.end_date).toLocaleDateString('vi-VN')} (${l.total_days} ngày)</p>
                        <p><b>📝 Lý do:</b> ${l.reason || 'Không có'}</p>
                        <p><b>🤝 Người bàn giao:</b> ${l.handover_name || 'Không có'}</p>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Đóng'
            });
        }
    };

    return (
      <div
        key={`${ev.type}-${ev.user_id}-${index}`}
        onClick={handleClick}
        style={{
          backgroundColor: bgColor,
          color: color,
          border: `1px solid ${borderColor}`,
          padding: '3px 6px',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: 600,
          marginBottom: '3px',
          cursor: ev.type === 'leave' ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          transition: 'transform 0.15s',
        }}
        title={`${ev.label}\n${ev.sub}\n${ev.phone || ''}\n${ev.role || ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{ev.label}</span>
        </div>
        <div style={{ fontSize: '0.6rem', opacity: 0.85, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
          <span>{ev.sub}</span>
          {ev.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Phone size={8} /> {ev.phone}</span>}
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
            <CalendarIcon size={20} color="#3b82f6" />
            <span className="notranslate" translate="no">{`${monthNames[currentDate.getMonth()]} năm ${currentDate.getFullYear()}`}</span>
          </h3>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Cake size={14} color="#d97706" /> <strong style={{ color: '#92400e' }}>{birthdayCount}</strong> sinh nhật
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={14} color="#2563eb" /> <strong style={{ color: '#1e40af' }}>{anniversaryCount}</strong> kỷ niệm
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plane size={14} color="#c026d3" /> <strong style={{ color: '#86198f' }}>{leaveCount}</strong> lượt nghỉ phép
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'birthday', label: '🎂 Sinh nhật' },
              { key: 'anniversary', label: '🏅 Kỷ niệm' },
              { key: 'leave', label: '🏖️ Nghỉ phép' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                style={{
                  padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 600,
                  background: filterType === f.key ? '#3b82f6' : 'transparent',
                  color: filterType === f.key ? '#fff' : '#64748b',
                  transition: 'all 0.2s'
                }}
              >{f.label}</button>
            ))}
          </div>
          {/* Nav */}
          <button className="btn btn-outline" onClick={prevMonth} style={{ padding: '6px 10px' }}><ChevronLeft size={16} /></button>
          <button className="btn btn-outline" onClick={() => setCurrentDate(new Date())} style={{ padding: '6px 12px' }}>Hôm nay</button>
          <button className="btn btn-outline" onClick={nextMonth} style={{ padding: '6px 10px' }}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
        {['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map(day => (
          <div key={day} style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569' }}>
            {day}
          </div>
        ))}

        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} style={{ minHeight: '120px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }} />;
          }

          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
          const dayEvents = filteredEvents.filter(e => e.day === day);

          return (
            <div key={`day-${day}`} style={{
              minHeight: '120px',
              borderRight: '1px solid #e2e8f0',
              borderBottom: '1px solid #e2e8f0',
              padding: '8px',
              backgroundColor: isToday ? '#eff6ff' : dayEvents.length > 0 ? '#fefce8' : '#fff',
              transition: 'background 0.2s'
            }}>
              <div style={{
                fontWeight: isToday ? 'bold' : 'normal',
                color: isToday ? '#3b82f6' : '#64748b',
                marginBottom: '6px',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: isToday ? '#3b82f6' : 'transparent',
                  color: isToday ? '#fff' : 'inherit',
                  fontSize: '0.85rem'
                }}>
                  {day}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {dayEvents.map((ev, evIdx) => renderEventChip(ev, evIdx))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffCalendarView;
