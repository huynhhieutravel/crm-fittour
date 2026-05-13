import React, { useMemo } from 'react';

const RoomBookingDayView = ({ date, events, onEventClick, onQuickBook }) => {
    // Helper to format time
    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    // Filter events for the selected date
    const dayEvents = useMemo(() => {
        const targetDateStr = date.toDateString();
        return events
            .filter(e => new Date(e.start).toDateString() === targetDateStr)
            .sort((a, b) => new Date(a.start) - new Date(b.start));
    }, [date, events]);

    // Calculate Available Slots
    const availableSlots = useMemo(() => {
        const slots = [];
        const startOfDay = new Date(date);
        startOfDay.setHours(7, 0, 0, 0); // 07:00
        
        const endOfDay = new Date(date);
        endOfDay.setHours(22, 0, 0, 0); // 22:00

        let currentTime = startOfDay;

        dayEvents.forEach(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);

            if (eventStart > currentTime) {
                const diffMs = eventStart - currentTime;
                const diffMins = diffMs / 60000;
                if (diffMins >= 30) {
                    slots.push({
                        start: new Date(currentTime),
                        end: new Date(eventStart),
                        duration: diffMins
                    });
                }
            }
            if (eventEnd > currentTime) {
                currentTime = eventEnd;
            }
        });

        if (endOfDay > currentTime) {
            const diffMs = endOfDay - currentTime;
            const diffMins = diffMs / 60000;
            if (diffMins >= 30) {
                slots.push({
                    start: new Date(currentTime),
                    end: new Date(endOfDay),
                    duration: diffMins
                });
            }
        }

        return slots;
    }, [dayEvents, date]);

    // Next Meeting
    const now = new Date();
    const nextMeeting = dayEvents.find(e => new Date(e.start) > now);

    const formatDuration = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h > 0 && m > 0) return `${h}h ${m}m available`;
        if (h > 0) return `${h}h available`;
        return `${m}m available`;
    };

    // Date formatting for header
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const dayOptions = { weekday: 'long' };

    return (
        <div className="custom-day-view">
            {/* LEFT COLUMN: EVENTS */}
            <div className="day-view-left">
                <div className="day-view-header">
                    <h2>{date.toLocaleDateString('en-US', dateOptions)}</h2>
                    <p>{date.toLocaleDateString('en-US', dayOptions)} • {dayEvents.length} meeting{dayEvents.length !== 1 ? 's' : ''} scheduled</p>
                </div>

                <div className="day-events-list">
                    {dayEvents.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#86868b' }}>
                            <p>No meetings scheduled for this day.</p>
                        </div>
                    ) : (
                        dayEvents.map((event, idx) => {
                            // The color class is inside event.classNames array
                            const colorClass = event.classNames && event.classNames[0] ? event.classNames[0] : 'blue';
                            const bgColorMap = {
                                blue: 'linear-gradient(135deg, #007aff, #0056b3)',
                                purple: 'linear-gradient(135deg, #af52de, #7e2cb0)',
                                green: 'linear-gradient(135deg, #34c759, #248a3d)',
                                red: 'linear-gradient(135deg, #ff3b30, #c81d11)',
                                gray: 'linear-gradient(135deg, #8e8e93, #636366)'
                            };
                            
                            return (
                                <div 
                                    key={event.id} 
                                    className="day-event-card"
                                    style={{ background: bgColorMap[colorClass] || bgColorMap.blue }}
                                    onClick={() => onEventClick(event)}
                                    title={event.extendedProps.description ? `📝 ${event.extendedProps.description}` : 'Không có ghi chú'}
                                >
                                    <div className="day-event-time">
                                        <h3>{formatTime(event.start)}</h3>
                                        <p>→ {formatTime(event.end)}</p>
                                    </div>
                                    <div className="day-event-details">
                                        <h3>{event.title}</h3>
                                        <p>{event.extendedProps.host || 'Khách'}{event.extendedProps.bu ? ` · ${event.extendedProps.bu}` : ''}</p>
                                        <div className="day-event-tags">
                                            {event.extendedProps.bu && <span className="day-event-tag">{event.extendedProps.bu}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: SLOTS & NEXT MEETING */}
            <div className="day-view-right">
                <div className="slots-pane">
                    <h3>Available Slots</h3>
                    {availableSlots.length === 0 ? (
                        <p style={{ color: '#86868b', fontSize: '14px' }}>No available slots.</p>
                    ) : (
                        availableSlots.map((slot, i) => (
                            <div key={i} className="slot-card">
                                <div className="slot-info">
                                    <h4>{formatTime(slot.start)} → {formatTime(slot.end)}</h4>
                                    <p>{formatDuration(slot.duration)}</p>
                                </div>
                                <button 
                                    className="quick-book-btn"
                                    onClick={() => onQuickBook(slot.start, slot.end)}
                                >
                                    Quick Book
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {nextMeeting && (
                    <div className="next-meeting-pane">
                        <h3>Next Meeting</h3>
                        <h2>{nextMeeting.title}</h2>
                        <p>Starts at {formatTime(nextMeeting.start)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomBookingDayView;
