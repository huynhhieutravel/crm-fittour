-- Migration: Tạo bảng zalo_ai_sessions quản lý trạng thái AI theo từng khách hàng
CREATE TABLE IF NOT EXISTS zalo_ai_sessions (
  zalo_uid VARCHAR(100) PRIMARY KEY,
  is_ai_active BOOLEAN DEFAULT TRUE,
  muted_by VARCHAR(100),
  muted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_zalo_ai_sessions_uid ON zalo_ai_sessions(zalo_uid);
