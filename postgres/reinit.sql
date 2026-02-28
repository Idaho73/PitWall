ALTER TABLE driver_career_stats DROP CONSTRAINT IF EXISTS fk_driver_career_stats_driver_code;

ALTER TABLE drivers
  ALTER COLUMN code TYPE VARCHAR(100);

ALTER TABLE driver_career_stats
  ALTER COLUMN driver_code TYPE VARCHAR(100);

ALTER TABLE driver_career_stats
  ADD CONSTRAINT fk_driver_career_stats_driver_code
  FOREIGN KEY (driver_code) REFERENCES drivers(code)
  ON UPDATE CASCADE ON DELETE CASCADE;