const db = require('../db');

/**
 * Migration: Tạo Database Indexes cho tất cả Foreign Key columns quan trọng
 * Mục đích: Tăng tốc độ JOIN và SubQuery trên toàn hệ thống CRM
 * 
 * Trước khi có indexes:
 *   - API /api/leads: ~7000ms (Seq Scan 3.2 triệu lượt)
 * Sau khi có indexes:
 *   - API /api/leads: ~400ms (Index Scan)
 */
(async () => {
    try {
        console.log('🚀 Bắt đầu tạo Performance Indexes cho toàn hệ thống...');
        
        await db.query(`
            -- ═══════════════════════════════════════════════
            -- LEADS & LEAD-RELATED (3700+ rows)
            -- ═══════════════════════════════════════════════
            CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON leads(customer_id);
            CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
            CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);

            -- ═══════════════════════════════════════════════
            -- BOOKINGS & BOOKING-RELATED (859+ rows)
            -- ═══════════════════════════════════════════════
            CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
            CREATE INDEX IF NOT EXISTS idx_bookings_tour_id ON bookings(tour_id);
            CREATE INDEX IF NOT EXISTS idx_bookings_tour_departure_id ON bookings(tour_departure_id);
            CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking_id ON booking_passengers(booking_id);
            CREATE INDEX IF NOT EXISTS idx_booking_transactions_booking_id ON booking_transactions(booking_id);

            -- ═══════════════════════════════════════════════
            -- CUSTOMERS & CUSTOMER-RELATED (777+ rows)
            -- ═══════════════════════════════════════════════
            CREATE INDEX IF NOT EXISTS idx_customers_assigned_to ON customers(assigned_to);
            CREATE INDEX IF NOT EXISTS idx_customers_lead_id ON customers(lead_id);
            CREATE INDEX IF NOT EXISTS idx_customer_events_customer_id ON customer_events(customer_id);

            -- ═══════════════════════════════════════════════
            -- MESSAGES & CONVERSATIONS (7300+ / 3500+ rows)
            -- ═══════════════════════════════════════════════
            CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
            CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
            CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);

            -- ═══════════════════════════════════════════════
            -- TOUR OPERATIONS
            -- ═══════════════════════════════════════════════
            CREATE INDEX IF NOT EXISTS idx_tour_departures_template_id ON tour_departures(tour_template_id);
            CREATE INDEX IF NOT EXISTS idx_departure_reminders_assigned_to ON departure_reminders(assigned_to);
        `);
        
        console.log('✅ Đã tạo thành công 16 Performance Indexes!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi khi tạo Indexes:', err);
        process.exit(1);
    }
})();
