-- ==========================================
-- TẠO BẢNG GEMINI API USAGE (TRACKING TOKENS)
-- ==========================================

CREATE TABLE IF NOT EXISTS gemini_api_usage (
    date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    prompt_tokens INT DEFAULT 0,
    candidate_tokens INT DEFAULT 0,
    cached_tokens INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    cost_usd NUMERIC(10, 4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: cost_usd sẽ được cập nhật tự động bằng CronJob cuối ngày
