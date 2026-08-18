-- Migration Phase 10: Thêm message_count và last_message_at vào zalo_ai_sessions
ALTER TABLE zalo_ai_sessions ADD COLUMN IF NOT EXISTS message_count INT DEFAULT 0;
ALTER TABLE zalo_ai_sessions ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
