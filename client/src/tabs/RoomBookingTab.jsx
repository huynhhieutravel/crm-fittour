import React, { useState, useEffect, useRef } from 'react';
import { getLocalIsoString, getLocalDateTimeLocal, getLocalDateString } from '../utils/dateUtils';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import RoomBookingDayView from './RoomBookingDayView';

// Import CSS
import '../styles/meetingRoom.css';

const RoomBookingTab = ({ currentUser }) => {
    const [events, setEvents] = useState([]);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const calendarRef = useRef(null);
    const [viewMode, setViewMode] = useState('day');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoverTooltip, setHoverTooltip] = useState(null);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        const handleScroll = () => setHoverTooltip(null);
        window.addEventListener('resize', checkMobile);
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, []);

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        mode: 'create', // create, view, edit
        data: {
            id: null,
            title: '',
            date: '',
            startTime: '',
            endTime: '',
            bu: 'BU1',
            description: '',
            host: ''
        }
    });

    const formatISODate = (d) => {
        const date = new Date(d);
        return getLocalDateString(new Date(date));
    };
    const formatISOTime = (d) => {
        const date = new Date(d);
        return date.toTimeString().slice(0, 5);
    };

    // Màu theo BU
    const buColorMap = {
        'BU1': 'blue',
        'BU2': 'purple',
        'BU3': 'green',
        'BU4': 'red',
        'BU5': 'orange',
        'KHÁC': 'gray',
        'Khác': 'gray'
    };

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/meeting-rooms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;

            const mappedEvents = data.map((b, index) => {
                const bu = (b.bu || 'Khác').toString().trim();
                const cleanBu = bu.toUpperCase().replace(/\s+/g, '');
                const colorClass = buColorMap[cleanBu] || buColorMap[bu] || 'gray';
                // Kiểm tra current meeting
                const now = new Date();
                const start = new Date(b.start_time);
                const end = new Date(b.end_time);
                let classes = [colorClass];
                if (now >= start && now <= end) {
                    classes.push('current-meeting');
                }

                return {
                    id: b.id,
                    title: b.title,
                    start: b.start_time,
                    end: b.end_time,
                    classNames: classes,
                    extendedProps: {
                        host: b.organizer_name || 'Khách',
                        description: b.description,
                        bu: bu
                    }
                };
            });
            setEvents(mappedEvents);

            // Upcoming
            const now = new Date();
            const upcoming = data.filter(b => new Date(b.end_time) > now).slice(0, 3);
            setUpcomingBookings(upcoming);

        } catch (err) {
            console.error(err);
            toast.error('Lỗi tải danh sách phòng họp');
        }
    };

    useEffect(() => {
        fetchBookings();
        // Cập nhật upcoming mỗi phút để current-meeting nhảy
        const interval = setInterval(fetchBookings, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleSelect = (info) => {
        let startTime = formatISOTime(info.start);
        let endTime = formatISOTime(info.end);

        // Nếu người dùng nhấp chọn ô ngày ở chế độ Tháng (Month view) hoặc chọn cả ngày (allDay)
        // thì startTime và endTime sẽ đều là '00:00'. Mặc định tạo khung giờ làm việc hợp lệ.
        if (info.allDay || startTime === endTime || (startTime === '00:00' && endTime === '00:00')) {
            const now = new Date();
            const selectedDate = new Date(info.start);
            // Nếu ngày được chọn là hôm nay, lấy mốc giờ tiếp theo
            if (selectedDate.toDateString() === now.toDateString()) {
                const nextHour = Math.min(now.getHours() + 1, 21);
                startTime = `${String(nextHour).padStart(2, '0')}:00`;
                endTime = `${String(Math.min(nextHour + 1, 22)).padStart(2, '0')}:00`;
            } else {
                startTime = '09:00';
                endTime = '10:00';
            }
        }

        setHoverTooltip(null);
        setModal({
            isOpen: true,
            mode: 'create',
            data: {
                id: null,
                title: '',
                date: formatISODate(info.start),
                startTime: startTime,
                endTime: endTime,
                bu: 'BU1',
                description: '',
                host: currentUser ? currentUser.full_name : 'Admin'
            }
        });
    };

    const handleEventClick = (infoOrEvent) => {
        // Dismiss hover tooltip ngay khi nhấp vào sự kiện
        setHoverTooltip(null);
        // Support both FullCalendar info object ({event: ...}) and plain event object from DayView
        const event = infoOrEvent.event ? infoOrEvent.event : infoOrEvent;
        const now = new Date();
        const isPast = new Date(event.end) <= now; // Chỉ khóa khi đã KẾT THÚC, không khóa khi đang diễn ra

        setModal({
            isOpen: true,
            mode: isPast ? 'view' : 'edit',
            data: {
                id: event.id,
                title: event.title,
                date: formatISODate(event.start),
                startTime: formatISOTime(event.start),
                endTime: formatISOTime(event.end),
                bu: event.extendedProps?.bu || 'Khác',
                description: event.extendedProps?.description || '',
                host: event.extendedProps?.host || 'Khách'
            }
        });
    };

    const handleDelete = async () => {
        const confirmCancel = await Swal.fire({
            title: 'Xác nhận hủy?',
            text: 'Bạn có chắc muốn hủy lịch này không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Quay lại'
        });
        if (confirmCancel.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/meeting-rooms/${modal.data.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Đã hủy lịch!');
                setModal({ ...modal, isOpen: false });
                fetchBookings();
            } catch (err) {
                toast.error(err.response?.data?.error || 'Lỗi khi hủy lịch');
            }
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        const { id, title, description, date, startTime, endTime, bu } = modal.data;
        if (!title) { toast.error('Vui lòng nhập tên cuộc họp'); return; }
        if (!date || !startTime || !endTime) { toast.error('Vui lòng chọn đầy đủ thời gian'); return; }

        const startStr = `${date}T${startTime}:00`;
        const endStr = `${date}T${endTime}:00`;

        try {
            const token = localStorage.getItem('token');
            const payload = {
                title, description, bu,
                start_time: startStr,
                end_time: endStr
            };

            if (modal.mode === 'create') {
                await axios.post('/api/meeting-rooms', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Đặt phòng thành công!');
            } else if (modal.mode === 'edit') {
                await axios.put(`/api/meeting-rooms/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Đã cập nhật lịch họp!');
            }
            setModal({ ...modal, isOpen: false });
            fetchBookings();
        } catch (err) {
            if (err.response && err.response.status === 409) {
                toast.error(err.response.data.error, { duration: 5000 });
            } else {
                toast.error(err.response?.data?.error || 'Lỗi xử lý');
            }
        }
    };

    const handleEventDrop = async (info) => {
        const event = info.event;
        const oldEvent = info.oldEvent;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/meeting-rooms/${event.id}`, {
                title: event.title,
                start_time: event.startStr,
                end_time: event.endStr,
                description: event.extendedProps.description,
                bu: event.extendedProps.bu
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Đã cập nhật thời gian!');
            fetchBookings();
        } catch (err) {
            info.revert(); // Trả lại vị trí cũ
            if (err.response && err.response.status === 409) {
                toast.error(err.response.data.error, { duration: 5000 });
            } else {
                toast.error(err.response?.data?.error || 'Lỗi cập nhật');
            }
        }
    };

    const renderEventContent = (eventInfo) => {
        const { host, bu } = eventInfo.event.extendedProps;
        return (
            <div className="event-inner">
                <div className="event-title">
                    {eventInfo.event.title}
                </div>
                <div className="event-host">
                    <span className="event-host-name">{host || 'Khách'}</span>
                    {bu && <span className="event-bu-pill">{bu}</span>}
                </div>
            </div>
        );
    };

    const handleEventMouseEnter = (info) => {
        const rect = info.el.getBoundingClientRect();
        const event = info.event;
        const startStr = formatISOTime(event.start);
        const endStr = formatISOTime(event.end);
        
        // Tránh bị thanh Thứ (Mon, Tue, Wed) ở trên che: nếu cách đỉnh màn hình < 270px thì hiện ở DƯỚI
        const isNearTop = rect.top < 270;
        const placement = isNearTop ? 'bottom' : 'top';
        
        const tooltipWidth = 260;
        let left = rect.left + rect.width / 2 - tooltipWidth / 2;
        left = Math.max(12, Math.min(window.innerWidth - tooltipWidth - 12, left));
        
        const y = isNearTop ? rect.bottom + 8 : rect.top - 8;

        setHoverTooltip({
            title: event.title,
            time: `${startStr} - ${endStr}`,
            host: event.extendedProps?.host || 'Khách',
            bu: event.extendedProps?.bu || 'Khác',
            description: event.extendedProps?.description || '',
            x: left,
            y: y,
            placement: placement
        });
    };

    const handleEventMouseLeave = () => {
        setHoverTooltip(null);
    };

    // Calculate status
    const now = new Date();
    const currentMeeting = events.find(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        return start <= now && end >= now;
    });
    
    let statusText = 'Available all day';
    let isOccupied = false;
    
    if (currentMeeting) {
        statusText = `Occupied until ${new Date(currentMeeting.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        isOccupied = true;
    } else if (upcomingBookings.length > 0) {
        const nextMeeting = upcomingBookings.find(e => new Date(e.start_time).toDateString() === now.toDateString());
        if (nextMeeting) {
            statusText = `Available until ${new Date(nextMeeting.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }
    }

    return (
        <div className="meeting-room-tab" style={{ flexDirection: 'column', gap: '16px' }}>
            <div className="top-navigation-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', color: '#1d1d1f' }}>Meeting Room</h1>
                    <div className="status-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isOccupied ? '#ffe5e5' : '#e5f6eb', padding: '6px 12px', borderRadius: '100px' }}>
                        <div className="dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOccupied ? '#ff3b30' : '#34c759', boxShadow: isOccupied ? '0 0 8px rgba(255, 59, 48, 0.4)' : '0 0 8px rgba(52, 199, 89, 0.4)' }}></div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: isOccupied ? '#d70015' : '#248a3d' }}>{statusText}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="view-toggle-group" style={{ marginRight: '8px' }}>
                        <button className={`view-toggle-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Day</button>
                        <button className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => {
                            setViewMode('week');
                            setTimeout(() => {
                                if (calendarRef.current) calendarRef.current.getApi().changeView('timeGridWeek');
                            }, 50);
                        }}>Week</button>
                        <button className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => {
                            setViewMode('month');
                            setTimeout(() => {
                                if (calendarRef.current) calendarRef.current.getApi().changeView('dayGridMonth');
                            }, 50);
                        }}>Month</button>
                    </div>
                    {viewMode === 'day' && (
                        <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
                            <button className="soft-btn" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white', cursor: 'pointer' }} onClick={() => {
                                const d = new Date(currentDate);
                                d.setDate(d.getDate() - 1);
                                setCurrentDate(d);
                            }}>‹</button>
                            <button className="soft-btn" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white', cursor: 'pointer', fontWeight: '500' }} onClick={() => setCurrentDate(new Date())}>Today</button>
                            <button className="soft-btn" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white', cursor: 'pointer' }} onClick={() => {
                                const d = new Date(currentDate);
                                d.setDate(d.getDate() + 1);
                                setCurrentDate(d);
                            }}>›</button>
                        </div>
                    )}
                    <button className="soft-btn" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white', cursor: 'pointer', fontWeight: '500' }} onClick={() => fetchBookings()}>Refresh</button>
                    <a 
                      href="/huong-dan-erp/dat-phong-hop" 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ 
                        textDecoration: 'none', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '8px 14px', 
                        borderRadius: '8px', 
                        border: '1px solid #3b82f6', 
                        background: '#eff6ff', 
                        color: '#1d4ed8', 
                        fontWeight: '600', 
                        fontSize: '13px',
                        cursor: 'pointer' 
                      }}
                      title="Xem hướng dẫn sử dụng Đặt phòng họp"
                    >
                      📖 Hướng dẫn
                    </a>
                    <button className="dark-btn" style={{ background: '#1d1d1f', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer' }} onClick={() => {
                        const start = new Date();
                        start.setMinutes(0, 0, 0);
                        start.setHours(start.getHours() + 1);
                        const end = new Date(start);
                        end.setHours(start.getHours() + 1);
                        const tzOffset = (new Date()).getTimezoneOffset() * 60000; 
                        handleSelect({ 
                            start: start, 
                            end: end, 
                            startStr: getLocalDateTimeLocal(new Date(start)), 
                            endStr: getLocalDateTimeLocal(new Date(end)) 
                        });
                    }}>+ New Booking</button>
                </div>
            </div>

            <main className="main" style={{ height: 'calc(100vh - 120px)', background: viewMode === 'day' ? 'transparent' : undefined, border: viewMode === 'day' ? 'none' : undefined, boxShadow: viewMode === 'day' ? 'none' : undefined }}>

                <div className="calendar-wrap" style={{ display: viewMode === 'day' ? 'none' : 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="mobile-scroll-hint">👈 Vuốt ngang để xem trọn vẹn 7 ngày 👉</div>
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        nowIndicator={true}
                        editable={true}
                        selectable={true}
                        allDaySlot={false}
                        expandRows={true}
                        height={isMobile ? 'auto' : '100%'}
                        contentHeight={isMobile ? 'auto' : undefined}
                        slotMinTime="07:00:00"
                        slotMaxTime="22:00:00"
                        slotDuration="00:30:00"
                        slotLabelInterval="00:30:00"
                        slotLabelFormat={{
                            hour: 'numeric',
                            minute: '2-digit',
                            meridiem: 'short'
                        }}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: ''
                        }}
                        buttonText={{
                            today: 'Today'
                        }}
                        events={events}
                        eventContent={renderEventContent}
                        select={handleSelect}
                        eventClick={handleEventClick}
                        eventMouseEnter={handleEventMouseEnter}
                        eventMouseLeave={handleEventMouseLeave}
                        eventDrop={handleEventDrop}
                        eventResize={handleEventDrop} // Tái sử dụng logic update
                    />
                </div>

                {viewMode === 'day' && (
                    <RoomBookingDayView 
                        date={currentDate} 
                        events={events} 
                        onEventClick={handleEventClick}
                        onQuickBook={(start, end) => {
                            const tzOffset = (new Date()).getTimezoneOffset() * 60000; 
                            handleSelect({
                                start, end,
                                startStr: getLocalDateTimeLocal(new Date(start)),
                                endStr: getLocalDateTimeLocal(new Date(end))
                            });
                        }}
                    />
                )}
            </main>



            {/* Custom React Modal */}
            {modal.isOpen && (
                <div className="booking-modal-overlay" onClick={() => setModal({ ...modal, isOpen: false })}>
                    <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="booking-modal-header">
                            {modal.mode === 'create' ? 'Đặt phòng họp mới' : modal.mode === 'edit' ? 'Sửa lịch họp' : 'Chi tiết lịch họp'}
                            {modal.data.host && modal.mode !== 'create' && (
                                <div style={{ fontSize: '13px', color: '#86868b', fontWeight: '500', marginTop: '6px' }}>
                                    Người đặt: {modal.data.host}
                                </div>
                            )}
                        </div>
                        
                        <form onSubmit={handleModalSubmit}>
                            <div className="booking-form-group full-width">
                                <label>Tiêu đề cuộc họp</label>
                                <input 
                                    type="text" 
                                    className="booking-form-control" 
                                    placeholder="Ví dụ: Họp phòng Marketing"
                                    value={modal.data.title}
                                    onChange={e => setModal({ ...modal, data: { ...modal.data, title: e.target.value } })}
                                    disabled={modal.mode === 'view'}
                                    required
                                />
                            </div>

                            <div className="booking-grid">
                                <div className="booking-form-group">
                                    <label>Ngày họp</label>
                                    <input 
                                        type="date" 
                                        className="booking-form-control" 
                                        value={modal.data.date}
                                        onChange={e => setModal({ ...modal, data: { ...modal.data, date: e.target.value } })}
                                        disabled={modal.mode === 'view'}
                                        required
                                    />
                                </div>
                                <div className="booking-form-group">
                                    <label>Business Unit (BU)</label>
                                    <select 
                                        className="booking-form-control"
                                        value={modal.data.bu}
                                        onChange={e => setModal({ ...modal, data: { ...modal.data, bu: e.target.value } })}
                                        disabled={modal.mode === 'view'}
                                    >
                                        <option value="BU1">BU1</option>
                                        <option value="BU2">BU2</option>
                                        <option value="BU3">BU3</option>
                                        <option value="BU4">BU4</option>
                                        <option value="BU5">BU5</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                                <div className="booking-form-group">
                                    <label>Từ giờ</label>
                                    <input 
                                        type="time" 
                                        className="booking-form-control" 
                                        value={modal.data.startTime}
                                        onChange={e => setModal({ ...modal, data: { ...modal.data, startTime: e.target.value } })}
                                        disabled={modal.mode === 'view'}
                                        required
                                    />
                                </div>
                                <div className="booking-form-group">
                                    <label>Đến giờ</label>
                                    <input 
                                        type="time" 
                                        className="booking-form-control" 
                                        value={modal.data.endTime}
                                        onChange={e => setModal({ ...modal, data: { ...modal.data, endTime: e.target.value } })}
                                        disabled={modal.mode === 'view'}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="booking-form-group full-width">
                                <label>Mô tả / Ghi chú</label>
                                <textarea 
                                    className="booking-form-control" 
                                    placeholder="Nội dung, thành viên tham gia..."
                                    value={modal.data.description || ''}
                                    onChange={e => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })}
                                    disabled={modal.mode === 'view'}
                                ></textarea>
                            </div>

                            <div className="booking-modal-actions">
                                {modal.mode === 'view' ? (
                                    <button type="button" className="booking-btn booking-btn-cancel" onClick={() => setModal({ ...modal, isOpen: false })}>Đóng</button>
                                ) : modal.mode === 'edit' ? (
                                    <>
                                        <button type="button" className="booking-btn booking-btn-cancel" onClick={handleDelete} style={{ color: '#ff453a', marginRight: 'auto' }}>Huỷ lịch</button>
                                        <button type="button" className="booking-btn booking-btn-cancel" onClick={() => setModal({ ...modal, isOpen: false })}>Đóng</button>
                                        <button type="submit" className="booking-btn booking-btn-submit">Lưu thay đổi</button>
                                    </>
                                ) : (
                                    <>
                                        <button type="button" className="booking-btn booking-btn-cancel" onClick={() => setModal({ ...modal, isOpen: false })}>Đóng</button>
                                        <button type="submit" className="booking-btn booking-btn-submit">Đặt phòng</button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Global Floating Tooltip khi rê chuột vào cuộc họp (Không bao giờ bị tràn ô hay che bởi thanh Thứ) */}
            {hoverTooltip && (
                <div 
                    className={`meeting-floating-tooltip placement-${hoverTooltip.placement}`}
                    style={{
                        position: 'fixed',
                        left: `${hoverTooltip.x}px`,
                        top: hoverTooltip.placement === 'bottom' ? `${hoverTooltip.y}px` : undefined,
                        bottom: hoverTooltip.placement === 'top' ? `${window.innerHeight - hoverTooltip.y}px` : undefined,
                        zIndex: 999999,
                        pointerEvents: 'none'
                    }}
                >
                    <div className="tooltip-header-row">
                        <span className="tooltip-time">⏰ {hoverTooltip.time}</span>
                        {hoverTooltip.bu && <span className="tooltip-bu-pill">{hoverTooltip.bu}</span>}
                    </div>
                    <div className="tooltip-title">{hoverTooltip.title}</div>
                    <div className="tooltip-host">👤 Người đặt: <strong>{hoverTooltip.host}</strong></div>
                    {hoverTooltip.description && (
                        <div className="tooltip-desc">
                            📝 {hoverTooltip.description}
                        </div>
                    )}
                    <div className="tooltip-hint">💡 Nhấp vào cuộc họp để xem / sửa</div>
                </div>
            )}
        </div>
    );
};

export default RoomBookingTab;
