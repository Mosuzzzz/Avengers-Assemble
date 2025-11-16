CREATE OR REPLACE FUNCTION diesel_manage_updated_at(_tbl regclass)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON %s
        FOR EACH ROW
        EXECUTE FUNCTION diesel_set_updated_at();',
        _tbl);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION diesel_set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
