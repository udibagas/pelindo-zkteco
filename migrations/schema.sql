DROP TABLE IF EXISTS "api_logs";

CREATE TABLE "api_logs" (
    id BIGSERIAL PRIMARY KEY,
    "createdAt" DATE DEFAULT CURRENT_TIMESTAMP,
    "raw_log" JSON,
    "api_payload" JSON,
    "api_response" JSON,
    "log_id" VARCHAR,
    "device_id" VARCHAR,
    "driver_id" VARCHAR,
    "driver_name" VARCHAR,
    "time" DATE,
    "response_status" BOOLEAN NULL
);