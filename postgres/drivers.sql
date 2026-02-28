CREATE TABLE drivers (
  id            BIGSERIAL PRIMARY KEY,
  code          VARCHAR(3)   NOT NULL,        -- "VER"
  driver_id     VARCHAR(64),                  -- ergast/jolpica driverId pl "verstappen"
  given_name    VARCHAR(64),
  family_name   VARCHAR(64),
  display_name  VARCHAR(128),                 -- "Max Verstappen" (gyors UI-hoz)
  portrait_url  TEXT,                         -- "/drivers/ver.png" vagy CDN
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_drivers_code UNIQUE (code),
  CONSTRAINT uq_drivers_driver_id UNIQUE (driver_id)
);

CREATE INDEX ix_drivers_code ON drivers (code);