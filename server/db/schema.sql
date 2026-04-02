-- Database Schema cho FIT Tour CRM
-- Sử dụng PostgreSQL

-- 1. Bảng Phân quyền (Roles)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('admin'), ('sales'), ('marketing'), ('operations');

-- 2. Bảng Người dùng (Users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role_id INTEGER REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Tour (Tours)
CREATE TABLE tours (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    destination VARCHAR(200),
    duration VARCHAR(50), -- ví dụ: "8 ngày 7 đêm"
    price DECIMAL(12, 2) DEFAULT 0,
    max_pax INTEGER DEFAULT 0,
    start_date DATE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Leads (Khách hàng tiềm năng)
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    source VARCHAR(50), -- Facebook Ads, Website, Google, Tik Tok, etc.
    tour_id INTEGER REFERENCES tours(id),
    status VARCHAR(50) DEFAULT 'new', -- new, contacted, consulting, considering, won, lost
    assigned_to INTEGER REFERENCES users(id),
    consultation_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng Customers (Khách hàng chính thức)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    nationality VARCHAR(50),
    notes TEXT,
    tags TEXT, -- Lưu dạng chuỗi hoặc mảng nếu cần
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng Bookings (Đơn đặt tour)
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    tour_id INTEGER REFERENCES tours(id),
    start_date DATE,
    pax_count INTEGER DEFAULT 1,
    total_price DECIMAL(12, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, partial, paid
    booking_status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng Tasks & Follow-up (Nhắc việc)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    deadline TIMESTAMP,
    assigned_to INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'open', -- open, completed, overdue
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bảng Conversations & Messages (Inbox)
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50), -- messenger, website, zalo
    external_id VARCHAR(100) UNIQUE, -- Messenger PSID (Page Scoped ID)
    lead_id INTEGER REFERENCES leads(id),
    customer_id INTEGER REFERENCES customers(id),
    last_message TEXT,
    metadata JSONB, -- Lưu thêm thông tin như profile khách hàng từ Facebook
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20), -- 'customer' hoặc 'user'
    sender_id INTEGER, -- ID của user hoặc ID của external customer
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bảng Ghi chú tư vấn chi tiết (Lead Notes / Timeline)
CREATE TABLE lead_notes (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Bảng lưu giao dịch thanh toán cho từng phần của Booking
CREATE TABLE IF NOT EXISTS booking_transactions (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'CASH',
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mở rộng thông tin Passsenger (Khách đi tour thực tế)
-- ALTER TABLE booking_passengers ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
-- ALTER TABLE booking_passengers ADD COLUMN IF NOT EXISTS passport_number VARCHAR(100);
-- ALTER TABLE booking_passengers ADD COLUMN IF NOT EXISTS passport_expired DATE;
-- ALTER TABLE booking_passengers ADD COLUMN IF NOT EXISTS visa_status VARCHAR(50) DEFAULT 'NOT_APPLIED';
-- ALTER TABLE booking_passengers ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- 2026-04-03 Nâng Cấp Form Bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pax_details JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_details JSONB DEFAULT '[]'::jsonb;
