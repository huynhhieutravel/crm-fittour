ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"push_bu_message": true, "push_personal_assignment": true}'::jsonb;
