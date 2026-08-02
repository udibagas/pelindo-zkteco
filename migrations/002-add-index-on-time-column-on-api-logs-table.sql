CREATE INDEX IF NOT EXISTS idx_time ON api_logs (time);

CREATE INDEX IF NOT EXISTS idx_created_at ON api_logs ("createdAt");