-- 旅行計画一覧APIが start_date 昇順でソートするため、フルスキャンを避けるインデックスを追加する。
CREATE INDEX idx_trips_start_date ON trips (start_date);
