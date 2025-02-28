DROP FUNCTION IF EXISTS notify_api CASCADE;

CREATE FUNCTION notify_api()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('api_channel', row_to_json(NEW)::TEXT);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_api
AFTER INSERT ON acc_transaction
FOR EACH ROW EXECUTE FUNCTION notify_api();