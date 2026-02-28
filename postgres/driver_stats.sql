CREATE TABLE driver_career_stats (
  id            BIGSERIAL PRIMARY KEY,

  driver_code   VARCHAR(3)  NOT NULL,
  championships INTEGER     NOT NULL DEFAULT 0,
  points_total  NUMERIC(12,2) NOT NULL DEFAULT 0,  -- félpontok miatt
  wins          INTEGER     NOT NULL DEFAULT 0,
  podiums       INTEGER     NOT NULL DEFAULT 0,
  poles         INTEGER     NOT NULL DEFAULT 0,

  first_season  INTEGER,
  last_season   INTEGER,

  source        VARCHAR(32) NOT NULL DEFAULT 'jolpica',
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_driver_career_stats_code UNIQUE (driver_code),
  CONSTRAINT fk_driver_career_stats_driver_code
    FOREIGN KEY (driver_code) REFERENCES drivers(code)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX ix_driver_career_stats_code ON driver_career_stats (driver_code);