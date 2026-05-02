const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('🚀 Starting Email Module Migration...');

    // ══════════════════════════════════════════════
    // Extension cho tiếng Việt search
    // ══════════════════════════════════════════════
    await client.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);
    console.log('✅ Extension unaccent ready');

    // Tạo text search config hỗ trợ tiếng Việt (bỏ dấu vẫn tìm được)
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'vietnamese') THEN
          CREATE TEXT SEARCH CONFIGURATION vietnamese (COPY = simple);
          ALTER TEXT SEARCH CONFIGURATION vietnamese
            ALTER MAPPING FOR word WITH unaccent, simple;
        END IF;
      END $$
    `);
    console.log('✅ Vietnamese text search config ready');

    // ══════════════════════════════════════════════
    // 1. EMAILS — Bảng chính
    // ══════════════════════════════════════════════
    await client.query(`
      CREATE TABLE IF NOT EXISTS emails (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id),
        mailbox_address VARCHAR(255) NOT NULL,
        email_type VARCHAR(10) DEFAULT 'personal',
        folder VARCHAR(20) NOT NULL DEFAULT 'inbox',
        subject TEXT,
        sender VARCHAR(255),
        recipient VARCHAR(255),
        cc TEXT,
        bcc TEXT,
        body TEXT,
        body_text TEXT,
        date TIMESTAMPTZ DEFAULT NOW(),
        is_read BOOLEAN DEFAULT FALSE,
        is_starred BOOLEAN DEFAULT FALSE,

        -- Threading
        message_id VARCHAR(500),
        in_reply_to VARCHAR(500),
        email_references TEXT,
        thread_id VARCHAR(40),
        normalized_subject VARCHAR(500),
        raw_headers TEXT,

        -- SLA / Assignment
        status VARCHAR(20) DEFAULT 'open',
        assigned_to INTEGER REFERENCES users(id),
        priority VARCHAR(10) DEFAULT 'normal',
        resolved_at TIMESTAMPTZ,

        -- Full-text search
        search_vector tsvector,

        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Table emails created');

    // Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emails_user_folder ON emails(user_id, folder)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emails_thread ON emails(thread_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emails_mailbox ON emails(mailbox_address)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emails_assigned ON emails(assigned_to)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emails_search ON emails USING GIN(search_vector)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emails_type ON emails(email_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emails_norm_subject ON emails(normalized_subject)`);
    console.log('✅ Email indexes created');

    // Auto-update search vector trigger (Vietnamese + unaccent)
    await client.query(`
      CREATE OR REPLACE FUNCTION emails_search_trigger() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('vietnamese', COALESCE(NEW.subject, '')), 'A') ||
          setweight(to_tsvector('vietnamese', COALESCE(NEW.sender, '')), 'B') ||
          setweight(to_tsvector('vietnamese', COALESCE(NEW.body_text, '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trg_emails_search ON emails;
      CREATE TRIGGER trg_emails_search
        BEFORE INSERT OR UPDATE ON emails
        FOR EACH ROW EXECUTE FUNCTION emails_search_trigger()
    `);
    console.log('✅ Full-text search trigger ready');

    // ══════════════════════════════════════════════
    // 2. ATTACHMENTS
    // ══════════════════════════════════════════════
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
        filename VARCHAR(500) NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        r2_key VARCHAR(500),
        content_id VARCHAR(255),
        disposition VARCHAR(20) DEFAULT 'attachment',
        retention_tier VARCHAR(10) DEFAULT 'customer'
      )
    `);
    console.log('✅ Table email_attachments created');

    // ══════════════════════════════════════════════
    // 3. EMAIL LOGS (retry tracking)
    // ══════════════════════════════════════════════
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        email_id UUID REFERENCES emails(id),
        direction VARCHAR(10) NOT NULL,
        status VARCHAR(20) NOT NULL,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        next_retry_at TIMESTAMPTZ,
        idempotency_key VARCHAR(100) UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Table email_logs created');

    // ══════════════════════════════════════════════
    // 4. USER ACTION AUDIT LOG
    // ══════════════════════════════════════════════
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_activity_logs (
        id SERIAL PRIMARY KEY,
        email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(20) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_email_activity_email ON email_activity_logs(email_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_email_activity_user ON email_activity_logs(user_id)`);
    console.log('✅ Table email_activity_logs created');

    // ══════════════════════════════════════════════
    // 5. MAILBOXES (map email → CRM user)
    // ══════════════════════════════════════════════
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_mailboxes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        email_address VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        signature TEXT,
        mailbox_type VARCHAR(10) DEFAULT 'personal',
        max_send_per_minute INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Table email_mailboxes created');

    // ══════════════════════════════════════════════
    // 6. TAGS / LABELS (DB sẵn, code UI sau)
    // ══════════════════════════════════════════════
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(7) DEFAULT '#6366f1',
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(name, user_id)
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_tag_map (
        email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES email_tags(id) ON DELETE CASCADE,
        PRIMARY KEY (email_id, tag_id)
      )
    `);
    console.log('✅ Tables email_tags + email_tag_map created');

    // ══════════════════════════════════════════════
    // 7. INTERNAL NOTES (DB sẵn, code UI sau)
    // ══════════════════════════════════════════════
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_internal_notes (
        id SERIAL PRIMARY KEY,
        email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
        thread_id VARCHAR(40),
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Table email_internal_notes created');

    // ══════════════════════════════════════════════
    // 8. EMAIL TEMPLATES (nền tảng noreply@)
    // ══════════════════════════════════════════════
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        subject_template TEXT NOT NULL,
        body_template TEXT NOT NULL,
        category VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Table email_templates created');

    // Seed mẫu templates
    await client.query(`
      INSERT INTO email_templates (slug, name, subject_template, body_template, category)
      VALUES
        ('tour_program', 'Chương trình Tour', 'Chương trình Tour {{tour_name}} - {{departure_date}}', '<h2>Chương trình Tour {{tour_name}}</h2><p>Ngày khởi hành: {{departure_date}}</p><p>{{itinerary}}</p>', 'transactional'),
        ('booking_confirm', 'Xác nhận Booking', 'Xác nhận đặt tour {{tour_name}} - {{booking_code}}', '<h2>Xác nhận đặt tour</h2><p>Mã booking: {{booking_code}}</p><p>Tour: {{tour_name}}</p><p>Ngày: {{departure_date}}</p><p>Cảm ơn quý khách!</p>', 'transactional'),
        ('visa_reminder', 'Nhắc nhở Visa', 'Nhắc nhở: Visa {{country}} sắp hết hạn', '<p>Kính gửi {{customer_name}},</p><p>Visa {{country}} của quý khách sẽ hết hạn vào ngày {{expiry_date}}.</p><p>Vui lòng liên hệ để gia hạn.</p>', 'notification'),
        ('post_tour_survey', 'Khảo sát sau Tour', 'FIT Tour cảm ơn quý khách - Khảo sát trải nghiệm', '<p>Kính gửi {{customer_name}},</p><p>Cảm ơn quý khách đã đồng hành cùng FIT Tour trong chuyến {{tour_name}}.</p><p>Quý khách vui lòng dành 2 phút khảo sát: {{survey_link}}</p>', 'marketing'),
        ('departure_reminder', 'Nhắc nhở Khởi hành', 'Nhắc nhở: Tour {{tour_name}} khởi hành sau {{days_left}} ngày', '<p>Kính gửi {{customer_name}},</p><p>Tour {{tour_name}} sẽ khởi hành vào ngày {{departure_date}} (còn {{days_left}} ngày).</p><p>Vui lòng chuẩn bị hành lý và giấy tờ.</p>', 'notification')
      ON CONFLICT (slug) DO NOTHING
    `);
    console.log('✅ Seed email templates done');

    // ══════════════════════════════════════════════
    // 9. SCHEDULED EMAILS (nền tảng noreply@)
    // ══════════════════════════════════════════════
    await client.query(`
      CREATE TABLE IF NOT EXISTS scheduled_emails (
        id SERIAL PRIMARY KEY,
        template_id INTEGER REFERENCES email_templates(id),
        from_address VARCHAR(255) DEFAULT 'noreply@fittour.vn',
        to_address VARCHAR(255) NOT NULL,
        to_name VARCHAR(255),
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        related_entity VARCHAR(50),
        related_id INTEGER,
        scheduled_at TIMESTAMPTZ NOT NULL,
        sent_at TIMESTAMPTZ,
        status VARCHAR(20) DEFAULT 'pending',
        error_message TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_scheduled_pending ON scheduled_emails(status, scheduled_at)
        WHERE status = 'pending'
    `);
    console.log('✅ Table scheduled_emails created');

    console.log('');
    console.log('══════════════════════════════════════════════');
    console.log('🎉 Email Module Migration Complete!');
    console.log('══════════════════════════════════════════════');
    console.log('Tables created: emails, email_attachments, email_logs,');
    console.log('  email_activity_logs, email_mailboxes, email_tags,');
    console.log('  email_tag_map, email_internal_notes, email_templates,');
    console.log('  scheduled_emails');
    console.log('══════════════════════════════════════════════');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
