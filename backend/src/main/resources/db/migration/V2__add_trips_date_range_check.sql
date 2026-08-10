ALTER TABLE trips
    ADD CONSTRAINT chk_trips_date_range CHECK (start_date <= end_date);
